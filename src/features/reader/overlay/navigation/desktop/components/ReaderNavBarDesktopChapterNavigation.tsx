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
import MenuItem from '@mui/material/MenuItem';
import { memo, useLayoutEffect } from 'react';
import Popover from '@mui/material/Popover';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Link } from 'react-router-dom';
import { Select } from '@/base/components/inputs/Select.tsx';
import { ReaderChapterList } from '@/features/reader/overlay/navigation/components/ReaderChapterList.tsx';
import { ReaderNavBarDesktopNextPreviousButton } from '@/features/reader/overlay/navigation/desktop/components/ReaderNavBarDesktopNextPreviousButton.tsx';
import { getOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ReaderStateChapters } from '@/features/reader/Reader.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';

const BaseReaderNavBarDesktopChapterNavigation = ({
    currentChapter,
    previousChapter,
    nextChapter,
    chapters = [],
    readerThemeDirection,
    openChapter,
}: Pick<ReaderStateChapters, 'chapters' | 'currentChapter' | 'previousChapter' | 'nextChapter'> & {
    readerThemeDirection: ReturnType<typeof ReaderService.useGetThemeDirection>;
    openChapter: ReturnType<typeof ReaderControls.useOpenChapter>;
}) => {
    const { t } = useTranslation();

    const popupState = usePopupState({ variant: 'popover', popupId: 'reader-nav-bar-desktop-chapter-list' });

    useLayoutEffect(() => {
        popupState.close();
    }, [currentChapter?.id]);

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }} dir="ltr">
            <ReaderNavBarDesktopNextPreviousButton
                type="previous"
                title={t(
                    getOptionForDirection(
                        'reader.button.previous_chapter',
                        'reader.button.next_chapter',
                        readerThemeDirection,
                    ),
                )}
                onClick={() => {
                    openChapter(getOptionForDirection('previous', 'next', readerThemeDirection));
                }}
                disabled={getOptionForDirection(!previousChapter, !nextChapter, readerThemeDirection)}
            />
            <FormControl sx={{ flexBasis: '70%', flexGrow: 0, flexShrink: 0 }}>
                <InputLabel id="reader-nav-bar-desktop-chapter-select">{t('chapter.title_one')}</InputLabel>
                <Select
                    {...bindTrigger(popupState)}
                    open={popupState.isOpen}
                    value={currentChapter?.id ?? 0}
                    // hide actual select menu
                    MenuProps={{ sx: { visibility: 'hidden' } }}
                    label={t('chapter.title_one')}
                    labelId="reader-nav-bar-desktop-chapter-select"
                >
                    {/* hacky way to use the select component with a custom menu, the only possible value that is needed is the current chapter */}
                    <MenuItem key={currentChapter?.id} value={currentChapter?.id ?? 0}>
                        {currentChapter ? `#${currentChapter.chapterNumber} ${currentChapter.name}` : ''}
                    </MenuItem>
                </Select>
            </FormControl>
            <ReaderNavBarDesktopNextPreviousButton
                component={Link}
                type="next"
                title={t(
                    getOptionForDirection(
                        'reader.button.next_chapter',
                        'reader.button.previous_chapter',
                        readerThemeDirection,
                    ),
                )}
                onClick={() => {
                    openChapter(getOptionForDirection('next', 'previous', readerThemeDirection));
                }}
                disabled={getOptionForDirection(!nextChapter, !previousChapter, readerThemeDirection)}
            />
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ mb: 1 }}>
                    <ReaderChapterList
                        style={{
                            width: '500px',
                            maxWidth: '90vw',
                            minHeight: '150px',
                            maxHeight: '300px',
                        }}
                        currentChapter={currentChapter}
                        chapters={chapters}
                    />
                </Box>
            </Popover>
        </Stack>
    );
};

export const ReaderNavBarDesktopChapterNavigation = withPropsFrom(
    memo(BaseReaderNavBarDesktopChapterNavigation),
    [
        () => ({
            readerThemeDirection: ReaderService.useGetThemeDirection(),
        }),
        () => ({
            openChapter: ReaderControls.useOpenChapter(),
        }),
    ],
    ['readerThemeDirection', 'openChapter'],
);
