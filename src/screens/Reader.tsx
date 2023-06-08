/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CircularProgress from '@mui/material/CircularProgress';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChapterOffset, IChapter, IManga, IMangaCard, IReaderSettings, ReaderType, TranslationKey } from '@/typings';
import requestManager from '@/lib/RequestManager';
import {
    checkAndHandleMissingStoredReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from '@/util/readerSettings';
import { requestUpdateMangaMetadata } from '@/util/metadata';
import HorizontalPager from '@/components/reader/pager/HorizontalPager';
import PageNumber from '@/components/reader/PageNumber';
import PagedPager from '@/components/reader/pager/PagedPager';
import DoublePagedPager from '@/components/reader/pager/DoublePagedPager';
import VerticalPager from '@/components/reader/pager/VerticalPager';
import ReaderNavBar from '@/components/navbar/ReaderNavBar';
import NavbarContext from '@/components/context/NavbarContext';
import makeToast from '@/components/util/Toast';

const isDupChapter = async (chapterIndex: number, currentChapter: IChapter) => {
    const nextChapter = await requestManager.getChapter(currentChapter.mangaId, chapterIndex).response;

    return nextChapter.chapterNumber === currentChapter.chapterNumber;
};

/**
 * In case duplicated chapters should be skipped the function will check all next/prev chapters until
 *  - a non duplicated chapter was found
 *  - no prev/next chapter exists => chapter request will fail and error will be raised up
 */
const getOffsetChapter = async (
    chapterIndex: number,
    currentChapter: IChapter,
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
    index: -1,
    chapterCount: 0,
    lastPageRead: 0,
    name: 'Loading...',
};

export default function Reader() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const { chapterIndex, mangaId } = useParams<{ chapterIndex: string; mangaId: string }>();
    const {
        data: manga = {
            id: +mangaId,
            title: '',
            thumbnailUrl: '',
            genre: [],
            inLibraryAt: 0,
            lastReadAt: 0,
        } as IMangaCard | IManga,
        isLoading: isMangaLoading,
    } = requestManager.useGetManga(mangaId);
    const { data: chapter = initialChapter, isLoading: isChapterLoading } = requestManager.useGetChapter(
        mangaId,
        chapterIndex,
        { disableCache: true, revalidateOnFocus: false },
    );
    const [wasLastPageReadSet, setWasLastPageReadSet] = useState(false);
    const [curPage, setCurPage] = useState<number>(0);
    const [pageToScrollTo, setPageToScrollTo] = useState<number | undefined>(undefined);
    const { setOverride, setTitle } = useContext(NavbarContext);
    const [retrievingNextChapter, setRetrievingNextChapter] = useState(false);

    const { settings: defaultSettings, loading: areDefaultSettingsLoading } = useDefaultReaderSettings();
    const [settings, setSettings] = useState(getReaderSettingsFor(manga, defaultSettings));

    const setSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        setSettings({ ...settings, [key]: value });
        requestUpdateMangaMetadata(manga, [[key, value]]).catch(() =>
            makeToast(t('reader.settings.error.label.failed_to_save_settings'), 'warning'),
        );
    };

    const openNextChapter = useCallback(
        async (offset: ChapterOffset, setHistory: (nextChapterIndex: number) => void) => {
            setRetrievingNextChapter(true);
            try {
                setHistory(
                    await getOffsetChapter(
                        chapter.index + offset,
                        chapter as IChapter,
                        settings.skipDupChapters,
                        offset,
                    ),
                );
            } catch (error) {
                const offsetToTranslationKeyMap: { [chapterOffset in ChapterOffset]: TranslationKey } = {
                    [ChapterOffset.PREV]: 'reader.error.label.unable_to_get_prev_chapter_skip_dup',
                    [ChapterOffset.NEXT]: 'reader.error.label.unable_to_get_next_chapter_skip_dup',
                };

                makeToast(t(offsetToTranslationKeyMap[offset]) as string, 'error');
            } finally {
                setRetrievingNextChapter(false);
            }
        },
        [chapter, settings],
    );

    useEffect(() => {
        if (isChapterLoading || !chapter) {
            return;
        }

        setWasLastPageReadSet(true);
        if (chapter.lastPageRead === chapter.pageCount - 1) {
            // last page, also probably read = true, we will load the first page.
            setCurPage(0);
        } else setCurPage(chapter.lastPageRead);
    }, [chapter, isChapterLoading]);

    useEffect(() => {
        if (!manga?.title || (chapter as IChapter)?.name === t('global.label.loading')) {
            setTitle(t('reader.title'));
        } else {
            setTitle(`${manga.title}: ${(chapter as IChapter).name}`);
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
                    chapter={chapter as IChapter}
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
        if (curPage !== -1) {
            requestManager.updateChapter(manga.id, chapter.index, { lastPageRead: curPage });
        }

        if (curPage === chapter.pageCount - 1) {
            requestManager.updateChapter(manga.id, chapter.index, { read: true });
        }
    }, [curPage]);

    const nextChapter = useCallback(() => {
        if (chapter.index < chapter.chapterCount) {
            requestManager.updateChapter(manga.id, chapter.index, {
                lastPageRead: chapter.pageCount - 1,
                read: true,
            });

            openNextChapter(ChapterOffset.NEXT, (nextChapterIndex) =>
                navigate(`/manga/${manga.id}/chapter/${nextChapterIndex}`, {
                    replace: true,
                    state: location.state,
                }),
            );
        }
    }, [chapter.index, chapter.chapterCount, chapter.pageCount, manga.id, settings.skipDupChapters]);

    const prevChapter = useCallback(() => {
        if (chapter.index > 1) {
            openNextChapter(ChapterOffset.PREV, (prevChapterIndex) =>
                navigate(`/manga/${manga.id}/chapter/${prevChapterIndex}`, {
                    replace: true,
                    state: location.state,
                }),
            );
        }
    }, [chapter.index, manga.id, settings.skipDupChapters]);

    // return spinner while chpater data is loading
    if (chapter.pageCount === -1) {
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
