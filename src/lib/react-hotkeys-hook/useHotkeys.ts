/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// oxlint-disable-next-line no-restricted-imports
import { useHotkeys as orgUseHotkeys } from 'react-hotkeys-hook';

export const useHotkeys = (...args: Parameters<typeof orgUseHotkeys>): ReturnType<typeof orgUseHotkeys> => {
    const [keys, callback, options, dependencies] = args;
    return orgUseHotkeys(
        keys,
        callback,
        {
            preventDefault: true,
            useKey: true,
            ...options,
        },
        dependencies,
    );
};
