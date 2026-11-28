/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import packageJson from '../../package.json';

type TPackageJson = typeof packageJson;
type DependencyType = keyof Pick<TPackageJson, 'dependencies' | 'devDependencies'>;

type OutdatedDependency = {
    name: string;
    latest: string;
    dependencyType: DependencyType;
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

    writeFileSync('package.json', `${JSON.stringify(packageJson, null, 4)}\n`);
};

// "bun outdated" has no JSON output, so the table rows get parsed: | name (dev) | current | update | latest |
const getOutdatedDependencies = (): OutdatedDependency[] =>
    execSync('bun outdated', { encoding: 'utf8', env: { ...process.env, NO_COLOR: '1' } })
        .split('\n')
        .map((line) =>
            line
                .split('|')
                .slice(1, -1)
                .map((cell) => cell.trim()),
        )
        .filter(([name, current]) => !!name && /^\d/.test(current ?? ''))
        // "*" marks a newer version that is held back by "minimumReleaseAge"
        .map((cells) => cells.map((cell) => cell.replace(/\s*\*$/, '')))
        .map(([label, current, , latest]) => {
            const [name] = label.split(' ');
            const dependencyType = PACKAGE_TYPES.find((type) => name in packageJson[type]);

            return {
                name,
                latest,
                dependencyType: dependencyType!,
                isUpdate: current !== latest,
                isMajorUpdate: current.split('.')[0] !== latest.split('.')[0],
            };
        })
        .filter(({ dependencyType, isUpdate }) => !!dependencyType && isUpdate);

const showOutdated = () => execSync('bun outdated', { stdio: 'inherit' });

const log = (...args: Parameters<typeof console.log>) => console.log('updateDependencies:', ...args);

const updateDependencies = () => {
    log('checking for outdated dependencies...');

    const outdatedDependencies = getOutdatedDependencies();
    const autoUpdatableDependencies = outdatedDependencies.filter(({ isMajorUpdate }) => !isMajorUpdate);

    if (!outdatedDependencies.length) {
        log('all dependencies are up-to-date');
        return;
    }

    showOutdated();

    if (!autoUpdatableDependencies.length) {
        log('no automatically updatable dependencies found');
        return;
    }

    log('updating dependencies with non breaking changes...');

    updateVersionsInPackageJson(autoUpdatableDependencies);

    execSync('bun install', { stdio: 'inherit' });

    log('commiting changes...');

    execSync('git add package.json bun.lock && git commit -m "Update dependencies"', { stdio: 'inherit' });

    log('updated dependencies with non breaking changes. Check dependencies with breaking changes listed below:');

    showOutdated();
};

updateDependencies();
