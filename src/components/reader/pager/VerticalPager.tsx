/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useCallback, useEffect, useRef } from 'react';
import { Box } from '@mui/system';
import Page from '../Page';

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
const SCROLL_OFFSET = 0.95;
const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth';

const isAtBottom = () => window.innerHeight + window.scrollY >= document.body.offsetHeight;
const isAtTop = () => window.scrollY <= 0;

export default function VerticalPager(props: IReaderProps) {
    const {
        pages, settings, setCurPage, initialPage, nextChapter, prevChapter,
    } = props;

    const currentPageRef = useRef(initialPage);
    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            if (!selfRef.current) return;

            // Update current page in parent
            const currentPage = findCurrentPageIndex(selfRef.current);
            if (currentPage !== currentPageRef.current) {
                currentPageRef.current = currentPage;
                setCurPage(currentPage);
            }

            // Go to next chapter if configured to and at bottom
            if (settings.loadNextonEnding) {
                if (isAtBottom()) {
                    nextChapter();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [settings.loadNextonEnding]);

    const go = useCallback((direction: 'up' | 'down') => {
        if (direction === 'down' && isAtBottom()) {
            nextChapter();
            return;
        }

        if (direction === 'up' && isAtTop()) {
            prevChapter();
            return;
        }

        window.scroll({
            top: window.scrollY + (window.innerHeight * SCROLL_OFFSET) * (direction === 'up' ? -1 : 1),
            behavior: SCROLL_BEHAVIOR,
        });
    }, [nextChapter, prevChapter]);

    useEffect(() => {
        const handleKeyboard = (e:KeyboardEvent) => {
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
            {
                pages.map((page) => (
                    <Page
                        key={page.index}
                        index={page.index}
                        src={page.src}
                        onImageLoad={() => {}}
                        settings={settings}
                        ref={(e:HTMLDivElement) => { pagesRef.current[page.index] = e; }}
                    />
                ))
            }
        </Box>
    );
}
