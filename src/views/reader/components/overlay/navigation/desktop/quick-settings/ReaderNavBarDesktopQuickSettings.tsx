/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import { memo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { ReaderNavBarDesktopPageScale } from '@/views/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopPageScale.tsx';
import { ReaderNavBarDesktopReadingMode } from '@/views/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingMode.tsx';
import { ReaderNavBarDesktopOffsetDoubleSpread } from '@/views/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopOffsetDoubleSpread.tsx';
import { ReaderNavBarDesktopReadingDirection } from '@/views/reader/components/overlay/navigation/desktop/quick-settings/ReaderNavBarDesktopReadingDirection.tsx';
import type { ReaderNavBarDesktopProps } from '@/models/reader/overlay/ReaderOverlay.types.ts';
import { ReaderService } from '@/controllers/reader/services/ReaderService.ts';
import { ReaderNavBarDesktopAutoScroll } from '@/views/reader/components/auto-scroll/settings/quick-setting/ReaderNavBarDesktopAutoScroll.tsx';
import { useReaderSettingsStore } from '@/controllers/reader/stores/ReaderStore.ts';

const BaseReaderNavBarDesktopQuickSettings = ({ openSettings }: Pick<ReaderNavBarDesktopProps, 'openSettings'>) => {
    const { t } = useLingui();
    const { readingMode, shouldOffsetDoubleSpreads, pageScaleMode, shouldStretchPage, readingDirection, autoScroll } =
        useReaderSettingsStore(
            'readingMode',
            'shouldOffsetDoubleSpreads',
            'pageScaleMode',
            'shouldStretchPage',
            'readingDirection',
            'autoScroll',
        );

    return (
        <Stack sx={{ gap: 1 }}>
            <ReaderNavBarDesktopReadingMode
                readingMode={readingMode}
                setReadingMode={(value) => ReaderService.updateSetting('readingMode', value)}
                isDefaultable
                onDefault={() => ReaderService.deleteSetting('readingMode')}
            />
            <ReaderNavBarDesktopOffsetDoubleSpread
                readingMode={readingMode.value}
                shouldOffsetDoubleSpreads={shouldOffsetDoubleSpreads.value}
                setShouldOffsetDoubleSpreads={(value) => ReaderService.setOffsetDoubleSpreads(value)}
            />
            <ReaderNavBarDesktopPageScale
                pageScaleMode={pageScaleMode}
                shouldStretchPage={shouldStretchPage}
                updateSetting={ReaderService.updateSetting}
                isDefaultable
                onDefault={() => ReaderService.deleteSetting('pageScaleMode')}
            />
            <ReaderNavBarDesktopReadingDirection
                readingDirection={readingDirection}
                setReadingDirection={(value) => ReaderService.updateSetting('readingDirection', value)}
                isDefaultable
                onDefault={() => ReaderService.deleteSetting('readingDirection')}
            />
            <ReaderNavBarDesktopAutoScroll
                autoScroll={autoScroll}
                setAutoScroll={(...args) => ReaderService.updateSetting('autoScroll', ...args)}
            />
            <Button
                onClick={() => openSettings()}
                size="large"
                sx={{ justifyContent: 'start', textTransform: 'none' }}
                variant="contained"
                startIcon={<SettingsIcon />}
            >
                {t`Settings`}
            </Button>
        </Stack>
    );
};

export const ReaderNavBarDesktopQuickSettings = memo(BaseReaderNavBarDesktopQuickSettings);
