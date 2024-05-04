/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MangaGrid } from '@/components/MangaGrid.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { TManga } from '@/typings';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';
import { GridLayouts } from '@/components/source/GridLayouts.tsx';

export const LibraryDuplicates = () => {
    const { t } = useTranslation();

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('library.settings.advanced.duplicates.label.title'));
        setAction(<GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, gridLayout]);

    const { data, loading, error, refetch } = requestManager.useGetMangas({ condition: { inLibrary: true } });

    const duplicatedMangas = useMemo(() => {
        const libraryMangas: TManga[] = data?.mangas.nodes ?? [];

        const titleToMangas = Object.groupBy(libraryMangas, ({ title }) => title);

        return Object.entries(titleToMangas)
            .filter(([, mangasWithTitle]) => (mangasWithTitle?.length ?? 0) > 1)
            .map(([, mangasWithTitle]) => mangasWithTitle ?? [])
            .flat();
    }, [data?.mangas.nodes]);

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
