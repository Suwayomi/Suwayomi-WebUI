/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import { d } from 'koration';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

type ActionConfig = [string, () => Promise<unknown> | unknown][];
type InFlightAction = [string, Promise<unknown> | unknown];

export class AppInitializer {
    private static actions: ControlledPromise[] = [];

    static async start(): Promise<void> {
        AppInitializer.stop();
        await AppInitializer.authenticate();

        void AppInitializer.fetchBackgroundData();

        await AppInitializer.fetchRequiredData();
        await AppInitializer.startPostDataFetchLogic();
    }

    static stop(): void {
        AppInitializer.actions.forEach((promise) => promise.reject('stopped'));
        AppInitializer.actions = [];
    }

    private static async authenticate(): Promise<void> {
        await AppInitializer.executeActions([
            [
                'initializeAuthentication',
                async () => {
                    const response = await requestManager.getAbout().response;

                    if (AuthManager.isAuthInitialized()) {
                        return;
                    }

                    assertIsDefined(response?.data);

                    AuthManager.setAuthRequired(false);
                    AuthManager.setAuthInitialized(true);
                    requestManager.processQueues();
                },
            ],
        ]);
    }

    private static async fetchRequiredData(): Promise<void> {
        await AppInitializer.executeActions([
            ['globalMeta', () => requestManager.getGlobalMeta().response],
            ['serverSettings', () => requestManager.getServerSettings().response],
            // Load the full download status once on startup to fill the cache
            ['downloadStatus', () => requestManager.getDownloadStatus().response],
        ]);
    }

    private static async startPostDataFetchLogic(): Promise<void> {
        await AppInitializer.executeActions([
            [
                'resumeMigration',
                () => {
                    if (!MigrationManager.isActive()) {
                        navigator.locks
                            ?.request('migration-executor', async () => {
                                const resumed = await MigrationManager.resume();
                                if (resumed) {
                                    await MigrationManager.awaitCompletion();
                                }
                            })
                            .catch(defaultPromiseErrorHandler('ResumeMigration'));
                    }
                },
            ],
        ]);
    }

    private static async fetchBackgroundData(): Promise<void> {
        await AppInitializer.executeActions([
            // Fetch extension list on startup to show up-to-date number of available extension updates in the navigation bar
            // without having to open the extensions page.
            ['fetchExtensionList', () => requestManager.getExtensionListFetch().response],
        ]);
    }

    private static async executeActions(
        actions: ActionConfig,
        {
            timeout = d(5).seconds.inWholeMilliseconds,
            timeoutMultiplier = 1.5,
            maxTimeout = d(2).minutes.inWholeMilliseconds,
            promise,
        }: {
            timeout?: number;
            timeoutMultiplier?: number;
            maxTimeout?: number;
            promise?: ControlledPromise;
        } = {},
    ): Promise<void> {
        const finalPromise = promise ?? new ControlledPromise();
        if (!promise) {
            AppInitializer.actions.push(finalPromise);
        }

        const isAborted = async () => {
            try {
                const result = (await Promise.race([finalPromise.promise, Promise.resolve(false)])) ?? true;

                return result;
            } catch (error) {
                return true;
            }
        };

        if (await isAborted()) {
            return;
        }

        const inFlightActions = actions.map(([key, fn]) => [key, fn()] satisfies InFlightAction);

        const actionWithSuccessState = await Promise.all(
            inFlightActions.map(async ([key, inFlightAction]) => {
                try {
                    await inFlightAction;

                    return [key, true] as [string, boolean];
                } catch (e) {
                    return [key, false] as [string, boolean];
                }
            }),
        );

        const failedActions = actionWithSuccessState.filter(([_, succeeded]) => !succeeded);

        if (!failedActions.length) {
            finalPromise.resolve();

            return;
        }

        await new Promise((resolve) => {
            setTimeout(resolve, timeout);
        });

        await AppInitializer.executeActions(
            actions.filter(([key]) => !failedActions.some(([k]) => k === key)),
            {
                timeout: (timeout * timeoutMultiplier) % maxTimeout,
                timeoutMultiplier,
                maxTimeout,
                promise,
            },
        );
    }
}
