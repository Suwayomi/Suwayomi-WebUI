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
import { useState } from 'react';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { CustomIconButton } from '@/modules/core/components/buttons/CustomIconButton.tsx';
import { ValueRotationButton } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ValueRotationButton.tsx';

enum ReaderPageScale {
    WIDTH,
    HEIGHT,
    SCREEN,
    ORIGINAL,
}

export const ReaderNavBarDesktopPageScale = () => {
    const { t } = useTranslation();

    const [pageScale, setPageScale] = useState<ReaderPageScale>(ReaderPageScale.ORIGINAL);
    const [shouldScalePages, setShouldScalePages] = useState(false);

    const isPageScalingPossible = pageScale !== ReaderPageScale.ORIGINAL;

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <ValueRotationButton
                value={pageScale}
                values={Object.values(ReaderPageScale).filter((value) => typeof value === 'number')}
                setValue={setPageScale}
                valueToDisplayData={{
                    [ReaderPageScale.WIDTH]: {
                        title: 'reader.settings.page_scale.width',
                        icon: <ExpandIcon sx={{ transform: 'rotate(90deg)' }} />,
                    },
                    [ReaderPageScale.HEIGHT]: {
                        title: 'reader.settings.page_scale.height',
                        icon: <ExpandIcon />,
                    },
                    [ReaderPageScale.SCREEN]: {
                        title: 'reader.settings.page_scale.screen',
                        icon: <ZoomOutMapIcon />,
                    },
                    [ReaderPageScale.ORIGINAL]: {
                        title: 'reader.settings.page_scale.original',
                        icon: <CropOriginalIcon />,
                    },
                }}
            />
            {isPageScalingPossible && (
                <Tooltip title={t('reader.settings.label.scale_page')}>
                    <CustomIconButton
                        onClick={() => setShouldScalePages(!shouldScalePages)}
                        sx={{ minWidth: 0 }}
                        variant="contained"
                        color={shouldScalePages ? 'secondary' : 'primary'}
                    >
                        <FitScreenIcon />
                    </CustomIconButton>
                </Tooltip>
            )}
        </Stack>
    );
};
