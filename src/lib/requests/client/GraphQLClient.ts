/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ApolloClient, ApolloClientOptions, InMemoryCache, NormalizedCacheObject, split } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { Client, createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { TypePolicies } from '@apollo/client/cache';
import { BaseClient } from '@/lib/requests/client/BaseClient.ts';
import { StrictTypedTypePolicies } from '@/lib/graphql/generated/apollo-helpers.ts';

/* eslint-disable no-underscore-dangle */
const typePolicies: StrictTypedTypePolicies = {
    GlobalMetaType: { keyFields: ['key'] },
    ExtensionType: { keyFields: ['pkgName'] },
    AboutServerPayload: { keyFields: [] },
    AboutWebUI: { keyFields: [] },
    WebUIUpdateInfo: { keyFields: [] },
    WebUIUpdateCheck: { keyFields: [] },
    SettingsType: { keyFields: [] },
    DownloadStatus: { keyFields: [] },
    DownloadType: { keyFields: ['chapter'] },
    Query: {
        fields: {
            manga(_, { args, toReference }) {
                return toReference({
                    __typename: 'MangaType',
                    id: args?.id,
                });
            },
            category(_, { args, toReference }) {
                return toReference({
                    __typename: 'CategoryType',
                    id: args?.id,
                });
            },
            source(_, { args, toReference }) {
                return toReference({
                    __typename: 'SourceType',
                    id: args?.id,
                });
            },
            extension(_, { args, toReference }) {
                return toReference({
                    __typename: 'ExtensionType',
                    apkName: args?.pkgName,
                });
            },
            meta(_, { args, toReference }) {
                return toReference({
                    __typename: 'GlobalMetaType',
                    key: args?.key,
                });
            },
            chapters: {
                keyArgs: ['condition', 'filter', 'orderBy', 'orderByType'],
                merge(existing, incoming) {
                    console.log('merge chapters', { ...existing }, { ...incoming });
                    if (existing == null) {
                        return incoming;
                    }

                    const isReFetch = !incoming.pageInfo.hasPreviousPage;
                    const hasLessItems = existing.nodes.length > incoming.nodes.length;

                    const useIncomingResponse = isReFetch && !hasLessItems;
                    if (useIncomingResponse) {
                        return incoming;
                    }

                    const replaceExistingItems = isReFetch && hasLessItems;
                    if (replaceExistingItems) {
                        const existingWithReplacedIncoming: typeof incoming = {
                            ...existing,
                            pageInfo: {
                                ...existing.pageInfo,
                                startCursor: incoming.pageInfo.startCursor,
                            },
                            nodes: [...incoming.nodes, ...existing.nodes.slice(incoming.nodes.length)],
                        };

                        return existingWithReplacedIncoming;
                    }

                    const existingWithAppendedIncoming: typeof incoming = {
                        ...existing,
                        pageInfo: {
                            ...existing.pageInfo,
                            endCursor: incoming.pageInfo.endCursor,
                            hasNextPage: incoming.pageInfo.hasNextPage,
                        },
                        nodes: [...existing.nodes, ...incoming.nodes],
                    };

                    return existingWithAppendedIncoming;
                },
            },
        },
    },
};
/* eslint-enable no-underscore-dangle */

export class GraphQLClient extends BaseClient<
    ApolloClient<NormalizedCacheObject>,
    ApolloClientOptions<NormalizedCacheObject>,
    null
> {
    readonly fetcher = null;

    public declare client: ApolloClient<NormalizedCacheObject>;

    private wsClient!: Client;

    public override getBaseUrl(): string {
        return `${super.getBaseUrl()}/api/graphql`;
    }

    private createUploadLink() {
        return createUploadLink({ uri: () => this.getBaseUrl() });
    }

    private createWSLink() {
        return new GraphQLWsLink(this.wsClient);
    }

    private createLink() {
        return split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
            },
            this.createWSLink(),
            this.createUploadLink(),
        );
    }

    protected createClient() {
        this.wsClient = createClient({
            url: () => this.getBaseUrl().replace(/http(|s)/g, 'ws'),
            keepAlive: 20000,
        });

        this.client = new ApolloClient({
            cache: new InMemoryCache({
                // for whatever reason there is some weird TypeError complaining that
                // "FieldReadFunction<Reference, Reference, FieldFunctionOptions<SomeObject, Record<string, any>>"
                // is not compatible with "FieldReadFunction<any, any, FieldFunctionOptions<Record<string, any, Record<string, any>>"
                // Since "typePolicies" is correctly typed as StrictTypedTypePolicies, and it is working as expected,
                // the TypeError can just be ignored
                typePolicies: typePolicies as TypePolicies,
            }),
            connectToDevTools: true,
            link: this.createLink(),
        });
    }

    public override updateConfig() {}
}
