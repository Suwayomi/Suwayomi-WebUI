/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { Page } from '@/modules/reader/components/page/Page.tsx';
import { IReaderProps } from '@/modules/reader/Reader.types.ts';
import { Priority } from '@/lib/Queue.ts';

const isSpreadPage = (image: HTMLImageElement): boolean => {
    const aspectRatio = image.height / image.width;
    return aspectRatio < 1;
};

export function DoublePagedPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, curPage, nextChapter, prevChapter } = props;

    const selfRef = useRef<HTMLDivElement>(null);

    const pagesToDisplayStateRef = useRef<boolean[]>([]);

    const [pagesToSpreadState, setPagesToSpreadState] = useState(Array(pages.length).fill(false));
    const [pagesLoadState, setPagesLoadState] = useState<boolean[]>(Array(pages.length).fill(false));

    // each spread page has to be counted as 2 pages and all trailing page numbers have to be increased by the count
    // of leading spread pages
    const pageToActualPageIndex = useMemo(
        () => pagesToSpreadState.map((_, page) => page + pagesToSpreadState.slice(0, page).filter(Boolean).length),
        [pagesToSpreadState],
    );

    function nextPage() {
        const setNextPage = (page: number) => setCurPage(page === -1 ? pages.length - 1 : page);

        const isLastPageDisplayed = pagesToDisplayStateRef.current[pages.length - 1];
        if (isLastPageDisplayed && settings.loadNextOnEnding) {
            // make sure to set last page as current page so that the chapter gets marked as read before opening the next chapter
            const isLastPage = curPage === pages.length - 1;
            if (!isLastPage) {
                setNextPage(pages.length - 1);
            }

            nextChapter();
            return;
        }

        const page = pagesToDisplayStateRef.current.findIndex((displayed, index) => !displayed && index > curPage);
        setNextPage(page);
    }

    function prevPage() {
        const setPrevPage = (page: number) => setCurPage(Math.max(page, 0));

        const isFirstPageDisplayed = pagesToDisplayStateRef.current[0];
        if (isFirstPageDisplayed) {
            // not important, but for consistency make sure that first page gets set as current page in case it was displayed
            const isFirstPage = !curPage;
            if (!isFirstPage) {
                setPrevPage(0);
            }

            prevChapter();
            return;
        }

        const page = [...pagesToDisplayStateRef.current].slice(0, curPage).findLastIndex((displayed) => !displayed);
        setPrevPage(page);
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

    useEffect(() => {
        document.addEventListener('keydown', keyboardControl);

        return () => {
            document.removeEventListener('keydown', keyboardControl);
        };
    }, [selfRef, curPage, settings.readerType, prevChapter, nextChapter, pagesLoadState, pagesToSpreadState]);

    useEffect(() => {
        setCurPage(initialPage);
    }, [initialPage]);

    return (
        <Box ref={selfRef} onClick={clickControl}>
            <Box
                id="display"
                sx={{
                    display: 'flex',
                    flexDirection: settings.readerType === 'DoubleLTR' ? 'row' : 'row-reverse',
                    justifyContent: 'center',
                    width: 'auto',
                    height: 'auto',
                }}
            >
                {pages.map(({ index, src }) => {
                    /*

                    | = page separator
                    + = double page
                    _ = double spread

                    without double spreads:
                     without double spread offset: | 0 + 1 | 2 + 3 | 4 + 5 | 6 + 7 |   8   |
                     with double spread offset   : |   0   | 1 + 2 | 3 + 4 | 5 + 6 | 7 + 8 |

                    with double spreads
                      to handle double spreads:
                       each double spread has to count as 2 pages, thus, each page number after a double spread has to increase
                       by the number of leading double spreads

                     without double spread offset: | 0 + 1 |   2   | _3/4_ | 5 + 6 | 7 + 8 | _9/10_ | 11 + 12 | 13 + 14 |
                     with double spread offset   : |   0   | 1 + 2 | _3/4_ | 5 + 6 | 7 + 8 | _9/10_ | 11 + 12 | 13 + 14 |

                     thus, to get the second page:
                      without offset: second page = current page number even ? +1 : -1
                      with offset   : second page = current page number even ? +1 : -1

                      the second page has to be ignored in case:
                       - double spreads are offset, and the current page is the first page
                       - either the current or second page is a double spread
                     */

                    const normalizedCurPage = pageToActualPageIndex[curPage];
                    const isCurPageEven = !(normalizedCurPage % 2);

                    const secondPageOffset = (() => {
                        const invert = settings.offsetFirstPage ? -1 : 1;
                        const offset = isCurPageEven ? 1 : -1;

                        return offset * invert;
                    })();

                    const secondPage = curPage + secondPageOffset;

                    const isFirstPage = curPage === 0;
                    const isCurPage = index === curPage;
                    const isSecondPage = index === secondPage;

                    const isCurrentPageSpreadPage = pagesToSpreadState[curPage];
                    const isSecondPageSpreadPage = pagesToSpreadState[secondPage];
                    const hasSpreadPage = isCurrentPageSpreadPage || isSecondPageSpreadPage;

                    const ignoreSecondPageDueToOffset = isFirstPage && settings.offsetFirstPage;

                    const displaySecondPage = isSecondPage && !hasSpreadPage && !ignoreSecondPageDueToOffset;
                    const displayPage = isCurPage || displaySecondPage;

                    pagesToDisplayStateRef.current[index] = displayPage;

                    return (
                        <Page
                            key={src}
                            index={index}
                            src={src}
                            onImageLoad={() => {
                                const img = new Image();
                                img.onload = () => {
                                    setPagesLoadState((prevState) => prevState.toSpliced(index, 1, true));
                                    setPagesToSpreadState((prevState) =>
                                        prevState.toSpliced(index, 1, isSpreadPage(img)),
                                    );
                                };
                                img.src = src;
                            }}
                            settings={settings}
                            display={displayPage}
                            priority={displayPage ? Priority.HIGH : undefined}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}
