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
import { LibraryUpdateNotifier } from '@/features/updates/LibraryUpdateNotifier.ts';
import { BasicAuthDeprecationReminder } from '@/base/notification/BasicAuthDeprecationReminder.ts';

type Action = { key: string; required: boolean };
type ActionConfig = Action & { setup: () => Promise<unknown> | unknown };
type InFlightAction = Action & { inFlightSetup: Promise<unknown> | unknown };

type Config = readonly (
    | ActionConfig
    | (
          | (Omit<ActionConfig, 'required'> & { required: false })[]
          | (Omit<ActionConfig, 'required'> & { required: true })[]
      )
)[];

export class AppInitializer {
    private static actionControllers: ControlledPromise[] = [];

    private static subscriptions: any[] = [];

    private static config: Config = [
        {
            key: 'initializeAuthentication',
            required: true,
            setup: async () => {
                const response = await requestManager.getAbout().response;

                if (AuthManager.isAuthInitialized()) {
                    return;
                }

                assertIsDefined(response?.data);

                AuthManager.setAuthRequired(false);
                AuthManager.setAuthInitialized(true);
                requestManager.processQueues();
            },
        },
        [
            {
                key: 'globalMeta',
                required: true,
                setup: () => requestManager.getGlobalMeta().response,
            },
            {
                key: 'serverSettings',
                required: true,
                setup: () => requestManager.getServerSettings().response,
            },
        ],
        [
            {
                key: 'resumeMigration',
                required: false,
                setup: () => {
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
            },
            {
                key: 'libraryUpdateNotifier',
                required: false,
                setup: () => LibraryUpdateNotifier.start(),
            },
            // Load the full download status once on startup to fill the cache
            {
                key: 'downloadStatus',
                required: false,
                setup: () => requestManager.getDownloadStatus().response,
            },
            // Fetch extension list on startup to show up-to-date number of available extension updates in the navigation bar
            // without having to open the extensions page.
            {
                key: 'fetchExtensionList',
                required: false,
                setup: () => requestManager.getExtensionListFetch().response,
            },
            /*
             * Creates permanent subscriptions to always have the latest data.
             *
             * E.g. in case a view is open, which does not subscribe to the download updates, finished downloads are never received
             * and thus, data of existing chapters/mangas in the cache get outdated
             */
            {
                key: 'downloadSubscription',
                required: false,
                setup: () => this.subscriptions.push(requestManager.downloadSubscription().subscribe()),
            },
            {
                key: 'updaterSubscription',
                required: false,
                setup: () => this.subscriptions.push(requestManager.updaterSubscription().subscribe()),
            },
            {
                key: 'webUISubscription',
                required: false,
                setup: () => this.subscriptions.push(requestManager.webUIUpdateSubscription().subscribe()),
            },
            {
                key: 'syncSubscription',
                required: false,
                setup: () => this.subscriptions.push(requestManager.syncSubscription().subscribe()),
            },
            { key: 'basicAuthDeprecationReminder', required: false, setup: () => BasicAuthDeprecationReminder.start() },
        ],
    ];

    static async start(): Promise<void> {
        AppInitializer.stop();

        for (const actions of AppInitializer.config) {
            // oxlint-disable-next-line no-await-in-loop
            await AppInitializer.startActions(actions);
        }
    }

    static stop(): void {
        AppInitializer.actionControllers.forEach((promise) => promise.reject('stopped'));
        AppInitializer.actionControllers = [];
        AppInitializer.subscriptions.forEach((subscription) => subscription.unsubscribe());
        LibraryUpdateNotifier.stop();
    }

    private static async startActions(actions: ActionConfig | ActionConfig[]): Promise<void> {
        const promise = AppInitializer.executeActions(Array.isArray(actions) ? actions : [actions]);

        if (!AppInitializer.isActionRequired(actions)) {
            return Promise.resolve();
        }

        await promise;

        return promise;
    }

    private static isActionRequired(action: ActionConfig | ActionConfig[]): boolean {
        if (Array.isArray(action)) {
            return action[0].required;
        }

        return action.required;
    }

    private static async executeActions(
        actions: ActionConfig[],
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
            AppInitializer.actionControllers.push(finalPromise);
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

        const inFlightActions = actions.map(
            ({ setup, ...action }) =>
                ({ ...action, inFlightSetup: Promise.resolve().then(setup) }) satisfies InFlightAction,
        );

        const actionWithSuccessState = await Promise.all(
            inFlightActions.map(async ({ key, inFlightSetup }) => {
                try {
                    await inFlightSetup;

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
            actions.filter(({ key }) => failedActions.some(([k]) => k === key)),
            {
                timeout: (timeout * timeoutMultiplier) % maxTimeout,
                timeoutMultiplier,
                maxTimeout,
                promise,
            },
        );
    }
}
