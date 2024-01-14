/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent as ReactMouseEvent, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { IReaderProps } from '@/typings';
import { Page } from '@/components/reader/Page';

const findCurrentPageIndex = (wrapper: HTMLDivElement): number => {
    for (let i = 0; i < wrapper.children.length; i++) {
        const child = wrapper.children.item(i);
        if (child) {
            const { left, right } = child.getBoundingClientRect();
            if (left <= window.innerWidth / 2 && right > window.innerWidth / 2) return i;
        }
    }
    return -1;
};

const SCROLL_SAFE_ZONE = 5; // px
const isAtEnd = () => {
    const visibleEnd = window.innerWidth + window.scrollX;
    // SCROLL_SAFE_ZONE is here for special cases when window might be .5px shorter
    // and math just dont add up correctly
    return visibleEnd >= document.body.scrollWidth - SCROLL_SAFE_ZONE;
};
const isAtStart = () => window.scrollX <= 0;

export function HorizontalPager(props: IReaderProps) {
    const { pages, curPage, initialPage, settings, setCurPage, prevChapter, nextChapter } = props;

    const currentPageRef = useRef(initialPage);
    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    function nextPage() {
        if (curPage < pages.length - 1) {
            pagesRef.current[curPage + 1]?.scrollIntoView({ inline: 'center' });
            setCurPage((page) => page + 1);
        } else if (settings.loadNextOnEnding) {
            nextChapter();
        }
    }

    function prevPage() {
        if (curPage > 0) {
            pagesRef.current[curPage - 1]?.scrollIntoView({ inline: 'center' });
            setCurPage(curPage - 1);
        } else if (curPage === 0) {
            prevChapter();
        }
    }

    function goLeft() {
        if (settings.readerType === 'ContinuesHorizontalLTR') {
            prevPage();
        } else {
            nextPage();
        }
    }

    function goRight() {
        if (settings.readerType === 'ContinuesHorizontalLTR') {
            nextPage();
        } else {
            prevPage();
        }
    }

    const mouseXPos = useRef<number>(0);

    function dragScreen(e: MouseEvent) {
        window.scrollBy(mouseXPos.current - e.pageX, 0);
    }

    function dragControl(e: MouseEvent) {
        mouseXPos.current = e.pageX;
        selfRef.current?.addEventListener('mousemove', dragScreen);
    }

    function removeDragControl() {
        selfRef.current?.removeEventListener('mousemove', dragScreen);
    }

    function clickControl(e: ReactMouseEvent) {
        if (e.clientX >= window.innerWidth * 0.85) {
            goRight();
        } else if (e.clientX <= window.innerWidth * 0.15) {
            goLeft();
        }
    }

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
        // Delay scrolling to next cycle
        setTimeout(() => {
            // scroll last read page into view when initialPage changes
            pagesRef.current[initialPage]?.scrollIntoView({ inline: 'center' });
        }, 0);
    }, [initialPage]);

    useEffect(() => {
        selfRef.current?.addEventListener('mousedown', dragControl);
        selfRef.current?.addEventListener('mouseup', removeDragControl);

        return () => {
            selfRef.current?.removeEventListener('mousedown', dragControl);
            selfRef.current?.removeEventListener('mouseup', removeDragControl);
        };
    }, [selfRef]);

    useEffect(() => {
        if (settings.loadNextOnEnding) {
            document.addEventListener('scroll', handleLoadNextonEnding);
        }

        return () => {
            document.removeEventListener('scroll', handleLoadNextonEnding);
        };
    }, [selfRef, curPage, prevChapter, nextChapter]);

    useEffect(() => {
        const handleScroll = () => {
            if (!selfRef.current) return;

            // Update current page in parent
            const currentPage = findCurrentPageIndex(selfRef.current);
            if (currentPage !== currentPageRef.current) {
                currentPageRef.current = currentPage;
                setCurPage(currentPage);
            }

            // Special case if scroll is moved all the way to the edge
            // This handles cases when last page is show, but is smaller then
            // window, in which case it would never get marked as read.
            // See https://github.com/Suwayomi/Suwayomi-WebUI/issues/14 for more info
            if (settings.readerType === 'ContinuesHorizontalLTR' ? isAtEnd() : isAtStart()) {
                currentPageRef.current = pages.length - 1;
                setCurPage(currentPageRef.current);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [settings.readerType]);

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: settings.readerType === 'ContinuesHorizontalLTR' ? 'row' : 'row-reverse',
                justifyContent: settings.readerType === 'ContinuesHorizontalLTR' ? 'flex-start' : 'flex-end',
                margin: '0 auto',
                width: 'auto',
                height: 'auto',
                overflowX: 'visible',
                userSelect: 'none',
            }}
            onClick={clickControl}
        >
            {pages.map((page) => (
                <Page
                    key={page.index}
                    index={page.index}
                    src={page.src}
                    onImageLoad={() => {}}
                    settings={settings}
                    ref={(e: HTMLDivElement) => {
                        pagesRef.current[page.index] = e;
                    }}
                />
            ))}
        </Box>
    );
}
