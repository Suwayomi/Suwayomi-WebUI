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
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { BaseMangaGrid } from '@/views/manga/components/BaseMangaGrid.tsx';
import { GridLayout } from '@/models/base/Base.types.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { useAppTitleAndAction } from '@/controllers/navigation-bar/hooks/useAppTitleAndAction.ts';
import { GridLayouts } from '@/views/base/components/GridLayouts.tsx';
import { useLocalStorage } from '@/controllers/base/hooks/useStorage.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MigrationManager } from '@/controllers/migration/services/MigrationManager.ts';
import { useSelectableCollection } from '@/controllers/base/hooks/collection/useSelectableCollection.ts';
import type {
    GetMigratableSourceMangasQuery,
    GetMigratableSourceMangasQueryVariables,
    GetSourceMigratableQuery,
    GetSourceMigratableQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_MIGRATABLE } from '@/lib/graphql/source/SourceQuery.ts';
import { SelectableCollectionSelectMode } from '@/views/base/components/collection/SelectableCollectionSelectMode.tsx';
import { Mangas } from '@/controllers/manga/services/Mangas.ts';
import { STABLE_EMPTY_ARRAY } from '@/models/base/Base.constants.ts';
import { MigrationContinueButton } from '@/views/migration/components/MigrationContinueButton.tsx';
import { GET_MIGRATABLE_SOURCE_MANGAS } from '@/lib/graphql/manga/MangaQuery.ts';
import { MangaOrderBy, SortOrder } from '@/lib/graphql/generated/graphql-base.types.ts';

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
    const sourceIds = MigrationManager.useSourceIds();
    const selectedMangas = MigrationManager.useEntries();

    const sourceId = sourceIds?.[0];

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const {
        data: migratableSourceData,
        loading: isSourceLoading,
        error: sourceError,
        refetch: refetchSource,
    } = requestManager.useGetSource<GetSourceMigratableQuery, GetSourceMigratableQueryVariables>(
        GET_SOURCE_MIGRATABLE,
        sourceId ?? '',
        { skip: !sourceIds },
    );

    const {
        data: migratableSourceMangasData,
        loading: areMangasLoading,
        error: mangasError,
        refetch: refetchMangas,
    } = requestManager.useGetMangas<GetMigratableSourceMangasQuery, GetMigratableSourceMangasQueryVariables>(
        GET_MIGRATABLE_SOURCE_MANGAS,
        {
            condition: {
                sourceId,
                inLibrary: true,
            },
            order: [
                {
                    by: MangaOrderBy.Title,
                    byType: SortOrder.Asc,
                },
                {
                    by: MangaOrderBy.InLibraryAt,
                    byType: SortOrder.Desc,
                },
            ],
        },
        {
            skip: !sourceIds,
        },
    );

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

    const sourceName = migratableSourceData?.source?.displayName ?? sourceIds ?? t`Migrate`;
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
                mode="migrate.select.bulk"
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
