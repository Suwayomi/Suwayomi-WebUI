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
import { ComponentProps, memo, useMemo } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { useReaderScrollbarContext } from '@/features/reader/contexts/ReaderScrollbarContext.tsx';
import { useReaderStateChaptersContext } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import {
    IReaderSettings,
    ReaderTransitionPageMode,
    ReadingMode,
    TReaderScrollbarContext,
    TReaderStateMangaContext,
} from '@/features/reader/Reader.types.ts';
import { isTransitionPageVisible } from '@/features/reader/viewer/pager/ReaderPager.utils.tsx';
import { useBackButton } from '@/base/hooks/useBackButton.ts';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import {
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
} from '@/features/reader/settings/ReaderSettings.utils.tsx';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useReaderStateMangaContext } from '@/features/reader/contexts/state/ReaderStateMangaContext.tsx';
import { getValueFromObject, noOp } from '@/lib/HelperFunctions.ts';
import { READER_BACKGROUND_TO_COLOR } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { userReaderStatePagesContext } from '@/features/reader/contexts/state/ReaderStatePagesContext.tsx';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { ChapterIdInfo } from '@/features/chapter/Chapter.types.ts';

const ChapterInfo = ({
    title,
    name,
    scanlator,
    backgroundColor,
}: {
    title: string;
    name?: ChapterType['name'];
    scanlator?: ChapterType['scanlator'];
    backgroundColor: IReaderSettings['backgroundColor'];
}) => {
    const theme = useTheme();

    const contrastText = theme.palette.getContrastText(
        getValueFromObject(theme.palette, READER_BACKGROUND_TO_COLOR[backgroundColor]),
    );
    const disabledText = alpha(contrastText, 0.5);

    if (!name) {
        return null;
    }

    return (
        <Stack>
            <Typography color={contrastText}>{title}</Typography>
            <Typography color={contrastText} variant="h6" component="h1">
                {name}
            </Typography>
            {scanlator && (
                <Typography variant="body2" color={disabledText}>
                    {scanlator}
                </Typography>
            )}
        </Stack>
    );
};

const BaseReaderTransitionPage = ({
    type,
    transitionPageMode,
    readingMode,
    backgroundColor,
    shouldShowTransitionPage,
    manga,
    currentChapterName,
    currentChapterScanlator,
    previousChapterName,
    previousChapterScanlator,
    nextChapterName,
    nextChapterScanlator,
    scrollbarXSize,
    scrollbarYSize,
    readerNavBarWidth,
    handleBack,
}: Pick<IReaderSettings, 'readingMode' | 'backgroundColor' | 'shouldShowTransitionPage'> &
    Pick<TReaderStateMangaContext, 'manga'> &
    Pick<TReaderScrollbarContext, 'scrollbarXSize' | 'scrollbarYSize'> &
    Pick<ReaderStatePages, 'transitionPageMode'> &
    Pick<NavbarContextType, 'readerNavBarWidth'> & {
        // gets used in the "source props creators" of the "withPropsFrom" call
        // eslint-disable-next-line react/no-unused-prop-types
        chapterId: ChapterIdInfo['id'];
        currentChapterName?: ChapterType['name'];
        currentChapterScanlator?: ChapterType['scanlator'];
        previousChapterName?: ChapterType['name'];
        previousChapterScanlator?: ChapterType['scanlator'];
        nextChapterName?: ChapterType['name'];
        nextChapterScanlator?: ChapterType['scanlator'];
        type: Exclude<ReaderTransitionPageMode, ReaderTransitionPageMode.NONE | ReaderTransitionPageMode.BOTH>;
        handleBack: () => void;
    }) => {
    const { t } = useTranslation();

    const isPreviousType = type === ReaderTransitionPageMode.PREVIOUS;
    const isNextType = type === ReaderTransitionPageMode.NEXT;

    const isFirstChapter = !!currentChapterName && !previousChapterName;
    const isLastChapter = !!currentChapterName && !nextChapterName;

    const forceShowFirstChapterPreviousTransitionPage = isFirstChapter && type === ReaderTransitionPageMode.PREVIOUS;
    const forceShowLastChapterNextTransitionPage = isLastChapter && type === ReaderTransitionPageMode.NEXT;
    const forceShowTransitionPage =
        forceShowFirstChapterPreviousTransitionPage || forceShowLastChapterNextTransitionPage;

    if (!shouldShowTransitionPage && !forceShowTransitionPage) {
        return null;
    }

    if (!isTransitionPageVisible(type, transitionPageMode, readingMode)) {
        return null;
    }

    return (
        <Stack
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                ...applyStyles(!isContinuousReadingMode(readingMode), {
                    width: '100%',
                    height: '100%',
                }),
                ...applyStyles(isContinuousReadingMode(readingMode), {
                    position: 'sticky',
                    ...applyStyles(isContinuousVerticalReadingMode(readingMode), {
                        left: 0,
                        maxWidth: `calc(100vw - ${scrollbarYSize}px - ${readerNavBarWidth}px)`,
                        minHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    }),
                    ...applyStyles(readingMode === ReadingMode.CONTINUOUS_HORIZONTAL, {
                        top: 0,
                        minWidth: `calc(100vw - ${scrollbarYSize}px - ${readerNavBarWidth}px)`,
                        maxHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    }),
                }),
            }}
        >
            <Stack
                sx={{
                    gap: 2,
                    maxWidth: (theme) =>
                        // spacing = added padding left + right
                        `calc(100vw - ${scrollbarYSize}px - ${readerNavBarWidth}px - ${theme.spacing(2)})`,
                    maxHeight: `calc(100vh - ${scrollbarXSize}px)`,
                    width: 'max-content',
                    p: 1,
                }}
            >
                {isPreviousType && isFirstChapter && (
                    <Typography variant="h6">{t('reader.transition_page.first_chapter')}</Typography>
                )}
                <Stack sx={{ gap: 5 }}>
                    {isPreviousType && !isFirstChapter && (
                        <ChapterInfo
                            title={t('reader.transition_page.previous')}
                            name={previousChapterName}
                            scanlator={previousChapterScanlator}
                            backgroundColor={backgroundColor}
                        />
                    )}
                    {!!currentChapterName && (
                        <ChapterInfo
                            title={t(
                                isPreviousType ? 'reader.transition_page.current' : 'reader.transition_page.finished',
                            )}
                            name={currentChapterName}
                            scanlator={currentChapterScanlator}
                            backgroundColor={backgroundColor}
                        />
                    )}
                    {isNextType && !isLastChapter && (
                        <ChapterInfo
                            title={t('reader.transition_page.next')}
                            name={nextChapterName}
                            scanlator={nextChapterScanlator}
                            backgroundColor={backgroundColor}
                        />
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
                            to={AppRoutes.manga.path(manga?.id ?? -1)}
                        >
                            {t('reader.transition_page.exit.manga_page')}
                        </Button>
                    </Stack>
                )}
            </Stack>
        </Stack>
    );
};

