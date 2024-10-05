/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ParseKeys } from 'i18next';

export enum DirectionOffset {
    PREVIOUS = -1,
    NEXT = 1,
}

export type NullAndUndefined<T> = T | null | undefined;

export type TranslationKey = ParseKeys;
