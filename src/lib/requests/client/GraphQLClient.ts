/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    ApolloClient,
    ApolloClientOptions,
    ApolloLink,
    InMemoryCache,
    NormalizedCacheObject,
    split,
    from,
} from '@apollo/client';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { Client, createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { TypePolicies } from '@apollo/client/cache';
import { removeTypenameFromVariables } from '@apollo/client/link/remove-typename';
import { BaseClient } from '@/lib/requests/client/BaseClient.ts';
import { StrictTypedTypePolicies } from '@/lib/graphql/generated/apollo-helpers.ts';

/* eslint-disable no-underscore-dangle */
const typePolicies: StrictTypedTypePolicies = {
    MangaType: {
        fields: {
            trackRecords: {
                merge(existing, incoming) {
                    const nodes = incoming.nodes ?? existing?.nodes;

                    return {
                        ...existing,
                        ...incoming,
                        totalCount: nodes?.length ?? existing?.totalCount ?? incoming.totalCount,
                        nodes,
                    };
                },
            },
        },
    },
    GlobalMetaType: { keyFields: ['key'] },
    MangaMetaType: { keyFields: ['mangaId', 'key'] },
    ChapterMetaType: { keyFields: ['chapterId', 'key'] },
    CategoryMetaType: { keyFields: ['categoryId', 'key'] },
    SourceMetaType: { keyFields: ['sourceId', 'key'] },
    ExtensionType: { keyFields: ['pkgName'] },
    AboutServerPayload: { keyFields: [] },
    AboutWebUI: { keyFields: [] },
    WebUIUpdateInfo: { keyFields: [] },
    WebUIUpdateCheck: { keyFields: [] },
    SettingsType: { keyFields: [] },
    DownloadStatus: {
        keyFields: [],
        fields: {
            queue: {
                merge(_existing, incoming) {
                    return incoming;
                },
            },
        },
    },
    DownloadType: { keyFields: ['chapter'] },
    CategoryUpdateType: { keyFields: ['category'] },
    MangaUpdateType: { keyFields: ['manga'] },
    UpdaterJobsInfoType: { keyFields: [] },
    WebUIUpdateStatus: { keyFields: [] },
    UpdateStatus: { keyFields: [] },
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
                    pkgName: args?.pkgName,
                });
            },
            meta(_, { args, toReference }) {
                return toReference({
                    __typename: 'GlobalMetaType',
                    key: args?.key,
                });
            },
            downloadStatus: {
                read(_, { toReference }) {
                    return toReference({
                        __typename: 'DownloadStatus',
                        key: {},
                    });
                },
                merge(_, incoming) {
                    return incoming;
                },
            },
            getWebUIUpdateStatus(_, { toReference }) {
                return toReference({
                    __typename: 'WebUIUpdateStatus',
                    key: {},
                });
            },
            updateStatus(_, { toReference }) {
                return toReference({ __typename: 'UpdateStatus', key: {} });
            },
            chapters: {
                keyArgs: ['condition', 'filter', 'orderBy', 'orderByType', 'order'],
                merge(existing, incoming) {
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
            settings: {
                merge(existing, incoming) {
                    return {
                        ...(existing ?? {}),
                        ...(incoming ?? {}),
                    };
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

    public client!: ApolloClient<NormalizedCacheObject>;

    private wsClient!: Client;

    constructor() {
        super();

        this.createClient();
    }

    public override getBaseUrl(): string {
        return `${super.getBaseUrl()}/api/graphql`;
    }

    public terminateSubscriptions(): void {
        this.wsClient.terminate();
    }

    private createUploadLink() {
        return createUploadLink({ uri: () => this.getBaseUrl(), credentials: 'include' });
    }

    private createWSLink() {
        return new GraphQLWsLink(this.wsClient);
    }

    private createLink() {
        const removeTypenameLink = removeTypenameFromVariables();

        return split(
            ({ query }) => {
                const definition = getMainDefinition(query);
                return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
            },
            this.createWSLink(),
            // apollo-upload-client dependency is outdated (see 134e47763faae9e62db4d4e3a8387a74e32e5568) and thus types are not matching, but they are still correct
            from([removeTypenameLink, this.createUploadLink() as unknown as ApolloLink]),
        );
    }

    protected createClient() {
        const heartbeatInterval = 1000 * 20;

        this.wsClient = createClient({
            url: () => this.getBaseUrl().replace(/http(|s)/g, 'ws'),
            keepAlive: heartbeatInterval,
            retryAttempts: 10,
        });

        let lastHeartbeat: number = 0;
        this.wsClient.on('connected', () => {
            lastHeartbeat = Date.now();
        });
        this.wsClient.on('pong', () => {
            lastHeartbeat = Date.now();
        });

        const checkHeartbeatInterval = heartbeatInterval + 1000 * 10;
        setInterval(() => {
            const isHeartbeatMissing = Date.now() - lastHeartbeat > checkHeartbeatInterval * 1.1;
            if (isHeartbeatMissing) {
                // force a reconnect
                this.wsClient.terminate();
            }
        }, checkHeartbeatInterval);

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