export const ReaderTransitionPage = withPropsFrom(
    memo(BaseReaderTransitionPage) as typeof BaseReaderTransitionPage,
    [
        useReaderStateMangaContext,
        ({ chapterId }: Pick<ComponentProps<typeof BaseReaderTransitionPage>, 'chapterId'>) => {
            const { chapters } = useReaderStateChaptersContext();

            const currentChapterIndex = useMemo(
                () => chapters.findIndex((chapter) => chapter.id === chapterId),
                [chapterId, chapters],
            );
            const currentChapter = chapters[currentChapterIndex];
            // chapters are sorted from latest to oldest
            const previousChapter = useMemo(() => chapters[currentChapterIndex + 1], [currentChapterIndex, chapters]);
            const nextChapter = useMemo(() => chapters[currentChapterIndex - 1], [currentChapterIndex, chapters]);

            return {
                currentChapterName: currentChapter?.name,
                currentChapterScanlator: currentChapter?.scanlator,
                previousChapterName: previousChapter?.name,
                previousChapterScanlator: previousChapter?.name,
                nextChapterName: nextChapter?.name,
                nextChapterScanlator: nextChapter?.scanlator,
            };
        },
        useReaderScrollbarContext,
        useNavBarContext,
        userReaderStatePagesContext,
        ReaderService.useSettingsWithoutDefaultFlag,
        ({ chapterId, type }: Pick<ComponentProps<typeof BaseReaderTransitionPage>, 'chapterId' | 'type'>) => {
            const handleBack = useBackButton();
            const { chapters } = useReaderStateChaptersContext();

            const currentChapterIndex = useMemo(
                () => chapters.findIndex((chapter) => chapter.id === chapterId),
                [chapterId, chapters],
            );

            // chapters are sorted from latest to oldest
            const isLastChapter = currentChapterIndex === 0;
            const isFirstChapter = currentChapterIndex === chapters.length - 1;

            const handleBackFirstChapter = type === ReaderTransitionPageMode.PREVIOUS && isFirstChapter;
            const handleBackLastChapter = type === ReaderTransitionPageMode.NEXT && isLastChapter;

            const needsToHandleBack = handleBackFirstChapter || handleBackLastChapter;

            return {
                handleBack: needsToHandleBack ? handleBack : noOp,
            };
        },
    ],
    [
        'manga',
        'currentChapterName',
        'currentChapterScanlator',
        'previousChapterName',
        'previousChapterScanlator',
        'nextChapterName',
        'nextChapterScanlator',
        'scrollbarXSize',
        'scrollbarYSize',
        'readerNavBarWidth',
        'backgroundColor',
        'transitionPageMode',
        'readingMode',
        'handleBack',
        'shouldShowTransitionPage',
    ],
);
