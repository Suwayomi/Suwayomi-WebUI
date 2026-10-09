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
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { armNativeContextMenuOnSecondRightClick, SECONDARY_MOUSE_BUTTON } from '@/base/utils/NativeContextMenu.ts';

export type UsePressResult = LongPressResult<
    (LongPressPointerHandlers | LongPressMouseHandlers | LongPressTouchHandlers) & {
        onClick: (event: React.MouseEvent | React.TouchEvent) => void;
        onContextMenu: (event: React.MouseEvent) => void;
    }
>;

export const usePress = (
    options: Omit<Parameters<typeof useLongPress>[1], 'onCancel' | 'onStart'> & {
        filterEvents?: (event: LongPressReactEvents<Element>) => boolean;
        onLongPress: NonNullable<Parameters<typeof useLongPress>[0]>;
        onPress: (event: React.MouseEvent | React.TouchEvent) => void;
    },
): UsePressResult => {
    const { onLongPress, onPress, filterEvents, ...actualOptions } = options;

    const isTouchDevice = MediaQuery.useIsTouchDevice();
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
            // the secondary button is handled by the "contextmenu" event, otherwise the long press timer would
            // open the custom menu in addition to (and delayed after) the native one
            filterEvents: (event) => {
                const isSecondaryButton = 'button' in event && event.button === SECONDARY_MOUSE_BUTTON;
                if (isSecondaryButton) {
                    return false;
                }

                return filterEvents?.(event) ?? true;
            },
            onCancel,
            onStart: onCancel,
        },
    );

    return useCallback(
        (context?: unknown) => ({
            ...bind(context),
            onContextMenu: (event: React.MouseEvent) => {
                // the native menu is replaced by the custom one, on touch devices the long press already opens it
                event.preventDefault();

                if (!isTouchDevice) {
                    onLongPress(event, { context });
                    armNativeContextMenuOnSecondRightClick({ x: event.clientX, y: event.clientY });
                }
            },
            onClick: (event: React.MouseEvent | React.TouchEvent) => {
                if (!hasLongPressRef.current) {
                    onPress(event);
                } else {
                    event.preventDefault();
                }
            },
        }),
        [bind, onPress, onLongPress, isTouchDevice],
    );
};
