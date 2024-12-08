/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { ContextType } from 'react';
import { ReaderSettingReadingMode } from '@/modules/reader/components/settings/layout/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/modules/reader/components/settings/layout/ReaderSettingReadingDirection.tsx';
import { ReaderSettingTapZoneLayout } from '@/modules/reader/components/settings/layout/ReaderSettingTapZoneLayout.tsx';
import { ReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';
import { ReaderSettingTapZoneInvertMode } from '@/modules/reader/components/settings/layout/ReaderSettingTapZoneInvertMode.tsx';
import { ReaderSettingPageScaleMode } from '@/modules/reader/components/settings/layout/ReaderSettingPageScaleMode.tsx';
import { ReaderSettingStretchPage } from '@/modules/reader/components/settings/layout/ReaderSettingStretchPage.tsx';
import { ReaderSettingsTypeProps } from '@/modules/reader/types/Reader.types.ts';
import { ReaderSettingPageGap } from '@/modules/reader/components/settings/layout/ReaderSettingPageGap.tsx';
import { ReaderSettingWidth } from '@/modules/reader/components/settings/layout/ReaderSettingWidth.tsx';

export const ReaderLayoutSettings = ({
    setShowPreview,
    settings,
    updateSetting,
    isDefaultable,
    onDefault,
}: ReaderSettingsTypeProps & {
    setShowPreview: ContextType<typeof ReaderTapZoneContext>['setShowPreview'];
}) => (
    <Stack sx={{ gap: 2 }}>
        <ReaderSettingReadingMode
            readingMode={settings.readingMode}
            setReadingMode={(value) => updateSetting('readingMode', value)}
            isDefaultable={isDefaultable}
            onDefault={() => onDefault?.('readingMode')}
        />
        <ReaderSettingPageGap
            pageGap={settings.pageGap}
            readingMode={settings.readingMode}
            updateSetting={(...args) => updateSetting('pageGap', ...args)}
        />
        <ReaderSettingReadingDirection
            readingDirection={settings.readingDirection}
            setReadingDirection={(value) => updateSetting('readingDirection', value)}
            isDefaultable={isDefaultable}
            onDefault={() => onDefault?.('readingDirection')}
        />
        <ReaderSettingTapZoneLayout
            tapZoneLayout={settings.tapZoneLayout}
            setTapZoneLayout={(value) => {
                setShowPreview(true);
                updateSetting('tapZoneLayout', value);
            }}
            isDefaultable={isDefaultable}
            onDefault={() => {
                setShowPreview(true);
                onDefault?.('tapZoneLayout');
            }}
        />
        <ReaderSettingTapZoneInvertMode
            tapZoneInvertMode={settings.tapZoneInvertMode}
            setTapZoneInvertMode={(value) => {
                setShowPreview(true);
                updateSetting('tapZoneInvertMode', value);
            }}
            isDefaultable={isDefaultable}
            onDefault={() => {
                setShowPreview(true);
                onDefault?.('tapZoneInvertMode');
            }}
        />
        <ReaderSettingPageScaleMode
            pageScaleMode={settings.pageScaleMode}
            setPageScaleMode={(value) => updateSetting('pageScaleMode', value)}
            isDefaultable={isDefaultable}
            onDefault={() => onDefault?.('pageScaleMode')}
        />
        <ReaderSettingStretchPage
            pageScaleMode={settings.pageScaleMode.value}
            shouldStretchPage={settings.shouldStretchPage.value}
            setShouldStretchPage={(value) => updateSetting('shouldStretchPage', value)}
        />
        <ReaderSettingWidth
            readerWidth={settings.readerWidth.value}
            pageScaleMode={settings.pageScaleMode.value}
            updateSetting={(...args) => updateSetting(...args)}
        />
    </Stack>
);
