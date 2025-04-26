/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { IReaderSettingsWithDefaultFlag, ReaderSettingsTypeProps } from '@/modules/reader/types/Reader.types.ts';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';
import { ReaderSettingExitMode } from '@/modules/reader/components/settings/behaviour/ReaderSettingExitMode.tsx';
import { isOffsetDoubleSpreadPagesEditable } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { SliderInput } from '@/modules/core/components/inputs/SliderInput.tsx';
import { DEFAULT_READER_SETTINGS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { ReaderSettingAutoScroll } from '@/modules/reader/components/settings/behaviour/ReaderSettingAutoScroll.tsx';
import { ReaderSettingScrollAmount } from '@/modules/reader/components/settings/behaviour/ReaderSettingScrollAmount.tsx';

export const ReaderBehaviourSettings = ({
    settings,
    updateSetting,
    onDefault,
}: {
    settings: IReaderSettingsWithDefaultFlag;
    updateSetting: (
        ...args: OmitFirst<Parameters<typeof ReaderService.updateSetting>>
    ) => ReturnType<typeof ReaderService.updateSetting>;
} & ReaderSettingsTypeProps) => {
    const { t } = useTranslation();

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderSettingExitMode
                exitMode={settings.exitMode}
                setExitMode={(value) => updateSetting('exitMode', value)}
            />
            <ReaderSettingScrollAmount
                scrollAmount={settings.scrollAmount}
                setScrollAmount={(value) => updateSetting('scrollAmount', value)}
            />
            <CheckboxInput
                label={t('reader.settings.label.skip_dup_chapters')}
                checked={settings.shouldSkipDupChapters}
                onChange={(_, checked) => updateSetting('shouldSkipDupChapters', checked)}
            />
            {isOffsetDoubleSpreadPagesEditable(settings.readingMode.value) && (
                <CheckboxInput
                    label={t('reader.settings.label.offset_double_spread')}
                    checked={settings.shouldOffsetDoubleSpreads.value}
                    onChange={(_, checked) => updateSetting('shouldOffsetDoubleSpreads', checked)}
                />
            )}
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t('reader.settings.infinite_scroll.title')}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t('reader.settings.infinite_scroll.description')}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldUseInfiniteScroll}
                onChange={(_, checked) => updateSetting('shouldUseInfiniteScroll', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t('reader.settings.preview.reading_mode.title')}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t('reader.settings.preview.reading_mode.description')}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldShowReadingModePreview}
                onChange={(_, checked) => updateSetting('shouldShowReadingModePreview', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t('reader.settings.preview.tap_zones.title')}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t('reader.settings.preview.tap_zones.description')}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldShowTapZoneLayoutPreview}
                onChange={(_, checked) => updateSetting('shouldShowTapZoneLayoutPreview', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t('reader.settings.auto_webtoon_mode.title')}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t('reader.settings.auto_webtoon_mode.description')}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldUseAutoWebtoonMode}
                onChange={(_, checked) => updateSetting('shouldUseAutoWebtoonMode', checked)}
            />
            <CheckboxInput
                label={t('reader.settings.chapter_transition.warning.missing_chapter')}
                checked={settings.shouldInformAboutMissingChapter}
                onChange={(_, checked) => updateSetting('shouldInformAboutMissingChapter', checked)}
            />
            <CheckboxInput
                label={t('reader.settings.chapter_transition.warning.scanlator_change')}
                checked={settings.shouldInformAboutScanlatorChange}
                onChange={(_, checked) => updateSetting('shouldInformAboutScanlatorChange', checked)}
            />
            <ReaderSettingAutoScroll
                autoScroll={settings.autoScroll}
                setAutoScroll={(...args) => updateSetting('autoScroll', ...args)}
            />
            <SliderInput
                label={t('reader.settings.image_preload_amount')}
                value={settings.imagePreLoadAmount}
                onDefault={() => onDefault?.('imagePreLoadAmount')}
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.imagePreLoadAmount,
                        value: settings.imagePreLoadAmount,
                        step: 1,
                        min: 1,
                        max: 20,
                        onChange: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, false);
                        },
                        onChangeCommitted: (_, value) => {
                            updateSetting('imagePreLoadAmount', value as number, true);
                        },
                    },
                }}
            />
        </Stack>
    );
};
