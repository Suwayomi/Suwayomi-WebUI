/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useTranslation } from 'react-i18next';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton.tsx';
import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderPageScaleMode,
} from '@/modules/reader/types/Reader.types.ts';
import {
    PAGE_SCALE_VALUE_TO_DISPLAY_DATA,
    READER_PAGE_SCALE_MODE_TO_SCALING_ALLOWED,
    READER_PAGE_SCALE_MODE_VALUES,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { MultiValueButtonDefaultableProps } from '@/modules/core/Core.types.ts';

export const ReaderNavBarDesktopPageScale = ({
    pageScaleMode,
    shouldStretchPage,
    updateSetting,
    ...buttonSelectInputProps
}: Pick<IReaderSettingsWithDefaultFlag, 'pageScaleMode' | 'shouldStretchPage'> &
    Pick<MultiValueButtonDefaultableProps<ReaderPageScaleMode>, 'isDefaultable' | 'onDefault'> & {
        updateSetting: <Setting extends keyof Pick<IReaderSettings, 'pageScaleMode' | 'shouldStretchPage'>>(
            setting: Setting,
            value: IReaderSettings[Setting],
        ) => void;
    }) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <ValueRotationButton
                {...buttonSelectInputProps}
                value={pageScaleMode.isDefault ? undefined : pageScaleMode.value}
                values={READER_PAGE_SCALE_MODE_VALUES}
                setValue={(value) => updateSetting('pageScaleMode', value)}
                valueToDisplayData={PAGE_SCALE_VALUE_TO_DISPLAY_DATA}
                defaultIcon={PAGE_SCALE_VALUE_TO_DISPLAY_DATA[pageScaleMode.value].icon}
            />
            {READER_PAGE_SCALE_MODE_TO_SCALING_ALLOWED[pageScaleMode.value] && (
                <Tooltip title={t('reader.settings.label.scale_page')}>
                    <CustomIconButton
                        onClick={() => updateSetting('shouldStretchPage', !shouldStretchPage.value)}
                        sx={{ minWidth: 0 }}
                        variant="contained"
                        color={shouldStretchPage.value ? 'secondary' : 'primary'}
                    >
                        <FitScreenIcon />
                    </CustomIconButton>
                </Tooltip>
            )}
        </Stack>
    );
};
