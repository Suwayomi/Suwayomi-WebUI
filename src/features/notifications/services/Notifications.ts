/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { makeToast } from '@/base/utils/Toast.ts';

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

export class Notifications {
    /** "undefined" in case the browser does not support notifications */
    static getPermission(): NotificationPermission | undefined {
        return getApi()?.permission;
    }

    static isPermissionGranted(): boolean {
        return Notifications.getPermission() === 'granted';
    }

    /** Has to be called from a user gesture, otherwise browsers reject the request */
    static async requestPermission(): Promise<void> {
        const api = getApi();

        if (api?.permission !== 'default') {
            return;
        }

        try {
            await api.requestPermission();
        } catch (_) {
            // browsers that only provide the deprecated callback based version
        }
    }

    /** Shows a toast while the app is in use, and a notification of the browser otherwise */
    static async show(title: string, { onClick, ...options }: NotificationOptions & { onClick?: () => void } = {}) {
        if (document.visibilityState === 'visible' && document.hasFocus()) {
            makeToast(title, 'info', options.body);
            return;
        }

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
