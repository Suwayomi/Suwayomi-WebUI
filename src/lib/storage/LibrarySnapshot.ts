/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { DocumentNode } from '@apollo/client';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { AuthManager } from '@/controllers/authentication/services/AuthManager.ts';
import { GET_CATEGORIES_LIBRARY } from '@/lib/graphql/category/CategoryQuery.ts';
import { GET_MANGAS_COUNT, GET_MANGAS_LIBRARY } from '@/lib/graphql/manga/MangaQuery.ts';

const KEY = 'library-snapshot';

const QUERIES = { GET_CATEGORIES_LIBRARY, GET_MANGAS_COUNT, GET_MANGAS_LIBRARY } satisfies Record<string, DocumentNode>;

type Snapshot = {
    // the hashed file name of the build, since the shape of the data can change with an update
    version: string;
    server: string;
    results: Partial<Record<keyof typeof QUERIES, { variables: any; data: any }>>;
};

const read = (): Snapshot => {
    const snapshot = AppStorage.local.getItemParsed<Snapshot | null>(KEY, null);
    const server = requestManager.getBaseUrl();

    const isUsable = snapshot?.version === import.meta.url && snapshot.server === server;

    return isUsable ? snapshot : { version: import.meta.url, server, results: {} };
};

// keeps what the library shows, to be able to show it right away after a reload, while it gets fetched again
export const LibrarySnapshot = {
    save(query: keyof typeof QUERIES, variables: unknown, data: unknown): void {
        // nothing of a protected server may stay readable in the storage
        if (AuthManager.isAuthRequired() !== false) {
            return;
        }

        const snapshot = read();
        snapshot.results[query] = { variables, data };

        try {
            AppStorage.local.setItem(KEY, snapshot, false);
        } catch {
            // shortcut: libraries exceeding the localStorage quota are not kept, move to IndexedDB if that matters
        }
    },

    restore(): void {
        if (AuthManager.isAuthRequired() !== false) {
            return;
        }

        const { cache } = requestManager.graphQLClient.client;

        Object.entries(read().results).forEach(([name, { variables, data }]) => {
            const query = QUERIES[name as keyof typeof QUERIES];

            if (!cache.readQuery({ query, variables })) {
                cache.writeQuery({ query, variables, data });
            }
        });
    },
};
