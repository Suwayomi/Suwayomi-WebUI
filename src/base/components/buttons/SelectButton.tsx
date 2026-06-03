/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { StackProps } from '@mui/material/Stack';
import Stack from '@mui/material/Stack';
import type { ButtonProps } from '@mui/material/Button';
import Button from '@mui/material/Button';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Superscript } from '@/base/components/texts/Superscript.tsx';
import type { ValueToDisplayData } from '@/base/Base.types.ts';
import type { ReactNode, RefObject } from 'react';
import { useCallback, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { assertIsDefined } from '@/base/Asserts.ts';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useElementSize } from '@mantine/hooks';

export interface SelectButtonBaseProps<Value extends string | number, MultiValue extends Value | Value[] = Value> {
    value: MultiValue;
    defaultValue?: Value;
    values: Value[];
    setValue: (value: MultiValue) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
    isCollapsible?: MultiValue extends Value[] ? never : boolean;
    tooltip?: MultiValue extends Value[] ? never : ReactNode;
    defaultIcon?: MultiValue extends Value[] ? never : ReactNode;
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

const SelectButtonBase = <Value extends string | number, MultiValue extends Value | Value[] = Value>({
    ref,
    value,
    values,
    defaultValue,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
    slotProps,
}: SelectButtonProps<Value, MultiValue> & {
    ref?: RefObject<HTMLDivElement>;
    slotProps?: {
        stack?: StackProps;
        defaultButton?: ButtonProps & { hideText?: boolean };
        button?: ButtonProps & { hideText?: boolean; tooltip?: (isDefault: boolean, title: string) => ReactNode };
    };
}) => {
    const { t } = useLingui();

    return (
        <Stack
            {...slotProps?.stack}
            ref={ref}
            sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1, ...slotProps?.stack?.sx }}
        >
            {isDefaultable && (
                <CustomTooltip title={slotProps?.defaultButton?.hideText ? t`Default` : null}>
                    <Button
                        onClick={onDefault}
                        variant={value === undefined ? 'contained' : 'outlined'}
                        {...slotProps?.defaultButton}
                        startIcon={!slotProps?.defaultButton?.hideText && slotProps?.defaultButton?.startIcon}
                        endIcon={!slotProps?.defaultButton?.hideText && slotProps?.defaultButton?.endIcon}
                    >
                        {!slotProps?.defaultButton?.hideText
                            ? t`Default`
                            : (slotProps?.defaultButton?.startIcon ?? slotProps?.defaultButton?.endIcon)}
                    </Button>
                </CustomTooltip>
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
                    <CustomTooltip
                        key={displayValue}
                        title={slotProps?.button?.tooltip?.(isDefault, text) ?? (isDefault ? t`Active setting` : '')}
                    >
                        <Button
                            variant={isSelected ? 'contained' : 'outlined'}
                            startIcon={!slotProps?.button?.hideText && valueToDisplayData[displayValue].icon}
                            {...slotProps?.button}
                            onClick={() => setValue(newValue)}
                        >
                            {(() => {
                                if (slotProps?.button?.hideText) {
                                    return isDefault ? (
                                        <Superscript superscript="*" text={valueToDisplayData[displayValue].icon} />
                                    ) : (
                                        valueToDisplayData[displayValue].icon
                                    );
                                }

                                return isDefault ? <Superscript superscript="*" text={text} /> : text;
                            })()}
                        </Button>
                    </CustomTooltip>
                );
            })}
        </Stack>
    );
};

const SelectButtonCollapsible = <Value extends string | number, MultiValue extends Value | Value[] = Value>(
    props: SelectButtonProps<Value, MultiValue>,
) => {
    const { tooltip, value, valueToDisplayData, defaultValue, onDefault, setValue, defaultIcon } = props;

    const { t } = useLingui();
    const { ref, height } = useElementSize();

    const [isExpanded, setIsExpanded] = useState(false);

    const finalOnDefault = useCallback(() => {
        setIsExpanded(false);
        onDefault?.();
    }, [onDefault]);

    const finalSetValue = useCallback(
        (...args: Parameters<typeof setValue>) => {
            setIsExpanded(false);
            setValue(...args);
        },
        [setValue],
    );

    if (!isExpanded) {
        return (
            <CustomTooltip title={tooltip}>
                <Button
                    ref={ref}
                    onClick={() => setIsExpanded(true)}
                    variant="contained"
                    size="large"
                    startIcon={defaultIcon}
                    sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                >
                    {(() => {
                        const isDefault = value === undefined && defaultValue !== undefined;
                        if (!isDefault) {
                            assertIsDefined(value);

                            const { title } = valueToDisplayData[value as Value];

                            return typeof title === 'string' ? title : t(title);
                        }

                        const { title } = valueToDisplayData[defaultValue];

                        return (
                            <Superscript
                                superscript={`(${t`Default`})`}
                                text={typeof title === 'string' ? title : t(title)}
                            />
                        );
                    })()}
                </Button>
            </CustomTooltip>
        );
    }

    return (
        <ClickAwayListener onClickAway={() => setIsExpanded(false)}>
            <SelectButtonBase
                {...props}
                onDefault={finalOnDefault}
                setValue={finalSetValue}
                slotProps={{
                    stack: {
                        sx: {
                            flexGrow: 1,
                        },
                    },
                    defaultButton: {
                        hideText: true,
                        startIcon: <RestartAltIcon />,
                        size: 'large',
                        sx: {
                            flexGrow: 1,
                            height,
                            minWidth: 'unset',
                            px: '10px',
                        },
                    },
                    button: {
                        hideText: true,
                        tooltip: (isDefault, title) => (isDefault ? t`Active setting (${title})` : title),
                        size: 'large',
                        sx: {
                            flexGrow: 1,
                            height,
                            minWidth: 'unset',
                            px: '10px',
                        },
                    },
                }}
            />
        </ClickAwayListener>
    );
};

export const SelectButton = <Value extends string | number, MultiValue extends Value | Value[] = Value>(
    props: SelectButtonProps<Value, MultiValue>,
) => {
    const { isCollapsible } = props;

    if (isCollapsible) {
        return <SelectButtonCollapsible {...props} />;
    }

    return <SelectButtonBase {...props} />;
};
