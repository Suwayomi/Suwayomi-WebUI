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
import { Virtuoso } from 'react-virtuoso';
import { useMemo } from 'react';
import Popover from '@mui/material/Popover';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import { Link } from 'react-router-dom';
import { ReaderNavBarDesktopProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { ChapterCard } from '@/modules/chapter/components/cards/ChapterCard.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { IChapterWithMeta } from '@/modules/chapter/components/ChapterList.tsx';
import { ReaderNavBarDesktopPreviousButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopPreviousButton.tsx';
import { ReaderNavBarDesktopNextButton } from '@/modules/reader/components/overlay/navigation/desktop/ReaderNavBarDesktopNextButton.tsx';

export const ReaderNavBarDesktopChapterNavigation = ({
    currentChapterIndex,
    chapter,
    chapters,
}: Pick<ReaderNavBarDesktopProps, 'currentChapterIndex' | 'chapter' | 'chapters'>) => {
    const { t } = useTranslation();

    const popupState = usePopupState({ variant: 'popover', popupId: 'reader-nav-bar-desktop-chapter-list' });

    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const chaptersWithMeta: IChapterWithMeta[] = useMemo(
        () =>
            chapters.map((baseChapter) => {
                const downloadChapter = queue?.find((cd) => cd.chapter.id === baseChapter.id);

                return {
                    chapter: baseChapter,
                    downloadChapter,
                    selected: null,
                };
            }),
        [queue],
    );

    return (
        <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <ReaderNavBarDesktopPreviousButton
                component={Link}
                title={t('reader.button.previous_chapter')}
                disabled={chapter.id === chapters[0].id}
                to={`/manga/${chapter.mangaId}/chapter/${chapters[currentChapterIndex - 1].sourceOrder}`}
                replace
            />
            <FormControl sx={{ flexBasis: '70%', flexGrow: 0, flexShrink: 0 }}>
                <InputLabel id="reader-nav-bar-desktop-chapter-select">{t('chapter.title_one')}</InputLabel>
                <Select
                    {...bindTrigger(popupState)}
                    open={popupState.isOpen}
                    value={chapter.id}
                    // hide actual select menu
                    MenuProps={{ sx: { visibility: 'hidden' } }}
                    label={t('chapter.title_one')}
                    labelId="reader-nav-bar-desktop-chapter-select"
                >
                    {/* hacky way to use the select component with a custom menu, the only possible value that is needed is the current chapter */}
                    <MenuItem
                        key={chapter.id}
                        value={chapter.id}
                    >{`#${chapter.chapterNumber} ${chapter.name}`}</MenuItem>
                </Select>
            </FormControl>
            <Popover
                {...bindPopover(popupState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <Box sx={{ mb: 1 }}>
                    <Virtuoso
                        style={{
                            width: '500px',
                            maxWidth: '90vw',
                            height: `calc(${chaptersWithMeta.length} * 100px)`,
                            minHeight: '150px',
                            maxHeight: '300px',
                        }}
                        initialTopMostItemIndex={currentChapterIndex}
                        totalCount={chaptersWithMeta.length}
                        itemContent={(index) => (
                            <ChapterCard
                                key={chaptersWithMeta[index].chapter.id}
                                mode="reader"
                                chapter={chaptersWithMeta[index].chapter}
                                downloadChapter={chaptersWithMeta[index].downloadChapter}
                                allChapters={chapters}
                                showChapterNumber
                                selected={null}
                                onSelect={() => undefined}
                                selectable={false}
                            />
                        )}
                        overscan={250}
                        increaseViewportBy={500}
                    />
                </Box>
            </Popover>
            <ReaderNavBarDesktopNextButton
                component={Link}
                title={t('reader.button.next_chapter')}
                disabled={chapter.id === chapters.slice(-1)[0].id}
                to={`/manga/${chapter.mangaId}/chapter/${chapters[currentChapterIndex + 1]}`}
                replace
            />
        </Stack>
    );
};
