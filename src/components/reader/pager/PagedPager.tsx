/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Page from 'components/reader/Page';
import { IReaderProps } from 'typings';

export default function PagedReader(props: IReaderProps) {
    const { pages, settings, setCurPage, initialPage, curPage, nextChapter, prevChapter } = props;

    const selfRef = useRef<HTMLDivElement>(null);

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

    function clickControl(e: MouseEvent) {
        if (e.clientX > window.innerWidth / 2) {
            goRight();
        } else {
            goLeft();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', keyboardControl);
        selfRef.current?.addEventListener('click', clickControl);

        return () => {
            document.removeEventListener('keydown', keyboardControl);
            selfRef.current?.removeEventListener('click', clickControl);
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
                flexDirection: 'row',
                justifyContent: 'center',
                margin: '0 auto',
                width: '100%',
                height: '100vh',
            }}
        >
            <Page key={curPage} index={curPage} onImageLoad={() => {}} src={pages[curPage].src} settings={settings} />
        </Box>
    );
}
