/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReadingDirection,
} from '@/modules/reader/types/Reader.types.ts';
import {
    PAGE_SCALE_VALUE_TO_DISPLAY_DATA,
    READER_PAGE_SCALE_MODE_VALUES,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { ButtonSelectInput } from '@/modules/core/components/inputs/ButtonSelectInput.tsx';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';

export const ReaderSettingPageScaleMode = ({
    pageScaleMode,
    setPageScaleMode,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'pageScaleMode'> &
    Pick<MultiValueButtonDefaultableProps<ReadingDirection>, 'isDefaultable' | 'onDefault'> & {
        setPageScaleMode: (mode: IReaderSettings['pageScaleMode']) => void;
    }) => {
    const { t } = useTranslation();

    return (
        <ButtonSelectInput
            {...buttonSelectInputProps}
            label={t('reader.settings.page_scale.title')}
            value={pageScaleMode.isDefault ? undefined : pageScaleMode.value}
            defaultValue={pageScaleMode.isDefault ? pageScaleMode.value : undefined}
            values={READER_PAGE_SCALE_MODE_VALUES}
            setValue={setPageScaleMode}
            valueToDisplayData={PAGE_SCALE_VALUE_TO_DISPLAY_DATA}
        />
    );
};
