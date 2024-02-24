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
import { GridItemProps, GridStateSnapshot, VirtuosoGrid } from 'react-virtuoso';
import { useLocation, useNavigate } from 'react-router-dom';
import { EmptyView } from '@/components/util/EmptyView';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { MangaCard, MangaCardProps } from '@/components/MangaCard';
import { GridLayout } from '@/components/context/LibraryOptionsContext';
import { useLocalStorage } from '@/util/useLocalStorage';
import { TManga, TPartialManga } from '@/typings.ts';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab.tsx';

const GridContainer = React.forwardRef<HTMLDivElement, GridTypeMap['props']>(({ children, ...props }, ref) => (
    <Grid {...props} ref={ref} container sx={{ paddingLeft: '5px', paddingRight: '13px' }}>
        {children}
    </Grid>
));

const GridItemContainerWithDimension = (
    dimensions: number,
    itemWidth: number,
    gridLayout?: GridLayout,
    maxColumns: number = 12,
) => {
    const itemsPerRow = Math.ceil(dimensions / itemWidth);
    const columnsPerItem = gridLayout === GridLayout.List ? maxColumns : maxColumns / itemsPerRow;

    return ({ children, ...itemProps }: GridTypeMap['props'] & Partial<GridItemProps>) => (
        <Grid {...itemProps} item xs={columnsPerItem} sx={{ width: '100%', paddingTop: '8px', paddingLeft: '8px' }}>
            {children}
        </Grid>
    );
};

const createMangaCard = (
    manga: TPartialManga,
    gridLayout?: GridLayout,
    inLibraryIndicator?: boolean,
    isSelectModeActive: boolean = false,
    selectedMangaIds?: TManga['id'][],
    handleSelection?: DefaultGridProps['handleSelection'],
    mode?: MangaCardProps['mode'],
) => (
    <MangaCard
        key={manga.id}
        manga={manga}
        gridLayout={gridLayout}
        inLibraryIndicator={inLibraryIndicator}
        selected={isSelectModeActive ? selectedMangaIds?.includes(manga.id) : null}
        handleSelection={handleSelection}
        mode={mode}
    />
);

type DefaultGridProps = Pick<MangaCardProps, 'mode'> & {
    isLoading: boolean;
    mangas: TPartialManga[];
    inLibraryIndicator?: boolean;
    GridItemContainer: (props: GridTypeMap['props'] & Partial<GridItemProps>) => JSX.Element;
    gridLayout?: GridLayout;
    isSelectModeActive?: boolean;
    selectedMangaIds?: Required<TManga['id']>[];
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
};

