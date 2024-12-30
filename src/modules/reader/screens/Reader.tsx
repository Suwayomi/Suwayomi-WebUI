/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    getReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { ReaderOverlay } from '@/modules/reader/components/overlay/ReaderOverlay.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetChaptersReaderQuery, GetMangaReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_READER } from '@/lib/graphql/queries/MangaQuery.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { userReaderStatePagesContext } from '@/modules/reader/contexts/state/ReaderStatePagesContext.tsx';
import { GET_CHAPTERS_READER } from '@/lib/graphql/queries/ChapterQuery.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset, TranslationKey } from '@/Base.types.ts';
import { TapZoneLayout } from '@/modules/reader/components/TapZoneLayout.tsx';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { ReaderRGBAFilter } from '@/modules/reader/components/ReaderRGBAFilter.tsx';
import { useReaderStateSettingsContext } from '@/modules/reader/contexts/state/ReaderStateSettingsContext.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { ReaderViewer } from '@/modules/reader/components/viewer/ReaderViewer.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import {
    READER_BACKGROUND_TO_COLOR,
    READING_MODE_VALUE_TO_DISPLAY_DATA,
} from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { createPageData, createPagesData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderHotkeys } from '@/modules/reader/components/ReaderHotkeys.tsx';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderResumeMode,
    ReaderStateChapters,
    ReaderTransitionPageMode,
    ReadingMode,
    TReaderAutoScrollContext,
    TReaderStateMangaContext,
    TReaderStateSettingsContext,
} from '@/modules/reader/types/Reader.types.ts';
import { getInitialReaderPageIndex } from '@/modules/reader/utils/Reader.utils.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { NavbarContextType } from '@/modules/navigation-bar/NavigationBar.types.ts';
import { TReaderOverlayContext } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { isAutoWebtoonMode } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { useReaderAutoScrollContext } from '@/modules/reader/contexts/ReaderAutoScrollContext.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { TReaderTapZoneContext } from '@/modules/reader/types/TapZoneLayout.types.ts';
import { useReaderTapZoneContext } from '@/modules/reader/contexts/ReaderTapZoneContext.tsx';

