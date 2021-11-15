/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import CircularProgress from '@mui/material/CircularProgress';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import HorizontalPager from 'components/reader/pager/HorizontalPager';
import PageNumber from 'components/reader/PageNumber';
import PagedPager from 'components/reader/pager/PagedPager';
import DoublePagedPager from 'components/reader/pager/DoublePagedPager';
import VerticalPager from 'components/reader/pager/VerticalPager';
import ReaderNavBar, { defaultReaderSettings } from 'components/navbar/ReaderNavBar';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import cloneObject from 'util/cloneObject';
import { Box } from '@mui/system';

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
const initialChapter = () => ({ pageCount: -1, index: -1, chapterCount: 0 });

export default function Reader() {
    const [settings, setSettings] = useLocalStorage<IReaderSettings>('readerSettings', defaultReaderSettings);

    const history = useHistory();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');

    const { chapterIndex, mangaId } = useParams<{ chapterIndex: string, mangaId: string }>();
    const [manga, setManga] = useState<IMangaCard | IManga>({ id: +mangaId, title: '', thumbnailUrl: '' });
    const [chapter, setChapter] = useState<IChapter | IPartialChpter>(initialChapter());
    const [curPage, setCurPage] = useState<number>(0);
    const { setOverride, setTitle } = useContext(NavbarContext);

    useEffect(() => {
        // make sure settings has all the keys
        const settingsClone = cloneObject(settings) as any;
        const defualtSettings = defaultReaderSettings();
        let shouldUpdateSettings = false;
        Object.keys(defualtSettings).forEach((key) => {
            const keyOf = key as keyof IReaderSettings;
            if (settings[keyOf] === undefined) {
                settingsClone[keyOf] = defualtSettings[keyOf];
                shouldUpdateSettings = true;
            }
        });
        if (shouldUpdateSettings) { setSettings(settingsClone); }

        // set the custom navbar
        setOverride(
            {
                status: true,
                value: (
                    <ReaderNavBar
                        settings={settings}
                        setSettings={setSettings}
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
            });
    }, [chapterIndex]);

    useEffect(() => {
        setChapter(initialChapter);
        client.get(`/api/v1/manga/${mangaId}/chapter/${chapterIndex}`)
            .then((response) => response.data)
            .then((data:IChapter) => {
                setChapter(data);
                setCurPage(data.lastPageRead);
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

    const nextChapter = () => {
        if (chapter.index < chapter.chapterCount) {
            const formData = new FormData();
            formData.append('lastPageRead', `${chapter.pageCount - 1}`);
            formData.append('read', 'true');
            client.patch(`/api/v1/manga/${manga.id}/chapter/${chapter.index}`, formData);

            history.replace(`/manga/${manga.id}/chapter/${chapter.index + 1}`);
        }
    };

    const prevChapter = () => {
        if (chapter.index > 1) {
            history.replace(`/manga/${manga.id}/chapter/${chapter.index - 1}`);
        }
    };

    const pages = range(chapter.pageCount).map((index) => ({
        index,
        src: `${serverAddress}/api/v1/manga/${mangaId}/chapter/${chapterIndex}/page/${index}`,
    }));

    const ReaderComponent = getReaderComponent(settings.readerType);

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
