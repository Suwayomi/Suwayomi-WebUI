/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Superscript } from '@/base/components/texts/Superscript.tsx';
import type { ValueToDisplayData } from '@/base/Base.types.ts';

export interface SelectButtonBaseProps<Value extends string | number, MultiValue extends Value | Value[] = Value> {
    value: MultiValue;
    defaultValue?: Value;
    values: Value[];
    setValue: (value: MultiValue) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
}

export interface SelectButtonDefaultableProps<
    Value extends string | number,
    MultiValue extends Value | Value[] = Value,
> extends OptionalProperty<SelectButtonBaseProps<Value, MultiValue>, 'value'> {
    isDefaultable?: boolean;
    onDefault?: () => void;
}

export type SelectButtonProps<Value extends string | number, MultiValue extends Value | Value[] = Value> =
    | (SelectButtonBaseProps<Value, MultiValue> & PropertiesNever<SelectButtonDefaultableProps<Value, MultiValue>>)
    | SelectButtonDefaultableProps<Value, MultiValue>;

export const SelectButton = <Value extends string | number, MultiValue extends Value | Value[] = Value>({
    value,
    values,
    defaultValue,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
}: SelectButtonProps<Value, MultiValue>) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
            {isDefaultable && (
                <Button key="default" onClick={onDefault} variant={value === undefined ? 'contained' : 'outlined'}>
                    {t`Default`}
                </Button>
            )}
            {values.map((displayValue) => {
                const isDefault = value === undefined && displayValue === defaultValue;
                const isMultiSelect = Array.isArray(value);
                const isSelected = isMultiSelect ? value.includes(displayValue) : displayValue === value;

                const newValue = (() => {
                    if (value === undefined) {
                        return isMultiSelect ? [displayValue] : displayValue;
                    }

                    if (isMultiSelect) {
                        return isSelected ? value.filter((v) => v !== displayValue) : [...value, displayValue];
                    }

                    return displayValue;
                })() as MultiValue;

                const text =
                    typeof valueToDisplayData[displayValue].title === 'string'
                        ? valueToDisplayData[displayValue].title
                        : t(valueToDisplayData[displayValue].title);

                return (
                    <CustomTooltip key={displayValue} title={isDefault ? t`Active setting` : ''}>
                        <Button
                            onClick={() => setValue(newValue)}
                            variant={isSelected ? 'contained' : 'outlined'}
                            startIcon={valueToDisplayData[displayValue].icon}
                        >
                            {isDefault ? <Superscript superscript="*" text={text} /> : text}
                        </Button>
                    </CustomTooltip>
                );
            })}
        </Stack>
    );
};