const BaseReader = ({
    setTitle,
    setOverride,
    readerNavBarWidth,
    isVisible: isOverlayVisible,
    setIsVisible: setIsOverlayVisible,
    manga,
    setManga,
    shouldSkipDupChapters,
    backgroundColor,
    readingMode,
    tapZoneLayout,
    tapZoneInvertMode,
    shouldShowReadingModePreview,
    shouldShowTapZoneLayoutPreview,
    setSettings,
    initialChapter,
    currentChapter,
    chapters,
    setReaderStateChapters,
    firstPageUrl,
    totalPages,
    setTotalPages,
    setCurrentPageIndex,
    setPageToScrollToIndex,
    setPages,
    setPageUrls,
    setPageLoadStates,
    setTransitionPageMode,
    cancelAutoScroll,
    setShowPreview,
}: Pick<NavbarContextType, 'setTitle' | 'setOverride' | 'readerNavBarWidth'> &
    Pick<TReaderOverlayContext, 'isVisible' | 'setIsVisible'> &
    Pick<TReaderStateMangaContext, 'manga' | 'setManga'> &
    Pick<TReaderStateSettingsContext, 'setSettings'> &
    Pick<
        IReaderSettings,
        'shouldSkipDupChapters' | 'backgroundColor' | 'shouldShowReadingModePreview' | 'shouldShowTapZoneLayoutPreview'
    > &
    Pick<IReaderSettingsWithDefaultFlag, 'readingMode' | 'tapZoneLayout' | 'tapZoneInvertMode'> &
    Pick<ReaderStateChapters, 'initialChapter' | 'currentChapter' | 'chapters' | 'setReaderStateChapters'> &
    Pick<
        ReaderStatePages,
        | 'totalPages'
        | 'setTotalPages'
        | 'setCurrentPageIndex'
        | 'setPageToScrollToIndex'
        | 'setPages'
        | 'setPageUrls'
        | 'setPageLoadStates'
        | 'setTransitionPageMode'
    > &
    Pick<TReaderTapZoneContext, 'setShowPreview'> & {
        firstPageUrl?: string;
        cancelAutoScroll: TReaderAutoScrollContext['cancel'];
    }) => {
    const { t } = useTranslation();
    const { resumeMode } = useLocation<{
        resumeMode: ReaderResumeMode;
    }>().state ?? { resumeMode: ReaderResumeMode.START };

    const scrollElementRef = useRef<HTMLDivElement | null>(null);

    const { chapterIndex: paramChapterIndex, mangaId: paramMangaId } = useParams<{
        chapterIndex: string;
        mangaId: string;
    }>();
    const chapterIndex = Number(paramChapterIndex);
    const mangaId = Number(paramMangaId);

    const mangaResponse = requestManager.useGetManga<GetMangaReaderQuery>(GET_MANGA_READER, mangaId);
    const chaptersResponse = requestManager.useGetMangaChapters<GetChaptersReaderQuery>(GET_CHAPTERS_READER, mangaId);
    const [arePagesFetched, setArePagesFetched] = useState(false);
    const [fetchPages, pagesResponse] = requestManager.useGetChapterPagesFetch(-1);

    const doFetchPages = useCallback(() => {
        if (!currentChapter) {
            return;
        }

        setArePagesFetched(false);

        fetchPages({ variables: { input: { chapterId: currentChapter.id } } }).catch(
            defaultPromiseErrorHandler('Reader::fetchPages'),
        );
    }, [fetchPages, currentChapter?.id]);

    const {
        metadata: defaultSettingsMetadata,
        settings: defaultSettings,
        request: defaultSettingsResponse,
    } = useDefaultReaderSettings();

    const doesChapterExist =
        !chaptersResponse.loading &&
        !chaptersResponse.error &&
        chapterIndex >= 0 &&
        chapterIndex <= chapters.length - 1;

    const isLoading =
        mangaResponse.loading ||
        chaptersResponse.loading ||
        defaultSettingsResponse.loading ||
        pagesResponse.loading ||
        (doesChapterExist && !arePagesFetched && !chaptersResponse.error && !pagesResponse.error);
    const error = mangaResponse.error ?? chaptersResponse.error ?? defaultSettingsResponse.error ?? pagesResponse.error;

    useLayoutEffect(() => {
        if (!manga || !currentChapter) {
            setTitle(t('reader.title', { mangaId, chapterIndex }));
            return;
        }

        setTitle(`${manga.title}: ${currentChapter.name}`);
    }, [t, mangaId, chapterIndex, manga, currentChapter]);

    useEffect(() => {
        doFetchPages();
        return () => setArePagesFetched(false);
    }, [currentChapter?.id]);

    useEffect(() => {
        setManga(mangaResponse.data?.manga);
    }, [mangaResponse.data?.manga]);

    // reset states
    useEffect(
        () => () => {
            setManga(undefined);
            setReaderStateChapters({
                mangaChapters: [],
                chapters: [],
            });

            setCurrentPageIndex(0);
            setPageToScrollToIndex(null);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ loaded: false }]);

            setIsOverlayVisible(false);

            cancelAutoScroll();
        },
        [],
    );

    // set pages state
    useEffect(() => {
        const pagesPayload = pagesResponse.data?.fetchChapterPages;
        if (pagesPayload) {
            const { pages: newPages } = pagesPayload;

            const initialReaderPageIndex = getInitialReaderPageIndex(
                resumeMode,
                currentChapter?.lastPageRead ?? 0,
                newPages.length - 1,
            );

            setArePagesFetched(true);
            setTotalPages(pagesPayload.chapter.pageCount);
            setPages(createPagesData(newPages));
            setPageUrls(newPages);
            setPageLoadStates(newPages.map(() => ({ loaded: false })));
            setCurrentPageIndex(initialReaderPageIndex);
            setPageToScrollToIndex(initialReaderPageIndex);
        } else {
            setArePagesFetched(false);
            setCurrentPageIndex(0);
            setPageToScrollToIndex(null);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ loaded: false }]);
        }

        setTransitionPageMode(ReaderTransitionPageMode.NONE);
    }, [pagesResponse.data?.fetchChapterPages?.pages]);

    // set settings state
    useEffect(() => {
        const mangaFromResponse = mangaResponse.data?.manga;
        if (!mangaFromResponse || defaultSettingsResponse.loading || defaultSettingsResponse.error) {
            return;
        }

        const settingsWithDefaultProfileFallback = getReaderSettingsFor(mangaFromResponse, defaultSettings);

        const shouldUseWebtoonMode = isAutoWebtoonMode(
            mangaFromResponse,
            settingsWithDefaultProfileFallback.shouldUseAutoWebtoonMode,
            settingsWithDefaultProfileFallback.readingMode,
        );

        const defaultSettingsWithAutoReadingMode = {
            ...defaultSettings,
            readingMode: shouldUseWebtoonMode ? ReadingMode.WEBTOON : defaultSettings.readingMode,
        };

        const profile = shouldUseWebtoonMode
            ? ReadingMode.WEBTOON
            : settingsWithDefaultProfileFallback.readingMode.value;
        const profileSettings = getReaderSettings(
            'global',
            { meta: defaultSettingsMetadata! },
            defaultSettingsWithAutoReadingMode,
            undefined,
            profile,
        );

        const finalSettings = getReaderSettingsFor(mangaFromResponse, profileSettings);
        setSettings(finalSettings);
    }, [mangaResponse.data?.manga, defaultSettings]);

    // show setting previews on change or when open reader
    const previousReadingMode = useRef<IReaderSettingsWithDefaultFlag['readingMode']>();
    const previousTapZoneLayout = useRef<IReaderSettingsWithDefaultFlag['tapZoneLayout']>();
    const previousTapZoneInvertMode = useRef<IReaderSettingsWithDefaultFlag['tapZoneInvertMode']>();
    useEffect(() => {
        const mangaFromResponse = mangaResponse.data?.manga;
        if (!mangaFromResponse || defaultSettingsResponse.loading || defaultSettingsResponse.error) {
            return;
        }

        const didReadingModeChange = JSON.stringify(readingMode) !== JSON.stringify(previousReadingMode.current);
        const showReadingModePreview = shouldShowReadingModePreview && didReadingModeChange;
        if (showReadingModePreview) {
            makeToast(t(READING_MODE_VALUE_TO_DISPLAY_DATA[readingMode.value].title as TranslationKey));
        }
        previousReadingMode.current = readingMode;

        const didTapZoneLayoutChange =
            JSON.stringify(tapZoneLayout) !== JSON.stringify(previousTapZoneLayout.current) ||
            JSON.stringify(tapZoneInvertMode) !== JSON.stringify(previousTapZoneInvertMode.current);
        const showTapZoneLayoutPreview = shouldShowTapZoneLayoutPreview && didTapZoneLayoutChange;
        if (showTapZoneLayoutPreview) {
            setShowPreview(true);
        }
        previousTapZoneLayout.current = tapZoneLayout;
        previousTapZoneInvertMode.current = tapZoneInvertMode;
    }, [
        readingMode.value,
        readingMode.isDefault,
        tapZoneLayout.value,
        tapZoneLayout.isDefault,
        tapZoneInvertMode.value,
        tapZoneInvertMode.isDefault,
    ]);

    // set chapters state
    useEffect(() => {
        const newMangaChapters = chaptersResponse.data?.chapters.nodes;
        const newCurrentChapter = newMangaChapters
            ? (newMangaChapters[newMangaChapters.length - chapterIndex] ?? null)
            : undefined;
        const newInitialChapter = initialChapter ?? newCurrentChapter;

        setReaderStateChapters({
            mangaChapters: newMangaChapters ?? [],
            chapters:
                newInitialChapter && newMangaChapters
                    ? Chapters.removeDuplicates(newInitialChapter, newMangaChapters)
                    : [],
            initialChapter: newInitialChapter,
            currentChapter: newCurrentChapter,
            nextChapter:
                newMangaChapters &&
                newCurrentChapter &&
                Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                    offset: DirectionOffset.NEXT,
                    skipDupe: shouldSkipDupChapters,
                    skipDupeChapter: newInitialChapter,
                }),
            previousChapter:
                newMangaChapters &&
                newCurrentChapter &&
                Chapters.getNextChapter(newCurrentChapter, newMangaChapters, {
                    offset: DirectionOffset.PREVIOUS,
                    skipDupe: shouldSkipDupChapters,
                    skipDupeChapter: newInitialChapter,
                }),
        });
    }, [chaptersResponse.data?.chapters.nodes, chapterIndex, shouldSkipDupChapters]);

    useLayoutEffect(() => {
        setOverride({
            status: true,
            value: (
                <Box sx={{ position: 'absolute' }}>
                    <ReaderHotkeys scrollElementRef={scrollElementRef} />
                    <ReaderOverlay isVisible={isOverlayVisible} />
                    {!scrollElementRef.current && (
                        <Box
                            onClick={() => setIsOverlayVisible(!isOverlayVisible)}
                            sx={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                width: '100vw',
                                height: '100vh',
                                background: 'transparent',
                            }}
                        />
                    )}
                </Box>
            ),
        });

        return () => setOverride({ status: false, value: null });
    }, [isOverlayVisible, setIsOverlayVisible, scrollElementRef.current]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    width: '100vw',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <LoadingPlaceholder />
            </Box>
        );
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (mangaResponse.error) {
                        mangaResponse.refetch().catch(defaultPromiseErrorHandler('Reader::refetchManga'));
                    }

                    if (defaultSettingsResponse.error) {
                        defaultSettingsResponse
                            .refetch()
                            .catch(defaultPromiseErrorHandler('Reader::refetchDefaultSettings'));
                    }

                    if (chaptersResponse.error) {
                        chaptersResponse.refetch().catch(defaultPromiseErrorHandler('Reader::refetchChapters'));
                    }

                    if (pagesResponse.error) {
                        doFetchPages();
                    }
                }}
            />
        );
    }

    if (currentChapter === null) {
        return <EmptyViewAbsoluteCentered message={t('reader.error.label.chapter_not_found')} />;
    }

    if (currentChapter && !currentChapter?.pageCount) {
        return <EmptyViewAbsoluteCentered message={t('reader.error.label.no_pages_found')} retry={doFetchPages} />;
    }

    if (!manga || !currentChapter) {
        return null;
    }

    const isPlaceholderPageState = totalPages === 1 && firstPageUrl === requestManager.getBaseUrl();
    if (isPlaceholderPageState) {
        return null;
    }

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                width: `calc(100vw - ${readerNavBarWidth}px)`,
                height: `100vh`,
                marginLeft: `${readerNavBarWidth}px`,
                transition: (theme) =>
                    `width 0.${theme.transitions.duration.shortest}s, margin-left 0.${theme.transitions.duration.shortest}s`,
                overflow: 'auto',
                backgroundColor: READER_BACKGROUND_TO_COLOR[backgroundColor],
            }}
        >
            <ReaderViewer ref={scrollElementRef} />
            <TapZoneLayout />
            <ReaderRGBAFilter />
        </Box>
    );
};

