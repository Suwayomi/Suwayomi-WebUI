/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import { Page } from '@/modules/reader/components/page/Page.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { IReaderProps } from '@/modules/reader/Reader.types.ts';

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
const SCROLL_OFFSET_SLIGHT = 0.25;
const SCROLL_BEHAVIOR: ScrollBehavior = 'smooth';

const isAtBottom = () => {
    const visibleBottom = window.innerHeight + window.scrollY;
    // SCROLL_SAFE_ZONE is here for special cases when window might be .5px shorter
    // and math just dont add up correctly
    return visibleBottom >= document.body.offsetHeight - SCROLL_SAFE_ZONE;
};
const isAtTop = () => window.scrollY <= 0;

export function VerticalPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, nextChapter, prevChapter } = props;

    const currentPageRef = useRef(initialPage);
    const selfRef = useRef<HTMLDivElement>(null);
    const pagesRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        let handlingEndOfPage = false;
        const handleScroll = () => {
            if (!selfRef.current) return;

            if (isAtBottom()) {
                if (handlingEndOfPage) {
                    return;
                }

                handlingEndOfPage = true;

                // If scroll is moved all the way to the bottom
                // This handles cases when last page is show, but is smaller then
                // window, in which case it would never get marked as read.
                // See https://github.com/Suwayomi/Suwayomi-WebUI/issues/14 for more info
                currentPageRef.current = pages.length - 1;
                setCurPage(currentPageRef.current);

                // Go to next chapter if configured to and at bottom
                if (settings.loadNextOnEnding) {
                    nextChapter();
                }
            } else {
                handlingEndOfPage = false;

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

    const mouseYPos = useRef<number>(0);
    const didMouseMove = useRef(false);

    function dragScreen(e: MouseEvent) {
        didMouseMove.current = true;
        window.scrollBy(0, mouseYPos.current - e.pageY);
    }

    function dragControl(e: MouseEvent) {
        mouseYPos.current = e.pageY;
        selfRef.current?.addEventListener('mousemove', dragScreen);
    }

    function removeDragControl() {
        selfRef.current?.removeEventListener('mousemove', dragScreen);
    }

    useEffect(() => {
        selfRef.current?.addEventListener('mousedown', dragControl);
        selfRef.current?.addEventListener('mouseup', removeDragControl);

        return () => {
            selfRef.current?.removeEventListener('mousedown', dragControl);
            selfRef.current?.removeEventListener('mouseup', removeDragControl);
        };
    }, [selfRef]);

    const go = useCallback(
        (direction: 'up' | 'down', offset: number = SCROLL_OFFSET) => {
            if (direction === 'down' && isAtBottom()) {
                nextChapter();
                return;
            }

            if (direction === 'up' && isAtTop()) {
                prevChapter();
                return;
            }

            window.scroll({
                top: window.scrollY + window.innerHeight * offset * (direction === 'up' ? -1 : 1),
                behavior: SCROLL_BEHAVIOR,
            });
        },
        [nextChapter, prevChapter],
    );

    useEffect(() => {
        const handleKeyboard = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Space':
                    e.preventDefault();
                    go(e.shiftKey ? 'up' : 'down');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    go(e.shiftKey ? 'up' : 'down', SCROLL_OFFSET_SLIGHT);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    go(e.shiftKey ? 'up' : 'down');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    go(e.shiftKey ? 'down' : 'up', SCROLL_OFFSET_SLIGHT);
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    go(e.shiftKey ? 'down' : 'up');
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyboard, false);
        return () => {
            document.removeEventListener('keydown', handleKeyboard);
        };
    }, [go]);

    useResizeObserver(
        pagesRef.current[initialPage],
        useCallback(
            (_, resizeObserver) => {
                const initialPageElement = pagesRef.current[initialPage];
                if (!initialPageElement?.offsetHeight) {
                    return;
                }

                initialPageElement.scrollIntoView();
                resizeObserver.disconnect();
            },
            [pagesRef.current[initialPage], initialPage],
        ),
    );

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 'auto',
                height: 'auto',
                userSelect: 'none',
            }}
            onClick={(e) => {
                if (didMouseMove.current) {
                    didMouseMove.current = false;
                    return;
                }

                go(e.clientX > window.innerWidth / 2 ? 'down' : 'up');
            }}
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
