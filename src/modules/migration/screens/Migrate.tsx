/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { TMigratableSource } from '@/modules/migration/components/MigrationCard.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { GridLayouts } from '@/modules/core/components/GridLayouts.tsx';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetSourceMigratableQuery, GetSourceMigratableQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_MIGRATABLE } from '@/lib/graphql/queries/SourceQuery.ts';
import { SOURCE_BASE_FIELDS } from '@/lib/graphql/fragments/SourceFragments.ts';
import { BaseMangaGrid } from '@/modules/manga/components/BaseMangaGrid.tsx';
import { GridLayout } from '@/modules/core/Core.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';
import { useAppAction } from '@/modules/navigation-bar/hooks/useAppAction.ts';

export const Migrate = () => {
    const { t } = useTranslation();

    const { sourceId: paramSourceId } = useParams<{ sourceId: string }>();

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const fragmentSource = requestManager.graphQLClient.client.cache.readFragment<
        Pick<TMigratableSource, 'id' | 'name'>
    >({
        id: requestManager.graphQLClient.client.cache.identify({ __typename: 'SourceType', id: paramSourceId }),
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
        paramSourceId,
        { skip: !!isKnownSource, notifyOnNetworkStatusChange: true },
    );

    const { sourceId, name } = {
        sourceId: paramSourceId,
        name: paramSourceId,
        ...fragmentSource,
        ...migratableSourceData?.source,
    };

    const {
        data: migratableSourceMangasData,
        loading: areMangasLoading,
        error: mangasError,
        refetch: refetchMangas,
    } = requestManager.useGetMigratableSourceMangas(sourceId, {
        skip: !isKnownSource,
        notifyOnNetworkStatusChange: true,
    });

    useAppTitle(name ?? sourceId ?? t('migrate.title'));
    useAppAction(<GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />);

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
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (hasErrorSource) {
                        refetchSource().catch(defaultPromiseErrorHandler('Migrate::refetchSource'));
                    }

                    if (mangasError) {
                        refetchMangas().catch(defaultPromiseErrorHandler('Migrate::refetchMangas'));
                    }
                }}
            />
        );
    }

    return (
        <BaseMangaGrid
            hasNextPage={false}
            loadMore={() => {}}
            isLoading={areMangasLoading}
            mangas={migratableSourceMangasData?.mangas.nodes ?? []}
            gridLayout={gridLayout}
            mode="migrate.search"
        />
    );
};
