/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { BaseSyntheticEvent } from 'react';
import React from 'react';
import { chainEventHandlers } from 'material-ui-popup-state/chainEventHandlers';
import type { SxProps, Theme } from '@mui/material/styles';

type SxItem = Exclude<SxProps<Theme>, readonly unknown[]>;

export class MUIUtil {
    static preventRipple(): (e: BaseSyntheticEvent) => void {
        return (e) => e.stopPropagation();
    }

    static preventRippleProp<T extends Record<string, unknown>[]>(
        ...handlers: T
    ): T & Pick<React.DOMAttributes<unknown>, 'onMouseDown' | 'onTouchStart'> {
        return chainEventHandlers(handlers[0], ...handlers.slice(1), {
            onMouseDown: MUIUtil.preventRipple(),
            onTouchStart: MUIUtil.preventRipple(),
        }) as T & Pick<React.DOMAttributes<unknown>, 'onMouseDown' | 'onTouchStart'>;
    }

    static mergeSx(...sxs: (SxProps<Theme> | undefined | null)[]): Array<SxItem> {
        return sxs.flatMap((sx) => {
            if (!sx) {
                return [];
            }

            if (Array.isArray(sx)) {
                return sx;
            }

            return [sx];
        });
    }
}