const HorizontalGrid = ({
    isLoading,
    mangas,
    inLibraryIndicator,
    GridItemContainer,
    gridLayout,
    isSelectModeActive,
    selectedMangaIds,
    handleSelection,
    mode,
}: DefaultGridProps) => (
    <Grid
        container
        spacing={1}
        style={{
            margin: 0,
            width: '100%',
            padding: '5px',
            overflowX: 'auto',
            display: '-webkit-inline-box',
            flexWrap: 'nowrap',
        }}
    >
        {isLoading ? (
            <LoadingPlaceholder />
        ) : (
            mangas.map((manga) => (
                <GridItemContainer key={manga.id}>
                    {createMangaCard(
                        manga,
                        gridLayout,
                        inLibraryIndicator,
                        isSelectModeActive,
                        selectedMangaIds,
                        handleSelection,
                        mode,
                    )}
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
    loadMore,
    isSelectModeActive,
    selectedMangaIds,
    handleSelection,
    mode,
}: DefaultGridProps & {
    hasNextPage: boolean;
    loadMore: () => void;
}) => {
    const location = useLocation<{ snapshot?: GridStateSnapshot }>();
    const navigate = useNavigate();
    const { snapshot } = location.state ?? {};

    const persistGridStateTimeout = useRef<NodeJS.Timeout | undefined>();
    const persistGridState = (gridState: GridStateSnapshot) => {
        const currentUrl = window.location.href;

        clearTimeout(persistGridStateTimeout.current);
        persistGridStateTimeout.current = setTimeout(() => {
            const didLocationChange = currentUrl !== window.location.href;
            if (didLocationChange) {
                return;
            }

            navigate(
                { pathname: '', search: location.search },
                { replace: true, state: { ...location.state, snapshot: gridState } },
            );
        }, 250);
    };
    useEffect(() => clearTimeout(persistGridStateTimeout.current), [location.key, persistGridStateTimeout.current]);

    return (
        <>
            <VirtuosoGrid
                useWindowScroll
                overscan={window.innerHeight * 0.25}
                totalCount={mangas.length}
                components={{
                    List: GridContainer,
                    Item: GridItemContainer,
                }}
                restoreStateFrom={snapshot}
                stateChanged={persistGridState}
                endReached={() => loadMore()}
                itemContent={(index) =>
                    createMangaCard(
                        mangas[index],
                        gridLayout,
                        inLibraryIndicator,
                        isSelectModeActive,
                        selectedMangaIds,
                        handleSelection,
                        mode,
                    )
                }
            />
            {/* render div to prevent UI jumping around when showing/hiding loading placeholder */
            /* eslint-disable-next-line no-nested-ternary */}
            {isSelectModeActive && gridLayout === GridLayout.List ? (
                <Box sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }} />
            ) : // eslint-disable-next-line no-nested-ternary
            isLoading ? (
                <LoadingPlaceholder />
            ) : hasNextPage ? (
                <div style={{ height: '75px' }} />
            ) : null}
        </>
    );
};

export interface IMangaGridProps extends Omit<DefaultGridProps, 'GridItemContainer'> {
    message?: string;
    messageExtra?: JSX.Element;
    hasNextPage: boolean;
    loadMore: () => void;
    horizontal?: boolean | undefined;
    noFaces?: boolean | undefined;
}

export const MangaGrid: React.FC<IMangaGridProps> = (props) => {
    const {
        mangas,
        isLoading,
        message,
        messageExtra,
        hasNextPage,
        loadMore,
        gridLayout,
        horizontal,
        noFaces,
        inLibraryIndicator,
        isSelectModeActive,
        selectedMangaIds,
        handleSelection,
        mode,
    } = props;

    const [dimensions, setDimensions] = useState(document.documentElement.offsetWidth);
    const [gridItemWidth] = useLocalStorage<number>('ItemWidth', 300);
    const gridRef = useRef<HTMLDivElement>(null);
    const GridItemContainer = useMemo(
        () => GridItemContainerWithDimension(dimensions, gridItemWidth, gridLayout),
        [dimensions, gridItemWidth, gridLayout],
    );

    const updateGridWidth = () => {
        const getDimensions = () => {
            const gridWidth = gridRef.current?.offsetWidth;

            if (!gridWidth) {
                return document.documentElement.offsetWidth;
            }

            return gridWidth;
        };

        setDimensions(getDimensions());
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
                    isSelectModeActive={isSelectModeActive}
                    selectedMangaIds={selectedMangaIds}
                    handleSelection={handleSelection}
                    mode={mode}
                />
            ) : (
                <VerticalGrid
                    isLoading={isLoading}
                    mangas={mangas}
                    inLibraryIndicator={inLibraryIndicator}
                    GridItemContainer={GridItemContainer}
                    hasNextPage={hasNextPage}
                    loadMore={loadMore}
                    gridLayout={gridLayout}
                    isSelectModeActive={isSelectModeActive}
                    selectedMangaIds={selectedMangaIds}
                    handleSelection={handleSelection}
                    mode={mode}
                />
            )}
        </div>
    );
};

MangaGrid.defaultProps = {
    message: '',
    messageExtra: undefined,
};
