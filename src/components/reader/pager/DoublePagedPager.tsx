/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { IReaderProps } from '@/typings';
import { Page } from '@/components/reader/Page';
import { DoublePage } from '@/components/reader/DoublePage';

const isSpreadPage = (image: HTMLImageElement): boolean => {
    const aspectRatio = image.height / image.width;
    return aspectRatio < 1;
};

const isSinglePage = (index: number, spreadPages: boolean[], offsetFirstPage: boolean): boolean => {
    // Page is single if it is spread page
    if (spreadPages[index] || spreadPages[index + 1]) return true;
    // Page is single if it is last page
    if (index === spreadPages.length - 1) return true;
    // Page is single if number of single pages since last spread is odd
    const previousSpreadIndex = spreadPages.lastIndexOf(true, index - 1);
    const numberOfNonSpreads = index - (previousSpreadIndex + 1);
    return offsetFirstPage ? numberOfNonSpreads % 2 === 0 : numberOfNonSpreads % 2 === 1;
};

export function DoublePagedPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, curPage, nextChapter, prevChapter } = props;

    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLImageElement[]>([]);

    const [pagesToSpreadState, setPagesToSpreadState] = useState(Array(pages.length).fill(false));
    const [pagesLoadState, setPagesLoadState] = useState<boolean[]>(Array(pages.length).fill(false));

    function getPagesToDisplay(): number {
        let pagesToDisplay = 1; // has to be at least one so skipping forward while pages are still loading is possible
        if (curPage < pages.length && pagesRef.current[curPage]) {
            if (pagesLoadState[curPage]) {
                pagesToDisplay = 1;
                if (pagesToSpreadState[curPage]) return pagesToDisplay;
            }
        }
        if (curPage + 1 < pages.length && pagesRef.current[curPage + 1]) {
            if (pagesLoadState[curPage + 1]) {
                if (isSinglePage(curPage, pagesToSpreadState, settings.offsetFirstPage)) return pagesToDisplay;
                pagesToDisplay = 2;
            }
        }

        return pagesToDisplay;
    }

    function pagesToGoBack() {
        // If previous page is single page, go only one page pack
        if (isSinglePage(curPage - 2, pagesToSpreadState, settings.offsetFirstPage)) {
            return 1;
        }

        // Otherwise go two pages back
        return 2;
    }

    function nextPage() {
        if (curPage < pages.length - 1) {
            const nextCurPage = curPage + getPagesToDisplay();
            setCurPage(nextCurPage >= pages.length ? pages.length - 1 : nextCurPage);
        } else if (settings.loadNextOnEnding) {
            nextChapter();
        }
    }

    function prevPage() {
        if (curPage > 0) {
            const nextCurPage = curPage - pagesToGoBack();
            setCurPage(nextCurPage < 0 ? 0 : nextCurPage);
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

    function keyboardControl(e: KeyboardEvent) {
        switch (e.key) {
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

    function clickControl(e: MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            goRight();
        } else {
            goLeft();
        }
    }

    function handleImageLoad(index: number) {
        return () => {
            setPagesLoadState((prevState) => prevState.toSpliced(index, 1, true));
            const image = pagesRef.current[index];
            setPagesToSpreadState((prevState) => prevState.toSpliced(index, 1, isSpreadPage(image)));
        };
    }

    useEffect(() => {
        document.addEventListener('keydown', keyboardControl);

        return () => {
            document.removeEventListener('keydown', keyboardControl);
        };
    }, [selfRef, curPage, settings.readerType, prevChapter, nextChapter, pagesLoadState, pagesToSpreadState]);

    useEffect(() => {
        setCurPage(initialPage);
    }, [initialPage]);

    useEffect(() => {
        if (settings.offsetFirstPage) {
            if (getPagesToDisplay() === 2) {
                setCurPage(curPage + 1);
            }
        } else if (curPage > 0 && !isSinglePage(curPage - 1, pagesToSpreadState, settings.offsetFirstPage)) {
            setCurPage(curPage - 1);
        }
    }, [settings.offsetFirstPage]);

    return (
        <Box ref={selfRef} onClick={clickControl}>
            <Box id="preload" sx={{ display: 'none' }}>
                {pages.map((page) => (
                    <img
                        ref={(e: HTMLImageElement) => {
                            pagesRef.current[page.index] = e;
                        }}
                        key={`${page.index}`}
                        src={page.src}
                        onLoad={handleImageLoad(page.index)}
                        alt={`${page.index}`}
                    />
                ))}
            </Box>
            <Box
                id="display"
                sx={{
                    display: 'flex',
                    flexDirection: settings.readerType === 'DoubleLTR' ? 'row' : 'row-reverse',
                    justifyContent: 'center',
                    margin: '0 auto',
                    width: 'auto',
                    height: 'auto',
                }}
            >
                {getPagesToDisplay() === 2 ? (
                    <DoublePage
                        key={curPage}
                        index={curPage}
                        image1src={pages[curPage].src}
                        image2src={pages[curPage + 1].src}
                        settings={settings}
                    />
                ) : (
                    <Page
                        key={curPage}
                        index={curPage}
                        src={pages[curPage].src}
                        onImageLoad={() => {}}
                        settings={settings}
                    />
                )}
            </Box>
        </Box>
    );
}