export const Reader = withPropsFrom(
    memo(BaseReader),
    [
        useNavBarContext,
        useReaderOverlayContext,
        useReaderStateMangaContext,
        useReaderStateChaptersContext,
        useReaderStateSettingsContext,
        () => {
            const {
                shouldSkipDupChapters,
                backgroundColor,
                shouldShowReadingModePreview,
                shouldShowTapZoneLayoutPreview,
            } = ReaderService.useSettingsWithoutDefaultFlag();
            return {
                shouldSkipDupChapters,
                backgroundColor,
                shouldShowReadingModePreview,
                shouldShowTapZoneLayoutPreview,
            };
        },
        () => {
            const { readingMode, tapZoneLayout, tapZoneInvertMode } = ReaderService.useSettings();
            return { readingMode, tapZoneLayout, tapZoneInvertMode };
        },
        userReaderStatePagesContext,
        () => ({
            firstPageUrl: userReaderStatePagesContext().pages[0].primary.url,
        }),
        () => ({ cancelAutoScroll: useReaderAutoScrollContext().cancel }),
        useReaderTapZoneContext,
    ],
    [
        'setTitle',
        'setOverride',
        'readerNavBarWidth',
        'isVisible',
        'setIsVisible',
        'manga',
        'setManga',
        'shouldSkipDupChapters',
        'backgroundColor',
        'readingMode',
        'tapZoneLayout',
        'tapZoneInvertMode',
        'shouldShowReadingModePreview',
        'shouldShowTapZoneLayoutPreview',
        'setSettings',
        'initialChapter',
        'currentChapter',
        'chapters',
        'setReaderStateChapters',
        'firstPageUrl',
        'totalPages',
        'setTotalPages',
        'setCurrentPageIndex',
        'setPageToScrollToIndex',
        'setPages',
        'setPageUrls',
        'setPageLoadStates',
        'setTransitionPageMode',
        'cancelAutoScroll',
        'setShowPreview',
    ],
);
