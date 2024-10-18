/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import Button from '@mui/material/Button';
import { ValueToDisplayData } from '@/modules/core/Core.types.ts';

export const ValueRotationButton = <Value extends string | number>({
    value,
    values,
    setValue,
    valueToDisplayData,
}: {
    value: Value;
    values: Value[];
    setValue: (value: Value) => void;
    valueToDisplayData: ValueToDisplayData<Value>;
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
