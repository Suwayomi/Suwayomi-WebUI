/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { enqueueSnackbar, OptionsObject, SnackbarKey } from 'notistack';

export function makeToast(message: string, severity?: OptionsObject['variant']): SnackbarKey;
export function makeToast(message: string, options?: OptionsObject): SnackbarKey;
export function makeToast(message: string, options: OptionsObject['variant'] | OptionsObject = 'default'): SnackbarKey {
    if (typeof options === 'string') {
        return enqueueSnackbar(message, { variant: options });
    }

    return enqueueSnackbar(message, options);
}
