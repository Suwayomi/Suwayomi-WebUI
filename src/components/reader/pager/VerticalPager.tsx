/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/system';
import Page from '../Page';

/**
 * The VerticalReader component is a component that displays the pages of a comic book in a vertical
 * fashion
 * @param {IReaderProps} props - IReaderProps
 * @returns A function that returns a function.
 */
export default function VerticalReader(props: IReaderProps) {
    const {
        pages, settings, setCurPage, curPage, nextChapter, prevChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        pagesRef.current = pagesRef.current.slice(0, pages.length);
    }, [pages.length]);

    /**
     * If the current page is not the last page, then scroll to the next page. If the current page is
     * the last page, and the settings.loadNextonEnding is true, then scroll to the next chapter
     */
    function nextPage() {
        if (curPage < pages.length - 1) {
            pagesRef.current[curPage + 1]?.scrollIntoView();
            setCurPage((page) => page + 1);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    /**
     * If the current page is not the first page, scroll the current page into view. If the current
     * page is the first page, scroll the previous chapter into view
     */
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

    /**
     * It takes an event as an argument and then checks the event code. If the event code is space, it
     * calls the nextPage function. If the event code is arrow right, it calls the nextPage function. If
     * the event code is arrow left, it calls the prevPage function.
     * @param {KeyboardEvent} e - The KeyboardEvent object.
     */
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

    /**
     * If the mouse click is on the right side of the screen, go to the next page. Otherwise, go to the
     * previous page
     * @param {MouseEvent} e - The MouseEvent object that was triggered.
     */
    function clickControl(e:MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            nextPage();
        } else {
            prevPage();
        }
    }

    /**
     * When the user scrolls to the bottom of the page, load the next chapter
     */
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
        // scroll last read page into view after first mount
        pagesRef.current[curPage].scrollIntoView();
    }, [pagesRef.current.length]);

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
                        setCurPage={setCurPage}
                        settings={settings}
                        ref={(e:HTMLDivElement) => { pagesRef.current[page.index] = e; }}
                    />
                ))
            }
        </Box>
    );
}
