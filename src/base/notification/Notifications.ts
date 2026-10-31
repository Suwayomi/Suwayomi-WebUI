/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { OptionsObject, SnackbarKey } from 'notistack';
import { enqueueSnackbar } from 'notistack';
import { AppSession } from '@/base/AppSession.ts';
import { DeviceNotifications } from '@/lib/DeviceNotifications.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

type Variant = OptionsObject['variant'];
type Options = {
    id?: string | number;
    variant?: Variant;
    onClick?: () => void;
    app?: Omit<OptionsObject, 'key' | 'variant'>;
    device?: Omit<NotificationOptions, 'body' | 'tag'>;
};
type OptionsUtil = Omit<Options, 'variant'>;

export class Notifications {
    private static COUNTER = 0;

    private static getId(): number {
        Notifications.COUNTER = (Notifications.COUNTER + 1) % Number.MAX_SAFE_INTEGER;

        return Notifications.COUNTER;
    }

    static show(message: string, description?: string): SnackbarKey;
    static show(message: string, options?: Options): SnackbarKey;
    static show(message: string, description?: string, options?: Options): SnackbarKey;
    static show(message: string, optionsOrDescription?: string | Options, optionsOrUndefined?: Options): SnackbarKey {
        const options = typeof optionsOrDescription === 'object' ? optionsOrDescription : (optionsOrUndefined ?? {});
        const description = typeof options === 'string' ? options : undefined;

        const id = options.id ?? Notifications.getId();

        if (AppSession.isActivelyUsed()) {
            return enqueueSnackbar(message, {
                key: id,
                variant: options.variant ?? 'info',
                ...options.app,
                // @ts-ignore - TS2353, "notistack" is outdated and the provided way to define custom props is not working, however,
                // everything in the options object gets passed to the custom snackbar component
                description,
            });
        }

        DeviceNotifications.show(message, {
            tag: id.toString(),
            body: message,
            onClick: options.onClick,
            ...options.device,
        }).catch(defaultPromiseErrorHandler(`Notifications::${id}`));

        return id;
    }

    private static callShow(
        message: string,
        variant: Variant,
        optionsOrDescription?: string | OptionsUtil,
        options?: OptionsUtil,
    ): SnackbarKey {
        const isDescription = typeof optionsOrDescription === 'string';
        if (isDescription) {
            return Notifications.show(message, optionsOrDescription, { ...options, variant });
        }

        return Notifications.show(message, {
            ...optionsOrDescription,
            variant,
        });
    }

    static success(message: string, description?: string): SnackbarKey;
    static success(message: string, options?: OptionsUtil): SnackbarKey;
    static success(message: string, description?: string, options?: OptionsUtil): SnackbarKey;
    static success(message: string, optionsOrDescription?: string | OptionsUtil, options?: OptionsUtil): SnackbarKey {
        return Notifications.callShow(message, 'success', optionsOrDescription, options);
    }

    static info(message: string, description?: string): SnackbarKey;
    static info(message: string, options?: OptionsUtil): SnackbarKey;
    static info(message: string, description?: string, options?: OptionsUtil): SnackbarKey;
    static info(message: string, optionsOrDescription?: string | OptionsUtil, options?: OptionsUtil): SnackbarKey {
        return Notifications.callShow(message, 'info', optionsOrDescription, options);
    }

    static warn(message: string, description?: string): SnackbarKey;
    static warn(message: string, options?: OptionsUtil): SnackbarKey;
    static warn(message: string, description?: string, options?: OptionsUtil): SnackbarKey;
    static warn(message: string, optionsOrDescription?: string | OptionsUtil, options?: OptionsUtil): SnackbarKey {
        return Notifications.callShow(message, 'warning', optionsOrDescription, options);
    }

    static error(message: string, description?: string): SnackbarKey;
    static error(message: string, options?: OptionsUtil): SnackbarKey;
    static error(message: string, description?: string, options?: OptionsUtil): SnackbarKey;
    static error(message: string, optionsOrDescription?: string | OptionsUtil, options?: OptionsUtil): SnackbarKey {
        return Notifications.callShow(message, 'error', optionsOrDescription, options);
    }
}
