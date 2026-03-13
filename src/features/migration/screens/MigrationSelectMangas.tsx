/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { BaseMangaGrid } from '@/features/manga/components/BaseMangaGrid.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { GridLayouts } from '@/base/components/GridLayouts.tsx';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import type { GetSourceMigratableQuery, GetSourceMigratableQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_MIGRATABLE } from '@/lib/graphql/source/SourceQuery.ts';
import { SelectableCollectionSelectMode } from '@/base/collection/components/SelectableCollectionSelectMode.tsx';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { MigrationContinueButton } from '@/features/migration/components/MigrationContinueButton.tsx';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';

const getSourceError = (error: unknown): unknown => {
    const message = getErrorMessage(error);

    if (
        message.includes(
            "The field at path '/source' was declared as a non null type, but the code involved in retrieving data has wrongly returned a null value",
        )
    ) {
        return null;
    }

    return error;
};

export const MigrationSelectMangas = () => {
    const { t } = useLingui();
    const sourceId = MigrationManager.useSourceId();
    const selectedMangas = MigrationManager.useEntries();

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const {
        data: migratableSourceData,
        loading: isSourceLoading,
        error: sourceError,
        refetch: refetchSource,
    } = requestManager.useGetSource<GetSourceMigratableQuery, GetSourceMigratableQueryVariables>(
        GET_SOURCE_MIGRATABLE,
        sourceId ?? '',
        { skip: !sourceId, notifyOnNetworkStatusChange: true },
    );

    const {
        data: migratableSourceMangasData,
        loading: areMangasLoading,
        error: mangasError,
        refetch: refetchMangas,
    } = requestManager.useGetMigratableSourceMangas(sourceId!, {
        skip: !sourceId,
        notifyOnNetworkStatusChange: true,
    });

    const mangas = migratableSourceMangasData?.mangas.nodes ?? STABLE_EMPTY_ARRAY;
    const mangaIds = useMemo(() => Mangas.getIds(mangas), [mangas]);

    const { selectedItemIds, handleSelection, handleSelectAll, areAllItemsSelected, areNoItemsSelected } =
        useSelectableCollection<number, string>(mangas.length, {
            itemIds: mangaIds,
            currentKey: 'default',
            initialState: useMemo(
                () => ({
                    default: Object.keys(selectedMangas).map(Number),
                }),
                [selectedMangas],
            ),
        });

    const sourceName = migratableSourceData?.source?.displayName ?? sourceId ?? t`Migrate`;
    useAppTitleAndAction(
        sourceName,
        <>
            <GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />
            <SelectableCollectionSelectMode
                isActive
                isCancelable={false}
                areAllItemsSelected={areAllItemsSelected}
                areNoItemsSelected={areNoItemsSelected}
                onSelectAll={(selectAll) => handleSelectAll(selectAll, [...new Set([...selectedItemIds, ...mangaIds])])}
                onModeChange={(checked) => {
                    handleSelectAll(checked, [...new Set([...selectedItemIds, ...mangaIds])]);
                }}
            />
        </>,
        [gridLayout, setGridLayout, areAllItemsSelected, areNoItemsSelected, handleSelectAll, mangaIds],
    );

    const handleContinue = () => {
        const selected = mangas.filter((manga) => selectedItemIds.includes(manga.id));

        const [entry] = selected;
        const isSingleManga = selected.length === 1;

        if (isSingleManga && entry) {
            ReactRouter.navigate(
                AppRoutes.migrate.childRoutes.singleMangaSearch.path(entry.sourceId, entry.id, entry.title),
                {
                    state: { mangaTitle: entry.title },
                },
            );

            MigrationManager.reset();

            return;
        }

        MigrationManager.selectMangas(selected);
    };

    const isLoading = isSourceLoading || areMangasLoading;
    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    const hasError = getSourceError(sourceError) || mangasError;
    if (hasError) {
        const error = getSourceError(sourceError) ?? mangasError;

        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (getSourceError(sourceError)) {
                        refetchSource().catch(defaultPromiseErrorHandler('MigrationSelectMangas::refetchSource'));
                    }
                    if (mangasError) {
                        refetchMangas().catch(defaultPromiseErrorHandler('MigrationSelectMangas::refetchMangas'));
                    }
                }}
            />
        );
    }

    return (
        <>
            <BaseMangaGrid
                mode="migrate.select"
                hasNextPage={false}
                loadMore={noOp}
                isLoading={areMangasLoading}
                mangas={mangas}
                gridLayout={gridLayout}
                isSelectModeActive
                selectedMangaIds={selectedItemIds}
                handleSelection={handleSelection}
            />
            <MigrationContinueButton onClick={handleContinue} isDisabled={!selectedItemIds.length} />
        </>
    );
};
