/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * The notification API is not available in every browser, e.g. Safari on iOS does not provide it,
 * and browsers only expose it in a secure context (https or localhost)
 */
const getApi = (): typeof Notification | undefined => (typeof Notification === 'undefined' ? undefined : Notification);

const getServiceWorker = async (): Promise<ServiceWorkerRegistration | undefined> => {
    if (!('serviceWorker' in navigator)) {
        return undefined;
    }

    try {
        return await navigator.serviceWorker.getRegistration();
    } catch (_) {
        return undefined;
    }
};

export type NotificationPermissionState = 'unsupported' | NotificationPermission;

export class Notifications {
    static isSupported(): boolean {
        return !!getApi();
    }

    static getPermission(): NotificationPermissionState {
        return getApi()?.permission ?? 'unsupported';
    }

    static isPermissionGranted(): boolean {
        return Notifications.getPermission() === 'granted';
    }

    /**
     * Returns the permission state after the user made their choice.
     *
     * Has to be called from a user gesture, otherwise browsers reject the request.
     *
     * "default" means the user dismissed the prompt without deciding, which, unlike "denied", can be prompted for again
     */
    static async requestPermission(): Promise<NotificationPermissionState> {
        const api = getApi();

        if (!api) {
            return 'unsupported';
        }

        if (api.permission !== 'default') {
            return api.permission;
        }

        try {
            return await api.requestPermission();
        } catch (_) {
            // browsers that only provide the deprecated callback based version
            return api.permission;
        }
    }

    static async show(title: string, { onClick, ...options }: NotificationOptions & { onClick?: () => void } = {}) {
        const api = getApi();

        if (api?.permission !== 'granted') {
            return;
        }

        try {
            const notification = new api(title, options);

            notification.onclick = () => {
                window.focus();
                notification.close();
                onClick?.();
            };

            return;
        } catch (_) {
            // some platforms, e.g. Chrome on Android, only allow notifications to be created by a service worker.
            // those are not clickable, since reacting to it requires a "notificationclick" listener in the service
            // worker, which the generated one does not provide.
        }

        const serviceWorker = await getServiceWorker();
        // "renotify" makes a notification that replaces a previous one of the same "tag" alert the user again instead
        // of silently swapping it out. It is only honored for service worker notifications.
        await serviceWorker?.showNotification(title, { ...options, renotify: !!options.tag } as NotificationOptions);
    }
}
