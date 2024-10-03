/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { TranslationKey } from '@/Base.types.ts';

export enum GridLayout {
    Compact = 0,
    Comfortable = 1,
    List = 2,
}

export type ValueToDisplayData<Value extends string | number> = Record<
    Value,
    {
        title: TranslationKey;
        icon: ReactNode;
    }
>;
