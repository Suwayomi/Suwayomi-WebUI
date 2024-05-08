/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MangaGrid } from '@/components/MangaGrid.tsx';
import { TManga } from '@/typings';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';
import { GridLayouts } from '@/components/source/GridLayouts.tsx';
import { CheckboxInput } from '@/components/atoms/CheckboxInput.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { MangaCard } from '@/components/MangaCard.tsx';
import { StyledGroupedVirtuoso } from '@/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/components/virtuoso/StyledGroupHeader.tsx';

const findDuplicatesByTitle = (libraryMangas: TManga[]): Record<string, TManga[]> => {
    const titleToMangas = Object.groupBy(libraryMangas, ({ title }) => title.toLowerCase().trim());

    return Object.fromEntries(
        Object.entries(titleToMangas)
            .filter((titleToMangaMap): titleToMangaMap is [string, TManga[]] => (titleToMangaMap[1]?.length ?? 0) > 1)
            .map(([, mangas]) => [mangas[0].title, mangas]),
    );
};

const findDuplicatesByTitleAndAlternativeTitles = (libraryMangas: TManga[]): Record<string, TManga[]> => {
    const idToDuplicateStatus: Record<TManga['id'], boolean> = {};
    const titleToMangas: Record<string, TManga[]> = {};

    libraryMangas.forEach((mangaToCheck) =>
        libraryMangas.forEach((libraryManga) => {
            const isDifferentManga = mangaToCheck.id !== libraryManga.id;
            if (!isDifferentManga) {
                return;
            }

            const titleToCheck = mangaToCheck.title.toLowerCase().trim();

            const doesTitleMatch = libraryManga.title.toLowerCase().trim() === titleToCheck;
            const doesAlternativeTitleMatch = !!libraryManga.description?.toLowerCase().trim().includes(titleToCheck);

            const isDuplicate = doesTitleMatch || doesAlternativeTitleMatch;
            if (!isDuplicate) {
                return;
            }

            const markMangaToCheckAsDuplicate = !idToDuplicateStatus[mangaToCheck.id];
            if (markMangaToCheckAsDuplicate) {
                idToDuplicateStatus[mangaToCheck.id] = true;
                titleToMangas[mangaToCheck.title] = [...(titleToMangas[mangaToCheck.title] ?? []), mangaToCheck];
            }

            const wasAlreadyDetected = idToDuplicateStatus[libraryManga.id];
            if (wasAlreadyDetected) {
                return;
            }

            idToDuplicateStatus[libraryManga.id] = true;
            titleToMangas[mangaToCheck.title] = [...(titleToMangas[mangaToCheck.title] ?? []), libraryManga];
        }),
    );

    return titleToMangas;
};

export const LibraryDuplicates = () => {
    const { t } = useTranslation();

    const [gridLayout, setGridLayout] = useLocalStorage('libraryDuplicatesGridLayout', GridLayout.List);
    const [checkAlternativeTitles, setCheckAlternativeTitles] = useLocalStorage(
        'libraryDuplicatesCheckAlternativeTitles',
        false,
    );

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('library.settings.advanced.duplicates.label.title'));
        setAction(
            <>
                <GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />
                <PopupState variant="popover" popupId="library-dupliactes-settings">
                    {(popupState) => (
                        <>
                            <IconButton {...bindTrigger(popupState)}>
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

    const { data, loading, error, refetch } = requestManager.useGetMangas({ condition: { inLibrary: true } });

    const mangasByTitle = useMemo(() => {
        const libraryMangas: TManga[] = data?.mangas.nodes ?? [];

        if (checkAlternativeTitles) {
            return findDuplicatesByTitleAndAlternativeTitles(libraryMangas);
        }

        return findDuplicatesByTitle(libraryMangas);
    }, [data?.mangas.nodes, checkAlternativeTitles]);

    const duplicatedTitles = useMemo(() => Object.keys(mangasByTitle), [mangasByTitle]);
    const duplicatedMangas = useMemo(() => Object.values(mangasByTitle).flat(), [mangasByTitle]);
    const mangasCountByTitle = useMemo(
        () => Object.values(mangasByTitle).map((mangas) => mangas.length),
        [mangasByTitle],
    );

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('LibraryDuplicates::refetch'))}
            />
        );
    }

    if (gridLayout === GridLayout.List) {
        return (
            <StyledGroupedVirtuoso
                style={{
                    // override Virtuoso default values and set them with class
                    height: 'undefined',
                }}
                groupCounts={mangasCountByTitle}
                groupContent={(index) => (
                    <StyledGroupHeader variant="h5" isFirstItem={index === 0}>
                        {duplicatedTitles[index]}
                    </StyledGroupHeader>
                )}
                itemContent={(index) => (
                    <Box key={duplicatedMangas[index].id} sx={{ px: 1, pb: 1 }}>
                        <MangaCard manga={duplicatedMangas[index]} gridLayout={gridLayout} selected={null} />
                    </Box>
                )}
            />
        );
    }

    return duplicatedTitles.map((title, index) => (
        <Box key={title}>
            <StyledGroupHeader sx={{ pt: index === 0 ? undefined : 0, pb: 0 }} variant="h5" isFirstItem={false}>
                {title}
            </StyledGroupHeader>
            <MangaGrid
                mangas={mangasByTitle[title]}
                hasNextPage={false}
                loadMore={() => {}}
                isLoading={false}
                gridLayout={gridLayout}
                horizontal
            />
        </Box>
    ));
};
