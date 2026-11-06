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
import type { MessageDescriptor } from '@lingui/core';
import { useSyncExternalStore } from 'react';
import { msg } from '@lingui/core/macro';

type Action = {
    key: string;
    message?: MessageDescriptor;
    errorMessage?: MessageDescriptor;
    required: boolean;
    setup: () => Promise<unknown> | unknown;
    active?: boolean;
    error?: unknown;
};

type Status = {
    initialized: boolean;
    actions: Omit<Action, 'setup'>[];
};

type Config = readonly (
    | Action
    | ((Omit<Action, 'required'> & { required: false })[] | (Omit<Action, 'required'> & { required: true })[])
)[];

export class AppInitializer {
    private static actions = new Map<string, Action & { controller: ControlledPromise }>();

    private static subscriptions: any[] = [];

    private static subscribeCount: number = 0;

    private static subscribers = new Map<number, () => void>();

    private static notifierValue: number = 0;

    private static config: Config = [
        {
            key: 'initializeAuthentication',
            message: msg`Checking for authentication…`,
            errorMessage: msg`Unable to determine authentication`,
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
                message: msg`Loading client settings…`,
                errorMessage: msg`Unable to load client settings`,
                required: true,
                setup: () => requestManager.getGlobalMeta().response,
            },
            {
                key: 'serverSettings',
                message: msg`Loading server settings…`,
                errorMessage: msg`Unable to load server settings`,
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
        AppInitializer.actions.forEach(({ controller }) => controller.reject('stopped'));
        AppInitializer.actions.clear();
        AppInitializer.subscriptions.forEach((subscription) => subscription.unsubscribe());
        LibraryUpdateNotifier.stop();
    }

    private static subscribe(callback: () => void): () => void {
        const key = AppInitializer.subscribeCount++;
        AppInitializer.subscribers.set(key, callback);

        return () => this.unsubscribe(key);
    }

    private static unsubscribe(key: number): void {
        AppInitializer.subscribers.delete(key);
    }

    private static notify(): void {
        AppInitializer.notifierValue = (AppInitializer.notifierValue + 1) % Number.MAX_SAFE_INTEGER;
        AppInitializer.subscribers.forEach((callback) => callback());
    }

    public static useStatus(): Status {
        useSyncExternalStore(AppInitializer.subscribe.bind(AppInitializer), () => AppInitializer.notifierValue);

        return {
            initialized: AppInitializer.actions
                .values()
                .filter((action) => action.required)
                .every((action) => !action.active),
            actions: [...AppInitializer.actions.values()].map(
                ({ key, message, errorMessage, error, required, active }) => ({
                    key,
                    message,
                    errorMessage,
                    error,
                    required,
                    active,
                }),
            ),
        };
    }

    private static async startActions(actions: Action | Action[]): Promise<void[]> {
        if (Array.isArray(actions)) {
            const areRequired = actions[0].required;

            const promise = Promise.all(actions.map((action) => AppInitializer.executeActions(action)));

            if (!areRequired) {
                return Promise.resolve([]);
            }

            await promise;

            return promise;
        }

        const promise = await AppInitializer.executeActions(actions);

        return [promise];
    }

    private static async executeActions(
        action: Action,
        {
            timeout = d(5).seconds.inWholeMilliseconds,
            timeoutMultiplier = 1.5,
            maxTimeout = d(2).minutes.inWholeMilliseconds,
            controller,
        }: {
            timeout?: number;
            timeoutMultiplier?: number;
            maxTimeout?: number;
            controller?: ControlledPromise;
        } = {},
    ): Promise<void> {
        const finalController = controller ?? new ControlledPromise();
        if (!controller) {
            AppInitializer.actions.set(action.key, { ...action, controller: finalController, active: true });
            AppInitializer.notify();
        }

        const isAborted = async () => {
            try {
                const result = (await Promise.race([finalController.promise, Promise.resolve(false)])) ?? true;

                return result;
            } catch (error) {
                return true;
            }
        };

        if (await isAborted()) {
            return;
        }

        try {
            await action.setup();

            AppInitializer.actions.set(action.key, { ...action, controller: finalController, active: false });
            AppInitializer.notify();

            finalController.resolve();
        } catch (e) {
            AppInitializer.actions.set(action.key, { ...action, controller: finalController, error: e });
            AppInitializer.notify();

            await new Promise((resolve) => {
                setTimeout(resolve, timeout);
            });

            await AppInitializer.executeActions(action, {
                timeout: (timeout * timeoutMultiplier) % maxTimeout,
                timeoutMultiplier,
                maxTimeout,
                controller,
            });
        }
    }
}
