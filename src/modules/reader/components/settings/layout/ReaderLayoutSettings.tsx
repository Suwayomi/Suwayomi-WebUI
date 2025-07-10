/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { useTranslation } from 'react-i18next';
import { ReaderSettingReadingMode } from '@/modules/reader/components/settings/layout/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/modules/reader/components/settings/layout/ReaderSettingReadingDirection.tsx';
import { ReaderSettingTapZoneLayout } from '@/modules/reader/components/settings/layout/ReaderSettingTapZoneLayout.tsx';
import { ReaderSettingTapZoneInvertMode } from '@/modules/reader/components/settings/layout/ReaderSettingTapZoneInvertMode.tsx';
import { ReaderSettingPageScaleMode } from '@/modules/reader/components/settings/layout/ReaderSettingPageScaleMode.tsx';
import { ReaderSettingStretchPage } from '@/modules/reader/components/settings/layout/ReaderSettingStretchPage.tsx';
import { ReaderSettingsTypeProps } from '@/modules/reader/types/Reader.types.ts';
import { ReaderSettingPageGap } from '@/modules/reader/components/settings/layout/ReaderSettingPageGap.tsx';
import { ReaderSettingWidth } from '@/modules/reader/components/settings/layout/ReaderSettingWidth.tsx';
import { ReaderSettingSwipePreviewThreshold } from '@/modules/reader/components/settings/layout/ReaderSettingSwipePreviewThreshold.tsx';
import { DefaultSettingFootnote } from '@/modules/reader/components/settings/DefaultSettingFootnote.tsx';
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { ReaderDefaultLayoutSettings } from '@/modules/reader/components/settings/layout/ReaderDefaultLayoutSettings.tsx';

export const ReaderLayoutSettings = ({
    setShowPreview,
    settings,
    updateSetting,
    isDefaultable,
    onDefault,
    isSeriesMode,
    setTransparent,
}: ReaderSettingsTypeProps & {
    setShowPreview: TReaderTapZoneContext['setShowPreview'];
    isSeriesMode?: boolean;
}) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2 }}>
            <DefaultSettingFootnote areDefaultSettings={!isDefaultable} />
            {isSeriesMode && (
                <>
                    <Typography>{t('reader.settings.source_series')}</Typography>
                    <ReaderSettingReadingMode
                        readingMode={settings.readingMode}
                        setReadingMode={(value) => updateSetting('readingMode', value)}
                        isDefaultable={isDefaultable}
                        onDefault={() => onDefault?.('readingMode')}
                    />
                </>
            )}
            <ReaderSettingPageGap
                pageGap={settings.pageGap}
                readingMode={settings.readingMode}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('pageGap')}
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
            <ReaderSettingSwipePreviewThreshold
                swipePreviewThreshold={settings.swipePreviewThreshold}
                readingMode={settings.readingMode}
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('swipePreviewThreshold')}
                updateSetting={(...args) => updateSetting('swipePreviewThreshold', ...args)}
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
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('readerWidth')}
                updateSetting={(...args) => updateSetting(...args)}
                setTransparent={setTransparent}
            />
            {isSeriesMode && (
                <>
                    <Divider />
                    <ReaderDefaultLayoutSettings
                        profiles={[settings.readingMode.value]}
                        updateSetting={updateSetting}
                        isSeriesMode={isSeriesMode}
                        setTransparent={setTransparent}
                    />
                </>
            )}
        </Stack>
    );
};
