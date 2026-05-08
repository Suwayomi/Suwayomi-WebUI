/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import type { ReactNode } from 'react';

export enum GridLayout {
    Compact = 0,
    Comfortable = 1,
    List = 2,
}

export enum DirectionOffset {
    PREVIOUS = -1,
    NEXT = 1,
}

interface DisplayData {
    title: MessageDescriptor | string;
    icon: ReactNode;
}

export type ValueToDisplayData<Value extends string | number> = Record<Value, DisplayData>;

export interface MultiValueButtonBaseProps<Value extends string | number, MultiValue extends Value | Value[] = Value> {
    tooltip?: string;
    value: MultiValue;
    defaultValue?: Value;
    values: Value[];
    setValue: (value: MultiValue) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
}

export interface MultiValueButtonDefaultableProps<
    Value extends string | number,
    MultiValue extends Value | Value[] = Value,
> extends OptionalProperty<MultiValueButtonBaseProps<Value, MultiValue>, 'value'> {
    isDefaultable?: boolean;
    onDefault?: () => void;
}

export type MultiValueButtonProps<Value extends string | number, MultiValue extends Value | Value[] = Value> =
    | (MultiValueButtonBaseProps<Value, MultiValue> &
          PropertiesNever<MultiValueButtonDefaultableProps<Value, MultiValue>>)
    | MultiValueButtonDefaultableProps<Value, MultiValue>;

export enum ScrollOffset {
    BACKWARD,
    FORWARD,
}

export enum ScrollDirection {
    X,
    Y,
    XY,
}

export enum SearchParam {
    TAB = 'tab',
    QUERY = 'query',
    REDIRECT = 'redirect',
}
