/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { i18n } from '@/i18n';

export const createGetMenuItemTitle =
    <Action extends string>(
        isSingleMode: boolean,
        actionToTranslation: Record<
            Action,
            {
                action: {
                    single: MessageDescriptor;
                    selected: MessageDescriptor;
                };
                success: MessageDescriptor;
                error: MessageDescriptor;
            }
        >,
    ) =>
    (action: Action, count: number): string => {
        const countSuffix = count > 0 ? ` (${count})` : '';
        return `${i18n._(actionToTranslation[action].action[isSingleMode ? 'single' : 'selected'])}${countSuffix}`;
    };

export const createShouldShowMenuItem =
    (isSingleMode: boolean) =>
    (shouldBeVisible: boolean = false): boolean =>
        isSingleMode ? shouldBeVisible : true;

export const createIsMenuItemDisabled =
    (isSingleMode: boolean) =>
    (shouldBeDisabled: boolean): boolean =>
        isSingleMode ? false : shouldBeDisabled;
