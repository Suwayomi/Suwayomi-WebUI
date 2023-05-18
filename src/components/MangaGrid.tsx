/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Grid from '@mui/material/Grid';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import MangaCard from 'components/MangaCard';
import { GridLayout } from 'components/context/LibraryOptionsContext';
import { IMangaCard } from 'typings';

export interface IMangaGridProps {
    mangas: IMangaCard[];
    isLoading: boolean;
    message?: string;
    messageExtra?: JSX.Element;
    hasNextPage: boolean;
    lastPageNum: number;
    setLastPageNum: (lastPageNum: number) => void;
    gridLayout?: GridLayout;
    horizontal?: boolean | undefined;
    noFaces?: boolean | undefined;
    inLibraryIndicator?: boolean;
}

const MangaGrid: React.FC<IMangaGridProps> = (props) => {
    const {
        mangas,
        isLoading,
        message,
        messageExtra,
        hasNextPage,
        lastPageNum,
        setLastPageNum,
        gridLayout,
        horizontal,
        noFaces,
        inLibraryIndicator,
    } = props;
    let mapped;
    const lastManga = useRef<HTMLDivElement>(null);

    const scrollHandler = () => {
        if (lastManga.current) {
            const rect = lastManga.current.getBoundingClientRect();
            if ((rect.y + rect.height) / window.innerHeight < 2 && hasNextPage) {
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

    const [dimensions, setDimensions] = useState(1);

    const gridRef = useRef<HTMLDivElement>(null);

    const TestDimensions = () => {
        setDimensions(gridRef.current ? gridRef.current.offsetWidth : 0);
    };

    useLayoutEffect(TestDimensions, []);

    let movementTimer: NodeJS.Timeout;

    window.addEventListener('resize', () => {
        clearInterval(movementTimer);
        movementTimer = setTimeout(TestDimensions, 100);
    });

    if (mangas.length === 0) {
        if (isLoading) {
            mapped = <LoadingPlaceholder />;
        } else {
            mapped = noFaces ? (
                <Box
                    sx={{
                        margin: 'auto',
                    }}
                >
                    <Typography variant="h5">{message}</Typography>
                    {messageExtra}
                </Box>
            ) : (
                <EmptyView message={message!} messageExtra={messageExtra} />
            );
        }
    } else {
        mapped = mangas.map((it, idx) => (
            <MangaCard
                key={it.id}
                manga={it}
                ref={idx === mangas.length - 1 ? lastManga : undefined}
                gridLayout={gridLayout}
                dimensions={dimensions}
                inLibraryIndicator={inLibraryIndicator}
            />
        ));
    }

    return (
        <div ref={gridRef}>
            <Grid
                container
                spacing={1}
                style={
                    horizontal
                        ? {
                              margin: 0,
                              width: '100%',
                              padding: '5px',
                              overflowX: 'scroll',
                              display: '-webkit-inline-box',
                              flexWrap: 'nowrap',
                          }
                        : {
                              margin: 0,
                              width: '100%',
                              padding: '5px',
                          }
                }
            >
                {mapped}
            </Grid>
        </div>
    );
};

MangaGrid.defaultProps = {
    message: '',
    messageExtra: undefined,
};

export default MangaGrid;
