/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { GET_CHAPTERS_READER } from '@/lib/graphql/queries/ChapterQuery.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { DirectionOffset } from '@/Base.types.ts';
import { TapZoneLayout } from '@/modules/reader/components/TapZoneLayout.tsx';
import { useReaderOverlayContext } from '@/modules/reader/contexts/ReaderOverlayContext.tsx';
import { ReaderRGBAFilter } from '@/modules/reader/components/ReaderRGBAFilter.tsx';
import { useReaderStateSettingsContext } from '@/modules/reader/contexts/state/ReaderStateSettingsContext.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { ReaderViewer } from '@/modules/reader/components/viewer/ReaderViewer.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';
import { READER_BACKGROUND_TO_COLOR } from '@/modules/reader/constants/ReaderSettings.constants.tsx';
import { createPageData, createPagesData } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { getValidReaderProfile } from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { ReaderHotkeys } from '@/modules/reader/components/ReaderHotkeys.tsx';
import { ReaderResumeMode, ReaderTransitionPageMode } from '@/modules/reader/types/Reader.types.ts';
import { getInitialReaderPageIndex } from '@/modules/reader/utils/Reader.utils.ts';

export const Reader = () => {
    const { t } = useTranslation();
    const { setTitle, setOverride, readerNavBarWidth } = useNavBarContext();
    const { isVisible: isOverlayVisible, setIsVisible: setIsOverlayVisible } = useReaderOverlayContext();
    const { manga, setManga } = useReaderStateMangaContext();
    const {
        settings: { shouldSkipDupChapters },
        setSettings,
    } = useReaderStateSettingsContext();
    const { initialChapter, currentChapter, chapters, setReaderStateChapters } = useReaderStateChaptersContext();
    const {
        setTotalPages,
        setCurrentPageIndex,
        setPageToScrollToIndex,
        setPages,
        setPageUrls,
        setPageLoadStates,
        setTransitionPageMode,
    } = userReaderStatePagesContext();
    const { resumeMode } = useLocation<{
        resumeMode: ReaderResumeMode;
    }>().state ?? { resumeMode: ReaderResumeMode.START };

    const scrollElementRef = useRef<HTMLDivElement | null>(null);

    const { backgroundColor } = ReaderService.useSettings();

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
            setPageToScrollToIndex(0);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ loaded: false }]);
        },
        [],
    );

    // set pages state
    useEffect(() => {
        const pagesPayload = pagesResponse.data?.fetchChapterPages;
        if (pagesPayload) {
            const { pages } = pagesPayload;

            const initialReaderPageIndex = getInitialReaderPageIndex(
                resumeMode,
                currentChapter?.lastPageRead ?? 0,
                pages.length - 1,
            );

            setArePagesFetched(true);
            setTotalPages(pagesPayload.chapter.pageCount);
            setPages(createPagesData(pages));
            setPageUrls(pages);
            setPageLoadStates(pages.map(() => ({ loaded: false })));
            setCurrentPageIndex(initialReaderPageIndex);
            setPageToScrollToIndex(initialReaderPageIndex);
        } else {
            setArePagesFetched(false);
            setCurrentPageIndex(0);
            setPageToScrollToIndex(0);
            setTotalPages(0);
            setPages([createPageData('', 0)]);
            setPageUrls([]);
            setPageLoadStates([{ loaded: false }]);
        }

        setTransitionPageMode(ReaderTransitionPageMode.NONE);
    }, [pagesResponse.data?.fetchChapterPages?.pages]);

    // set settings state
    useEffect(() => {
        if (!mangaResponse.data?.manga || defaultSettingsResponse.loading || defaultSettingsResponse.error) {
            return;
        }

        const settingsWithDefaultProfileFallback = getReaderSettingsFor(
            mangaResponse.data?.manga ?? { id: -1 },
            defaultSettings,
        );

        const profile = getValidReaderProfile(
            settingsWithDefaultProfileFallback.defaultProfile.isDefault
                ? settingsWithDefaultProfileFallback.readingModesDefaultProfile[
                      settingsWithDefaultProfileFallback.readingMode.value
                  ]
                : settingsWithDefaultProfileFallback.defaultProfile.value,
            settingsWithDefaultProfileFallback.profiles,
        );

        const profileSettings = getReaderSettings(
            'global',
            { meta: defaultSettingsMetadata! },
            defaultSettings,
            undefined,
            profile,
        );

        setSettings(getReaderSettingsFor(mangaResponse.data!.manga, profileSettings));
    }, [mangaResponse.data?.manga, defaultSettings]);

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
                    <ReaderOverlay isVisible={isOverlayVisible} />
                    {!scrollElementRef.current && (
                        <Box
                            onClick={() => setIsOverlayVisible(!isOverlayVisible)}
                            sx={{
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

    const [isInitialLoad, setIsInitialLoad] = useState(true);
    useEffect(() => {
        if (isInitialLoad) {
            setIsOverlayVisible(isLoading || !!error);
            setIsInitialLoad(false);
        }
    }, [isLoading, error]);

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
                messageExtra={error.message}
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

    return (
        <>
            <ReaderHotkeys scrollElementRef={scrollElementRef} />
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
        </>
    );
};
