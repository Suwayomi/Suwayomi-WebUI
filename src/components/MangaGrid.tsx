/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useRef } from 'react';
import Grid from '@mui/material/Grid';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import MangaCard from './MangaCard';

export interface IMangaGridProps{
    mangas: IMangaCard[]
    isLoading: boolean
    message?: string
    messageExtra?: JSX.Element
    hasNextPage: boolean
    lastPageNum: number
    setLastPageNum: (lastPageNum: number) => void
    gridLayout?: number | undefined
    horisontal?: boolean | undefined
    noFaces?: boolean | undefined
}

/* This is a React component that renders a grid of manga cards. */
export default function MangaGrid(props: IMangaGridProps) {
    const {
        mangas, isLoading, message, messageExtra,
        hasNextPage, lastPageNum, setLastPageNum, gridLayout, horisontal, noFaces,
    } = props;
    let mapped;
    const lastManga = useRef<HTMLDivElement>(null);

    /**
     * If the last manga in the list is within 2% of the bottom of the window, and there is a next
     * page, then load the next page
     */
    const scrollHandler = () => {
        if (lastManga.current) {
            const rect = lastManga.current.getBoundingClientRect();
            if (((rect.y + rect.height) / window.innerHeight < 2) && hasNextPage) {
                setLastPageNum(lastPageNum + 1);
            }
        }
    };
    useEffect(() => {
        window.addEventListener('scroll', scrollHandler, true);
        return () => {
            window.removeEventListener('scroll', scrollHandler, true);
        };
    }, [hasNextPage, mangas]);

    if (mangas.length === 0) {
        if (isLoading) {
            mapped = (
                <LoadingPlaceholder />
            );
        } else {
            mapped = noFaces ? (
                <Box
                    sx={{
                        margin: 'auto',
                    }}
                >
                    <Typography variant="h5">
                        {message}
                    </Typography>
                    {messageExtra}
                </Box>
            ) : (
                <EmptyView message={message!} messageExtra={messageExtra} />
            );
        }
    } else {
        mapped = mangas.map((it, idx) => {
            if (idx === mangas.length - 1) {
                return (
                    <MangaCard
                        key={it.id}
                        manga={it}
                        ref={lastManga}
                        gridLayout={gridLayout}
                    />
                );
            }
            return (
                <MangaCard
                    key={it.id}
                    manga={it}
                    gridLayout={gridLayout}
                />
            );
        });
    }

    return (
        <Grid
            container
            spacing={1}
            style={horisontal ? {
                margin: 0,
                width: '100%',
                padding: '5px',
                overflowX: 'scroll',
                display: '-webkit-inline-box',
                flexWrap: 'nowrap',
            } : {
                margin: 0,
                width: '100%',
                padding: '5px',
            }}
        >
            {mapped}
        </Grid>
    );
}

MangaGrid.defaultProps = {
    message: '',
    messageExtra: undefined,
};
