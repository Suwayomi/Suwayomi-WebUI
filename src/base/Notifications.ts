/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { OptionsObject, SnackbarKey } from 'notistack';
import { enqueueSnackbar } from 'notistack';

type Variant = OptionsObject['variant'];
type Options = Omit<OptionsObject, 'variant'>;

export class Notifications {
    static show(message: string, description?: string): SnackbarKey;
    static show(message: string, options?: OptionsObject): SnackbarKey;
    static show(message: string, description?: string, options?: OptionsObject): SnackbarKey;
    static show(
        message: string,
        optionsOrDescription?: string | OptionsObject,
        optionsOrUndefined?: OptionsObject,
    ): SnackbarKey {
        const options = typeof optionsOrDescription === 'object' ? optionsOrDescription : (optionsOrUndefined ?? {});
        const description = typeof options === 'string' ? options : undefined;

        return enqueueSnackbar(message, {
            variant: 'info',
            ...options,
            // @ts-ignore - TS2353, "notistack" is outdated and the provided way to define custom props is not working, however,
            // everything in the options object gets passed to the custom snackbar component
            description,
        });
    }

    private static callShow(
        message: string,
        variant: Variant,
        optionsOrDescription?: string | Options,
        options?: Options,
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
    static success(message: string, options?: Options): SnackbarKey;
    static success(message: string, description?: string, options?: Options): SnackbarKey;
    static success(message: string, optionsOrDescription?: string | Options, options?: Options): SnackbarKey {
        return Notifications.callShow(message, 'success', optionsOrDescription, options);
    }

    static info(message: string, description?: string): SnackbarKey;
    static info(message: string, options?: Options): SnackbarKey;
    static info(message: string, description?: string, options?: Options): SnackbarKey;
    static info(message: string, optionsOrDescription?: string | Options, options?: Options): SnackbarKey {
        return Notifications.callShow(message, 'info', optionsOrDescription, options);
    }

    static warn(message: string, description?: string): SnackbarKey;
    static warn(message: string, options?: Options): SnackbarKey;
    static warn(message: string, description?: string, options?: Options): SnackbarKey;
    static warn(message: string, optionsOrDescription?: string | Options, options?: Options): SnackbarKey {
        return Notifications.callShow(message, 'warning', optionsOrDescription, options);
    }

    static error(message: string, description?: string): SnackbarKey;
    static error(message: string, options?: Options): SnackbarKey;
    static error(message: string, description?: string, options?: Options): SnackbarKey;
    static error(message: string, optionsOrDescription?: string | Options, options?: Options): SnackbarKey {
        return Notifications.callShow(message, 'error', optionsOrDescription, options);
    }
}
