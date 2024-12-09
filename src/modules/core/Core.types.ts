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

interface DisplayDataTranslationKey {
    isTitleString?: never;
    title: TranslationKey;
    icon: ReactNode;
}

interface DisplayDataString {
    isTitleString: true;
    title: string;
    icon: ReactNode;
}

type DisplayData = DisplayDataTranslationKey | DisplayDataString;

export type ValueToDisplayData<Value extends string | number> = Record<Value, DisplayData>;

export interface MultiValueButtonBaseProps<Value extends string | number> {
    value: Value;
    values: Value[];
    setValue: (value: Value) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
}

export interface MultiValueButtonDefaultableProps<Value extends string | number>
    extends OptionalProperty<MultiValueButtonBaseProps<Value>, 'value'> {
    isDefaultable?: boolean;
    onDefault?: () => void;
}

export type MultiValueButtonProps<Value extends string | number> =
    | (MultiValueButtonBaseProps<Value> & PropertiesNever<MultiValueButtonDefaultableProps<Value>>)
    | MultiValueButtonDefaultableProps<Value>;

export enum ScrollOffset {
    BACKWARD,
    FORWARD,
}

export enum ScrollDirection {
    X,
    Y,
    XY,
}
