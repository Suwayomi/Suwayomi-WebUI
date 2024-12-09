/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ChapterScanlatorInfo } from '@/modules/chapter/services/Chapters.ts';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import {
    IReaderSettings,
    ReaderPageScaleMode,
    ReaderTransitionPageMode,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { isTransitionPageVisible } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { isContinuousReadingMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

const ChapterInfo = ({
    title,
    chapter,
}: {
    title: string;
    chapter?: Pick<TChapterReader, 'name'> & ChapterScanlatorInfo;
}) => {
    if (!chapter) {
        return null;
    }

    return (
        <Stack>
            <Typography>{title}</Typography>
            <Typography variant="h6" component="h1">
                {chapter.name}
            </Typography>
            {chapter.scanlator && (
                <Typography variant="body2" color="textDisabled">
                    {chapter.scanlator}
                </Typography>
            )}
        </Stack>
    );
};

export const ReaderTransitionPage = ({
    type,
    mode,
    readingMode,
    pageScaleMode,
}: Pick<IReaderSettings, 'readingMode' | 'pageScaleMode'> & {
    type: Exclude<ReaderTransitionPageMode, ReaderTransitionPageMode.NONE | ReaderTransitionPageMode.BOTH>;
    mode: ReaderTransitionPageMode;
}) => {
    const { t } = useTranslation();

    const handleBack = useBackButton();
    const { manga } = useReaderStateMangaContext();
    const { currentChapter, nextChapter, previousChapter } = useReaderStateChaptersContext();
    const { scrollbarXSize, scrollbarYSize } = useReaderScrollbarContext();
    const { readerNavBarWidth } = useNavBarContext();

    const isPreviousType = type === ReaderTransitionPageMode.PREVIOUS;
    const isNextType = type === ReaderTransitionPageMode.NEXT;

    const isFirstChapter = !!currentChapter && !previousChapter;
    const isLastChapter = !!currentChapter && !nextChapter;

    const isFitWidthPageScaleMode = [ReaderPageScaleMode.SCREEN, ReaderPageScaleMode.WIDTH].includes(pageScaleMode);

    if (!isTransitionPageVisible(type, mode, readingMode)) {
        return null;
    }

    return (
        <Stack
            sx={{
                minWidth: `calc(100vw - ${scrollbarYSize}px - ${readerNavBarWidth}px)`,
                minHeight: `calc(100vh - ${scrollbarXSize}px)`,
                justifyContent: 'center',
                alignItems: 'center',
                ...applyStyles(isContinuousReadingMode(readingMode), {
                    position: 'relative',
                    transform: 'scale(1)',
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_VERTICAL, {
                        maxWidth: '100%',
                        width: '100%',
                        ...applyStyles(!isFitWidthPageScaleMode, { alignItems: 'baseline' }),
                    }),
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_HORIZONTAL, {
                        maxHeight: '100%',
                        height: '100%',
                        justifyContent: 'unset',
                    }),
                }),
            }}
        >
            <Stack
                sx={{
                    gap: 2,
                    maxWidth: `calc(100vw - ${scrollbarYSize}px)`,
                    maxHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    width: 'max-content',
                    p: 1,
                    ...applyStyles(isContinuousReadingMode(readingMode), {
                        position: 'sticky',
                        ...applyStyles(
                            // on small screens with "fit to with" enabled, "left 50%" does not center the element in the
                            // viewport which then causes "translate" to move the element mostly outside the viewport with
                            // only a small part of it being visible
                            !isFitWidthPageScaleMode && readingMode === ReadingMode.CONTINUOUS_VERTICAL,
                            {
                                left: '50%',
                                transform: 'translateX(-50%)',
                            },
                        ),
                        ...applyStyles(readingMode === ReadingMode.CONTINUOUS_HORIZONTAL, {
                            top: '50%',
                            transform: 'translateY(-50%)',
                        }),
                    }),
                }}
            >
                {isPreviousType && isFirstChapter && (
                    <Typography variant="h6">{t('reader.transition_page.first_chapter')}</Typography>
                )}
                <Stack sx={{ gap: 5 }}>
                    {isPreviousType && !isFirstChapter && (
                        <ChapterInfo title={t('reader.transition_page.previous')} chapter={previousChapter} />
                    )}
                    {!!currentChapter && (
                        <ChapterInfo
                            title={t(
                                isPreviousType ? 'reader.transition_page.current' : 'reader.transition_page.finished',
                            )}
                            chapter={currentChapter}
                        />
                    )}
                    {isNextType && !isLastChapter && (
                        <ChapterInfo title={t('reader.transition_page.next')} chapter={nextChapter} />
                    )}
                </Stack>
                {isNextType && isLastChapter && (
                    <Typography variant="h6">{t('reader.transition_page.last_chapter')}</Typography>
                )}
                {((isPreviousType && isFirstChapter) || (isNextType && isLastChapter)) && (
                    <Stack sx={{ flexDirection: 'row', flexWrap: 'wrap', gap: 1 }}>
                        <Button
                            sx={{ flexGrow: 1 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleBack();
                            }}
                            variant="contained"
                        >
                            {t('reader.transition_page.exit.previous_page')}
                        </Button>
                        <Button
                            sx={{ flexGrow: 1 }}
                            component={Link}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            variant="contained"
                            to={`/manga/${manga?.id}`}
                        >
                            {t('reader.transition_page.exit.manga_page')}
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};
