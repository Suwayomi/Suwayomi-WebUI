/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/system';
import Page from '../Page';

export default function VerticalReader(props: IReaderProps) {
    const {
        pages, settings, setCurPage, initialPage, nextChapter, prevChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        pagesRef.current = pagesRef.current.slice(0, pages.length);
    }, [pages.length]);

    function nextPage() {
        if (curPage < pages.length - 1) {
            pagesRef.current[curPage + 1]?.scrollIntoView();
            setCurPage((page) => page + 1);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    function prevPage() {
        if (curPage > 0) {
            const rect = pagesRef.current[curPage].getBoundingClientRect();
            if (rect.y < 0 && rect.y + rect.height > 0) {
                pagesRef.current[curPage]?.scrollIntoView();
            } else {
                pagesRef.current[curPage - 1]?.scrollIntoView();
                setCurPage(curPage - 1);
            }
        } else if (curPage === 0) {
            prevChapter();
        }
    }

    function keyboardControl(e:KeyboardEvent) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                nextPage();
                break;
            case 'ArrowRight':
                nextPage();
                break;
            case 'ArrowLeft':
                prevPage();
                break;
            default:
                break;
        }
    }

    function clickControl(e:MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            nextPage();
        } else {
            prevPage();
        }
    }

    const handleLoadNextonEnding = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            nextChapter();
        }
    };

    useEffect(() => {
        if (settings.loadNextonEnding) { document.addEventListener('scroll', handleLoadNextonEnding); }
        document.addEventListener('keydown', keyboardControl, false);
        selfRef.current?.addEventListener('click', clickControl);

        return () => {
            document.removeEventListener('scroll', handleLoadNextonEnding);
            document.removeEventListener('keydown', keyboardControl);
            selfRef.current?.removeEventListener('click', clickControl);
        };
    }, [selfRef, curPage]);

    useEffect(() => {
        // Delay scrolling to next cycle
        setTimeout(() => {
            // scroll last read page into view when initialPage changes
            pagesRef.current[initialPage]?.scrollIntoView();
        }, 0);
    }, [initialPage]);

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                margin: '0 auto',
                width: '100%',
            }}
        >
            {
                pages.map((page) => (
                    <Page
                        key={page.index}
                        index={page.index}
                        src={page.src}
                        onImageLoad={() => {}}
                        settings={settings}
                        ref={(e:HTMLDivElement) => { pagesRef.current[page.index] = e; }}
                    />
                ))
            }
        </Box>
    );
}
