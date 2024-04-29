/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import List from '@mui/material/List';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { GetMigratableSourcesQuery } from '@/lib/graphql/generated/graphql.ts';
import { MigrationCard, TMigratableSource } from '@/components/MigrationCard.tsx';
import { StyledGroupItemWrapper } from '@/components/virtuoso/StyledGroupItemWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

type TMigratableSourcesResult = GetMigratableSourcesQuery['mangas']['nodes'];
type TMigratableSources = Record<string, TMigratableSource>;

const getMigratableSources = (mangas?: TMigratableSourcesResult): TMigratableSources => {
    if (!mangas) {
        return {};
    }

    const uniqueSources: TMigratableSources = {};

    mangas.forEach(({ sourceId, source }) => {
        const uniqueSource = uniqueSources[sourceId] ?? {
            ...{ id: sourceId, name: sourceId, lang: 'unknown', iconUrl: null, mangaCount: 0, ...source },
        };

        uniqueSources[sourceId] = {
            ...uniqueSource,
            mangaCount: uniqueSource.mangaCount + 1,
        };
    });

    return uniqueSources;
};

export const Migration = () => {
    const { t } = useTranslation();

    const { data, loading, error, refetch } = requestManager.useGetMigratableSources({
        notifyOnNetworkStatusChange: true,
    });
    const migratableSources = useMemo(() => getMigratableSources(data?.mangas.nodes), [data?.mangas.nodes]);

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Migration::refetch'))}
            />
        );
    }

    return (
        <List>
            {Object.values(migratableSources).map((migratableSource, index) => (
                <StyledGroupItemWrapper
                    key={migratableSource.id}
                    isLastItem={index === Object.values(migratableSources).length - 1}
                >
                    <MigrationCard {...migratableSource} />
                </StyledGroupItemWrapper>
            ))}
        </List>
    );
};
