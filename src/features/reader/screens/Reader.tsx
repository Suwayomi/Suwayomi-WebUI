/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDefaultReaderSettings } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import { ReaderOverlay } from '@/features/reader/overlay/ReaderOverlay.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetChaptersReaderQuery, GetMangaReaderQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGA_READER } from '@/lib/graphql/queries/MangaQuery.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { userReaderStatePagesContext } from '@/features/reader/contexts/state/ReaderStatePagesContext.tsx';
import { GET_CHAPTERS_READER } from '@/lib/graphql/queries/ChapterQuery.ts';
import { TapZoneLayout } from '@/features/reader/tap-zones/TapZoneLayout.tsx';
import { useReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlayContext.tsx';
import { ReaderRGBAFilter } from '@/features/reader/filters/ReaderRGBAFilter.tsx';
import { useReaderStateSettingsContext } from '@/features/reader/contexts/state/ReaderStateSettingsContext.tsx';
import { useReaderStateMangaContext } from '@/features/reader/contexts/state/ReaderStateMangaContext.tsx';
import { ReaderViewer } from '@/features/reader/viewer/ReaderViewer.tsx';
import { ReaderService } from '@/features/reader/services/ReaderService.ts';
import { READER_BACKGROUND_TO_COLOR } from '@/features/reader/settings/ReaderSettings.constants.tsx';
import { ReaderHotkeys } from '@/features/reader/hotkeys/ReaderHotkeys.tsx';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderStateChapters,
    TReaderAutoScrollContext,
    TReaderStateMangaContext,
    TReaderStateSettingsContext,
} from '@/features/reader/Reader.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { NavbarContextType } from '@/features/navigation-bar/NavigationBar.types.ts';
import { TReaderOverlayContext } from '@/features/reader/overlay/ReaderOverlay.types.ts';
import { ReaderStatePages } from '@/features/reader/overlay/progress-bar/ReaderProgressBar.types.ts';
import { withPropsFrom } from '@/base/hoc/withPropsFrom.tsx';
import { useReaderStateChaptersContext } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { useReaderAutoScrollContext } from '@/features/reader/auto-scroll/ReaderAutoScrollContext.tsx';
import { TReaderTapZoneContext } from '@/features/reader/tap-zones/TapZoneLayout.types.ts';
import { useReaderTapZoneContext } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';
import { useReaderResetStates } from '@/features/reader/hooks/useReaderResetStates.ts';
import { useReaderSetSettingsState } from '@/features/reader/hooks/useReaderSetSettingsState.ts';
import { useReaderShowSettingPreviewOnChange } from '@/features/reader/hooks/useReaderShowSettingPreviewOnChange.ts';
import { useReaderSetChaptersState } from '@/features/reader/hooks/useReaderSetChaptersState.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useChapterListOptions } from '@/features/chapter/utils/ChapterList.util.tsx';
import { FALLBACK_MANGA } from '@/features/manga/Manga.constants.ts';

