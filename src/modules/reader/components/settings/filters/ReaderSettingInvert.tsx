/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';

export const ReaderSettingInvert = ({
    invert,
    updateSetting,
}: Pick<IReaderSettings['customFilter'], 'invert'> & {
    updateSetting: (invert: boolean) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Stack>
            <CheckboxInput
                label={t('reader.settings.custom_filter.invert')}
                checked={invert}
                onChange={(_, checked) => updateSetting(checked)}
            />
        </Stack>
    );
};
