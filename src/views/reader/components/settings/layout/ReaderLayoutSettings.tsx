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
import { useLingui } from '@lingui/react/macro';
import { ReaderSettingReadingMode } from '@/views/reader/components/settings/layout/ReaderSettingReadingMode.tsx';
import { ReaderSettingReadingDirection } from '@/views/reader/components/settings/layout/ReaderSettingReadingDirection.tsx';
import { ReaderSettingTapZoneLayout } from '@/views/reader/components/settings/layout/ReaderSettingTapZoneLayout.tsx';
import { ReaderSettingTapZoneInvertMode } from '@/views/reader/components/settings/layout/ReaderSettingTapZoneInvertMode.tsx';
import { ReaderSettingPageScaleMode } from '@/views/reader/components/settings/layout/ReaderSettingPageScaleMode.tsx';
import { ReaderSettingStretchPage } from '@/views/reader/components/settings/layout/ReaderSettingStretchPage.tsx';
import type { ReaderSettingsTypeProps } from '@/models/reader/Reader.types.ts';
import { ReaderSettingPageGap } from '@/views/reader/components/settings/layout/ReaderSettingPageGap.tsx';
import { ReaderSettingWidth } from '@/views/reader/components/settings/layout/ReaderSettingWidth.tsx';
import { DefaultSettingFootnote } from '@/views/reader/components/settings/DefaultSettingFootnote.tsx';
import { getReaderTapZoneStore } from '@/controllers/reader/stores/ReaderStore.ts';
import { ReaderDefaultLayoutSettings } from '@/views/reader/components/settings/layout/ReaderDefaultLayoutSettings.tsx';
import { CheckboxInput } from '@/views/base/components/inputs/CheckboxInput.tsx';
import { ResetButton } from '@/views/base/components/buttons/ResetButton.tsx';

export const ReaderLayoutSettings = ({
    settings,
    updateSetting,
    isDefaultable,
    onDefault,
    isSeriesMode,
    setTransparent,
}: ReaderSettingsTypeProps & {
    isSeriesMode?: boolean;
}) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ gap: 2 }}>
            <DefaultSettingFootnote areDefaultSettings={!isDefaultable} />
            {isSeriesMode && (
                <>
                    <Typography>{t`Series settings`}</Typography>
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
                    getReaderTapZoneStore().setShowPreview(true);
                    updateSetting('tapZoneLayout', value);
                }}
                isDefaultable={isDefaultable}
                onDefault={() => {
                    getReaderTapZoneStore().setShowPreview(true);
                    onDefault?.('tapZoneLayout');
                }}
            />
            <ReaderSettingTapZoneInvertMode
                tapZoneInvertMode={settings.tapZoneInvertMode}
                setTapZoneInvertMode={(value) => {
                    getReaderTapZoneStore().setShowPreview(true);
                    updateSetting('tapZoneInvertMode', value);
                }}
                isDefaultable={isDefaultable}
                onDefault={() => {
                    getReaderTapZoneStore().setShowPreview(true);
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
                isDefaultable={isDefaultable}
                onDefault={() => onDefault?.('readerWidth')}
                updateSetting={(...args) => updateSetting(...args)}
                setTransparent={setTransparent}
            />
            <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <CheckboxInput
                    label={t`Crop borders`}
                    checked={settings.shouldCropBorders.value}
                    onChange={(_, checked) => updateSetting('shouldCropBorders', checked)}
                />
                {isDefaultable && <ResetButton onClick={() => onDefault?.('shouldCropBorders')} variant="outlined" />}
            </Stack>
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
