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

const isSpreadPage = (image: HTMLImageElement): boolean => {
    const aspectRatio = image.height / image.width;
    return aspectRatio < 1;
};

const isSinglePage = (index: number, spreadPages: boolean[]): boolean => {
    // Page is single if it is spread page
    if (spreadPages[index]) return true;
    // Page is single if it is last page
    if (index === spreadPages.length - 1) return true;
    // Page can not be single if it is not followed by spread
    if (!spreadPages[index + 1]) return false;
    // Page is single if number of single pages since last spread is odd
    const previousSpreadIndex = spreadPages.lastIndexOf(true, index - 1);
    const numberOfNonSpreads = index - (previousSpreadIndex + 1);
    return numberOfNonSpreads % 2 === 0;
};

export default function DoublePagedPager(props: IReaderProps) {
    const {
        pages, settings, setCurPage, curPage, nextChapter, prevChapter,
    } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLImageElement[]>([]);

    const pagesDisplayed = useRef<number>(0);
    const pageLoaded = useRef<boolean[]>(Array(pages.length).fill(false));
    const spreadPage = useRef<boolean[]>(Array(pages.length).fill(false));

    function setPagesToDisplay() {
        pagesDisplayed.current = 0;
        if (curPage < pages.length && pagesRef.current[curPage]) {
            if (pageLoaded.current[curPage]) {
                pagesDisplayed.current = 1;
                if (spreadPage.current[curPage]) return;
            }
        }
        if (curPage + 1 < pages.length && pagesRef.current[curPage + 1]) {
            if (pageLoaded.current[curPage + 1]) {
                if (spreadPage.current[curPage + 1]) return;
                pagesDisplayed.current = 2;
            }
        }
    }

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
                    settings={settings}
                />,
                document.getElementById('display'),
            );
        }
    }

    function pagesToGoBack() {
        // If previous page is single page, go only one page pack
        // If previous page is not single page, but we are on last page
        // go back one page anyway.
        // This handles special case, where last page was displayed in pair, but then
        // page was changed to the last page and now it is shown as single page.
        const isLastPage = curPage === spreadPage.current.length - 1;
        if (isSinglePage(curPage - 1, spreadPage.current) || isLastPage) {
            return 1;
        }

        // Otherwise go two pages back
        return 2;
    }

    function nextPage() {
        if (curPage < pages.length - 1) {
            const nextCurPage = curPage + pagesDisplayed.current;
            setCurPage((nextCurPage >= pages.length) ? pages.length - 1 : nextCurPage);
        } else if (settings.loadNextonEnding) {
            nextChapter();
        }
    }

    function prevPage() {
        if (curPage > 0) {
            const nextCurPage = curPage - pagesToGoBack();
            setCurPage((nextCurPage < 0) ? 0 : nextCurPage);
        } else {
            prevChapter();
        }
    }

    function goLeft() {
        if (settings.readerType === 'DoubleLTR') {
            prevPage();
        } else {
            nextPage();
        }
    }

    function goRight() {
        if (settings.readerType === 'DoubleLTR') {
            nextPage();
        } else {
            prevPage();
        }
    }

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

    function clickControl(e:MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            goRight();
        } else {
            goLeft();
        }
    }

    function handleImageLoad(index: number) {
        return () => {
            pageLoaded.current[index] = true;
            const image = pagesRef.current[index];
            spreadPage.current[index] = isSpreadPage(image);
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
