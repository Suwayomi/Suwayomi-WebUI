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
import { ContextType, useLayoutEffect } from 'react';
import Popover from '@mui/material/Popover';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Link } from 'react-router-dom';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { ReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderChapterList } from '@/modules/reader/components/overlay/navigation/ReaderChapterList.tsx';
import { ReaderNavBarDesktopNextPreviousButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopNextPreviousButton.tsx';
import { getOptionForDirection } from '@/modules/theme/services/theme.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { ReaderResumeMode } from '@/modules/reader/types/Reader.types.ts';

export const ReaderNavBarDesktopChapterNavigation = ({
    currentChapter,
    previousChapter,
    nextChapter,
    chapters = [],
}: Pick<
    ContextType<typeof ReaderStateChaptersContext>,
    'chapters' | 'currentChapter' | 'previousChapter' | 'nextChapter'
>) => {
    const { t } = useTranslation();
    const readerThemeDirection = ReaderService.useGetThemeDirection();

    const popupState = usePopupState({ variant: 'popover', popupId: 'reader-nav-bar-desktop-chapter-list' });

    useLayoutEffect(() => {
        popupState.close();
    }, [currentChapter?.id]);

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }} dir="ltr">
            <ReaderNavBarDesktopNextPreviousButton
                component={Link}
                type="previous"
                title={t(
                    getOptionForDirection(
                        'reader.button.previous_chapter',
                        'reader.button.next_chapter',
                        readerThemeDirection,
                    ),
                )}
                disabled={getOptionForDirection(!previousChapter, !nextChapter, readerThemeDirection)}
                to={getOptionForDirection(
                    previousChapter && Chapters.getReaderUrl(previousChapter),
                    nextChapter && Chapters.getReaderUrl(nextChapter),
                    readerThemeDirection,
                )}
                replace
                state={{
                    resumeMode: getOptionForDirection(
                        ReaderResumeMode.END,
                        ReaderResumeMode.START,
                        readerThemeDirection,
                    ),
                }}
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
                disabled={getOptionForDirection(!nextChapter, !previousChapter, readerThemeDirection)}
                to={getOptionForDirection(
                    nextChapter && Chapters.getReaderUrl(nextChapter),
                    previousChapter && Chapters.getReaderUrl(previousChapter),
                    readerThemeDirection,
                )}
                replace
                state={{
                    resumeMode: getOptionForDirection(
                        ReaderResumeMode.START,
                        ReaderResumeMode.END,
                        readerThemeDirection,
                    ),
                }}
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
