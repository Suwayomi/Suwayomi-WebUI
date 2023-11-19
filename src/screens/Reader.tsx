/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CircularProgress from '@mui/material/CircularProgress';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChapterOffset, IReaderSettings, ReaderType, TChapter, TManga, TranslationKey } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    checkAndHandleMissingStoredReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/util/readerSettings';
import { requestUpdateMangaMetadata } from '@/util/metadata';
import { HorizontalPager } from '@/components/reader/pager/HorizontalPager';
import { PageNumber } from '@/components/reader/PageNumber';
import { PagedPager } from '@/components/reader/pager/PagedPager';
import { DoublePagedPager } from '@/components/reader/pager/DoublePagedPager';
import { VerticalPager } from '@/components/reader/pager/VerticalPager';
import { ReaderNavBar } from '@/components/navbar/ReaderNavBar';
import { makeToast } from '@/components/util/Toast';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useDebounce } from '@/components/manga/hooks.ts';
import { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';

const isDupChapter = async (chapterIndex: number, currentChapter: TChapter) => {
    const nextChapter = await requestManager.getChapter(currentChapter.manga.id, chapterIndex).response;

    return nextChapter.data.chapter.chapterNumber === currentChapter.chapterNumber;
};

/**
 * In case duplicated chapters should be skipped the function will check all next/prev chapters until
 *  - a non duplicated chapter was found
 *  - no prev/next chapter exists => chapter request will fail and error will be raised up
 */
const getOffsetChapter = async (
    chapterIndex: number,
    currentChapter: TChapter,
    skipDupChapters: boolean,
    offset: ChapterOffset,
): Promise<number> => {
    const shouldSkipChapter = skipDupChapters && (await isDupChapter(chapterIndex, currentChapter));
    if (shouldSkipChapter) {
        return getOffsetChapter(chapterIndex + offset, currentChapter, skipDupChapters, offset);
    }

    return chapterIndex;
};

const getReaderComponent = (readerType: ReaderType) => {
    switch (readerType) {
        case 'ContinuesVertical':
        case 'Webtoon':
            return VerticalPager;
            break;
        case 'SingleVertical':
        case 'SingleRTL':
        case 'SingleLTR':
            return PagedPager;
            break;
        case 'DoubleVertical':
        case 'DoubleRTL':
        case 'DoubleLTR':
            return DoublePagedPager;
            break;
        case 'ContinuesHorizontalLTR':
        case 'ContinuesHorizontalRTL':
            return HorizontalPager;
        default:
            return VerticalPager;
            break;
    }
};

const range = (n: number) => Array.from({ length: n }, (value, key) => key);
const initialChapter = {
    pageCount: -1,
    sourceOrder: -1,
    chapterCount: 0,
    lastPageRead: 0,
    name: 'Loading...',
} as unknown as TChapter;

export function Reader() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const { chapterIndex, mangaId } = useParams<{ chapterIndex: string; mangaId: string }>();

    const initialManga = useMemo(
        () =>
            ({
                id: +mangaId,
                title: '',
                thumbnailUrl: '',
                genre: [],
                inLibraryAt: 0,
                lastReadAt: 0,
                chapters: { totalCount: 0 },
            }) as unknown as TManga,
        [mangaId],
    );

    const { data, loading: isMangaLoading } = requestManager.useGetManga(mangaId);
    const loadedChapter = useRef<TChapter | null>(null);
    const isChapterLoaded =
        Number(mangaId) === loadedChapter.current?.manga.id &&
        Number(chapterIndex) === loadedChapter.current?.sourceOrder &&
        loadedChapter.current?.pageCount !== -1;
    const manga = data?.manga ?? initialManga;
    const { data: chapterData, loading: isChapterLoading } = requestManager.useGetMangaChapter(mangaId, chapterIndex, {
        skip: isChapterLoaded,
    });
    const [arePagesUpdated, setArePagesUpdated] = useState(false);

    const { data: settingsData } = requestManager.useGetServerSettings();
    const isDownloadAheadEnabled = !!settingsData?.settings.autoDownloadAheadLimit;
    const [downloadAhead] = requestManager.useDownloadAhead();

    const getLoadedChapter = () => {
        const isAChapterLoaded = loadedChapter.current;

        const isSameAsLoadedChapter = isAChapterLoaded && isChapterLoaded;
        if (isSameAsLoadedChapter) {
            return loadedChapter.current;
        }

        if (arePagesUpdated) {
            setArePagesUpdated(false);
        }

        if (chapterData?.chapter) {
            return chapterData.chapter;
        }

        return null;
    };
    loadedChapter.current = getLoadedChapter();

    const chapter = loadedChapter.current ?? initialChapter;
    const [fetchPages] = requestManager.useGetChapterPagesFetch(chapter.id);

    useEffect(() => {
        const reCheckPages = !chapter.isDownloaded || chapter.pageCount === -1;
        const shouldFetchPages = !isChapterLoading && reCheckPages;
        if (shouldFetchPages) {
            fetchPages().then(() => setArePagesUpdated(true));
        }

        if (!reCheckPages && !arePagesUpdated) {
            setArePagesUpdated(true);
        }
    }, [chapter.id]);

    const isLoading = isChapterLoading || !arePagesUpdated;
    const [wasLastPageReadSet, setWasLastPageReadSet] = useState(false);
    const [curPage, setCurPage] = useState<number>(0);
    const isLastPage = curPage === chapter.pageCount - 1;
    const curPageDebounced = useDebounce(curPage, isLastPage ? 0 : 1000);
    const [pageToScrollTo, setPageToScrollTo] = useState<number | undefined>(undefined);
    const { setOverride, setTitle } = useContext(NavBarContext);
    const [retrievingNextChapter, setRetrievingNextChapter] = useState(false);

    const { settings: defaultSettings, loading: areDefaultSettingsLoading } = useDefaultReaderSettings();
    const [settings, setSettings] = useState(getReaderSettingsFor(manga, defaultSettings));

    const { settings: metadataSettings } = useMetadataServerSettings();

    const updateChapter = (patch: UpdateChapterPatchInput) => {
        requestManager.updateChapter(chapter.id, patch).response.catch(() => {});

        const shouldDeleteChapter =
            patch.isRead &&
            metadataSettings.deleteChaptersAutoMarkedRead &&
            chapter.isDownloaded &&
            (!chapter.isBookmarked || metadataSettings.deleteChaptersWithBookmark);
        if (shouldDeleteChapter) {
            requestManager.deleteDownloadedChapter(chapter.id).response.catch(() => {});
        }

        const shouldDownloadAhead =
            chapter.manga.inLibrary && !chapter.isRead && patch.isRead && isDownloadAheadEnabled;
        if (shouldDownloadAhead) {
            downloadAhead({
                variables: {
                    input: {
                        mangaIds: [chapter.manga.id],
                        latestReadChapterIds: [chapter.id],
                    },
                },
            }).catch(() => {});
        }
    };

    const setSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        setSettings({ ...settings, [key]: value });
        requestUpdateMangaMetadata(manga, [[key, value]]).catch(() =>
            makeToast(t('reader.settings.error.label.failed_to_save_settings'), 'warning'),
        );
    };

    const openNextChapter = useCallback(
        async (offset: ChapterOffset, setHistory: (nextChapterIndex: number) => void) => {
            setRetrievingNextChapter(true);
            setCurPage(0);
            try {
                setHistory(
                    await getOffsetChapter(chapter.sourceOrder + offset, chapter, settings.skipDupChapters, offset),
                );
            } catch (error) {
                const offsetToTranslationKeyMap: { [chapterOffset in ChapterOffset]: TranslationKey } = {
                    [ChapterOffset.PREV]: 'reader.error.label.unable_to_get_prev_chapter_skip_dup',
                    [ChapterOffset.NEXT]: 'reader.error.label.unable_to_get_next_chapter_skip_dup',
                };

                makeToast(t(offsetToTranslationKeyMap[offset]), 'error');
            } finally {
                setRetrievingNextChapter(false);
            }
        },
        [chapter, settings],
    );

    useEffect(() => {
        if (isLoading || !chapter) {
            setCurPage(0);
            return;
        }

        setWasLastPageReadSet(true);
        if (chapter.lastPageRead === chapter.pageCount - 1) {
            // last page, also probably read = true, we will load the first page.
            setCurPage(0);
        } else setCurPage(chapter.lastPageRead);
    }, [chapter, isLoading]);

    useEffect(() => {
        if (!manga?.title || chapter.name === t('global.label.loading')) {
            setTitle(t('reader.title'));
        } else {
            setTitle(`${manga.title}: ${chapter.name}`);
        }
    }, [t, manga, chapter]);

    useEffect(() => {
        if (!areDefaultSettingsLoading && !isMangaLoading) {
            checkAndHandleMissingStoredReaderSettings(manga, 'manga', defaultSettings).catch(() => {});
            setSettings(getReaderSettingsFor(manga, defaultSettings));
        }
    }, [areDefaultSettingsLoading, isMangaLoading]);

    useEffect(() => {
        // set the custom navbar
        setOverride({
            status: true,
            value: (
                <ReaderNavBar
                    settings={settings}
                    setSettingValue={setSettingValue}
                    manga={manga}
                    chapter={chapter}
                    curPage={curPage}
                    scrollToPage={setPageToScrollTo}
                    openNextChapter={openNextChapter}
                    retrievingNextChapter={retrievingNextChapter}
                />
            ),
        });

        // clean up for when we leave the reader
        return () => setOverride({ status: false, value: <div /> });
    }, [manga, chapter, settings, curPage, chapterIndex, retrievingNextChapter]);

    useEffect(() => {
        if (!wasLastPageReadSet) {
            return;
        }

        // do not mutate the chapter, this will cause the page to jump around due to always scrolling to the last read page
        const updateLastPageRead = curPageDebounced !== -1;
        const updateIsRead = curPageDebounced === chapter.pageCount - 1;
        const shouldUpdateChapter = updateLastPageRead || updateIsRead;
        if (!shouldUpdateChapter) {
            return;
        }

        updateChapter({
            lastPageRead: updateLastPageRead ? curPageDebounced : undefined,
            isRead: updateIsRead ? true : undefined,
        });
    }, [curPageDebounced, isDownloadAheadEnabled]);

    const nextChapter = useCallback(() => {
        const doesNextChapterExist = chapter.sourceOrder < manga.chapters.totalCount;
        if (!doesNextChapterExist) {
            return;
        }

        updateChapter({
            lastPageRead: chapter.pageCount - 1,
            isRead: true,
        });

        openNextChapter(ChapterOffset.NEXT, (nextChapterIndex) =>
            navigate(`/manga/${manga.id}/chapter/${nextChapterIndex}`, {
                replace: true,
                state: location.state,
            }),
        );
    }, [
        chapter.sourceOrder,
        manga.chapters.totalCount,
        chapter.pageCount,
        manga.id,
        settings.skipDupChapters,
        isDownloadAheadEnabled,
    ]);

    const prevChapter = useCallback(() => {
        if (chapter.sourceOrder > 1) {
            openNextChapter(ChapterOffset.PREV, (prevChapterIndex) =>
                navigate(`/manga/${manga.id}/chapter/${prevChapterIndex}`, {
                    replace: true,
                    state: location.state,
                }),
            );
        }
    }, [chapter.sourceOrder, manga.id, settings.skipDupChapters]);

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
                <CircularProgress thickness={5} />
            </Box>
        );
    }

    const pages = range(chapter.pageCount).map((index) => ({
        index,
        src: requestManager.getChapterPageUrl(mangaId, chapterIndex, index),
    }));

    const ReaderComponent = getReaderComponent(settings.readerType);

    // last page, also probably read = true, we will load the first page.
    const initialPage = pageToScrollTo ?? (chapter.lastPageRead === chapter.pageCount - 1 ? 0 : chapter.lastPageRead);

    return (
        <Box
            sx={{
                width: settings.staticNav ? 'calc(100vw - 300px)' : '100vw',
                marginLeft: settings.staticNav ? '300px' : 'unset',
            }}
        >
            <PageNumber settings={settings} curPage={curPage} pageCount={chapter.pageCount} />
            <ReaderComponent
                key={chapter.id}
                pages={pages}
                pageCount={chapter.pageCount}
                setCurPage={setCurPage}
                initialPage={initialPage}
                curPage={curPage}
                settings={settings}
                manga={manga}
                chapter={chapter}
                nextChapter={nextChapter}
                prevChapter={prevChapter}
            />
        </Box>
    );
}
