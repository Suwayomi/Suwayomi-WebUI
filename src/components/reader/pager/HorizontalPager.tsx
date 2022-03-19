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
 * It creates a horizontal pager that can be used to navigate through the pages of a book
 * @param {IReaderProps} props - IReaderProps
 * @returns A component that renders the pages of the book.
 */
export default function HorizontalPager(props: IReaderProps) {
    const {
        pages, curPage, settings, setCurPage, prevChapter, nextChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    /**
     * If the current page is not the last page, then scroll to the next page. If the current page is
     * the last page, and the settings.loadNextonEnding is true, then scroll to the next chapter
     */
    function nextPage() {
        if (curPage < pages.length - 1) {
            pagesRef.current[curPage + 1]?.scrollIntoView({ inline: 'center' });
            setCurPage((page) => page + 1);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    /**
     * If the current page is not the first page, scroll to the previous page. If the current page is
     * the first page, scroll to the previous chapter
     */
    function prevPage() {
        if (curPage > 0) {
            pagesRef.current[curPage - 1]?.scrollIntoView({ inline: 'center' });
            setCurPage(curPage - 1);
        } else if (curPage === 0) {
            prevChapter();
        }
    }

    /**
     * If the reader type is ContinuesHorizontalLTR, then go to the previous page. Otherwise, go to the
     * next page
     */
    function goLeft() {
        if (settings.readerType === 'ContinuesHorizontalLTR') {
            prevPage();
        } else {
            nextPage();
        }
    }

    /**
     * If the reader type is ContinuesHorizontalLTR, then go to the next page. Otherwise, go to the
     * previous page
     */
    function goRight() {
        if (settings.readerType === 'ContinuesHorizontalLTR') {
            nextPage();
        } else {
            prevPage();
        }
    }

    const mouseXPos = useRef<number>(0);

    /**
     * It moves the screen by the difference between the mouse's current position and the previous
     * position.
     * @param {MouseEvent} e - MouseEvent
     */
    function dragScreen(e: MouseEvent) {
        window.scrollBy(mouseXPos.current - e.pageX, 0);
    }

    /**
     * It sets the mouseXPos to the current mouse position and then adds an event listener to the
     * screen.
     * @param {MouseEvent} e - MouseEvent
     */
    function dragControl(e:MouseEvent) {
        mouseXPos.current = e.pageX;
        selfRef.current?.addEventListener('mousemove', dragScreen);
    }

    /**
     * Remove the drag control event listener from the screen.
     */
    function removeDragControl() {
        selfRef.current?.removeEventListener('mousemove', dragScreen);
    }

    /**
     * If the mouse is clicked on the right side of the screen, go right. If the mouse is clicked on
     * the left side of the screen, go left
     * @param {MouseEvent} e - The MouseEvent object that was triggered.
     */
    function clickControl(e:MouseEvent) {
        if (e.clientX >= window.innerWidth * 0.85) {
            goRight();
        } else if (e.clientX <= window.innerWidth * 0.15) {
            goLeft();
        }
    }

    /**
     * If the reader is in a continues horizontal mode, and the user has scrolled to the end of the
     * page, then the next chapter is loaded
     */
    const handleLoadNextonEnding = () => {
        if (settings.readerType === 'ContinuesHorizontalLTR') {
            if (window.scrollX + window.innerWidth >= document.body.scrollWidth) {
                nextChapter();
            }
        } else if (settings.readerType === 'ContinuesHorizontalRTL') {
            if (window.scrollX <= window.innerWidth) {
                nextChapter();
            }
        }
    };

    useEffect(() => {
        // scroll last read page into view after first mount
        pagesRef.current[curPage]?.scrollIntoView({ inline: 'center' });
    }, [pagesRef.current.length]);

    useEffect(() => {
        selfRef.current?.addEventListener('mousedown', dragControl);
        selfRef.current?.addEventListener('mouseup', removeDragControl);

        return () => {
            selfRef.current?.removeEventListener('mousedown', dragControl);
            selfRef.current?.removeEventListener('mouseup', removeDragControl);
        };
    }, [selfRef]);

    useEffect(() => {
        if (settings.loadNextonEnding) {
            document.addEventListener('scroll', handleLoadNextonEnding);
        }
        selfRef.current?.addEventListener('mousedown', clickControl);

        return () => {
            document.removeEventListener('scroll', handleLoadNextonEnding);
            selfRef.current?.removeEventListener('mousedown', clickControl);
        };
    }, [selfRef, curPage]);

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: (settings.readerType === 'ContinuesHorizontalLTR') ? 'row' : 'row-reverse',
                justifyContent: (settings.readerType === 'ContinuesHorizontalLTR') ? 'flex-start' : 'flex-end',
                margin: '0 auto',
                width: 'auto',
                height: 'auto',
                overflowX: 'visible',
                userSelect: 'none',
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
