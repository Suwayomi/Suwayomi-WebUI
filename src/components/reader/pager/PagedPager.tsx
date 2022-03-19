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
 * It renders a page of the book.
 * @param {IReaderProps} props - IReaderProps
 */
export default function PagedReader(props: IReaderProps) {
    const {
        pages, settings, setCurPage, curPage, nextChapter, prevChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);

    /**
     * If the current page is not the last page, then increment the current page. If the current page
     * is the last page, and the settings.loadNextonEnding is true, then increment the current chapter
     */
    function nextPage() {
        if (curPage < pages.length - 1) {
            setCurPage(curPage + 1);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    /**
     * If the current page is greater than 0, decrement the current page. Otherwise, decrement the
     * current chapter
     */
    function prevPage() {
        if (curPage > 0) {
            setCurPage(curPage - 1);
        } else {
            prevChapter();
        }
    }

    /**
     * If the reader type is SingleLTR, then call the prevPage function. If the reader type is
     * SingleRTL, then call the nextPage function
     */
    function goLeft() {
        if (settings.readerType === 'SingleLTR') {
            prevPage();
        } else if (settings.readerType === 'SingleRTL') {
            nextPage();
        }
    }

    /**
     * If the reader type is SingleLTR, then go to the next page. If the reader type is SingleRTL, then
     * go to the previous page
     */
    function goRight() {
        if (settings.readerType === 'SingleLTR') {
            nextPage();
        } else if (settings.readerType === 'SingleRTL') {
            prevPage();
        }
    }

    /**
     * It takes an event as an argument and then checks the event code. If the event code is space, it
     * calls the nextPage function. If the event code is arrow right, it calls the goRight function. If
     * the event code is arrow left, it calls the goLeft function.
     * @param {KeyboardEvent} e - The KeyboardEvent object.
     */
    function keyboardControl(e:KeyboardEvent) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                nextPage();
                break;
            case 'ArrowRight':
                goRight();
                break;
            case 'ArrowLeft':
                goLeft();
                break;
            default:
                break;
        }
    }

    /**
     * If the mouse click is on the left side of the screen, go left. If it's on the right side of the
     * screen, go right
     * @param {MouseEvent} e - The MouseEvent object that was triggered.
     */
    function clickControl(e:MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            goRight();
        } else {
            goLeft();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', keyboardControl);
        selfRef.current?.addEventListener('click', clickControl);

        return () => {
            document.removeEventListener('keydown', keyboardControl);
            selfRef.current?.removeEventListener('click', clickControl);
        };
    }, [selfRef, curPage, settings.readerType]);

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                margin: '0 auto',
                width: '100%',
                height: '100vh',
            }}
        >
            <Page
                key={curPage}
                index={curPage}
                onImageLoad={() => {}}
                src={pages[curPage].src}
                setCurPage={setCurPage}
                settings={settings}
            />
        </Box>
    );
}
