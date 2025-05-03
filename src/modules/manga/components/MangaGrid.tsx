/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, {
    ForwardedRef,
    forwardRef,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type JSX,
} from 'react';
import Grid, { GridTypeMap } from '@mui/material/Grid';
import Box, { BoxProps } from '@mui/material/Box';
import { GridItemProps, GridStateSnapshot, VirtuosoGrid } from 'react-virtuoso';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { MangaCard } from '@/modules/manga/components/cards/MangaCard.tsx';
import { useLocalStorage, useSessionStorage } from '@/modules/core/hooks/useStorage.tsx';
import { SelectableCollectionReturnType } from '@/modules/collection/hooks/useSelectableCollection.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/modules/core/components/buttons/StyledFab.tsx';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { MangaCardProps } from '@/modules/manga/Manga.types.ts';
import { MangaType } from '@/lib/graphql/generated/graphql.ts';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { GridLayout } from '@/modules/core/Core.types.ts';

const GridContainer = React.forwardRef<HTMLDivElement, GridTypeMap['props']>(({ children, ...props }, ref) => (
    <Grid {...props} ref={ref} container spacing={1}>
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

    // MUI GridProps and Virtuoso GridItemProps use different types for the "ref" prop which conflict with each other
    return ({ children, ...itemProps }: GridTypeMap['props'] & Omit<Partial<GridItemProps>, 'ref'>) => (
        <Grid {...itemProps} size={columnsPerItem}>
            {children}
        </Grid>
    );
};

type TManga = MangaCardProps['manga'];

const createMangaCard = (
    manga: TManga,
    gridLayout?: GridLayout,
    inLibraryIndicator?: boolean,
    isSelectModeActive: boolean = false,
    selectedMangaIds?: MangaType['id'][],
    handleSelection?: DefaultGridProps['handleSelection'],
    mode?: MangaCardProps['mode'],
) => (
    <MangaCard
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
    mangas: TManga[];
    inLibraryIndicator?: boolean;
    GridItemContainer: (props: GridTypeMap['props'] & Partial<GridItemProps>) => JSX.Element;
    gridLayout?: GridLayout;
    isSelectModeActive?: boolean;
    selectedMangaIds?: Required<MangaType['id']>[];
    handleSelection?: SelectableCollectionReturnType<MangaType['id']>['handleSelection'];
};

const HorizontalGrid = forwardRef(
    (
        {
            isLoading,
            mangas,
            inLibraryIndicator,
            GridItemContainer,
            gridLayout,
            isSelectModeActive,
            selectedMangaIds,
            handleSelection,
            mode,
        }: DefaultGridProps,
        ref: ForwardedRef<HTMLDivElement | null>,
    ) => (
        <Grid
            ref={ref}
            container
            spacing={1}
            sx={{
                width: '100%',
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
    ),
);

export const getGridSnapshotKey = (location: ReturnType<typeof useLocation>) =>
    `MangaGrid-snapshot-location-${location.key}`;

const VerticalGrid = forwardRef(
    (
        {
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
        },
        ref: ForwardedRef<HTMLDivElement | null>,
    ) => {
        const location = useLocation<{ snapshot?: GridStateSnapshot }>();

        const snapshotSessionKey = getGridSnapshotKey(location);
        const [snapshot] = useSessionStorage<GridStateSnapshot | undefined>(snapshotSessionKey, undefined);

        const persistGridStateTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
        const persistGridState = (gridState: GridStateSnapshot) => {
            const currentUrl = window.location.href;

            clearTimeout(persistGridStateTimeout.current);
            persistGridStateTimeout.current = setTimeout(() => {
                const didLocationChange = currentUrl !== window.location.href;
                if (didLocationChange) {
                    return;
                }

                AppStorage.session.setItem(snapshotSessionKey, gridState, false);
            }, 250);
        };
        useEffect(() => clearTimeout(persistGridStateTimeout.current), [location.key, persistGridStateTimeout.current]);

        return (
            <>
                <Box ref={ref}>
                    <VirtuosoGrid
                        useWindowScroll
                        increaseViewportBy={window.innerHeight * 0.5}
                        totalCount={mangas.length}
                        components={{
                            List: GridContainer,
                            Item: GridItemContainer,
                        }}
                        restoreStateFrom={snapshot}
                        stateChanged={persistGridState}
                        endReached={() => loadMore()}
                        computeItemKey={(index) => mangas[index].id}
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
                </Box>
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
    },
);

export interface IMangaGridProps
    extends Omit<DefaultGridProps, 'GridItemContainer'>,
        Partial<React.ComponentProps<typeof EmptyViewAbsoluteCentered>> {
    hasNextPage: boolean;
    loadMore: () => void;
    horizontal?: boolean | undefined;
    noFaces?: boolean | undefined;
    gridWrapperProps?: Omit<BoxProps, 'ref'>;
}

export const MangaGrid: React.FC<IMangaGridProps> = ({
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
    retry,
    gridWrapperProps,
}) => {
    const { t } = useTranslation();

    const { navBarWidth } = useNavBarContext();

    const gridRef = useRef<HTMLDivElement>(null);
    const gridWrapperRef = useRef<HTMLDivElement>(null);

    const [dimensions, setDimensions] = useState(
        gridWrapperRef.current?.offsetWidth ?? Math.max(0, document.documentElement.offsetWidth - navBarWidth),
    );
    const [gridItemWidth] = useLocalStorage<number>('ItemWidth', 300);
    const GridItemContainer = useMemo(
        () => GridItemContainerWithDimension(dimensions, gridItemWidth, gridLayout),
        [dimensions, gridItemWidth, gridLayout],
    );

    // always show vertical scrollbar to prevent https://github.com/Suwayomi/Suwayomi-WebUI/issues/758
    useLayoutEffect(() => {
        if (horizontal) {
            return () => {};
        }

        // in case "overflow" is currently set to "hidden" that (most likely) means that a MUI modal is open and locks the scrollbar
        // once this modal is closed MUI restores the previous "overflow" value, thus, reverting the just set "overflow" value
        let timeout: NodeJS.Timeout;
        const changeStyle = (timeoutMS: number) => {
            timeout = setTimeout(() => {
                if (document.body.style.overflow.includes('hidden')) {
                    changeStyle(250);
                    return;
                }

                document.body.style.overflowY = gridLayout === GridLayout.List ? 'auto' : 'scroll';
            }, timeoutMS);
        };

        changeStyle(0);

        return () => {
            clearTimeout(timeout);
        };
    }, [gridLayout]);
    useLayoutEffect(
        () => () => {
            if (horizontal) {
                return;
            }

            document.body.style.overflowY = 'auto';
        },
        [],
    );

    useResizeObserver(
        gridWrapperRef,
        useCallback(() => {
            const getDimensions = () => {
                const gridWidth = gridWrapperRef.current?.offsetWidth;

                if (!gridWidth) {
                    return document.documentElement.offsetWidth - navBarWidth;
                }

                return gridWidth;
            };

            setDimensions(getDimensions());
        }, [navBarWidth]),
    );

    useResizeObserver(
        gridRef,
        useCallback(
            (entries, resizeObserver) => {
                const gridHeight = entries[0].target.clientHeight;
                const isScrollbarVisible = gridHeight > document.documentElement.clientHeight;

                if (isLoading) {
                    return;
                }

                if (!gridHeight) {
                    return;
                }

                if (isScrollbarVisible) {
                    resizeObserver.disconnect();
                    return;
                }

                loadMore();
                resizeObserver.disconnect();
            },
            [gridRef, loadMore, isLoading],
        ),
    );

    const hasNoItems = !isLoading && mangas.length === 0;
    if (hasNoItems) {
        return (
            <EmptyViewAbsoluteCentered
                noFaces={noFaces}
                message={message ?? t('manga.error.label.no_mangas_found')}
                messageExtra={messageExtra}
                retry={retry}
            />
        );
    }

    return (
        <Box {...gridWrapperProps} ref={gridWrapperRef} sx={{ ...gridWrapperProps?.sx, overflow: 'hidden' }}>
            {horizontal ? (
                <HorizontalGrid
                    ref={gridRef}
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
                    ref={gridRef}
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
        </Box>
    );
};
