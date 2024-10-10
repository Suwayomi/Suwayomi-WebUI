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
import { TranslationKey } from '@/Base.types.ts';

export const ValueRotationButton = <Value extends string | number>({
    value,
    values,
    setValue,
    valueToDisplayData,
}: {
    value: Value;
    values: Value[];
    setValue: (value: Value) => void;
    valueToDisplayData: Record<
        Value,
        {
            title: TranslationKey;
            icon: ReactNode;
        }
    >;
}) => {
    const { t } = useTranslation();

    const indexOfValue = useMemo(() => values.indexOf(value), [value, values]);

    return (
        <Button
            onClick={() => setValue(values[(indexOfValue + 1) % values.length])}
            sx={{ justifyContent: 'start', textTransform: 'unset', flexGrow: 1 }}
            variant="contained"
            startIcon={valueToDisplayData[value].icon}
            size="large"
        >
            {t(valueToDisplayData[value].title)}
        </Button>
    );
};
