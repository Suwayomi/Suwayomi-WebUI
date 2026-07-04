/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef } from 'react';
import type {
    LongPressCallbackMeta,
    LongPressMouseHandlers,
    LongPressPointerHandlers,
    LongPressReactEvents,
    LongPressResult,
    LongPressTouchHandlers,
} from 'use-long-press';
// oxlint-disable-next-line no-restricted-imports
import { useLongPress } from 'use-long-press';

export type UsePressResult = LongPressResult<
    (LongPressPointerHandlers | LongPressMouseHandlers | LongPressTouchHandlers) & {
        onClick: (event: React.MouseEvent | React.TouchEvent) => void;
    }
>;

export const usePress = (
    options: Omit<Parameters<typeof useLongPress>[1], 'onCancel' | 'onStart'> & {
        onLongPress: NonNullable<Parameters<typeof useLongPress>[0]>;
        onPress: (event: React.MouseEvent | React.TouchEvent) => void;
    },
): UsePressResult => {
    const { onLongPress, onPress, ...actualOptions } = options;

    const hasLongPressRef = useRef(false);

    const onCancel = useCallback(() => {
        if (hasLongPressRef.current) {
            hasLongPressRef.current = false;
        }
    }, []);

    const bind = useLongPress(
        useCallback(
            (event: LongPressReactEvents<Element>, meta: LongPressCallbackMeta<unknown>) => {
                hasLongPressRef.current = true;
                onLongPress(event, meta);
            },
            [onLongPress],
        ),
        {
            ...actualOptions,
            onCancel,
            onStart: onCancel,
        },
    );

    return useCallback(
        (context?: unknown) => ({
            ...bind(context),
            onClick: (event: React.MouseEvent | React.TouchEvent) => {
                if (!hasLongPressRef.current) {
                    onPress(event);
                } else {
                    event.preventDefault();
                }
            },
        }),
        [bind, onPress],
    );
};
