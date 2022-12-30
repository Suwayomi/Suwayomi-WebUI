/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import CircularProgress from '@mui/material/CircularProgress';
import React, {
    useCallback, useContext, useEffect, useState,
} from 'react';
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
import { getReaderSettingsFor } from 'util/readerSettings';
import makeToast from '../components/util/Toast';

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

const range = (n:number) => Array.from({ length: n }, (value, key) => key);
const initialChapter = () => ({
    pageCount: -1,
    index: -1,
    chapterCount: 0,
    lastPageRead: 0,
    name: 'Loading...',
});

export default function Reader() {
    const history = useHistory();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');

    const { chapterIndex, mangaId } = useParams<{ chapterIndex: string, mangaId: string }>();
    const [manga, setManga] = useState<IMangaCard | IManga>({ id: +mangaId, title: '', thumbnailUrl: '' });
    const [chapter, setChapter] = useState<IChapter | IPartialChapter>(initialChapter());
    const [curPage, setCurPage] = useState<number>(0);
    const { setOverride, setTitle } = useContext(NavbarContext);

    const [settings, setSettings] = useState(getReaderSettingsFor(manga));

    const setSettingValue = (key: keyof IReaderSettings, value: string | boolean) => {
        setSettings({ ...settings, [key]: value });
        requestUpdateMangaMetadata(manga, [[key, value]]).catch(() => makeToast('Failed to save the reader settings to the server', 'warning'));
    };

    useEffect(() => {
        // set the custom navbar
        setOverride(
            {
                status: true,
                value: (
                    <ReaderNavBar
                        settings={settings}
                        setSettingValue={setSettingValue}
                        manga={manga}
                        chapter={chapter as IChapter}
                        curPage={curPage}
                    />
                ),
            },
        );

        // clean up for when we leave the reader
        return () => setOverride({ status: false, value: <div /> });
    }, [manga, chapter, settings, curPage, chapterIndex]);

    useEffect(() => {
        setTitle('Reader');
        client.get(`/api/v1/manga/${mangaId}/`)
            .then((response) => response.data)
            .then((data: IManga) => {
                setManga(data);
                setTitle(data.title);
                setSettings(getReaderSettingsFor(data));
            });
    }, [mangaId]);

    useEffect(() => {
        setChapter(initialChapter);
        client.get(`/api/v1/manga/${mangaId}/chapter/${chapterIndex}`)
            .then((response) => response.data)
            .then((data:IChapter) => {
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

            history.replace({ pathname: `/manga/${manga.id}/chapter/${chapter.index + 1}`, state: history.location.state });
        }
    }, [chapter.index, chapter.chapterCount, chapter.pageCount, manga.id]);

    const prevChapter = useCallback(() => {
        if (chapter.index > 1) {
            history.replace({ pathname: `/manga/${manga.id}/chapter/${chapter.index - 1}`, state: history.location.state });
        }
    }, [chapter.index, manga.id]);

    // return spinner while chpater data is loading
    if (chapter.pageCount === -1) {
        return (
            <Box sx={{
                height: '100vh', width: '100vw', display: 'grid', placeItems: 'center',
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
    const initialPage = (chapter.lastPageRead === chapter.pageCount - 1) ? 0 : chapter.lastPageRead;

    return (
        <Box sx={{ width: settings.staticNav ? 'calc(100vw - 300px)' : '100vw' }}>
            <PageNumber
                settings={settings}
                curPage={curPage}
                pageCount={chapter.pageCount}
            />
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
