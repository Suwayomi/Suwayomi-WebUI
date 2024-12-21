/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { GridLayouts } from '@/modules/core/components/GridLayouts.tsx';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MangaCard } from '@/modules/manga/components/cards/MangaCard.tsx';
import { StyledGroupedVirtuoso } from '@/modules/core/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/modules/core/components/virtuoso/StyledGroupHeader.tsx';
import { GetMangasDuplicatesQuery, GetMangasDuplicatesQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGAS_DUPLICATES } from '@/lib/graphql/queries/MangaQuery.ts';
import { BaseMangaGrid } from '@/modules/manga/components/BaseMangaGrid.tsx';
import { IMangaGridProps } from '@/modules/manga/components/MangaGrid.tsx';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import { LibraryDuplicatesWorkerInput, TMangaDuplicate, TMangaDuplicates } from '@/modules/library/Library.types.ts';
import { GridLayout } from '@/modules/core/Core.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

export const LibraryDuplicates = () => {
    const { t } = useTranslation();

    const [gridLayout, setGridLayout] = useLocalStorage('libraryDuplicatesGridLayout', GridLayout.List);
    const [checkAlternativeTitles, setCheckAlternativeTitles] = useLocalStorage(
        'libraryDuplicatesCheckAlternativeTitles',
        false,
    );

    const { setTitle, setAction } = useContext(NavBarContext);
    useLayoutEffect(() => {
        setTitle(t('library.settings.advanced.duplicates.label.title'));
        setAction(
            <>
                <GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />
                <PopupState variant="popover" popupId="library-dupliactes-settings">
                    {(popupState) => (
                        <>
                            <IconButton {...bindTrigger(popupState)} color="inherit">
                                <SettingsIcon />
                            </IconButton>
                            <Menu {...bindMenu(popupState)}>
                                <MenuItem>
                                    <CheckboxInput
                                        label={t(
                                            'library.settings.advanced.duplicates.settings.label.check_description',
                                        )}
                                        checked={checkAlternativeTitles}
                                        onChange={(_, checked) => setCheckAlternativeTitles(checked)}
                                    />
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </PopupState>
            </>,
        );

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, gridLayout, checkAlternativeTitles]);

    const { data, loading, error, refetch } = requestManager.useGetMangas<
        GetMangasDuplicatesQuery,
        GetMangasDuplicatesQueryVariables
    >(GET_MANGAS_DUPLICATES, { condition: { inLibrary: true } });

    const [isCheckingForDuplicates, setIsCheckingForDuplicates] = useState(true);

    const [mangasByTitle, setMangasByTitle] = useState<Record<string, TMangaDuplicate[]>>({});
    useEffect(() => {
        setIsCheckingForDuplicates(true);
        const libraryMangas: TMangaDuplicate[] = data?.mangas.nodes ?? [];

        if (!libraryMangas.length) {
            setMangasByTitle({});
            return () => {};
        }

        const worker = new Worker(new URL('../workers/LibraryDuplicatesWorker.ts', import.meta.url), {
            type: 'module',
        });

        worker.onmessage = (event: MessageEvent<TMangaDuplicates<(typeof libraryMangas)[number]>>) => {
            setMangasByTitle(event.data);
            setIsCheckingForDuplicates(false);
        };
        worker.postMessage({ mangas: libraryMangas, checkAlternativeTitles } satisfies LibraryDuplicatesWorkerInput);

        return () => worker.terminate();
    }, [data?.mangas.nodes, checkAlternativeTitles]);

    const duplicatedTitles = useMemo(
        () => Object.keys(mangasByTitle).toSorted((titleA, titleB) => titleA.localeCompare(titleB)),
        [mangasByTitle],
    );
    const duplicatedMangas = useMemo(
        () => duplicatedTitles.map((title) => mangasByTitle[title]).flat(),
        [mangasByTitle],
    );
    const mangasCountByTitle = useMemo(
        () => duplicatedTitles.map((title) => mangasByTitle[title]).map((mangas) => mangas.length),
        [mangasByTitle],
    );

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        mangasCountByTitle,
        useCallback((index) => duplicatedTitles[index], [duplicatedTitles]),
        useCallback(
            (index, groupIndex) => `${duplicatedTitles[groupIndex]}-${duplicatedMangas[index].id}}`,
            [duplicatedTitles, duplicatedMangas],
        ),
    );

    if (loading || isCheckingForDuplicates) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('LibraryDuplicates::refetch'))}
            />
        );
    }

    if (gridLayout === GridLayout.List) {
        return (
            <StyledGroupedVirtuoso
                groupCounts={mangasCountByTitle}
                groupContent={(index) => (
                    <StyledGroupHeader isFirstItem={index === 0}>
                        <Typography variant="h5" component="h2">
                            {duplicatedTitles[index]}
                        </Typography>
                    </StyledGroupHeader>
                )}
                computeItemKey={computeItemKey}
                itemContent={(index) => (
                    <StyledGroupItemWrapper>
                        <MangaCard
                            manga={duplicatedMangas[index] as IMangaGridProps['mangas'][number]}
                            gridLayout={gridLayout}
                            selected={null}
                            mode="duplicate"
                        />
                    </StyledGroupItemWrapper>
                )}
            />
        );
    }

    return duplicatedTitles.map((title, index) => (
        <Box key={title}>
            <StyledGroupHeader sx={{ pt: index === 0 ? undefined : 0, pb: 0 }} isFirstItem={false}>
                <Typography variant="h5" component="h2">
                    {title}
                </Typography>
            </StyledGroupHeader>
            <BaseMangaGrid
                mangas={mangasByTitle[title] as IMangaGridProps['mangas']}
                hasNextPage={false}
                loadMore={() => {}}
                isLoading={false}
                gridLayout={gridLayout}
                inLibraryIndicator={false}
                horizontal
                mode="duplicate"
            />
        </Box>
    ));
};
