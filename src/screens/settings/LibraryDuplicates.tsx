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
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MangaGrid } from '@/components/MangaGrid.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { TManga } from '@/typings';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';
import { GridLayouts } from '@/components/source/GridLayouts.tsx';
import { CheckboxInput } from '@/components/atoms/CheckboxInput.tsx';

const findDuplicatesByTitle = (libraryMangas: TManga[]): TManga[] => {
    const titleToMangas = Object.groupBy(libraryMangas, ({ title }) => title.toLowerCase().trim());

    return Object.entries(titleToMangas)
        .filter(([, mangasWithTitle]) => (mangasWithTitle?.length ?? 0) > 1)
        .map(([, mangasWithTitle]) => mangasWithTitle ?? [])
        .flat();
};

const findDuplicatesByTitleAndAlternativeTitles = (libraryMangas: TManga[]): TManga[] => {
    const idToDuplicateStatus: Record<TManga['id'], boolean> = {};
    const duplicatedMangas: TManga[] = [];

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
                duplicatedMangas.push(mangaToCheck);
            }

            const wasAlreadyDetected = idToDuplicateStatus[libraryManga.id];
            if (wasAlreadyDetected) {
                return;
            }

            idToDuplicateStatus[libraryManga.id] = true;
            duplicatedMangas.push(libraryManga);
        }),
    );

    return duplicatedMangas;
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

    const duplicatedMangas = useMemo(() => {
        const libraryMangas: TManga[] = data?.mangas.nodes ?? [];

        if (checkAlternativeTitles) {
            return findDuplicatesByTitleAndAlternativeTitles(libraryMangas);
        }

        return findDuplicatesByTitle(libraryMangas);
    }, [data?.mangas.nodes, checkAlternativeTitles]);

    return (
        <MangaGrid
            mangas={duplicatedMangas}
            hasNextPage={false}
            loadMore={() => {}}
            message={error ? t('manga.error.label.request_failure') : t('library.error.label.empty')}
            messageExtra={error?.message}
            isLoading={loading}
            retry={error ? () => refetch().catch(defaultPromiseErrorHandler('LibraryDuplicates::refetch')) : undefined}
            gridLayout={gridLayout}
        />
    );
};
