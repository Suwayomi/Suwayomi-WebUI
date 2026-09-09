/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Superscript } from '@/base/components/texts/Superscript.tsx';
import type { ValueToDisplayData } from '@/base/Base.types.ts';
import { getNextRotationValue } from '@/lib/HelperFunctions.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';

export interface ValueRotationButtonBaseProps<Value extends string | number> {
    tooltip?: string;
    value: Value;
    defaultValue?: Value;
    values: Value[];
    setValue: (value: Value) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
}

export interface ValueRotationButtonDefaultableProps<Value extends string | number> extends OptionalProperty<
    ValueRotationButtonBaseProps<Value>,
    'value'
> {
    isDefaultable?: boolean;
    onDefault?: () => void;
}

export type ValueRotationButtonProps<Value extends string | number> =
    | (ValueRotationButtonBaseProps<Value> & PropertiesNever<ValueRotationButtonDefaultableProps<Value>>)
    | ValueRotationButtonDefaultableProps<Value>;

export const ValueRotationButton = <Value extends string | number>({
    tooltip,
    value,
    defaultValue,
    values,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
    defaultIcon,
    slots,
}: ValueRotationButtonProps<Value> & {
    defaultIcon?: ReactNode;
    slots?: {
        button?: {
            base?: ButtonProps;
            default?: ButtonProps;
            nonDefault?: ButtonProps;
        };
    };
}) => {
    const { t } = useLingui();

    const isDefault = value === undefined;
    const indexOfValue = useMemo(() => {
        if (isDefault) {
            return -1;
        }

        return values.indexOf(value);
    }, [value, values]);

    return (
        <CustomTooltip title={tooltip}>
            {isDefault ? (
                <Button
                    variant="contained"
                    size="large"
                    {...slots?.button?.base}
                    {...slots?.button?.default}
                    sx={MUIUtil.mergeSx(
                        { justifyContent: 'start', textTransform: 'unset', flexGrow: 1 },
                        slots?.button?.base?.sx,
                        slots?.button?.default?.sx,
                    )}
                    onClick={() => setValue(values[0])}
                    startIcon={defaultIcon}
                >
                    {defaultValue === undefined ? (
                        t`Default`
                    ) : (
                        <Superscript
                            superscript={`(${t`Default`})`}
                            text={
                                typeof valueToDisplayData[defaultValue].title === 'string'
                                    ? valueToDisplayData[defaultValue].title
                                    : t(valueToDisplayData[defaultValue].title)
                            }
                        />
                    )}
                </Button>
            ) : (
                <Button
                    variant="contained"
                    size="large"
                    {...slots?.button?.base}
                    {...slots?.button?.nonDefault}
                    sx={MUIUtil.mergeSx(
                        { justifyContent: 'start', textTransform: 'unset', flexGrow: 1 },
                        slots?.button?.base?.sx,
                        slots?.button?.nonDefault?.sx,
                    )}
                    onClick={() => {
                        const nextValue = getNextRotationValue(indexOfValue, values, isDefaultable);

                        if (nextValue === undefined) {
                            onDefault?.();
                            return;
                        }

                        setValue(nextValue);
                    }}
                    startIcon={valueToDisplayData[value].icon}
                >
                    {typeof valueToDisplayData[value].title === 'string'
                        ? valueToDisplayData[value].title
                        : t(valueToDisplayData[value].title)}
                </Button>
            )}
        </CustomTooltip>
    );
};
