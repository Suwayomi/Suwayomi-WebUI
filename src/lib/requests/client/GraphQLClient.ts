/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ApolloClient, ApolloClientOptions, InMemoryCache, NormalizedCacheObject, Reference } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { BaseClient } from '@/lib/requests/client/BaseClient.ts';
import { StrictTypedTypePolicies } from '@/lib/graphql/generated/apollo-helpers.ts';

/* eslint-disable no-underscore-dangle */
const typePolicies: StrictTypedTypePolicies = {
    GlobalMetaType: { keyFields: ['key'] },
    ExtensionType: { keyFields: ['apkName'] },
    AboutPayload: { keyFields: [] },
    Query: {
        fields: {
            chapters: {
                keyArgs: ['condition', 'filter', 'orderBy', 'orderByType'],
                merge(existing, incoming) {
                    const merged = {
                        ...existing,
                        ...incoming,
                        nodes: existing?.nodes ?? [],
                    };
                    const isRefetch = incoming.nodes.some(
                        (incomingChapter) =>
                            existing?.nodes.some(
                                (existingChapter) =>
                                    (existingChapter as unknown as Reference).__ref ===
                                    (incomingChapter as unknown as Reference).__ref,
                            ),
                    );
                    if (!isRefetch) {
                        merged.nodes = [...(existing?.nodes ?? []), ...incoming.nodes];
                    }
                    return merged;
                },
            },
        },
    },
};
/* eslint-enable no-underscore-dangle */

// eslint-disable-next-line import/prefer-default-export
export class GraphQLClient extends BaseClient<
    ApolloClient<NormalizedCacheObject>,
    ApolloClientOptions<NormalizedCacheObject>,
    null
> {
    readonly fetcher = null;

    public declare client: ApolloClient<NormalizedCacheObject>;

    public override getBaseUrl(): string {
        return `${super.getBaseUrl()}/api/graphql`;
    }

    private createUploadLink() {
        return createUploadLink({ uri: () => this.getBaseUrl() });
    }

    private createLink() {
        return this.createUploadLink();
    }

    protected createClient() {
        this.client = new ApolloClient({
            cache: new InMemoryCache({
                typePolicies,
            }),
            connectToDevTools: true,
            link: this.createLink(),
        });
    }

    public override updateConfig() {}
}
