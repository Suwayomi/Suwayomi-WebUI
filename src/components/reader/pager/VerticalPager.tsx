/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/system';
import Page from 'components/reader/Page';
import { IReaderProps } from 'typings';

const findCurrentPageIndex = (wrapper: HTMLDivElement): number => {
    for (let i = 0; i < wrapper.children.length; i++) {
        const child = wrapper.children.item(i);
        if (child) {
            const { top, bottom } = child.getBoundingClientRect();
            if (top <= window.innerHeight && bottom > 1) return i;
        }
    }
    return -1;
};

// TODO: make configurable?
const SCROLL_SAFE_ZONE = 5; // px
const SCROLL_OFFSET = 0.95;
const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth';

const isAtBottom = () => {
    const visibleBottom = window.innerHeight + window.scrollY;
    // SCROLL_SAFE_ZONE is here for special cases when window might be .5px shorter
    // and math just dont add up correctly
    return visibleBottom >= document.body.offsetHeight - SCROLL_SAFE_ZONE;
};
const isAtTop = () => window.scrollY <= 0;

export default function VerticalPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, nextChapter, prevChapter } = props;

    const currentPageRef = useRef(initialPage);
    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            if (!selfRef.current) return;

            if (isAtBottom()) {
                // If scroll is moved all the way to the bottom
                // This handles cases when last page is show, but is smaller then
                // window, in which case it would never get marked as read.
                // See https://github.com/Suwayomi/Tachidesk-WebUI/issues/14 for more info
                currentPageRef.current = pages.length - 1;
                setCurPage(currentPageRef.current);

                // Go to next chapter if configured to and at bottom
                if (settings.loadNextOnEnding) {
                    nextChapter();
                }
            } else {
                // Update current page in parent
                const currentPage = findCurrentPageIndex(selfRef.current);
                if (currentPage !== currentPageRef.current) {
                    currentPageRef.current = currentPage;
                    setCurPage(currentPage);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [settings.loadNextOnEnding, nextChapter]);

    const go = useCallback(
        (direction: 'up' | 'down') => {
            if (direction === 'down' && isAtBottom()) {
                nextChapter();
                return;
            }

            if (direction === 'up' && isAtTop()) {
                prevChapter();
                return;
            }

            window.scroll({
                top: window.scrollY + window.innerHeight * SCROLL_OFFSET * (direction === 'up' ? -1 : 1),
                behavior: SCROLL_BEHAVIOR,
            });
        },
        [nextChapter, prevChapter],
    );

    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            switch (e.code) {
                case 'Space':
                case 'ArrowRight':
                    e.preventDefault();
                    go('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    go('up');
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyboard, false);
        return () => {
            document.removeEventListener('keydown', handleKeyboard);
        };
    }, []);

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
            onClick={(e) => go(e.clientX > window.innerWidth / 2 ? 'down' : 'up')}
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
