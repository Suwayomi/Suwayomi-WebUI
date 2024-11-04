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
import { MultiValueButtonProps } from '@/modules/core/Core.types.ts';

export const ValueRotationButton = <Value extends string | number>({
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

    if (isDefault) {
        return (
            <Button
                onClick={() => setValue(values[0])}
                sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
                variant="contained"
                startIcon={defaultIcon}
                size="large"
            >
                {t('global.label.default')}
            </Button>
        );
    }

    return (
        <Button
            onClick={() => {
                const nextValueIndex = (indexOfValue + 1) % values.length;
                const wasLastValue = nextValueIndex === 0;

                const isDefaultNextValue = isDefaultable && wasLastValue;
                if (isDefaultNextValue) {
                    onDefault?.();
                    return;
                }

                setValue(values[(indexOfValue + 1) % values.length]);
            }}
            sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
            variant="contained"
            startIcon={valueToDisplayData[value].icon}
            size="large"
        >
            {t(valueToDisplayData[value].title)}
        </Button>
    );
};
