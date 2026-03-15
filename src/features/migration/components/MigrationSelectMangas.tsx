/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { TMigratableSource } from '@/features/migration/components/MigrationCard.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { BaseMangaGrid } from '@/features/manga/components/BaseMangaGrid.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';
import { GridLayouts } from '@/base/components/GridLayouts.tsx';
import { useLocalStorage } from '@/base/hooks/useStorage.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MigrationManager, useMigrationSourceId } from '@/features/migration/MigrationManager.ts';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import { SOURCE_BASE_FIELDS } from '@/lib/graphql/source/SourceFragments.ts';
import type { GetSourceMigratableQuery, GetSourceMigratableQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_MIGRATABLE } from '@/lib/graphql/source/SourceQuery.ts';

export const MigrationSelectMangas = () => {
    const { t } = useLingui();
    const sourceId = useMigrationSourceId();

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const fragmentSource = requestManager.graphQLClient.client.cache.readFragment<
        Pick<TMigratableSource, 'id' | 'name'>
    >({
        id: requestManager.graphQLClient.client.cache.identify({ __typename: 'SourceType', id: sourceId }),
        fragment: SOURCE_BASE_FIELDS,
    });

    const [isKnownSource, setIsKnownSource] = useState(fragmentSource !== null ? true : undefined);
    const {
        data: migratableSourceData,
        loading: isSourceLoading,
        error: sourceError,
        refetch: refetchSource,
    } = requestManager.useGetSource<GetSourceMigratableQuery, GetSourceMigratableQueryVariables>(
        GET_SOURCE_MIGRATABLE,
        sourceId ?? '',
        { skip: !!isKnownSource || !sourceId, notifyOnNetworkStatusChange: true },
    );

    const sourceName = fragmentSource?.name ?? migratableSourceData?.source?.name ?? sourceId ?? t`Migrate`;

    const {
        data: migratableSourceMangasData,
        loading: areMangasLoading,
        error: mangasError,
        refetch: refetchMangas,
    } = requestManager.useGetMigratableSourceMangas(sourceId!, {
        skip: !isKnownSource || !sourceId,
        notifyOnNetworkStatusChange: true,
    });

    const mangas = useMemo(() => migratableSourceMangasData?.mangas.nodes ?? [], [migratableSourceMangasData]);

    const mangaIds = useMemo(() => mangas.map((m) => m.id), [mangas]);

    const { selectedItemIds, handleSelection, handleSelectAll, areAllItemsSelected, areNoItemsSelected } =
        useSelectableCollection<number, string>(mangas.length, {
            itemIds: mangaIds,
            currentKey: 'default',
        });

    useAppTitleAndAction(sourceName, <GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />, [gridLayout]);

    useEffect(() => {
        if (isSourceLoading || isKnownSource) {
            return;
        }

        setIsKnownSource(
            !!migratableSourceData ||
                !!sourceError?.message.includes("The field at path '/source' was declared as a non null type"),
        );
    }, [isSourceLoading, sourceError]);

    const isLoadingSource = isSourceLoading || (!sourceError && !isKnownSource);
    const isLoading = isLoadingSource || areMangasLoading;

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    const hasErrorSource = sourceError && isKnownSource === false;
    const hasError = hasErrorSource || mangasError;
    if (hasError) {
        const error = (hasErrorSource ? sourceError : mangasError)!;
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (hasErrorSource) {
                        refetchSource().catch(defaultPromiseErrorHandler('MigrationSelectMangas::refetchSource'));
                    }
                    if (mangasError) {
                        refetchMangas().catch(defaultPromiseErrorHandler('MigrationSelectMangas::refetchMangas'));
                    }
                }}
            />
        );
    }

    const handleContinue = () => {
        const selected = mangas
            .filter((m) => selectedItemIds.includes(m.id))
            .map((m) => ({
                id: m.id,
                title: m.title,
                thumbnailUrl: m.thumbnailUrl ?? undefined,
                sourceId: m.sourceId,
            }));

        MigrationManager.selectMangas(selected);
    };

    return (
        <>
            <BaseMangaGrid
                hasNextPage={false}
                loadMore={() => {}}
                isLoading={areMangasLoading}
                mangas={mangas}
                gridLayout={gridLayout}
                isSelectModeActive
                selectedMangaIds={selectedItemIds}
                handleSelection={handleSelection}
            />
            <Stack
                direction="row"
                sx={{
                    position: 'sticky',
                    bottom: 0,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider',
                    zIndex: 1,
                }}
            >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={areAllItemsSelected}
                                indeterminate={!areAllItemsSelected && !areNoItemsSelected}
                                onChange={(_, checked) => handleSelectAll(checked, mangaIds)}
                            />
                        }
                        label={t`Select all`}
                    />
                    <Typography variant="body2" color="text.secondary">
                        {t`${selectedItemIds.length} selected`}
                    </Typography>
                </Stack>
                <Button variant="contained" disabled={areNoItemsSelected} onClick={handleContinue}>
                    {t`Continue`}
                </Button>
            </Stack>
        </>
    );
};
