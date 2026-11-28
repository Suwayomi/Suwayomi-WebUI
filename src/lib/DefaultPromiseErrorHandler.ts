/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const defaultPromiseErrorHandler =
    (name: string, allowProd: boolean = false) =>
    (error: any) => {
        if (!allowProd && import.meta.env.PROD) {
            return;
        }

        // biome-ignore lint/suspicious/noConsole: kept as before the Biome migration
        console.error(`${name} failed due to`, error);
    };
