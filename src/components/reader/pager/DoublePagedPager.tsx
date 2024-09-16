/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { IReaderProps } from '@/typings';
import { Page } from '@/components/reader/Page';
import { requestManager } from '@/lib/requests/RequestManager.ts';

const isSpreadPage = (image: HTMLImageElement): boolean => {
    const aspectRatio = image.height / image.width;
    return aspectRatio < 1;
};

export function DoublePagedPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, curPage, chapter, nextChapter, prevChapter } = props;

    const selfRef = useRef<HTMLDivElement>(null);

    const pagesToDisplayStateRef = useRef<boolean[]>([]);
    const pageToPrevSpreadPageRef = useRef<number[]>([]);

    const [pagesToSpreadState, setPagesToSpreadState] = useState(Array(pages.length).fill(false));
    const [pagesLoadState, setPagesLoadState] = useState<boolean[]>(Array(pages.length).fill(false));

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

    useEffect(() => {
        const imageRequests: [number, ReturnType<(typeof requestManager)['requestImage']>][] = pages.map((page) => [
            page.index,
            requestManager.requestImage(page.src),
        ]);

        imageRequests.forEach(async ([index, imageRequest]) => {
            try {
                const imageUrl = await imageRequest.response;
                const img = new Image();
                img.onload = () => {
                    URL.revokeObjectURL(imageUrl);

                    setPagesLoadState((prevState) => prevState.toSpliced(index, 1, true));
                    setPagesToSpreadState((prevState) => prevState.toSpliced(index, 1, isSpreadPage(img)));
                };
                img.src = imageUrl;
            } catch (e) {
                // ignore
            }
        });

        return () => {
            imageRequests.forEach(([index, imageRequest]) =>
                imageRequest.abortRequest(new Error(`DoublePagedPager::preload(${index}): chapter changed`)),
            );
        };
    }, [chapter.id]);

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
                    const prevSpreadPage = (() => {
                        let currentIndexOfPrevSpreadPage = pageToPrevSpreadPageRef.current[curPage];

                        if (currentIndexOfPrevSpreadPage === undefined) {
                            currentIndexOfPrevSpreadPage = Math.max(pagesToSpreadState.lastIndexOf(true, curPage), 0);

                            const areAllPrevPagesLoaded = pagesLoadState.slice(0, curPage).every(Boolean);
                            if (areAllPrevPagesLoaded) {
                                pageToPrevSpreadPageRef.current[curPage] = currentIndexOfPrevSpreadPage;
                            }
                        }

                        return currentIndexOfPrevSpreadPage > 0
                            ? currentIndexOfPrevSpreadPage + 1
                            : currentIndexOfPrevSpreadPage;
                    })();

                    // index of first page after a spread page will be 0
                    const normalizedCurPageIndexForSpreadPages = curPage - prevSpreadPage;

                    const isFirstPage = curPage === 0;
                    // only offset pages before the first spread page, after the first spread page handle as if "offsetFirstPage" is disabled
                    const firstPageOffset =
                        Number(settings.offsetFirstPage) +
                        Number(settings.offsetFirstPage && !normalizedCurPageIndexForSpreadPages && !isFirstPage);

                    const normalizedCurPageIndex = normalizedCurPageIndexForSpreadPages - firstPageOffset;

                    const isCurPageEven = !(normalizedCurPageIndex % 2);
                    const secondPage = curPage + (isCurPageEven ? 1 : -1);

                    const isCurPage = index === curPage;
                    const isSecondPage = index === secondPage;

                    const isCurrentPageSpreadPage = pagesToSpreadState[curPage];
                    const isSecondPageSpreadPage = pagesToSpreadState[secondPage];
                    const hasSpreadPage = isCurrentPageSpreadPage || isSecondPageSpreadPage;

                    const displaySecondPage = isSecondPage && !hasSpreadPage;
                    const displayPage = isCurPage || displaySecondPage;

                    pagesToDisplayStateRef.current[index] = displayPage;

                    return (
                        <Page
                            key={src}
                            index={index}
                            src={src}
                            onImageLoad={() => {}}
                            settings={settings}
                            display={displayPage}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}