const BaseReader = ({
    setOverride,
    readerNavBarWidth,
    isVisible: isOverlayVisible,
    setIsVisible: setIsOverlayVisible,
    manga,
    setManga,
    shouldSkipDupChapters,
    shouldSkipFilteredChapters,
    backgroundColor,
    readingMode,
    tapZoneLayout,
    tapZoneInvertMode,
    shouldShowReadingModePreview,
    shouldShowTapZoneLayoutPreview,
    setSettings,
    mangaChapters,
    initialChapter,
    chapterForDuplicatesHandling,
    currentChapter,
    setReaderStateChapters,
    setTotalPages,
    setCurrentPageIndex,
    setPageToScrollToIndex,
    setPages,
    setPageUrls,
    setPageLoadStates,
    setTransitionPageMode,
    cancelAutoScroll,
    setShowPreview,
}: Pick<NavbarContextType, 'setOverride' | 'readerNavBarWidth'> &
    Pick<TReaderOverlayContext, 'isVisible' | 'setIsVisible'> &
    Pick<TReaderStateMangaContext, 'manga' | 'setManga'> &
    Pick<TReaderStateSettingsContext, 'setSettings'> &
    Pick<
        IReaderSettings,
        | 'shouldSkipDupChapters'
        | 'shouldSkipFilteredChapters'
        | 'backgroundColor'
        | 'shouldShowReadingModePreview'
        | 'shouldShowTapZoneLayoutPreview'
    > &
    Pick<IReaderSettingsWithDefaultFlag, 'readingMode' | 'tapZoneLayout' | 'tapZoneInvertMode'> &
    Pick<
        ReaderStateChapters,
        | 'mangaChapters'
        | 'initialChapter'
        | 'chapterForDuplicatesHandling'
        | 'currentChapter'
        | 'setReaderStateChapters'
    > &
    Pick<
        ReaderStatePages,
        | 'setTotalPages'
        | 'setCurrentPageIndex'
        | 'setPageToScrollToIndex'
        | 'setPages'
        | 'setPageUrls'
        | 'setPageLoadStates'
        | 'setTransitionPageMode'
    > &
    Pick<TReaderTapZoneContext, 'setShowPreview'> & {
        cancelAutoScroll: TReaderAutoScrollContext['cancel'];
    }) => {
    const { t } = useTranslation();

    const scrollElementRef = useRef<HTMLDivElement | null>(null);

    const [areSettingsSet, setAreSettingsSet] = useState(false);

    const { chapterSourceOrder: paramChapterSourceOrder, mangaId: paramMangaId } = useParams<{
        chapterSourceOrder: string;
        mangaId: string;
    }>();
    const chapterSourceOrder = Number(paramChapterSourceOrder);
    const mangaId = Number(paramMangaId);

    const mangaResponse = requestManager.useGetManga<GetMangaReaderQuery>(GET_MANGA_READER, mangaId);
    const chaptersResponse = requestManager.useGetMangaChapters<GetChaptersReaderQuery>(GET_CHAPTERS_READER, mangaId);

    useAppTitle(
        !manga || !currentChapter
            ? t('reader.title', { mangaId, chapterIndex: chapterSourceOrder })
            : `${manga.title}: ${currentChapter.name}`,
    );

    const {
        metadata: defaultSettingsMetadata,
        settings: defaultSettings,
        request: defaultSettingsResponse,
    } = useDefaultReaderSettings();
    const chapterListOptions = useChapterListOptions(manga ?? FALLBACK_MANGA);

    const isLoading =
        currentChapter === undefined ||
        !areSettingsSet ||
        mangaResponse.loading ||
        chaptersResponse.loading ||
        defaultSettingsResponse.loading;
    const error = mangaResponse.error ?? chaptersResponse.error ?? defaultSettingsResponse.error;

    useEffect(() => {
        setManga(mangaResponse.data?.manga);
    }, [mangaResponse.data?.manga]);

    useReaderResetStates(
        setManga,
        setReaderStateChapters,
        setCurrentPageIndex,
        setPageToScrollToIndex,
        setTotalPages,
        setPages,
        setPageUrls,
        setPageLoadStates,
        setTransitionPageMode,
        setIsOverlayVisible,
        setSettings,
        cancelAutoScroll,
    );
    useReaderSetSettingsState(
        mangaResponse,
        defaultSettingsResponse,
        defaultSettings,
        defaultSettingsMetadata,
        setSettings,
        setAreSettingsSet,
    );
    useReaderShowSettingPreviewOnChange(
        isLoading,
        error,
        areSettingsSet,
        readingMode,
        tapZoneLayout,
        tapZoneInvertMode,
        shouldShowReadingModePreview,
        shouldShowTapZoneLayoutPreview,
        setShowPreview,
    );
    useReaderSetChaptersState(
        chaptersResponse,
        chapterSourceOrder,
        mangaChapters,
        initialChapter,
        chapterForDuplicatesHandling,
        setReaderStateChapters,
        shouldSkipDupChapters,
        shouldSkipFilteredChapters,
        chapterListOptions,
    );

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
                }}
            />
        );
    }

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

    if (currentChapter === null) {
        return <EmptyViewAbsoluteCentered message={t('reader.error.label.chapter_not_found')} />;
    }

    if (!manga || !currentChapter) {
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
                shouldSkipFilteredChapters,
                backgroundColor,
                shouldShowReadingModePreview,
                shouldShowTapZoneLayoutPreview,
            } = ReaderService.useSettingsWithoutDefaultFlag();
            return {
                shouldSkipDupChapters,
                shouldSkipFilteredChapters,
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
        () => ({ cancelAutoScroll: useReaderAutoScrollContext().cancel }),
        useReaderTapZoneContext,
    ],
    [
        'setOverride',
        'readerNavBarWidth',
        'isVisible',
        'setIsVisible',
        'manga',
        'setManga',
        'shouldSkipDupChapters',
        'shouldSkipFilteredChapters',
        'backgroundColor',
        'readingMode',
        'tapZoneLayout',
        'tapZoneInvertMode',
        'shouldShowReadingModePreview',
        'shouldShowTapZoneLayoutPreview',
        'setSettings',
        'mangaChapters',
        'initialChapter',
        'chapterForDuplicatesHandling',
        'currentChapter',
        'setReaderStateChapters',
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
