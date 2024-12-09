/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { ReactNode, useMemo } from 'react';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { MultiValueButtonProps } from '@/modules/core/Core.types.ts';
import { getNextRotationValue } from '@/modules/core/utils/ValueRotationButton.utils.ts';

export const ValueRotationButton = <Value extends string | number>({
    tooltip,
    value,
    values,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
    defaultIcon,
}: MultiValueButtonProps<Value> & { defaultIcon?: ReactNode }) => {
    const { t } = useTranslation();

    const isDefault = value === undefined;
    const indexOfValue = useMemo(() => {
        if (isDefault) {
            return -1;
        }

        return values.indexOf(value);
    }, [value, values]);

    return (
        <Tooltip title={tooltip}>
            {isDefault ? (
                <Button
                    onClick={() => setValue(values[0])}
                    sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                    variant="contained"
                    startIcon={defaultIcon}
                    size="large"
                >
                    {t('global.label.default')}
                </Button>
            ) : (
                <Button
                    onClick={() => {
                        const nextValue = getNextRotationValue(indexOfValue, values, isDefaultable);

                        if (nextValue === undefined) {
                            onDefault?.();
                            return;
                        }

                        setValue(nextValue);
                    }}
                    sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                    variant="contained"
                    startIcon={valueToDisplayData[value].icon}
                    size="large"
                >
                    {valueToDisplayData[value].isTitleString
                        ? valueToDisplayData[value].title
                        : t(valueToDisplayData[value].title)}
                </Button>
            )}
        </Tooltip>
    );
};
