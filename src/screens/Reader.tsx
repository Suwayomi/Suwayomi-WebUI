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
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { AllowedMetadataValueTypes, ChapterOffset, IReaderSettings, ReaderType, TChapter, TManga } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    checkAndHandleMissingStoredReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/lib/metadata/readerSettings.ts';
import { requestUpdateMangaMetadata } from '@/lib/metadata/metadata.ts';
import { HorizontalPager } from '@/components/reader/pager/HorizontalPager';
import { PageNumber } from '@/components/reader/PageNumber';
import { PagedPager } from '@/components/reader/pager/PagedPager';
import { DoublePagedPager } from '@/components/reader/pager/DoublePagedPager';
import { VerticalPager } from '@/components/reader/pager/VerticalPager';
import { ReaderNavBar } from '@/components/navbar/ReaderNavBar';
import { makeToast } from '@/components/util/Toast';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useDebounce } from '@/util/useDebounce.ts';
import { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql.ts';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { Chapters } from '@/lib/data/Chapters.ts';

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
    const { data: chapterData, loading: isChapterLoading } = requestManager.useGetMangaChapter(mangaId, chapterIndex);
    const arePagesUpdatedRef = useRef(false);

    const {
        settings: { downloadAheadLimit },
    } = useMetadataServerSettings();
    const isDownloadAheadEnabled = !!downloadAheadLimit;

    const getLoadedChapter = () => {
        const isAChapterLoaded = loadedChapter.current;

        const isSameAsLoadedChapter = isAChapterLoaded && isChapterLoaded;
        if (isSameAsLoadedChapter) {
            const didPageCountChange =
                chapterData?.chapter && loadedChapter.current?.pageCount !== chapterData.chapter.pageCount;
            return didPageCountChange ? chapterData!.chapter : loadedChapter.current;
        }

        arePagesUpdatedRef.current = false;

        if (chapterData?.chapter) {
            return chapterData.chapter;
        }

        return null;
    };
    loadedChapter.current = getLoadedChapter();

    const chapter = loadedChapter.current ?? initialChapter;
    const [fetchPages] = requestManager.useGetChapterPagesFetch(chapter.id);

    useEffect(() => {
        const shouldFetchPages = !isChapterLoading && !chapter.isDownloaded;
        if (shouldFetchPages) {
            fetchPages().then(() => {
                arePagesUpdatedRef.current = true;
            });
        } else {
            arePagesUpdatedRef.current = true;
        }
    }, [chapter.id]);

    const isLoading = isChapterLoading || !arePagesUpdatedRef.current;
    const [wasLastPageReadSet, setWasLastPageReadSet] = useState(false);
    const [curPage, setCurPage] = useState<number>(0);
    const isLastPage = curPage === chapter.pageCount - 1;
    const curPageDebounced = useDebounce(curPage, isLastPage ? 0 : 1000);
    const [pageToScrollTo, setPageToScrollTo] = useState<number | undefined>(undefined);
    const { setOverride, setTitle } = useContext(NavBarContext);
    const [retrievingNextChapter, setRetrievingNextChapter] = useState(false);
    const { data: mangaChaptersData } = requestManager.useGetMangaChapters(mangaId, { nextFetchPolicy: 'standby' });
    const mangaChapters = mangaChaptersData?.chapters.nodes;

    const { settings: defaultSettings, loading: areDefaultSettingsLoading } = useDefaultReaderSettings();
    const [settings, setSettings] = useState(getReaderSettingsFor(manga, defaultSettings));

    const { settings: metadataSettings } = useMetadataServerSettings();

    const prevChapters = useMemo(
        () =>
            Chapters.getNextChapters(chapter, mangaChapters ?? [], {
                offset: ChapterOffset.PREV,
                skipDupe: settings.skipDupChapters,
            }),
        [chapter, mangaChapters, settings.skipDupChapters],
    );
    const nextChapters = useMemo(
        () => Chapters.getNextChapters(chapter, mangaChapters ?? [], { skipDupe: settings.skipDupChapters }),
        [chapter, mangaChapters, settings.skipDupChapters],
    );
    const prevChapter = useMemo(
        () =>
            Chapters.getNextChapter(chapter, mangaChapters ?? [], {
                offset: ChapterOffset.PREV,
                skipDupe: settings.skipDupChapters,
            }),
        [chapter, mangaChapters, settings.skipDupChapters],
    );
    const nextChapter = useMemo(
        () =>
            Chapters.getNextChapter(chapter, mangaChapters ?? [], {
                skipDupe: settings.skipDupChapters,
            }),
        [chapter, mangaChapters, settings.skipDupChapters],
    );

    const updateChapter = (patch: UpdateChapterPatchInput) => {
        if (chapter === initialChapter) {
            return;
        }

        const getChapterIdsToDelete = () => {
            const isAutoDeletionEnabled = !!patch.isRead && !!metadataSettings.deleteChaptersWhileReading;
            if (!isAutoDeletionEnabled || !mangaChapters) {
                return [];
            }

            const chapterToDelete = [chapter, ...prevChapters][metadataSettings.deleteChaptersWhileReading - 1];

            if (!chapterToDelete) {
                return [];
            }

            // chapter has to exist in the cache since the reader fetches all chapters of the manga
            const chapterToDeleteUpToDateData = Chapters.getFromCache<TChapter>(chapterToDelete.id)!;

            const shouldDeleteChapter =
                chapterToDeleteUpToDateData.isRead &&
                Chapters.isDeletable(chapterToDeleteUpToDateData, metadataSettings.deleteChaptersWithBookmark);
            if (!shouldDeleteChapter) {
                return [];
            }

            if (!settings.skipDupChapters) {
                return Chapters.getIds([chapterToDelete]);
            }

            return Chapters.getIds(Chapters.addDuplicates([chapterToDelete], mangaChapters));
        };

        const downloadAhead = () => {
            const currentChapter = Chapters.getFromCache<TChapter>(chapter.id);

            const inDownloadRange = (patch.lastPageRead ?? 0) / chapter.pageCount > 0.25;
            const shouldCheckDownloadAhead =
                isDownloadAheadEnabled && chapter.manga.inLibrary && !!currentChapter?.isDownloaded && inDownloadRange;

            if (shouldCheckDownloadAhead) {
                const nextChapterUpToDate = nextChapter ? Chapters.getFromCache<TChapter>(nextChapter.id) : null;

                if (!nextChapterUpToDate?.isDownloaded) {
                    return;
                }

                const nextChaptersUpToDate = Chapters.getNonRead(nextChapters).map(
                    // the chapters have to be in the cache since the reader fetches the whole chapter list of the manga
                    (mangaChapter) => Chapters.getFromCache<TChapter>(mangaChapter.id)!,
                );

                const chapterIdsToDownload = nextChaptersUpToDate
                    // "settingsData" can't be undefined since this would not get executed otherwise
                    .slice(-downloadAheadLimit)
                    .filter((mangaChapter) => !mangaChapter.isDownloaded)
                    .map((mangaChapter) => mangaChapter.id)
                    .filter((id) => !Chapters.isDownloading(id));

                if (!chapterIdsToDownload.length) {
                    return;
                }

                Chapters.download(chapterIdsToDownload).catch(
                    defaultPromiseErrorHandler('Reader::updateChapter: shouldDownloadAhead'),
                );
            }
        };

        downloadAhead();

        requestManager
            .updateChapters([chapter.id], {
                ...patch,
                chapterIdsToDelete: getChapterIdsToDelete(),
                trackProgressMangaId:
                    metadataSettings.updateProgressAfterReading && patch.isRead && manga.trackRecords.totalCount
                        ? manga.id
                        : undefined,
            })
            .response.catch();
    };

    const setSettingValue = (key: keyof IReaderSettings, value: AllowedMetadataValueTypes, persist: boolean = true) => {
        setSettings({ ...settings, [key]: value });
        if (persist) {
            requestUpdateMangaMetadata(manga, [[key, value]]).catch(() =>
                makeToast(t('reader.settings.error.label.failed_to_save_settings'), 'warning'),
            );
        }
    };

    const openNextChapter = useCallback(
        (offset: ChapterOffset) => {
            const isOpenNextChapter = offset === ChapterOffset.NEXT;
            const chapterToOpen = isOpenNextChapter ? nextChapter : prevChapter;

            if (!chapterToOpen) {
                makeToast(
                    t(
                        isOpenNextChapter
                            ? 'reader.error.label.next_chapter_does_not_exist'
                            : 'reader.error.label.prev_chapter_does_not_exist',
                    ),
                    'error',
                );
                return;
            }

            setRetrievingNextChapter(true);
            setCurPage(0);

            navigate(`/manga/${manga.id}/chapter/${chapterToOpen.sourceOrder}`, {
                replace: true,
                state: location.state,
            });

            setRetrievingNextChapter(false);
        },
        [manga.id, prevChapter?.id, nextChapter?.id],
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
            checkAndHandleMissingStoredReaderSettings(manga, 'manga', defaultSettings).catch(
                defaultPromiseErrorHandler('Reader::checkAndHandleMissingStoredReaderSettings'),
            );
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

        if (chapter === initialChapter) {
            return;
        }

        const chapterUpToDate = Chapters.getFromCache<TChapter>(chapter.id);
        if (curPageDebounced === chapterUpToDate?.lastPageRead) {
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

    const loadNextChapter = useCallback(() => {
        updateChapter({
            lastPageRead: chapter.pageCount - 1,
            isRead: true,
        });

        openNextChapter(ChapterOffset.NEXT);
    }, [chapter.pageCount, openNextChapter]);

    const loadPrevChapter = useCallback(() => {
        openNextChapter(ChapterOffset.PREV);
    }, [openNextChapter]);

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
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: settings.staticNav
                    ? 'calc((100vw - (100vw - 100%)) - 300px)'
                    : 'calc(100vw - (100vw - 100%))', // 100vw = width excluding scrollbar; 100% = width including scrollbar
                minHeight: '100vh',
                marginLeft: settings.staticNav ? '300px' : 'unset',
            }}
        >
            <PageNumber settings={settings} curPage={curPage} pageCount={chapter.pageCount} />
            <Box sx={{ alignSelf: 'stretch' }}>
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
                    nextChapter={loadNextChapter}
                    prevChapter={loadPrevChapter}
                />
            </Box>
        </Box>
    );
}
