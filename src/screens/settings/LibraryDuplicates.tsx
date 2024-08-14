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
import {
    GetMangasDuplicatesQuery,
    GetMangasDuplicatesQueryVariables,
    MangaType,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_MANGAS_DUPLICATES } from '@/lib/graphql/queries/MangaQuery.ts';
import { BaseMangaGrid } from '@/components/source/BaseMangaGrid.tsx';
import { IMangaGridProps } from '@/components/MangaGrid.tsx';
import { StyledGroupItemWrapper } from '@/components/virtuoso/StyledGroupItemWrapper.tsx';
import { enhancedCleanup } from '@/lib/data/Strings.ts';

const findDuplicatesByTitle = <Manga extends Pick<MangaType, 'title'>>(
    libraryMangas: Manga[],
): Record<string, Manga[]> => {
    const titleToMangas = Object.groupBy(libraryMangas, ({ title }) => enhancedCleanup(title));

    return Object.fromEntries(
        Object.entries(titleToMangas)
            .filter((titleToMangaMap): titleToMangaMap is [string, Manga[]] => (titleToMangaMap[1]?.length ?? 0) > 1)
            .map(([, mangas]) => [mangas[0].title, mangas]),
    );
};

type TMangaDuplicate = Pick<MangaType, 'id' | 'title' | 'description'>;
const findDuplicatesByTitleAndAlternativeTitles = <Manga extends TMangaDuplicate>(
    libraryMangas: Manga[],
): Record<string, Manga[]> => {
    const titleToMangas: Record<string, Set<Manga>> = {};
    const titleToAlternativeTitleMatches: Record<string, Set<Manga>> = {};

    libraryMangas.forEach((mangaToCheck) => {
        const titleToCheck = enhancedCleanup(mangaToCheck.title);

        titleToMangas[titleToCheck] ??= new Set();
        titleToMangas[titleToCheck].add(mangaToCheck);

        titleToAlternativeTitleMatches[titleToCheck] ??= new Set();
        titleToAlternativeTitleMatches[titleToCheck].add(mangaToCheck);

        libraryMangas.forEach((libraryManga) => {
            const isDifferentManga = mangaToCheck.id !== libraryManga.id;
            if (!isDifferentManga) {
                return;
            }

            const doesTitleMatch = enhancedCleanup(libraryManga.title) === titleToCheck;
            const doesAlternativeTitleMatch = enhancedCleanup(libraryManga?.description ?? '').includes(titleToCheck);

            const isDuplicate = doesTitleMatch || doesAlternativeTitleMatch;
            if (!isDuplicate) {
                return;
            }

            if (doesTitleMatch) {
                titleToMangas[titleToCheck].add(libraryManga);
            }

            if (doesAlternativeTitleMatch) {
                titleToAlternativeTitleMatches[titleToCheck].add(libraryManga);
            }
        });
    });

    const titleToDuplicatesEntries = Object.entries(titleToMangas)
        .map(([title, titleMatches]) => {
            const originalTitle = [...titleMatches][0].title;

            const combinedDuplicates = [...titleMatches, ...(titleToAlternativeTitleMatches[title] ?? [])];
            const duplicates = [...new Set([...combinedDuplicates])];

            const noDuplicatesFound = duplicates.length === 1;
            if (noDuplicatesFound) {
                return null;
            }

            return [originalTitle, duplicates];
        })
        .filter((entry) => !!entry);

    return Object.fromEntries(titleToDuplicatesEntries);
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

    const { data, loading, error, refetch } = requestManager.useGetMangas<
        GetMangasDuplicatesQuery,
        GetMangasDuplicatesQueryVariables
    >(GET_MANGAS_DUPLICATES, { condition: { inLibrary: true } });

    const mangasByTitle = useMemo(() => {
        const libraryMangas: TMangaDuplicate[] = data?.mangas.nodes ?? [];

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
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('LibraryDuplicates::refetch'))}
            />
        );
    }

    if (gridLayout === GridLayout.List) {
        return (
            <StyledGroupedVirtuoso
                groupCounts={mangasCountByTitle}
                groupContent={(index) => (
                    <StyledGroupHeader variant="h5" isFirstItem={index === 0}>
                        {duplicatedTitles[index]}
                    </StyledGroupHeader>
                )}
                itemContent={(index) => (
                    <StyledGroupItemWrapper key={duplicatedMangas[index].id}>
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
            <StyledGroupHeader sx={{ pt: index === 0 ? undefined : 0, pb: 0 }} variant="h5" isFirstItem={false}>
                {title}
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
