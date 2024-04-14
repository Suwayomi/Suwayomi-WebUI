/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { TMigratableSource } from '@/components/MigrationCard.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { MangaGrid } from '@/components/MangaGrid.tsx';
import { TPartialManga } from '@/typings.ts';
import { GridLayouts } from '@/components/source/GridLayouts.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { GridLayout } from '@/components/context/LibraryOptionsContext.tsx';

const Migrate = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    const { sourceId: paramSourceId } = useParams<{ sourceId: string }>();

    const [gridLayout, setGridLayout] = useLocalStorage('migrateGridLayout', GridLayout.List);

    const fragmentSource = requestManager.graphQLClient.client.cache.readFragment<
        Pick<TMigratableSource, 'id' | 'name'>
    >({
        id: requestManager.graphQLClient.client.cache.identify({ __typename: 'SourceType', id: paramSourceId }),
        fragment: gql`
            fragment MigratableSource on SourceType {
                id
                name
            }
        `,
    });

    const [isKnownSource, setIsKnownSource] = useState(fragmentSource !== null ? true : undefined);
    const {
        data: migratableSourceData,
        loading: isSourceLoading,
        error: sourceError,
    } = requestManager.useGetSource(paramSourceId, { skip: !!isKnownSource });

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
    } = requestManager.useGetMigratableSourceMangas(sourceId, {
        skip: !isKnownSource,
    });

    useEffect(() => {
        setTitle(name ?? sourceId ?? t('migrate.title'));
        setAction(<GridLayouts gridLayout={gridLayout} onChange={setGridLayout} />);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, name, sourceId, gridLayout]);

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
        return <EmptyView message={t('global.error.label.failed_to_load_data')} messageExtra={error.message} />;
    }

    return (
        <MangaGrid
            hasNextPage={false}
            loadMore={() => {}}
            isLoading={areMangasLoading}
            mangas={(migratableSourceMangasData?.mangas.nodes ?? []) as TPartialManga[]}
            gridLayout={gridLayout}
            mode="migrate.search"
        />
    );
};
export default Migrate;
