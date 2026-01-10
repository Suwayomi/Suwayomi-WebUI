/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { IReaderSettingsWithDefaultFlag, ReaderSettingsTypeProps } from '@/features/reader/Reader.types.ts';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { ReaderSettingExitMode } from '@/features/reader/settings/behaviour/components/ReaderSettingExitMode.tsx';
import { isOffsetDoubleSpreadPagesEditable } from '@/features/reader/settings/ReaderSettings.utils.tsx';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';
import {
    DEFAULT_READER_SETTINGS,
    IMAGE_PRE_LOAD_AMOUNT,
} from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderSettingAutoScroll } from '@/features/reader/auto-scroll/settings/ReaderSettingAutoScroll.tsx';
import { ReaderSettingScrollAmount } from '@/features/reader/settings/behaviour/components/ReaderSettingScrollAmount.tsx';

export const ReaderBehaviourSettings = ({
    settings,
    updateSetting,
    onDefault,
    isDefaultable,
}: {
    settings: IReaderSettingsWithDefaultFlag;
    updateSetting: (
        ...args: Parameters<typeof ReaderService.updateSetting>
    ) => ReturnType<typeof ReaderService.updateSetting>;
} & ReaderSettingsTypeProps) => {
    const { t } = useLingui();

    return (
        <Stack sx={{ gap: 2 }}>
            <ReaderSettingExitMode
                exitMode={settings.exitMode}
                setExitMode={(value) => updateSetting('exitMode', value)}
            />
            <ReaderSettingScrollAmount
                scrollAmount={settings.scrollAmount}
                setScrollAmount={(value, commit) => updateSetting('scrollAmount', value, commit)}
            />
            <CheckboxInput
                label={t`Skip duplicate chapters`}
                checked={settings.shouldSkipDupChapters}
                onChange={(_, checked) => updateSetting('shouldSkipDupChapters', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t`Skip filtered chapters`}</Typography>
                        {isDefaultable && (
                            <Typography variant="body2" color="textDisabled">
                                {t`Setting can not be changed while the reader is opened`}
                            </Typography>
                        )}
                    </Box>
                }
                checked={settings.shouldSkipFilteredChapters}
                onChange={(_, checked) => updateSetting('shouldSkipFilteredChapters', checked)}
                disabled={isDefaultable}
            />
            {isOffsetDoubleSpreadPagesEditable(settings.readingMode.value) && (
                <CheckboxInput
                    label={t`Offset double spreads`}
                    checked={settings.shouldOffsetDoubleSpreads.value}
                    onChange={(_, checked) => updateSetting('shouldOffsetDoubleSpreads', checked)}
                />
            )}
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t`Continuous chapter display`}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t`Keep previous and upcoming chapters visible while reading in continuous reading modes, allowing seamless scrolling between chapters.`}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldUseInfiniteScroll}
                onChange={(_, checked) => updateSetting('shouldUseInfiniteScroll', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t`Show reading mode`}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t`Briefly show current mode when reader is opened or mode got changed`}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldShowReadingModePreview}
                onChange={(_, checked) => updateSetting('shouldShowReadingModePreview', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t`Show tap zones overlay`}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t`Briefly show tap zone layout preview when reader is opened or layout got changed`}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldShowTapZoneLayoutPreview}
                onChange={(_, checked) => updateSetting('shouldShowTapZoneLayoutPreview', checked)}
            />
            <CheckboxInput
                label={
                    <Box>
                        <Typography>{t`Auto webtoon mode`}</Typography>
                        <Typography variant="body2" color="textDisabled">
                            {t`Automatically use webtoon mode for entries that are detected to likely use the long strip format`}
                        </Typography>
                    </Box>
                }
                checked={settings.shouldUseAutoWebtoonMode}
                onChange={(_, checked) => updateSetting('shouldUseAutoWebtoonMode', checked)}
            />
            <CheckboxInput
                label={t`Show transition page`}
                checked={settings.shouldShowTransitionPage}
                onChange={(_, checked) => updateSetting('shouldShowTransitionPage', checked)}
            />
            <CheckboxInput
                label={t`Inform about missing chapters on chapter transition`}
                checked={settings.shouldInformAboutMissingChapter}
                onChange={(_, checked) => updateSetting('shouldInformAboutMissingChapter', checked)}
            />
            <CheckboxInput
                label={t`Inform about changing scanlator on chapter transition`}
                checked={settings.shouldInformAboutScanlatorChange}
                onChange={(_, checked) => updateSetting('shouldInformAboutScanlatorChange', checked)}
            />
            <ReaderSettingAutoScroll
                autoScroll={settings.autoScroll}
                setAutoScroll={(...args) => updateSetting('autoScroll', ...args)}
            />
            <SliderInput
                label={t`Preload images`}
                value={settings.imagePreLoadAmount}
                onDefault={() => onDefault?.('imagePreLoadAmount')}
                slotProps={{
                    slider: {
                        defaultValue: DEFAULT_READER_SETTINGS.imagePreLoadAmount,
                        value: settings.imagePreLoadAmount,
                        step: IMAGE_PRE_LOAD_AMOUNT.step,
                        min: IMAGE_PRE_LOAD_AMOUNT.min,
                        max: IMAGE_PRE_LOAD_AMOUNT.max,
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
