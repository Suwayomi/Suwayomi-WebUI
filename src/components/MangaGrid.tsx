/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Grid, { GridTypeMap } from '@mui/material/Grid';
import { Box, Typography } from '@mui/material';
import { GridItemProps, VirtuosoGrid, VirtuosoGridHandle } from 'react-virtuoso';
import { useNavigate, useLocation } from 'react-router-dom';
import { IMangaCard } from '@/typings';
import EmptyView from '@/components/util/EmptyView';
import LoadingPlaceholder from '@/components/util/LoadingPlaceholder';
import MangaCard from '@/components/MangaCard';
import { GridLayout } from '@/components/context/LibraryOptionsContext';
import useLocalStorage from '@/util/useLocalStorage';

const GridContainer = React.forwardRef<HTMLDivElement, GridTypeMap['props']>(({ children, ...props }, ref) => (
    <Grid {...props} ref={ref} container sx={{ paddingLeft: '5px', paddingRight: '13px' }}>
        {children}
    </Grid>
));

const GridItemContainerWithDimension =
    (dimensions: number, itemWidth: number, gridLayout?: GridLayout, maxColumns: number = 12) =>
    ({ children, ...itemProps }: GridTypeMap['props'] & Partial<GridItemProps>) => {
        const itemsPerRow = Math.ceil(dimensions / itemWidth);
        const columnsPerItem = gridLayout === GridLayout.List ? maxColumns : maxColumns / itemsPerRow;

        return (
            <Grid {...itemProps} item xs={columnsPerItem} sx={{ paddingTop: '8px', paddingLeft: '8px' }}>
                {children}
            </Grid>
        );
    };

const createMangaCard = (manga: IMangaCard, gridLayout?: GridLayout, inLibraryIndicator?: boolean) => (
    <MangaCard key={manga.id} manga={manga} gridLayout={gridLayout} inLibraryIndicator={inLibraryIndicator} />
);

type DefaultGridProps = {
    isLoading: boolean;
    mangas: IMangaCard[];
    inLibraryIndicator?: boolean;
    GridItemContainer: (props: GridTypeMap['props'] & Partial<GridItemProps>) => JSX.Element;
    gridLayout?: GridLayout;
};

const HorizontalGrid = ({ isLoading, mangas, inLibraryIndicator, GridItemContainer, gridLayout }: DefaultGridProps) => (
    <Grid
        container
        spacing={1}
        style={{
            margin: 0,
            width: '100%',
            padding: '5px',
            overflowX: 'scroll',
            display: '-webkit-inline-box',
            flexWrap: 'nowrap',
        }}
    >
        {isLoading ? (
            <LoadingPlaceholder />
        ) : (
            mangas.map((manga) => (
                <GridItemContainer key={manga.id}>
                    {createMangaCard(manga, gridLayout, inLibraryIndicator)}
                </GridItemContainer>
            ))
        )}
    </Grid>
);

const VerticalGrid = ({
    isLoading,
    mangas,
    inLibraryIndicator,
    GridItemContainer,
    gridLayout,
    hasNextPage,
    setLastPageNum,
    lastPageNum,
}: DefaultGridProps & {
    hasNextPage: boolean;
    setLastPageNum: (page: number) => void;
    lastPageNum: number;
}) => {
    const [restoredScrollPosition, setRestoredScrollPosition] = useState(mangas.length === 0);
    const location = useLocation<{ lastScrollPosition?: number }>();
    const navigate = useNavigate();
    const virtuoso = useRef<VirtuosoGridHandle>(null);

    const { lastScrollPosition = 0 } = location.state ?? {};

    useEffect(() => {
        const updateLastScrollPosition = () => {
            if (!restoredScrollPosition) {
                return;
            }

            navigate(
                { pathname: '', search: location.search },
                { replace: true, state: { ...location.state, lastScrollPosition: window.scrollY } },
            );
        };

        window.addEventListener('scroll', updateLastScrollPosition, true);
        window.addEventListener('resize', updateLastScrollPosition, true);

        return () => {
            window.removeEventListener('scroll', updateLastScrollPosition, true);
            window.removeEventListener('resize', updateLastScrollPosition, true);
        };
    }, [restoredScrollPosition, location.state, location.search]);

    useEffect(() => {
        const haveItemsRendered = document.documentElement.offsetHeight >= lastScrollPosition;
        const restoreScrollPosition = !restoredScrollPosition && haveItemsRendered && virtuoso.current;
        if (!restoreScrollPosition) {
            return;
        }

        virtuoso.current.scrollTo({ top: lastScrollPosition });
        setRestoredScrollPosition(true);
    }, [document.documentElement.offsetHeight, virtuoso.current]);

    return (
        <>
            <VirtuosoGrid
                ref={virtuoso}
                useWindowScroll
                overscan={window.innerHeight * 0.25}
                totalCount={mangas.length}
                components={{
                    List: GridContainer,
                    Item: GridItemContainer,
                }}
                endReached={() => {
                    if (!hasNextPage) {
                        return;
                    }

                    setLastPageNum(lastPageNum + 1);
                }}
                itemContent={(index) => createMangaCard(mangas[index], gridLayout, inLibraryIndicator)}
            />
            {/* render div to prevent UI jumping around when showing/hiding loading placeholder */
            /* eslint-disable-next-line no-nested-ternary */}
            {isLoading ? <LoadingPlaceholder /> : hasNextPage ? <div style={{ height: '75px' }} /> : null}
        </>
    );
};

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

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [gridItemWidth] = useLocalStorage<number>('ItemWidth', 300);
    const gridRef = useRef<HTMLDivElement>(null);
    const GridItemContainer = useMemo(
        () => GridItemContainerWithDimension(dimensions.width, gridItemWidth, gridLayout),
        [dimensions, gridItemWidth, gridLayout],
    );

    const updateGridWidth = () => {
        setDimensions({
            width: gridRef.current?.offsetWidth ?? 0,
            height: gridRef.current?.offsetHeight ?? 0,
        });
    };

    useLayoutEffect(updateGridWidth, []);

    useEffect(() => {
        let movementTimer: NodeJS.Timeout;

        const onResize = () => {
            clearInterval(movementTimer);
            movementTimer = setTimeout(updateGridWidth, 100);
        };

        window.addEventListener('resize', onResize);

        return () => window.removeEventListener('resize', onResize);
    }, []);

    const hasNoItems = !isLoading && mangas.length === 0;
    if (hasNoItems) {
        if (noFaces) {
            return (
                <Box
                    sx={{
                        margin: 'auto',
                    }}
                >
                    <Typography variant="h5">{message}</Typography>
                    {messageExtra}
                </Box>
            );
        }

        return <EmptyView message={message!} messageExtra={messageExtra} />;
    }

    return (
        <div
            ref={gridRef}
            style={{
                overflow: 'hidden',
                paddingBottom: '13px',
            }}
        >
            {horizontal ? (
                <HorizontalGrid
                    isLoading={isLoading}
                    mangas={mangas}
                    inLibraryIndicator={inLibraryIndicator}
                    GridItemContainer={GridItemContainer}
                    gridLayout={gridLayout}
                />
            ) : (
                <VerticalGrid
                    isLoading={isLoading}
                    mangas={mangas}
                    GridItemContainer={GridItemContainer}
                    hasNextPage={hasNextPage}
                    setLastPageNum={setLastPageNum}
                    lastPageNum={lastPageNum}
                    gridLayout={gridLayout}
                />
            )}
        </div>
    );
};

MangaGrid.defaultProps = {
    message: '',
    messageExtra: undefined,
};

export default MangaGrid;
