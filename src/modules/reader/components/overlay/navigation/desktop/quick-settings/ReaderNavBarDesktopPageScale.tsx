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
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';
import ExpandIcon from '@mui/icons-material/Expand';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton.tsx';
import { ValueRotationButton } from '@/modules/core/components/buttons/ValueRotationButton.tsx';
import { IReaderSettings, ReaderPageScaleMode } from '@/modules/reader/types/Reader.types.ts';
import { ValueToDisplayData } from '@/modules/core/Core.types';

const VALUE_TO_DISPLAY_DATA: ValueToDisplayData<ReaderPageScaleMode> = {
    [ReaderPageScaleMode.WIDTH]: {
        title: 'reader.settings.page_scale.width',
        icon: <ExpandIcon sx={{ transform: 'rotate(90deg)' }} />,
    },
    [ReaderPageScaleMode.HEIGHT]: {
        title: 'reader.settings.page_scale.height',
        icon: <ExpandIcon />,
    },
    [ReaderPageScaleMode.SCREEN]: {
        title: 'reader.settings.page_scale.screen',
        icon: <ZoomOutMapIcon />,
    },
    [ReaderPageScaleMode.ORIGINAL]: {
        title: 'reader.settings.page_scale.original',
        icon: <CropOriginalIcon />,
    },
};

const READER_PAGE_SCALE_MODE_VALUES = Object.values(ReaderPageScaleMode).filter((value) => typeof value === 'number');

export const ReaderNavBarDesktopPageScale = ({
    pageScaleMode,
    shouldScalePage,
    updateSetting,
}: Pick<IReaderSettings, 'pageScaleMode' | 'shouldScalePage'> & {
    updateSetting: <Setting extends keyof Pick<IReaderSettings, 'pageScaleMode' | 'shouldScalePage'>>(
        setting: Setting,
        value: IReaderSettings[Setting],
    ) => void;
}) => {
    const { t } = useTranslation();

    const isPageScalingPossible = pageScaleMode !== ReaderPageScaleMode.ORIGINAL;

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <ValueRotationButton
                value={pageScaleMode}
                values={READER_PAGE_SCALE_MODE_VALUES}
                setValue={(value) => updateSetting('pageScaleMode', value)}
                valueToDisplayData={VALUE_TO_DISPLAY_DATA}
            />
            {isPageScalingPossible && (
                <Tooltip title={t('reader.settings.label.scale_page')}>
                    <CustomIconButton
                        onClick={() => updateSetting('shouldScalePage', !shouldScalePage)}
                        sx={{ minWidth: 0 }}
                        variant="contained"
                        color={shouldScalePage ? 'secondary' : 'primary'}
                    >
                        <FitScreenIcon />
                    </CustomIconButton>
                </Tooltip>
            )}
        </Stack>
    );
};
