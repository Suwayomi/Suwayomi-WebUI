/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { LimitFunction } from 'p-limit';
import pLimit from 'p-limit';
import { MAX_SOURCES_IN_PARALLEL } from '@/models/migration/Migration.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { GetServerSettingsQuery, GetServerSettingsQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/settings/SettingsQuery.ts';
import type { SourceIdInfo } from '@/models/source/Source.types.ts';

// limits for source requests, which are shared between searching and migrating
export class MigrationSourceQueues {
    private static parallelSourcesQueue: LimitFunction | undefined;
    private static queueBySource = new Map<SourceIdInfo['id'], LimitFunction>();

    static getParallelSourceQueue(): LimitFunction {
        if (MigrationSourceQueues.parallelSourcesQueue) {
            return MigrationSourceQueues.parallelSourcesQueue;
        }

        try {
            const result = requestManager.graphQLClient.client.readQuery<
                GetServerSettingsQuery,
                GetServerSettingsQueryVariables
            >({
                query: GET_SERVER_SETTINGS,
            });

            MigrationSourceQueues.parallelSourcesQueue = pLimit(
                result?.settings.maxSourcesInParallel ?? MAX_SOURCES_IN_PARALLEL,
            );
        } catch {
            MigrationSourceQueues.parallelSourcesQueue = pLimit(MAX_SOURCES_IN_PARALLEL);
        }

        return MigrationSourceQueues.parallelSourcesQueue!;
    }

    static getOrCreateSourceQueue(sourceId: SourceIdInfo['id']): LimitFunction {
        if (MigrationSourceQueues.queueBySource.has(sourceId)) {
            return MigrationSourceQueues.queueBySource.get(sourceId)!;
        }

        const queue = pLimit(1);
        MigrationSourceQueues.queueBySource.set(sourceId, queue);

        return queue;
    }
}
