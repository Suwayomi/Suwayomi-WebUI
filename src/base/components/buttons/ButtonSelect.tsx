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
import { MultiValueButtonProps } from '@/base/Base.types.ts';
import { Superscript } from '@/base/components/texts/Superscript.tsx';

export const ButtonSelect = <Value extends string | number>({
    value,
    values,
    defaultValue,
    setValue,
    valueToDisplayData,
    isDefaultable,
    onDefault,
}: MultiValueButtonProps<Value>) => {
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

                const text = valueToDisplayData[displayValue].isTitleString
                    ? valueToDisplayData[displayValue].title
                    : t(valueToDisplayData[displayValue].title);

                return (
                    <CustomTooltip key={displayValue} title={isDefault ? t`Active setting` : ''}>
                        <Button
                            onClick={() => setValue(displayValue)}
                            variant={displayValue === value ? 'contained' : 'outlined'}
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
