/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import CircularProgress from '@mui/material/CircularProgress';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import HorizontalPager from 'components/reader/pager/HorizontalPager';
import PageNumber from 'components/reader/PageNumber';
import PagedPager from 'components/reader/pager/PagedPager';
import DoublePagedPager from 'components/reader/pager/DoublePagedPager';
import VerticalPager from 'components/reader/pager/VerticalPager';
import ReaderNavBar from 'components/navbar/ReaderNavBar';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import { Box } from '@mui/system';
import { requestUpdateMangaMetadata } from 'util/metadata';
import {
    checkAndHandleMissingStoredReaderSettings,
    getReaderSettingsFor,
    useDefaultReaderSettings,
} from 'util/readerSettings';
import makeToast from 'components/util/Toast';
import {
    ChapterOffset,
    IChapter,
    IManga,
    IMangaCard,
    IPartialChapter,
    IReaderSettings,
    ReaderType,
    TranslationKey,
} from 'typings';
import { useTranslation } from 'react-i18next';

const isDupChapter = async (chapterIndex: number, currentChapter: IChapter) => {
    const nextChapter = (await client.get<IChapter>(`/api/v1/manga/${currentChapter.mangaId}/chapter/${chapterIndex}`))
        .data;

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
const initialChapter = () => ({
    pageCount: -1,
    index: -1,
    chapterCount: 0,
    lastPageRead: 0,
    name: 'Loading...',
});

export default function Reader() {
    const { t } = useTranslation();
    const history = useHistory();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');

    const { chapterIndex, mangaId } = useParams<{ chapterIndex: string; mangaId: string }>();
    const [manga, setManga] = useState<IMangaCard | IManga>({
        id: +mangaId,
        title: '',
        thumbnailUrl: '',
        genre: [],
        inLibraryAt: 0,
        lastReadAt: 0,
    });
    const [chapter, setChapter] = useState<IChapter | IPartialChapter>(initialChapter());
    const [curPage, setCurPage] = useState<number>(0);
    const [pageToScrollTo, setPageToScrollTo] = useState<number | undefined>(undefined);
    const { setOverride, setTitle } = useContext(NavbarContext);
    const [retrievingNextChapter, setRetrievingNextChapter] = useState(false);

    const { settings: defaultSettings, loading: areDefaultSettingsLoading } = useDefaultReaderSettings();
    const [settings, setSettings] = useState(getReaderSettingsFor(manga, defaultSettings));
    const [isMangaLoading, setIsMangaLoading] = useState(true);

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
        setIsMangaLoading(true);
        client
            .get(`/api/v1/manga/${mangaId}/`)
            .then((response) => response.data)
            .then((data: IManga) => {
                setManga(data);
                setIsMangaLoading(false);
            });
    }, [mangaId]);

    useEffect(() => {
        setChapter(initialChapter);
        client
            .get(`/api/v1/manga/${mangaId}/chapter/${chapterIndex}`)
            .then((response) => response.data)
            .then((data: IChapter) => {
                setChapter(data);

                if (data.lastPageRead === data.pageCount - 1) {
                    // last page, also probably read = true, we will load the first page.
                    setCurPage(0);
                } else setCurPage(data.lastPageRead);
            });
    }, [chapterIndex]);

    useEffect(() => {
        if (curPage !== -1) {
            const formData = new FormData();
            formData.append('lastPageRead', curPage.toString());
            client.patch(`/api/v1/manga/${manga.id}/chapter/${chapter.index}`, formData);
        }

        if (curPage === chapter.pageCount - 1) {
            const formDataRead = new FormData();
            formDataRead.append('read', 'true');
            client.patch(`/api/v1/manga/${manga.id}/chapter/${chapter.index}`, formDataRead);
        }
    }, [curPage]);

    const nextChapter = useCallback(() => {
        if (chapter.index < chapter.chapterCount) {
            const formData = new FormData();
            formData.append('lastPageRead', `${chapter.pageCount - 1}`);
            formData.append('read', 'true');
            client.patch(`/api/v1/manga/${manga.id}/chapter/${chapter.index}`, formData);

            openNextChapter(ChapterOffset.NEXT, (nextChapterIndex) =>
                history.replace({
                    pathname: `/manga/${manga.id}/chapter/${nextChapterIndex}`,
                    state: history.location.state,
                }),
            );
        }
    }, [chapter.index, chapter.chapterCount, chapter.pageCount, manga.id, settings.skipDupChapters]);

    const prevChapter = useCallback(() => {
        if (chapter.index > 1) {
            openNextChapter(ChapterOffset.PREV, (prevChapterIndex) =>
                history.replace({
                    pathname: `/manga/${manga.id}/chapter/${prevChapterIndex}`,
                    state: history.location.state,
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
        src: `${serverAddress}/api/v1/manga/${mangaId}/chapter/${chapterIndex}/page/${index}`,
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
