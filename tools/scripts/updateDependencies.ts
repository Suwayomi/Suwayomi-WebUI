/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ExecSyncOptions } from 'node:child_process';
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import packageJson from '../../package.json';

type TPackageJson = typeof packageJson;
type DependencyType = keyof Pick<TPackageJson, 'dependencies' | 'devDependencies'>;

type OutdatedPayload = {
    current: string;
    latest: string;
    wanted: string;
    isDeprecated: boolean;
    dependencyType: DependencyType;
};

type OutdatedDependency = OutdatedPayload & {
    name: string;
    isMajorUpdate: boolean;
};

const PACKAGE_TYPES: DependencyType[] = ['dependencies', 'devDependencies'];

const updateVersionInPackageJson = <TDependencyType extends DependencyType>(
    type: TDependencyType,
    dependency: keyof TPackageJson[TDependencyType],
    version: string,
) => {
    // @ts-ignore - TS2322: Type string is not assignable to type (packageJson[type][dependency])
    packageJson[type][dependency] = version;
};

const updateVersionsInPackageJson = (dependencies: OutdatedDependency[]) => {
    dependencies.forEach(({ name, dependencyType, latest }) =>
        updateVersionInPackageJson(dependencyType, name as keyof TPackageJson[typeof dependencyType], latest),
    );

    writeFileSync('package.json', `${JSON.stringify(packageJson, null, 2)}\n`);
};

/**
 * @param asJson
 * @param stdio - only considered in case asJson is falsy
 */
const execOutdatedCmd = ({ asJson = false, stdio }: { asJson?: boolean; stdio?: ExecSyncOptions['stdio'] } = {}):
    | string
    | null => {
    try {
        execSync(`pnpm outdated ${asJson ? '--json' : ''}`, { stdio: !asJson ? stdio : undefined })?.toString();
        return null;
    } catch (e: any) {
        if (e?.stdout === null) {
            return null;
        }

        if (!Buffer.isBuffer(e.stdout)) {
            throw e;
        }

        return e.stdout.toString();
    }
};

const getOutdatedDependencies = (): OutdatedDependency[] => {
    const output = execOutdatedCmd({ asJson: true });

    if (output === null) {
        return [];
    }

    const outdatedPayload = JSON.parse(output) as Record<string, OutdatedPayload>;

    const outdatedPackages = Object.entries(outdatedPayload).map(([name, info]) => ({
        name,
        ...info,
    }));

    return outdatedPackages
        .map((dependency) => ({
            ...dependency,
            isMajorUpdate: dependency.current.split('.')[0] !== dependency.latest.split('.')[0],
        }))
        .filter(({ dependencyType }) => PACKAGE_TYPES.includes(dependencyType))
        .toSorted((a, b) => a.dependencyType.localeCompare(b.dependencyType));
};

const log = (...args: Parameters<typeof console.log>) => console.log('updateDependencies:', ...args);

const updateDependencies = () => {
    log('checking for outdated dependencies...');

    const outdatedDependencies = getOutdatedDependencies();
    const autoUpdatableDependencies = outdatedDependencies.filter(({ isMajorUpdate }) => !isMajorUpdate);

    if (!outdatedDependencies.length) {
        log('all dependencies are up-to-date');
        return;
    }

    execOutdatedCmd({ stdio: 'inherit' });

    if (!autoUpdatableDependencies.length) {
        log('no automatically updatable dependencies found');
        return;
    }

    log('updating dependencies with non breaking changes...');

    updateVersionsInPackageJson(autoUpdatableDependencies);

    execSync('pnpm i', { stdio: 'inherit' });

    log('commiting changes...');

    execSync('git add package.json pnpm-lock.yaml && git commit -m "Update dependencies"', { stdio: 'inherit' });

    log('updated dependencies with non breaking changes. Check dependencies with breaking changes listed below:');

    execOutdatedCmd({ stdio: 'inherit' });
};

updateDependencies();
