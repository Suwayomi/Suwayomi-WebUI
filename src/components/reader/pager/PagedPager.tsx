/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MouseEvent, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { IReaderProps } from '@/typings';
import { Page } from '@/components/reader/Page';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export function PagedPager(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, curPage, nextChapter, prevChapter, chapter } = props;

    const selfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const imageRequests = pages.map((page) => {
            const imageRequest = requestManager.requestImage(page.src);
            imageRequest.response.catch(() => {});
            return imageRequest;
        });

        return () => {
            imageRequests.forEach((imageRequest) =>
                imageRequest.abortRequest(new Error(`PagedPager::preload: chapter changed`)),
            );
        };
    }, [chapter.id]);

    const changePage = (newPage: number) => {
        setCurPage(newPage);
        window.scroll({ top: 0 });
    };

    function nextPage() {
        if (curPage < pages.length - 1) {
            changePage(curPage + 1);
        } else if (settings.loadNextOnEnding) {
            nextChapter();
        }
    }

    function prevPage() {
        if (curPage > 0) {
            changePage(curPage - 1);
        } else {
            prevChapter();
        }
    }

    function goLeft() {
        if (settings.readerType === 'SingleLTR') {
            prevPage();
        } else if (settings.readerType === 'SingleRTL') {
            nextPage();
        }
    }

    function goRight() {
        if (settings.readerType === 'SingleLTR') {
            nextPage();
        } else if (settings.readerType === 'SingleRTL') {
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
    }, [selfRef, curPage, settings.readerType, prevChapter, nextChapter]);

    useEffect(() => {
        // Delay scrolling to next cycle
        setTimeout(() => {
            // scroll last read page into view when initialPage changes
            changePage(initialPage);
        }, 0);
    }, [initialPage]);

    return (
        <Box
            ref={selfRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                width: 'auto',
                height: 'auto',
            }}
            onClick={clickControl}
        >
            <Page key={curPage} index={curPage} onImageLoad={() => {}} src={pages[curPage].src} settings={settings} />
        </Box>
    );
}
