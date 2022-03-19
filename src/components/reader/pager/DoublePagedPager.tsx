/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Box } from '@mui/system';
import Page from '../Page';
import DoublePage from '../DoublePage';

/**
 * It displays the pages of the book
 * @returns The component is being returned as a function.
 */
export default function DoublePagedPager(props: IReaderProps) {
    const {
        pages, settings, setCurPage, curPage, nextChapter, prevChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLImageElement[]>([]);

    const pagesDisplayed = useRef<number>(0);
    const pageLoaded = useRef<boolean[]>(Array(pages.length).fill(false));

    /**
     * If the current page is not the last page, and the next page is loaded, then set the number of
     * pages to display to two
     * @returns Nothing.
     */
    function setPagesToDisplay() {
        pagesDisplayed.current = 0;
        if (curPage < pages.length && pagesRef.current[curPage]) {
            if (pageLoaded.current[curPage]) {
                pagesDisplayed.current = 1;
                const imgElem = pagesRef.current[curPage];
                const aspectRatio = imgElem.height / imgElem.width;
                if (aspectRatio < 1) {
                    return;
                }
            }
        }
        if (curPage + 1 < pages.length && pagesRef.current[curPage + 1]) {
            if (pageLoaded.current[curPage + 1]) {
                const imgElem = pagesRef.current[curPage + 1];
                const aspectRatio = imgElem.height / imgElem.width;
                if (aspectRatio < 1) {
                    return;
                }
                pagesDisplayed.current = 2;
            }
        }
    }

    /**
     * If the current page is the first page, then display a Page component. If the current page is the
     * second page, then display a DoublePage component
     */
    function displayPages() {
        if (pagesDisplayed.current === 2) {
            ReactDOM.render(
                <DoublePage
                    key={curPage}
                    index={curPage}
                    image1src={pages[curPage].src}
                    image2src={pages[curPage + 1].src}
                    settings={settings}
                />,
                document.getElementById('display'),
            );
        } else {
            ReactDOM.render(
                <Page
                    key={curPage}
                    index={curPage}
                    src={(pagesDisplayed.current === 1) ? pages[curPage].src : ''}
                    onImageLoad={() => {}}
                    setCurPage={setCurPage}
                    settings={settings}
                />,
                document.getElementById('display'),
            );
        }
    }

    /**
     * If the current page is not the first page, and the previous page is loaded, return 1. Otherwise,
     * return 2
     * @returns The number of pages to go back.
     */
    function pagesToGoBack() {
        for (let i = 1; i <= 2; i++) {
            if (curPage - i > 0 && pagesRef.current[curPage - i]) {
                if (pageLoaded.current[curPage - i]) {
                    const imgElem = pagesRef.current[curPage - i];
                    const aspectRatio = imgElem.height / imgElem.width;
                    if (aspectRatio < 1) {
                        return 1;
                    }
                }
            }
        }
        return 2;
    }

    /**
     * If the current page is not the last page, then increment the current page by the number of pages
     * displayed. If the current page is the last page, then increment the current page by the number
     * of pages displayed. If the current page is the last page and the user has enabled the
     * loadNextonEnding setting, then increment the current chapter by 1
     */
    function nextPage() {
        if (curPage < pages.length - 1) {
            const nextCurPage = curPage + pagesDisplayed.current;
            setCurPage((nextCurPage >= pages.length) ? pages.length - 1 : nextCurPage);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    /**
     * If the current page is greater than zero, decrement the current page by the number of pages to
     * go back. If the current page is less than zero, decrement the current chapter by one
     */
    function prevPage() {
        if (curPage > 0) {
            const nextCurPage = curPage - pagesToGoBack();
            setCurPage((nextCurPage < 0) ? 0 : nextCurPage);
        } else {
            prevChapter();
        }
    }

    /**
     * If the reader type is double left to right, then go to the previous page. Otherwise, go to the
     * next page
     */
    function goLeft() {
        if (settings.readerType === 'DoubleLTR') {
            prevPage();
        } else {
            nextPage();
        }
    }

    /**
     * If the reader type is double left to right, then go to the next page. Otherwise, go to the
     * previous page
     */
    function goRight() {
        if (settings.readerType === 'DoubleLTR') {
            nextPage();
        } else {
            prevPage();
        }
    }

    /**
     * It takes an event as an argument and then checks the event code. If the event code is space, it
     * will call the nextPage function. If the event code is arrow right, it will call the goRight
     * function. If the event code is arrow left, it will call the goLeft function.
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

    /**
     * It sets the pageLoaded.current[index] to true.
     * @param {number} index - number
     * @returns A function that is called when the image is loaded.
     */
    function handleImageLoad(index: number) {
        return () => {
            pageLoaded.current[index] = true;
        };
    }

    useEffect(() => {
        const retryDisplay = setInterval(() => {
            const isLastPage = (curPage === pages.length - 1);
            if ((!isLastPage && pageLoaded.current[curPage] && pageLoaded.current[curPage + 1])
                || pageLoaded.current[curPage]) {
                setPagesToDisplay();
                displayPages();
                clearInterval(retryDisplay);
            }
        }, 50);

        document.addEventListener('keydown', keyboardControl);
        selfRef.current?.addEventListener('click', clickControl);

        return () => {
            clearInterval(retryDisplay);
            document.removeEventListener('keydown', keyboardControl);
            selfRef.current?.removeEventListener('click', clickControl);
        };
    }, [selfRef, curPage, settings.readerType]);

    return (
        <Box ref={selfRef}>
            <Box id="preload" sx={{ display: 'none' }}>
                {
                    pages.map((page) => (
                        <img
                            ref={(e:HTMLImageElement) => { pagesRef.current[page.index] = e; }}
                            key={`${page.index}`}
                            src={page.src}
                            onLoad={handleImageLoad(page.index)}
                            alt={`${page.index}`}
                        />
                    ))
                }
            </Box>
            <Box
                id="display"
                sx={{
                    display: 'flex',
                    flexDirection: (settings.readerType === 'DoubleLTR') ? 'row' : 'row-reverse',
                    justifyContent: 'center',
                    margin: '0 auto',
                    width: 'auto',
                    height: 'auto',
                    overflowX: 'scroll',
                }}
            />
        </Box>
    );
}
