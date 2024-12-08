/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { ReaderNavBarDesktopPageScale } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopPageScale.tsx';
import { ReaderNavBarDesktopReadingMode } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingMode.tsx';
import { ReaderNavBarDesktopOffsetDoubleSpread } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopOffsetDoubleSpread.tsx';
import { ReaderNavBarDesktopReadingDirection } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingDirection.tsx';
import { ReaderSettingsTypeProps } from '@/modules/reader/types/Reader.types.ts';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderNavBarDesktopProfile } from '@/modules/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopProfile.tsx';

export const ReaderNavBarDesktopQuickSettings = ({
    settings: {
        defaultProfile,
        profiles,
        readingMode,
        shouldOffsetDoubleSpreads,
        pageScaleMode,
        shouldStretchPage,
        readingDirection,
    },
    updateSetting,
    openSettings,
    isDefaultable,
    onDefault,
}: ReaderSettingsTypeProps & Pick<ReaderNavBarDesktopProps, 'openSettings'>) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 1 }}>
            <ReaderNavBarDesktopProfile
                defaultProfile={defaultProfile}
                profiles={profiles}
                updateSetting={(value) => updateSetting('defaultProfile', value)}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('defaultProfile')}
            />
            <ReaderNavBarDesktopReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => updateSetting('readingMode', value)}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('readingMode')}
            />
            <ReaderNavBarDesktopOffsetDoubleSpread
                readingMode={readingMode.value}
                shouldOffsetDoubleSpreads={shouldOffsetDoubleSpreads.value}
                setShouldOffsetDoubleSpreads={(value) => updateSetting('shouldOffsetDoubleSpreads', value)}
            />
            <ReaderNavBarDesktopPageScale
                pageScaleMode={pageScaleMode}
                shouldStretchPage={shouldStretchPage}
                updateSetting={updateSetting}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('pageScaleMode')}
            />
            <ReaderNavBarDesktopReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => updateSetting('readingDirection', value)}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('readingDirection')}
            />
            <Button
                onClick={() => openSettings()}
                size="large"
                sx={{ justifyContent: 'start', textTransform: 'none' }}
                variant="contained"
                startIcon={<SettingsIcon />}
            >
                {t('reader.settings.title.reader_settings')}
            </Button>
        </Stack>
    );
};
