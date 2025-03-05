/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    ApolloError,
    ApolloQueryResult,
    DocumentNode,
    FetchResult,
    MutationHookOptions as ApolloMutationHookOptions,
    MutationOptions as ApolloMutationOptions,
    MutationResult,
    MutationTuple,
    QueryHookOptions as ApolloQueryHookOptions,
    QueryOptions as ApolloQueryOptions,
    QueryResult,
    SubscriptionHookOptions as ApolloSubscriptionHookOptions,
    SubscriptionResult,
    TypedDocumentNode,
    useMutation,
    useQuery,
    useSubscription,
} from '@apollo/client';
import { MaybeMasked, OperationVariables, Reference } from '@apollo/client/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IRestClient, RestClient } from '@/lib/requests/client/RestClient.ts';
import { GraphQLClient } from '@/lib/requests/client/GraphQLClient.ts';
import {
    CategoryOrderBy,
    ChapterConditionInput,
    ChapterOrderBy,
    CheckForServerUpdatesQuery,
    CheckForServerUpdatesQueryVariables,
    CheckForWebuiUpdateQuery,
    CheckForWebuiUpdateQueryVariables,
    ClearCachedImagesInput,
    ClearDownloaderMutation,
    ClearDownloaderMutationVariables,
    ClearServerCacheMutation,
    ClearServerCacheMutationVariables,
    CreateCategoryInput,
    CreateCategoryMutation,
    CreateCategoryMutationVariables,
    DeleteCategoryMetadataMutation,
    DeleteCategoryMetadataMutationVariables,
    DeleteCategoryMutation,
    DeleteCategoryMutationVariables,
    DeleteChapterMetadataMutation,
    DeleteChapterMetadataMutationVariables,
    DeleteDownloadedChapterMutation,
    DeleteDownloadedChapterMutationVariables,
    DeleteDownloadedChaptersMutation,
    DeleteDownloadedChaptersMutationVariables,
    DeleteGlobalMetadataMutation,
    DeleteGlobalMetadataMutationVariables,
    DeleteMangaMetadataMutation,
    DeleteMangaMetadataMutationVariables,
    DeleteSourceMetadataMutation,
    DeleteSourceMetadataMutationVariables,
    DequeueChapterDownloadMutation,
    DequeueChapterDownloadMutationVariables,
    DequeueChapterDownloadsMutation,
    DequeueChapterDownloadsMutationVariables,
    DownloadStatusSubscription,
    DownloadStatusSubscriptionVariables,
    DownloadUpdateType,
    EnqueueChapterDownloadMutation,
    EnqueueChapterDownloadMutationVariables,
    EnqueueChapterDownloadsMutation,
    EnqueueChapterDownloadsMutationVariables,
    FetchSourceMangaInput,
    FetchSourceMangaType,
    FilterChangeInput,
    GetAboutQuery,
    GetAboutQueryVariables,
    GetCategoriesSettingsQuery,
    GetCategoriesSettingsQueryVariables,
    GetCategoryMangasQuery,
    GetCategoryMangasQueryVariables,
    GetChapterPagesFetchMutation,
    GetChapterPagesFetchMutationVariables,
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
    GetChaptersUpdatesQuery,
    GetChaptersUpdatesQueryVariables,
    GetChaptersHistoryQuery,
    GetChaptersHistoryQueryVariables,
    GetDownloadStatusQuery,
    GetDownloadStatusQueryVariables,
    GetExtensionsFetchMutation,
    GetExtensionsFetchMutationVariables,
    GetExtensionsQuery,
    GetExtensionsQueryVariables,
    GetGlobalMetadatasQuery,
    GetGlobalMetadatasQueryVariables,
    GetLastUpdateTimestampQuery,
    GetLastUpdateTimestampQueryVariables,
    GetMangaChaptersFetchMutation,
    GetMangaChaptersFetchMutationVariables,
    GetMangaFetchMutation,
    GetMangaFetchMutationVariables,
    GetMangasChapterIdsWithStateQuery,
    GetMangasChapterIdsWithStateQueryVariables,
    GetMangasLibraryQuery,
    GetMangasLibraryQueryVariables,
    GetMangaToMigrateQuery,
    GetMangaToMigrateQueryVariables,
    GetMangaToMigrateToFetchMutation,
    GetMangaToMigrateToFetchMutationVariables,
    GetMigratableSourceMangasQuery,
    GetMigratableSourceMangasQueryVariables,
    GetMigratableSourcesQuery,
    GetMigratableSourcesQueryVariables,
    GetRestoreStatusQuery,
    GetRestoreStatusQueryVariables,
    GetServerSettingsQuery,
    GetServerSettingsQueryVariables,
    GetSourceMangasFetchMutation,
    GetSourceMangasFetchMutationVariables,
    GetSourcesListQuery,
    GetSourcesListQueryVariables,
    GetUpdateStatusQuery,
    GetUpdateStatusQueryVariables,
    GetWebuiUpdateStatusQuery,
    GetWebuiUpdateStatusQueryVariables,
    InstallExternalExtensionMutation,
    InstallExternalExtensionMutationVariables,
    ReorderChapterDownloadMutation,
    ReorderChapterDownloadMutationVariables,
    ResetWebuiUpdateStatusMutation,
    ResetWebuiUpdateStatusMutationVariables,
    RestoreBackupMutation,
    RestoreBackupMutationVariables,
    SetCategoryMetadataMutation,
    SetCategoryMetadataMutationVariables,
    SetChapterMetadataMutation,
    SetChapterMetadataMutationVariables,
    SetGlobalMetadataMutation,
    SetGlobalMetadataMutationVariables,
    SetMangaMetadataMutation,
    SetMangaMetadataMutationVariables,
    SetSourceMetadataMutation,
    SetSourceMetadataMutationVariables,
    SettingsType,
    SortOrder,
    SourcePreferenceChangeInput,
    StartDownloaderMutation,
    StartDownloaderMutationVariables,
    StopDownloaderMutation,
    StopDownloaderMutationVariables,
    StopUpdaterMutation,
    StopUpdaterMutationVariables,
    TrackerBindMutation,
    TrackerBindMutationVariables,
    TrackerFetchBindMutation,
    TrackerFetchBindMutationVariables,
    TrackerLoginCredentialsMutation,
    TrackerLoginCredentialsMutationVariables,
    TrackerLoginOauthMutation,
    TrackerLoginOauthMutationVariables,
    TrackerLogoutMutation,
    TrackerLogoutMutationVariables,
    TrackerSearchQuery,
    TrackerSearchQueryVariables,
    TrackerUnbindMutation,
    TrackerUnbindMutationVariables,
    TrackerUpdateBindMutation,
    TrackerUpdateBindMutationVariables,
    UpdateCategoryMangasMutation,
    UpdateCategoryMangasMutationVariables,
    UpdateCategoryMutation,
    UpdateCategoryMutationVariables,
    UpdateCategoryOrderMutation,
    UpdateCategoryOrderMutationVariables,
    UpdateCategoryPatchInput,
    UpdateChapterMutation,
    UpdateChapterMutationVariables,
    UpdateChapterPatchInput,
    UpdateChaptersMutation,
    UpdateChaptersMutationVariables,
    UpdateExtensionMutation,
    UpdateExtensionMutationVariables,
    UpdateExtensionPatchInput,
    UpdateExtensionsMutation,
    UpdateExtensionsMutationVariables,
    UpdateLibraryMangasMutation,
    UpdateLibraryMangasMutationVariables,
    UpdateMangaCategoriesMutation,
    UpdateMangaCategoriesMutationVariables,
    UpdateMangaCategoriesPatchInput,
    UpdateMangaMutation,
    UpdateMangaMutationVariables,
    UpdateMangaPatchInput,
    UpdateMangasCategoriesMutation,
    UpdateMangasCategoriesMutationVariables,
    UpdateMangasMutation,
    UpdateMangasMutationVariables,
    UpdaterSubscription,
    UpdaterSubscriptionVariables,
    UpdateServerSettingsMutation,
    UpdateServerSettingsMutationVariables,
    UpdateSourcePreferencesMutation,
    UpdateSourcePreferencesMutationVariables,
    UpdateTrackInput,
    UpdateWebuiMutation,
    UpdateWebuiMutationVariables,
    ValidateBackupQuery,
    ValidateBackupQueryVariables,
    WebuiUpdateSubscription,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_GLOBAL_METADATAS } from '@/lib/graphql/queries/GlobalMetadataQuery.ts';
import { DELETE_GLOBAL_METADATA, SET_GLOBAL_METADATA } from '@/lib/graphql/mutations/GlobalMetadataMutation.ts';
import {
    CHECK_FOR_SERVER_UPDATES,
    CHECK_FOR_WEBUI_UPDATE,
    GET_ABOUT,
    GET_WEBUI_UPDATE_STATUS,
} from '@/lib/graphql/queries/ServerInfoQuery.ts';
import { GET_EXTENSIONS } from '@/lib/graphql/queries/ExtensionQuery.ts';
import {
    GET_EXTENSIONS_FETCH,
    INSTALL_EXTERNAL_EXTENSION,
    UPDATE_EXTENSION,
    UPDATE_EXTENSIONS,
} from '@/lib/graphql/mutations/ExtensionMutation.ts';
import { GET_MIGRATABLE_SOURCES, GET_SOURCES_LIST } from '@/lib/graphql/queries/SourceQuery.ts';
import {
    DELETE_MANGA_METADATA,
    GET_MANGA_FETCH,
    GET_MANGA_TO_MIGRATE_TO_FETCH,
    SET_MANGA_METADATA,
    UPDATE_MANGA,
    UPDATE_MANGA_CATEGORIES,
    UPDATE_MANGAS,
    UPDATE_MANGAS_CATEGORIES,
} from '@/lib/graphql/mutations/MangaMutation.ts';
import {
    GET_MANGA_TO_MIGRATE,
    GET_MANGA_TRACK_RECORDS,
    GET_MANGAS_LIBRARY,
    GET_MIGRATABLE_SOURCE_MANGAS,
} from '@/lib/graphql/queries/MangaQuery.ts';
import {
    GET_CATEGORIES_BASE,
    GET_CATEGORIES_LIBRARY,
    GET_CATEGORIES_SETTINGS,
    GET_CATEGORY_MANGAS,
} from '@/lib/graphql/queries/CategoryQuery.ts';
import {
    DELETE_SOURCE_METADATA,
    GET_SOURCE_MANGAS_FETCH,
    SET_SOURCE_METADATA,
    UPDATE_SOURCE_PREFERENCES,
} from '@/lib/graphql/mutations/SourceMutation.ts';
import {
    CLEAR_DOWNLOADER,
    DELETE_DOWNLOADED_CHAPTER,
    DELETE_DOWNLOADED_CHAPTERS,
    DEQUEUE_CHAPTER_DOWNLOAD,
    DEQUEUE_CHAPTER_DOWNLOADS,
    ENQUEUE_CHAPTER_DOWNLOAD,
    ENQUEUE_CHAPTER_DOWNLOADS,
    REORDER_CHAPTER_DOWNLOAD,
    START_DOWNLOADER,
    STOP_DOWNLOADER,
} from '@/lib/graphql/mutations/DownloaderMutation.ts';
import {
    GET_CHAPTERS_HISTORY,
    GET_CHAPTERS_MANGA,
    GET_CHAPTERS_UPDATES,
    GET_MANGAS_CHAPTER_IDS_WITH_STATE,
} from '@/lib/graphql/queries/ChapterQuery.ts';
import {
    DELETE_CHAPTER_METADATA,
    GET_CHAPTER_PAGES_FETCH,
    GET_MANGA_CHAPTERS_FETCH,
    SET_CHAPTER_METADATA,
    UPDATE_CHAPTER,
    UPDATE_CHAPTERS,
} from '@/lib/graphql/mutations/ChapterMutation.ts';
import {
    CREATE_CATEGORY,
    DELETE_CATEGORY,
    DELETE_CATEGORY_METADATA,
    SET_CATEGORY_METADATA,
    UPDATE_CATEGORY,
    UPDATE_CATEGORY_ORDER,
} from '@/lib/graphql/mutations/CategoryMutation.ts';
import {
    STOP_UPDATER,
    UPDATE_CATEGORY_MANGAS,
    UPDATE_LIBRARY_MANGAS,
} from '@/lib/graphql/mutations/UpdaterMutation.ts';
import { GET_LAST_UPDATE_TIMESTAMP, GET_UPDATE_STATUS } from '@/lib/graphql/queries/UpdaterQuery.ts';
import { CustomCache } from '@/lib/storage/CustomCache.ts';
import { RESTORE_BACKUP } from '@/lib/graphql/mutations/BackupMutation.ts';
import { GET_RESTORE_STATUS, VALIDATE_BACKUP } from '@/lib/graphql/queries/BackupQuery.ts';
import { DOWNLOAD_STATUS_SUBSCRIPTION } from '@/lib/graphql/subscriptions/DownloaderSubscription.ts';
import { UPDATER_SUBSCRIPTION } from '@/lib/graphql/subscriptions/UpdaterSubscription.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/queries/SettingsQuery.ts';
import { UPDATE_SERVER_SETTINGS } from '@/lib/graphql/mutations/SettingsMutation.ts';
import { CLEAR_SERVER_CACHE } from '@/lib/graphql/mutations/ImageMutation.ts';
import { RESET_WEBUI_UPDATE_STATUS, UPDATE_WEBUI } from '@/lib/graphql/mutations/ServerInfoMutation.ts';
import { WEBUI_UPDATE_SUBSCRIPTION } from '@/lib/graphql/subscriptions/ServerInfoSubscription.ts';
import { GET_DOWNLOAD_STATUS } from '@/lib/graphql/queries/DownloaderQuery.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { Queue, QueuePriority } from '@/lib/Queue.ts';
import { TRACKER_SEARCH } from '@/lib/graphql/queries/TrackerQuery.ts';
import {
    TRACKER_BIND,
    TRACKER_FETCH_BIND,
    TRACKER_LOGIN_CREDENTIALS,
    TRACKER_LOGIN_OAUTH,
    TRACKER_LOGOUT,
    TRACKER_UNBIND,
    TRACKER_UPDATE_BIND,
} from '@/lib/graphql/mutations/TrackerMutation.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { DOWNLOAD_STATUS_FIELDS } from '@/lib/graphql/fragments/DownloadFragments.ts';
import { EXTENSION_LIST_FIELDS } from '@/lib/graphql/fragments/ExtensionFragments.ts';
import { MANGA_BASE_FIELDS, MANGA_META_FIELDS } from '@/lib/graphql/fragments/MangaFragments.ts';
import { GLOBAL_METADATA } from '@/lib/graphql/fragments/Fragments.ts';
import { CATEGORY_META_FIELDS } from '@/lib/graphql/fragments/CategoryFragments.ts';
import { SOURCE_META_FIELDS } from '@/lib/graphql/fragments/SourceFragments.ts';
import { CHAPTER_META_FIELDS } from '@/lib/graphql/fragments/ChapterFragments.ts';
import { MetadataMigrationSettings } from '@/modules/migration/Migration.types.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { updateMetadataList } from '@/modules/metadata/services/MetadataApolloCacheHandler.ts';

enum GQLMethod {
    QUERY = 'QUERY',
    USE_QUERY = 'USE_QUERY',
    USE_MUTATION = 'USE_MUTATION',
    MUTATION = 'MUTATION',
    USE_SUBSCRIPTION = 'USE_SUBSCRIPTION',
}

type CustomApolloOptions = {
    /**
     * This is a workaround for an apollo bug (?).
     *
     * A new abort signal gets passed on every hook call.
     * This causes the passed arguments to change (due to updating the "context" option, which is only relevant for the actual request),
     * which - I assume - results in apollo to handle this as a completely new hook call.
     * Due to this, when e.g. calling "fetchMore", "loading" and "networkStatus" do not get updated when enabling "notifyOnNetworkStatusChange".
     *
     * It also causes apollo to spam requests in case of request failures on every rerender.
     *
     * Instead of adding the abort signal by default, it has to be added manually which will cause these stated issues (and potentially more?)
     */
    addAbortSignal?: boolean;
};
type QueryOptions<Variables extends OperationVariables = OperationVariables, Data = any> = Partial<
    ApolloQueryOptions<Variables, Data>
> &
    CustomApolloOptions;
type QueryHookOptions<Data = any, Variables extends OperationVariables = OperationVariables> = Partial<
    ApolloQueryHookOptions<Data, Variables>
> &
    CustomApolloOptions;
type MutationHookOptions<Data = any, Variables extends OperationVariables = OperationVariables> = Partial<
    ApolloMutationHookOptions<Data, Variables>
> &
    CustomApolloOptions;
type MutationOptions<Data = any, Variables extends OperationVariables = OperationVariables> = Partial<
    ApolloMutationOptions<Data, Variables>
> &
    CustomApolloOptions;
type ApolloPaginatedMutationOptions<Data = any, Variables extends OperationVariables = OperationVariables> = Partial<
    MutationHookOptions<Data, Variables>
> & { skipRequest?: boolean };
type SubscriptionHookOptions<Data = any, Variables extends OperationVariables = OperationVariables> = Partial<
    ApolloSubscriptionHookOptions<Data, Variables>
> &
    Omit<CustomApolloOptions, 'addAbortSignal'> & { addAbortSignal?: never };

type AbortableRequest = { abortRequest: AbortController['abort'] };

type ImageRequest = { response: Promise<string>; cleanup: () => void } & AbortableRequest;

export type AbortabaleApolloQueryResponse<Data = any> = {
    response: Promise<ApolloQueryResult<MaybeMasked<Data>>>;
} & AbortableRequest;
export type AbortableApolloUseQueryResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = QueryResult<MaybeMasked<Data>, Variables> & AbortableRequest;
export type AbortableApolloUseMutationResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = [MutationTuple<Data, Variables>[0], MutationTuple<Data, Variables>[1] & AbortableRequest];
export type AbortableApolloUseMutationPaginatedResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = [
    (page: number) => Promise<FetchResult<MaybeMasked<Data>>>,
    (Omit<MutationTuple<Data, Variables>[1], 'loading'> &
        AbortableRequest & {
            size: number;
            /**
             * Indicates whether any request is currently active.
             * In case only "isLoading" is true, it means that it's the initial request
             */
            isLoading: boolean;
            /**
             * Indicates if a next page is being fetched, which is not part of the initial pages
             */
            isLoadingMore: boolean;
            /**
             * Indicates if the cached pages are currently getting revalidated
             */
            isValidating: boolean;
        })[],
];
export type AbortableApolloMutationResponse<Data = any> = {
    response: Promise<FetchResult<MaybeMasked<Data>>>;
} & AbortableRequest;

const EXTENSION_LIST_CACHE_KEY = 'useExtensionListFetch';

const CACHE_INITIAL_PAGES_FETCHING_KEY = 'GET_SOURCE_MANGAS_FETCH_FETCHING_INITIAL_PAGES';
const CACHE_PAGES_KEY = 'GET_SOURCE_MANGAS_FETCH_PAGES';
const CACHE_RESULTS_KEY = 'GET_SOURCE_MANGAS_FETCH';

export const SPECIAL_ED_SOURCES = {
    REVALIDATION: [
        '57122881048805941', // e-hentai
    ],
};

// TODO - extract logic to reduce the size of this file... grew waaaaaaaaaaaaay too big peepoFat
// TODO - correctly update cache after all mutations instead of refetching queries
export class RequestManager {
    public static readonly API_VERSION = '/api/v1/';

    public readonly graphQLClient = new GraphQLClient();

    private readonly restClient: RestClient = new RestClient();

    private readonly cache = new CustomCache();

    private readonly imageQueue = new Queue(5);

    public getClient(): IRestClient {
        return this.restClient;
    }

    public updateClient(config: RequestInit): void {
        this.restClient.updateConfig(config);
        this.graphQLClient.updateConfig();
    }

    public reset(): void {
        this.graphQLClient.client.resetStore();
        this.graphQLClient.terminateSubscriptions();
        this.cache.clear();
        this.imageQueue.clear();
    }

    public getBaseUrl(): string {
        return this.restClient.getBaseUrl();
    }

    public getValidUrlFor(endpoint: string, apiVersion: string = RequestManager.API_VERSION): string {
        return `${this.getBaseUrl()}${apiVersion}${endpoint}`;
    }

    public clearBrowseCacheFor(sourceId: string) {
        const cacheKeys = this.cache.getMatchingKeys(
            new RegExp(`${CACHE_INITIAL_PAGES_FETCHING_KEY}|${CACHE_PAGES_KEY}|${CACHE_RESULTS_KEY}.*${sourceId}`),
        );

        this.cache.clearFor(...cacheKeys);
    }

    public clearExtensionCache() {
        this.cache.clearFor(this.cache.getKeyFor(EXTENSION_LIST_CACHE_KEY, undefined));
    }

    private createAbortController(): { signal: AbortSignal } & AbortableRequest {
        const abortController = new AbortController();
        const abortRequest = (reason?: any): void => {
            if (!abortController.signal.aborted) {
                abortController.abort(reason);
            }
        };

        return { signal: abortController.signal, abortRequest };
    }

    private createPaginatedResult<Result extends AbortableApolloUseMutationPaginatedResponse[1][number]>(
        result: Partial<Result> | undefined | null,
        defaultPage: number,
        page?: number,
    ): Result {
        const isLoading = !result?.error && (result?.isLoading || !result?.called);
        const size = page ?? result?.size ?? defaultPage;
        return {
            client: this.graphQLClient.client,
            abortRequest: () => {},
            reset: () => {},
            called: false,
            data: undefined,
            error: undefined,
            size,
            isLoading,
            isLoadingMore: isLoading && size > 1,
            isValidating: !!result?.isValidating,
            ...result,
        } as Result;
    }

    private async revalidatePage<Data = any, Variables extends OperationVariables = OperationVariables>(
        sourceId: string,
        cacheResultsKey: string,
        cachePagesKey: string,
        getVariablesFor: (page: number) => Variables,
        options: ApolloPaginatedMutationOptions<Data, Variables> | undefined,
        checkIfCachedPageIsInvalid: (
            cachedResult: AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number] | undefined,
            revalidatedResult: FetchResult<MaybeMasked<Data>>,
        ) => boolean,
        hasNextPage: (revalidatedResult: FetchResult<MaybeMasked<Data>>) => boolean,
        pageToRevalidate: number,
        maxPage: number,
        signal: AbortSignal,
    ): Promise<void> {
        if (SPECIAL_ED_SOURCES.REVALIDATION.includes(sourceId)) {
            return;
        }

        const isFirstPage = pageToRevalidate === 1;
        const isTtlReached =
            Date.now() - (this.cache.getFetchTimestampFor(cacheResultsKey, getVariablesFor(pageToRevalidate)) ?? 0) >=
            1000 * 60 * 5;

        if (isFirstPage && !isTtlReached) {
            return;
        }

        const { response: revalidationRequest } = this.doRequest(
            GQLMethod.MUTATION,
            GET_SOURCE_MANGAS_FETCH,
            getVariablesFor(pageToRevalidate),
            {
                ...options,
                context: { fetchOptions: { signal } },
            },
        );

        const revalidationResponse = await revalidationRequest;
        const cachedPageData = this.cache.getResponseFor<
            AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number]
        >(cacheResultsKey, getVariablesFor(pageToRevalidate));
        const isCachedPageInvalid = checkIfCachedPageIsInvalid(cachedPageData, revalidationResponse);

        this.cache.cacheResponse(cacheResultsKey, getVariablesFor(pageToRevalidate), revalidationResponse);

        if (!hasNextPage(revalidationResponse)) {
            const currentCachedPages = this.cache.getResponseFor<Set<number>>(cachePagesKey, getVariablesFor(0))!;
            this.cache.cacheResponse(
                cachePagesKey,
                getVariablesFor(0),
                [...currentCachedPages].filter((cachedPage) => cachedPage <= pageToRevalidate),
            );
            [...currentCachedPages]
                .filter((cachedPage) => cachedPage > pageToRevalidate)
                .forEach((cachedPage) =>
                    this.cache.cacheResponse(cacheResultsKey, getVariablesFor(cachedPage), undefined),
                );
            return;
        }

        if (isCachedPageInvalid && pageToRevalidate < maxPage) {
            await this.revalidatePage(
                sourceId,
                cacheResultsKey,
                cachePagesKey,
                getVariablesFor,
                options,
                checkIfCachedPageIsInvalid,
                hasNextPage,
                pageToRevalidate + 1,
                maxPage,
                signal,
            );
        }
    }

    private async revalidatePages<Variables extends OperationVariables = OperationVariables>(
        activeRevalidationRef:
            | [ForInput: Variables, Request: Promise<unknown>, AbortRequest: AbortableRequest['abortRequest']]
            | null,
        setRevalidationDone: (isDone: boolean) => void,
        setActiveRevalidation: (
            activeRevalidation:
                | [ForInput: Variables, Request: Promise<unknown>, AbortRequest: AbortableRequest['abortRequest']]
                | null,
        ) => void,
        getVariablesFor: (page: number) => Variables,
        setValidating: (isValidating: boolean) => void,
        revalidatePage: (pageToRevalidate: number, maxPage: number, signal: AbortSignal) => Promise<void>,
        maxPage: number,
        abortRequest: AbortableRequest['abortRequest'],
        signal: AbortSignal,
    ): Promise<void> {
        setRevalidationDone(true);

        const [currRevVars, currRevPromise, currRevAbortRequest] = activeRevalidationRef ?? [];

        const isActiveRevalidationForInput = JSON.stringify(currRevVars) === JSON.stringify(getVariablesFor(0));

        setValidating(true);

        if (!isActiveRevalidationForInput) {
            currRevAbortRequest?.(new Error('Abort revalidation for different input'));
        }

        let revalidationPromise = currRevPromise;
        if (!isActiveRevalidationForInput) {
            revalidationPromise = revalidatePage(1, maxPage, signal);
            setActiveRevalidation([getVariablesFor(0), revalidationPromise, abortRequest]);
        }

        try {
            await revalidationPromise;
            setActiveRevalidation(null);
        } catch (e) {
            defaultPromiseErrorHandler(`RequestManager..revalidatePages(${getVariablesFor(0)})`)(e);
        } finally {
            setValidating(false);
        }
    }

    private async fetchPaginatedMutationPage<
        Data = any,
        Variables extends OperationVariables = OperationVariables,
        ResultIdInfo extends Record<string, any> = any,
    >(
        getVariablesFor: (page: number) => Variables,
        setAbortRequest: (abortRequest: AbortableRequest['abortRequest']) => void,
        getResultIdInfo: () => ResultIdInfo,
        createPaginatedResult: (
            result: Partial<AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number]>,
        ) => AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number],
        setResult: (
            result: AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number] & ResultIdInfo,
        ) => void,
        revalidate: (
            maxPage: number,
            abortRequest: AbortableRequest['abortRequest'],
            signal: AbortSignal,
        ) => Promise<void>,
        options: ApolloPaginatedMutationOptions<Data, Variables> | undefined,
        documentNode: DocumentNode,
        cachePagesKey: string,
        cacheResultsKey: string,
        cachedPages: Set<number>,
        newPage: number,
    ): Promise<FetchResult<MaybeMasked<Data>>> {
        const basePaginatedResult: Partial<AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number]> = {
            size: newPage,
            isLoading: false,
            isLoadingMore: false,
            called: true,
        };

        let response: FetchResult<MaybeMasked<Data>> = {};
        try {
            const { signal, abortRequest } = this.createAbortController();
            setAbortRequest(abortRequest);

            const isRefetch = newPage === [...cachedPages][cachedPages.size - 1];
            if (isRefetch) {
                this.cache.cacheResponse(
                    cachePagesKey,
                    getVariablesFor(0),
                    new Set([...cachedPages].slice(0, cachedPages.size - 1)),
                );
                this.cache.clearFor(this.cache.getKeyFor(cacheResultsKey, getVariablesFor(newPage)));
            }

            setResult({
                ...getResultIdInfo(),
                ...createPaginatedResult({ isLoading: true, abortRequest, size: newPage, called: true }),
            });

            if (newPage !== 1 && cachedPages.size) {
                await revalidate(newPage, abortRequest, signal);
            }

            const { response: request } = this.doRequest<Data, Variables>(
                GQLMethod.MUTATION,
                documentNode,
                getVariablesFor(newPage),
                { ...options, context: { fetchOptions: { signal } } },
            );

            response = await request;

            basePaginatedResult.data = response.data;
        } catch (error: any) {
            defaultPromiseErrorHandler('RequestManager::fetchPaginatedMutationPage')(error);
            if (error instanceof ApolloError) {
                basePaginatedResult.error = error;
            } else {
                basePaginatedResult.error = new ApolloError({
                    errorMessage: error?.message ?? error.toString(),
                    extraInfo: error,
                });
            }
        }

        const fetchPaginatedResult = {
            ...getResultIdInfo(),
            ...createPaginatedResult(basePaginatedResult),
        };

        setResult(fetchPaginatedResult);

        const currentCachedPages = this.cache.getResponseFor<Set<number>>(cachePagesKey, getVariablesFor(0)) ?? [];
        this.cache.cacheResponse(cachePagesKey, getVariablesFor(0), new Set([...currentCachedPages, newPage]));
        this.cache.cacheResponse(cacheResultsKey, getVariablesFor(newPage), fetchPaginatedResult);

        return response;
    }

    private fetchInitialPages<Data = any, Variables extends OperationVariables = OperationVariables>(
        options: ApolloPaginatedMutationOptions<Data, Variables> | undefined,
        areFetchingInitialPages: boolean,
        areInitialPagesFetched: boolean,
        setRevalidationDone: (isDone: boolean) => void,
        cacheFetchingInitialPagesKey: string,
        getVariablesFor: (page: number) => Variables,
        initialPages: number,
        fetchPage: (page: number) => Promise<FetchResult<Data>>,
        hasNextPage: (result: FetchResult<Data>) => boolean,
    ): void {
        useEffect(() => {
            const shouldFetchInitialPages =
                !options?.skipRequest && !areFetchingInitialPages && !areInitialPagesFetched;
            if (!shouldFetchInitialPages) {
                return;
            }

            setRevalidationDone(true);
            this.cache.cacheResponse(cacheFetchingInitialPagesKey, getVariablesFor(0), true);

            const loadInitialPages = async (initialPage: number) => {
                const areAllPagesFetched = initialPage > initialPages;
                if (areAllPagesFetched) {
                    return;
                }

                const pageResult = await fetchPage(initialPage);

                if (hasNextPage(pageResult)) {
                    await loadInitialPages(initialPage + 1);
                }
            };

            loadInitialPages(1).finally(() =>
                this.cache.cacheResponse(cacheFetchingInitialPagesKey, getVariablesFor(0), false),
            );
        }, [!options?.skipRequest, !areFetchingInitialPages, !areInitialPagesFetched]);
    }

    private returnPaginatedMutationResult<Data = any, Variables extends OperationVariables = OperationVariables>(
        areInitialPagesFetched: boolean,
        cachedResults: AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number][],
        getVariablesFor: (page: number) => Variables,
        paginatedResult: AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number],
        fetchPage: (page: number) => Promise<FetchResult<MaybeMasked<Data>>>,
        hasCachedResult: boolean,
        createPaginatedResult: (
            result: Partial<AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number]>,
        ) => AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number],
    ): AbortableApolloUseMutationPaginatedResponse<Data, Variables> {
        const doCachedResultsExist = areInitialPagesFetched && cachedResults.length;
        if (!doCachedResultsExist) {
            return [fetchPage, [paginatedResult]];
        }

        const areAllPagesCached = doCachedResultsExist && hasCachedResult;
        if (!areAllPagesCached) {
            return [fetchPage, [...cachedResults, paginatedResult]];
        }

        return [
            fetchPage,
            [
                ...cachedResults.slice(0, cachedResults.length - 1),
                createPaginatedResult({
                    ...cachedResults[cachedResults.length - 1],
                    isValidating: paginatedResult.isValidating,
                }),
            ],
        ];
    }

    private revalidateInitialPages<Variables extends OperationVariables = OperationVariables>(
        isRevalidationDone: boolean,
        cachedResultsLength: number,
        cachedPages: Set<number>,
        setRevalidationDone: (isDone: boolean) => void,
        getVariablesFor: (page: number) => Variables,
        triggerRerender: () => void,
        revalidate: (
            maxPage: number,
            abortRequest: AbortableRequest['abortRequest'],
            signal: AbortSignal,
        ) => Promise<void>,
    ): void {
        const isMountedRef = useRef(false);

        useEffect(() => {
            const isRevalidationRequired = isMountedRef.current && cachedResultsLength;
            if (!isRevalidationRequired) {
                return;
            }

            setRevalidationDone(false);
            triggerRerender();
        }, [JSON.stringify(getVariablesFor(0))]);

        useEffect(() => {
            const shouldRevalidateData = isMountedRef.current && !isRevalidationDone && cachedResultsLength;
            if (shouldRevalidateData) {
                setRevalidationDone(true);

                const { signal, abortRequest } = this.createAbortController();
                revalidate(Math.max(...cachedPages), abortRequest, signal);
            }
        }, [isMountedRef.current, isRevalidationDone]);

        useEffect(() => {
            isMountedRef.current = true;
        }, []);
    }

    public getValidImgUrlFor(imageUrl: string, apiVersion: string = ''): string {
        // server provided image urls already contain the api version
        return `${this.getValidUrlFor(imageUrl, apiVersion)}`;
    }

    /**
     * Aborts pending image requests
     *
     * prevents aborting image requests that are already in progress
     * e.g. for source image requests, ongoing requests are already handled by the server and aborting them
     * will just cause new source image requests to be sent to the server, which then will cause the server
     * to become really slow for image requests to the same source
     */
    private abortImageRequest(key: string, abort: () => void): void {
        if (this.imageQueue.isProcessing(key)) {
            return;
        }

        abort();
    }

    private async optionallyDecodeImage(url: string, shouldDecode?: boolean, disableCors?: boolean): Promise<string> {
        if (!shouldDecode) {
            return url;
        }

        const decodePromise = new ControlledPromise();

        const img = new Image();

        if (!disableCors) {
            img.crossOrigin = 'anonymous';
        }
        img.src = url;

        img.onload = async () => {
            try {
                await img.decode();
            } catch (error) {
                decodePromise.reject(error);
            }

            decodePromise.resolve();
        };

        img.onerror = (error) => decodePromise.reject(error);
        img.onabort = (error) => decodePromise.reject(error);

        await decodePromise.promise;

        return url;
    }

    private fetchImageViaTag(
        url: string,
        {
            priority,
            shouldDecode,
            disableCors,
        }: { priority?: QueuePriority; shouldDecode?: boolean; disableCors?: boolean } = {},
    ): ImageRequest {
        const imgRequest = new ControlledPromise<string>();
        imgRequest.promise.catch(() => {});

        const img = new Image();
        const abortRequest = (reason?: any) => {
            img.src = '';
            img.onload = null;
            img.onerror = null;
            img.onabort = null;
            imgRequest.reject(reason);
        };

        const { key, promise: response } = this.imageQueue.enqueue(
            url,
            async () => {
                // throws error in case request was already aborted
                await Promise.race([imgRequest.promise, Promise.resolve()]);

                if (!disableCors) {
                    img.crossOrigin = 'anonymous';
                }
                img.src = url;

                img.onload = async () => {
                    try {
                        await this.optionallyDecodeImage(url, shouldDecode);
                        imgRequest.resolve(url);
                    } catch (error) {
                        imgRequest.reject(error);
                    }
                };

                img.onerror = (error) => imgRequest.reject(error);
                img.onabort = (error) => imgRequest.reject(error);

                return imgRequest.promise;
            },
            priority,
        );

        return {
            response,
            abortRequest: (reason?: any) => this.abortImageRequest(key, () => abortRequest(reason)),
            cleanup: () => {},
        };
    }

    /**
     * After the image has been handled, {@see URL#revokeObjectURL} has to be called.
     *
     * @example
     *
     * const imageRequest = requestManager.requestImage("someUrl");
     * const imageUrl = await imageRequest.response
     *
     * const img = new Image();
     * img.onLoad = () => imageRequest.cleanup();
     * img.src = imageUrl;
     *
     */
    private fetchImageViaFetchApi(
        url: string,
        {
            priority,
            shouldDecode,
            disableCors,
        }: { priority?: QueuePriority; shouldDecode?: boolean; disableCors?: boolean } = {},
    ): ImageRequest {
        let objectUrl: string = '';
        const { abortRequest, signal } = this.createAbortController();
        const { key, promise: response } = this.imageQueue.enqueue(
            url,
            () =>
                this.restClient
                    .fetcher(url, {
                        checkResponseIsJson: false,
                        config: {
                            signal,
                            priority: 'low',
                        },
                    })
                    .then((data) => data.blob())
                    .then((data) => URL.createObjectURL(data))
                    .then(async (imageUrl) => {
                        objectUrl = imageUrl;

                        await this.optionallyDecodeImage(imageUrl, shouldDecode, disableCors);

                        return imageUrl;
                    }),
            priority,
        );

        return {
            response,
            abortRequest: (reason?: any) => this.abortImageRequest(key, () => abortRequest(reason)),
            cleanup: () => URL.revokeObjectURL(objectUrl),
        };
    }

    /**
     * Make sure to call "cleanup" once the image is not needed anymore (only required if fetched via "fetch api")
     *
     * options:
     * - shouldDecode: decodes the image in case the browser is Firefox to prevent a flickering/blinking when an image gets visible for the first time
     */
    public requestImage(
        url: string,
        options: {
            priority?: QueuePriority;
            useFetchApi?: boolean;
            shouldDecode?: boolean;
            disableCors?: boolean;
        } = {},
    ): ImageRequest {
        const finalOptions = {
            useFetchApi: false,
            shouldDecode: false,
            disableCors: false,
            ...Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)),
        };

        // on firefox images are decoded async which causes a "flicker/blinking" when they're getting visible for the first time
        // this is an issue especially in the reader because pages that should not be shown are rendered but
        // not displayed, which then causes this issue once they get displayed
        const shouldDecode = finalOptions.shouldDecode && navigator.userAgent.toLowerCase().includes('firefox');

        if (finalOptions.useFetchApi) {
            return this.fetchImageViaFetchApi(url, { ...finalOptions, shouldDecode });
        }

        return this.fetchImageViaTag(url, { ...finalOptions, shouldDecode });
    }

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.QUERY,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: QueryOptions<Variables, Data>,
    ): AbortabaleApolloQueryResponse<Data>;

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.USE_QUERY,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables>;

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.USE_MUTATION,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: MutationHookOptions<Data, Variables>,
    ): AbortableApolloUseMutationResponse<Data, Variables>;

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.MUTATION,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: MutationOptions<Data, Variables>,
    ): AbortableApolloMutationResponse<Data>;

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.USE_SUBSCRIPTION,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: SubscriptionHookOptions<Data, Variables>,
    ): SubscriptionResult<Data, Variables>;

    private doRequest<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod,
        operation: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?:
            | QueryOptions<Variables, Data>
            | QueryHookOptions<Data, Variables>
            | MutationHookOptions<Data, Variables>
            | MutationOptions<Data, Variables>
            | SubscriptionHookOptions<Data, Variables>,
    ):
        | AbortabaleApolloQueryResponse<Data>
        | AbortableApolloUseQueryResponse<Data, Variables>
        | AbortableApolloUseMutationResponse<Data, Variables>
        | AbortableApolloMutationResponse<Data>
        | SubscriptionResult<Data, Variables> {
        const { signal, abortRequest } = this.createAbortController();
        switch (method) {
            case GQLMethod.QUERY:
                return {
                    response: this.graphQLClient.client.query<Data, Variables>({
                        query: operation,
                        variables,
                        ...(options as QueryOptions<Variables, Data>),
                        context: {
                            ...options?.context,
                            fetchOptions: {
                                signal: options?.addAbortSignal ? signal : undefined,
                                ...options?.context?.fetchOptions,
                            },
                        },
                    }),
                    abortRequest,
                };
            case GQLMethod.USE_QUERY:
                return {
                    ...useQuery<Data, Variables>(operation, {
                        variables,
                        client: this.graphQLClient.client,
                        ...options,
                        context: {
                            ...options?.context,
                            fetchOptions: {
                                signal: options?.addAbortSignal ? signal : undefined,
                                ...options?.context?.fetchOptions,
                            },
                        },
                    }),
                    abortRequest,
                };
            case GQLMethod.USE_MUTATION:
                // eslint-disable-next-line no-case-declarations
                const mutationResult = useMutation<Data, Variables>(operation, {
                    variables,
                    client: this.graphQLClient.client,
                    ...(options as MutationHookOptions<Data, Variables>),
                    context: {
                        ...options?.context,
                        fetchOptions: {
                            signal: options?.addAbortSignal ? signal : undefined,
                            ...options?.context?.fetchOptions,
                        },
                    },
                });

                return [mutationResult[0], { ...mutationResult[1], abortRequest }];
            case GQLMethod.MUTATION:
                return {
                    response: this.graphQLClient.client.mutate<Data, Variables>({
                        mutation: operation,
                        variables,
                        ...(options as MutationOptions<Data, Variables>),
                        context: {
                            ...options?.context,
                            fetchOptions: {
                                signal: options?.addAbortSignal ? signal : undefined,
                                ...options?.context?.fetchOptions,
                            },
                        },
                    }),
                    abortRequest,
                };
            case GQLMethod.USE_SUBSCRIPTION:
                return useSubscription<Data, Variables>(operation, {
                    client: this.graphQLClient.client,
                    variables,
                    ...(options as SubscriptionHookOptions<Data, Variables>),
                });
            default:
                throw new Error(`unexpected GQLRequest type "${method}"`);
        }
    }

    public getGlobalMeta(
        options?: QueryOptions<GetGlobalMetadatasQueryVariables, GetGlobalMetadatasQuery>,
    ): AbortabaleApolloQueryResponse<GetGlobalMetadatasQuery> {
        return this.doRequest(GQLMethod.QUERY, GET_GLOBAL_METADATAS, {}, options);
    }

    public useGetGlobalMeta(
        options?: QueryHookOptions<GetGlobalMetadatasQuery, GetGlobalMetadatasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetGlobalMetadatasQuery, GetGlobalMetadatasQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_GLOBAL_METADATAS, {}, options);
    }

    public setGlobalMetadata(
        key: string,
        value: any,
        options?: MutationOptions<SetGlobalMetadataMutation, SetGlobalMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<SetGlobalMetadataMutation> {
        return this.doRequest<SetGlobalMetadataMutation, SetGlobalMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_GLOBAL_METADATA,
            { input: { meta: { key, value: `${value}` } } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    setGlobalMeta: {
                        __typename: 'SetGlobalMetaPayload',
                        meta: {
                            __typename: 'GlobalMetaType',
                            key,
                            value: `${value}`,
                        },
                    },
                },
                update(cache, { data }) {
                    cache.modify({
                        fields: {
                            metas(existingMetas, { readField }) {
                                if (!existingMetas) {
                                    return existingMetas;
                                }

                                if (!data?.setGlobalMeta) {
                                    return existingMetas;
                                }

                                const exists = existingMetas.nodes.some(
                                    (meta: Reference) => readField('key', meta) === key,
                                );
                                if (exists) {
                                    return existingMetas;
                                }

                                const newMetaRef = cache.writeFragment({
                                    data: data!.setGlobalMeta.meta,
                                    fragment: GLOBAL_METADATA,
                                });

                                return {
                                    ...existingMetas,
                                    nodes: [...existingMetas.nodes, newMetaRef],
                                };
                            },
                        },
                    });
                },
                ...options,
            },
        );
    }

    public deleteGlobalMeta(
        key: string,
        options?: MutationOptions<DeleteGlobalMetadataMutation, DeleteGlobalMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteGlobalMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            DELETE_GLOBAL_METADATA,
            { input: { key } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteGlobalMeta: {
                        __typename: 'DeleteGlobalMetaPayload',
                        meta: {
                            __typename: 'GlobalMetaType',
                            key,
                            value: '',
                        },
                    },
                },
                update(cache) {
                    cache.evict({ id: cache.identify({ __typename: 'GlobalMetaType', key }) });
                },
                ...options,
            },
        );
    }

    public useGetAbout(
        options?: QueryHookOptions<GetAboutQuery, GetAboutQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetAboutQuery, GetAboutQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_ABOUT, {}, options);
    }

    public useCheckForServerUpdate(
        options?: QueryHookOptions<CheckForServerUpdatesQuery, CheckForServerUpdatesQueryVariables>,
    ): AbortableApolloUseQueryResponse<CheckForServerUpdatesQuery, CheckForServerUpdatesQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, CHECK_FOR_SERVER_UPDATES, {}, options);
    }

    public useCheckForWebUIUpdate(
        options?: QueryHookOptions<CheckForWebuiUpdateQuery, CheckForWebuiUpdateQueryVariables>,
    ): AbortableApolloUseQueryResponse<CheckForWebuiUpdateQuery, CheckForWebuiUpdateQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, CHECK_FOR_WEBUI_UPDATE, {}, options);
    }

    public updateWebUI(
        options?: MutationOptions<UpdateWebuiMutation, UpdateWebuiMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateWebuiMutation> {
        return this.doRequest(GQLMethod.MUTATION, UPDATE_WEBUI, undefined, options);
    }

    public useGetExtensionList(
        options?: QueryHookOptions<GetExtensionsQuery, GetExtensionsQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetExtensionsQuery, GetExtensionsQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_EXTENSIONS, {}, options);
    }

    public useExtensionListFetch(
        options?: MutationHookOptions<GetExtensionsFetchMutation, GetExtensionsFetchMutationVariables>,
    ): AbortableApolloUseMutationResponse<GetExtensionsFetchMutation, GetExtensionsFetchMutationVariables> {
        const [mutate, result] = this.doRequest(
            GQLMethod.USE_MUTATION,
            GET_EXTENSIONS_FETCH,
            {},
            { refetchQueries: [GET_EXTENSIONS], ...options },
        );
        const [, setUpdatedCache] = useState({});

        useEffect(() => {
            if (result.loading) {
                return;
            }

            if (!result.data?.fetchExtensions?.extensions) {
                return;
            }

            this.cache.cacheResponse(EXTENSION_LIST_CACHE_KEY, undefined, result);
            setUpdatedCache({});
        }, [result.loading]);

        const cachedResult = this.cache.getResponseFor<typeof result>(EXTENSION_LIST_CACHE_KEY, undefined, 1000 * 60);
        const normalizedCachedResult = useMemo(
            () =>
                !cachedResult
                    ? result
                    : {
                          ...cachedResult,
                          data: !cachedResult?.data?.fetchExtensions?.extensions
                              ? cachedResult?.data
                              : {
                                    ...cachedResult.data,
                                    fetchExtensions: {
                                        ...cachedResult.data.fetchExtensions,
                                        extensions: cachedResult.data.fetchExtensions.extensions.map(
                                            (extension) =>
                                                this.graphQLClient.client.cache.readFragment<
                                                    NonNullable<
                                                        GetExtensionsFetchMutation['fetchExtensions']
                                                    >['extensions'][0]
                                                >({
                                                    id: this.graphQLClient.client.cache.identify(extension),
                                                    fragment: EXTENSION_LIST_FIELDS,
                                                }) ?? extension,
                                        ),
                                    },
                                },
                      },
            [this.cache.getFetchTimestampFor(EXTENSION_LIST_CACHE_KEY, undefined), result.loading],
        );

        const wrappedMutate = async (mutateOptions: Parameters<typeof mutate>[0]) => {
            if (cachedResult) {
                return normalizedCachedResult;
            }

            return mutate(mutateOptions);
        };

        return [wrappedMutate, normalizedCachedResult];
    }

    public installExternalExtension(
        extensionFile: File,
        options?: MutationOptions<InstallExternalExtensionMutation, InstallExternalExtensionMutationVariables>,
    ): AbortableApolloMutationResponse<InstallExternalExtensionMutation> {
        const result = this.doRequest<InstallExternalExtensionMutation, InstallExternalExtensionMutationVariables>(
            GQLMethod.MUTATION,
            INSTALL_EXTERNAL_EXTENSION,
            { file: extensionFile },
            { refetchQueries: [GET_EXTENSIONS], ...options },
        );

        result.response.then((response) => {
            if (!response.data?.installExternalExtension?.extension) {
                return;
            }

            this.graphQLClient.client.cache.evict({ fieldName: 'sources' });
            const cachedExtensions = this.cache.getResponseFor<MutationResult<GetExtensionsFetchMutation>>(
                EXTENSION_LIST_CACHE_KEY,
                undefined,
            );

            const installedExtension = response.data?.installExternalExtension.extension;

            if (!cachedExtensions || !cachedExtensions.data) {
                this.cache.cacheResponse(EXTENSION_LIST_CACHE_KEY, undefined, {
                    data: {
                        fetchExtensions: {
                            extensions: [installedExtension],
                        },
                    },
                });
                return;
            }

            const isExtensionCached = !!cachedExtensions.data.fetchExtensions?.extensions.find(
                (extension) => installedExtension?.pkgName === extension.pkgName,
            );

            const updatedCachedExtensions: MutationResult<GetExtensionsFetchMutation> = {
                ...cachedExtensions,
                data: {
                    ...cachedExtensions.data,
                    fetchExtensions: {
                        ...cachedExtensions.data.fetchExtensions,
                        extensions: isExtensionCached
                            ? cachedExtensions.data.fetchExtensions!.extensions.map((extension) => {
                                  const isUpdatedExtension = installedExtension?.pkgName === extension.pkgName;
                                  if (!isUpdatedExtension) {
                                      return extension;
                                  }

                                  return {
                                      ...extension,
                                      ...installedExtension,
                                      hasUpdate: installedExtension?.versionCode < extension.versionCode,
                                  };
                              })
                            : [
                                  ...(cachedExtensions.data.fetchExtensions?.extensions ?? []),
                                  installedExtension as NonNullable<
                                      GetExtensionsFetchMutation['fetchExtensions']
                                  >['extensions'][number],
                              ],
                    },
                },
            };

            this.cache.cacheResponse(EXTENSION_LIST_CACHE_KEY, undefined, updatedCachedExtensions);
        });

        return result;
    }

    public updateExtension(
        id: string,
        { isObsolete = false, ...patch }: UpdateExtensionPatchInput & { isObsolete?: boolean },
        options?: MutationOptions<UpdateExtensionMutation, UpdateExtensionMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateExtensionMutation> {
        const result = this.doRequest<UpdateExtensionMutation, UpdateExtensionMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_EXTENSION,
            { input: { id, patch } },
            options,
        );

        result.response.then((response) => {
            if (response.errors) {
                return;
            }

            this.graphQLClient.client.cache.evict({ fieldName: 'sources' });
            const cachedExtensions = this.cache.getResponseFor<MutationResult<GetExtensionsFetchMutation>>(
                EXTENSION_LIST_CACHE_KEY,
                undefined,
            );

            if (!cachedExtensions || !cachedExtensions.data) {
                return;
            }

            const updatedCachedExtensions: MutationResult<GetExtensionsFetchMutation> = {
                ...cachedExtensions,
                data: {
                    ...cachedExtensions.data,
                    fetchExtensions: {
                        ...cachedExtensions.data.fetchExtensions,
                        extensions:
                            cachedExtensions.data.fetchExtensions?.extensions
                                .filter((extension) => {
                                    if (!isObsolete) {
                                        return true;
                                    }

                                    const isUpdatedExtension = id === extension.pkgName;
                                    return !isUpdatedExtension;
                                })
                                .map((extension) => {
                                    const isUpdatedExtension = id === extension.pkgName;
                                    if (!isUpdatedExtension) {
                                        return extension;
                                    }

                                    return {
                                        ...extension,
                                        ...(response.data?.updateExtension?.extension ?? []),
                                    };
                                }) ?? [],
                    },
                },
            };

            this.cache.cacheResponse(EXTENSION_LIST_CACHE_KEY, undefined, updatedCachedExtensions);
        });

        return result;
    }

    public updateExtensions(
        ids: string[],
        { isObsolete = false, ...patch }: UpdateExtensionPatchInput & { isObsolete?: boolean },
        options?: MutationOptions<UpdateExtensionsMutation, UpdateExtensionsMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateExtensionsMutation> {
        const result = this.doRequest<UpdateExtensionsMutation, UpdateExtensionsMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_EXTENSIONS,
            { input: { ids, patch } },
            options,
        );

        result.response.then((response) => {
            if (response.errors) {
                return;
            }

            this.graphQLClient.client.cache.evict({ fieldName: 'sources' });
            const cachedExtensions = this.cache.getResponseFor<MutationResult<GetExtensionsFetchMutation>>(
                EXTENSION_LIST_CACHE_KEY,
                undefined,
            );

            if (!cachedExtensions || !cachedExtensions.data) {
                return;
            }

            const updatedCachedExtensions: MutationResult<GetExtensionsFetchMutation> = {
                ...cachedExtensions,
                data: {
                    ...cachedExtensions.data,
                    fetchExtensions: {
                        ...cachedExtensions.data.fetchExtensions,
                        extensions:
                            cachedExtensions.data.fetchExtensions?.extensions
                                .filter((extension) => {
                                    if (!isObsolete) {
                                        return true;
                                    }

                                    const isUpdatedExtension = ids.includes(extension.pkgName);
                                    return !isUpdatedExtension;
                                })
                                .map((extension) => {
                                    const isUpdatedExtension = ids.includes(extension.pkgName);
                                    if (!isUpdatedExtension) {
                                        return extension;
                                    }

                                    return {
                                        ...extension,
                                        ...(response.data?.updateExtensions?.extensions.find(
                                            (updatedExtension) => updatedExtension.pkgName === extension.pkgName,
                                        ) ?? []),
                                    };
                                }) ?? [],
                    },
                },
            };

            this.cache.cacheResponse(EXTENSION_LIST_CACHE_KEY, undefined, updatedCachedExtensions);
        });

        return result;
    }

    public getExtensionIconUrl(extension: string): string {
        return this.getValidImgUrlFor(`extension/icon/${extension}`);
    }

    public useGetSourceList(
        options?: QueryHookOptions<GetSourcesListQuery, GetSourcesListQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetSourcesListQuery, GetSourcesListQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_SOURCES_LIST, {}, options);
    }

    public useGetSource<Data, Variables extends OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        id: string,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest(GQLMethod.USE_QUERY, document, { id } as unknown as Variables, options);
    }

    public setSourceMeta(
        sourceId: string,
        key: string,
        value: any,
        options?: MutationOptions<SetSourceMetadataMutation, SetSourceMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<SetSourceMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            SET_SOURCE_METADATA,
            {
                input: { meta: { sourceId, key, value: `${value}` } },
            },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    setSourceMeta: {
                        __typename: 'SetSourceMetaPayload',
                        meta: {
                            __typename: 'SourceMetaType',
                            sourceId,
                            key,
                            value: `${value}`,
                        },
                    },
                },
                update(cache, { data }) {
                    cache.modify({
                        id: cache.identify({ __typename: 'SourceType', id: sourceId }),
                        fields: {
                            meta(existingMetas, { readField }) {
                                return updateMetadataList(key, existingMetas, readField, () =>
                                    cache.writeFragment({
                                        data: data!.setSourceMeta!.meta,
                                        fragment: SOURCE_META_FIELDS,
                                    }),
                                );
                            },
                        },
                    });
                },
                ...options,
            },
        );
    }

    public deleteSourceMeta(
        sourceId: string,
        key: string,
        options?: MutationOptions<DeleteSourceMetadataMutation, DeleteSourceMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteSourceMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            DELETE_SOURCE_METADATA,
            { input: { sourceId, key } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteSourceMeta: {
                        __typename: 'DeleteSourceMetaPayload',
                        meta: {
                            __typename: 'SourceMetaType',
                            sourceId,
                            key,
                            value: '',
                        },
                    },
                },
                update(cache) {
                    cache.evict({ id: cache.identify({ __typename: 'SourceMetaType', sourceId, key }) });
                },
                ...options,
            },
        );
    }

    public useGetSourceMangas(
        input: FetchSourceMangaInput,
        initialPages: number = 1,
        options?: ApolloPaginatedMutationOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        type MutationResult = AbortableApolloUseMutationPaginatedResponse<
            GetSourceMangasFetchMutation,
            GetSourceMangasFetchMutationVariables
        >[1];
        type MutationDataResult = MutationResult[number];

        const createPaginatedResult = (
            result?: Partial<AbortableApolloUseMutationPaginatedResponse[1][number]> | null,
            page?: number,
        ) => this.createPaginatedResult(result, input.page, page);

        const getVariablesFor = (page: number): GetSourceMangasFetchMutationVariables => ({
            input: {
                ...input,
                page,
            },
        });

        const isRevalidationDoneRef = useRef(false);
        const activeRevalidationRef = useRef<
            | [
                  ForInput: GetSourceMangasFetchMutationVariables,
                  Request: Promise<unknown>,
                  AbortRequest: AbortableRequest['abortRequest'],
              ]
            | null
        >(null);
        const abortRequestRef = useRef<AbortableRequest['abortRequest']>(() => {});
        const resultRef = useRef<(MutationDataResult & { forInput: string }) | null>(null);
        const result = resultRef.current;

        const [, setTriggerRerender] = useState(0);
        const triggerRerender = () => setTriggerRerender((prev) => prev + 1);
        const setResult = (nextResult: typeof resultRef.current) => {
            resultRef.current = nextResult;
            triggerRerender();
        };

        const cachedPages = this.cache.getResponseFor<Set<number>>(CACHE_PAGES_KEY, getVariablesFor(0)) ?? new Set();
        const cachedResults = [...cachedPages]
            .map(
                (cachedPage) =>
                    this.cache.getResponseFor<MutationDataResult>(CACHE_RESULTS_KEY, getVariablesFor(cachedPage))!,
            )
            .sort((a, b) => a.size - b.size);
        const areFetchingInitialPages = !!this.cache.getResponseFor<boolean>(
            CACHE_INITIAL_PAGES_FETCHING_KEY,
            getVariablesFor(0),
        );

        const areInitialPagesFetched =
            cachedResults.length >= initialPages ||
            (!!cachedResults.length && !cachedResults[cachedResults.length - 1].data?.fetchSourceManga?.hasNextPage);
        const isResultForCurrentInput = result?.forInput === JSON.stringify(getVariablesFor(0));
        const lastPage = cachedPages.size ? Math.max(...cachedPages) : input.page;
        const nextPage = isResultForCurrentInput ? result.size : lastPage;

        const paginatedResult =
            isResultForCurrentInput && areInitialPagesFetched ? result : createPaginatedResult(undefined, nextPage);
        paginatedResult.abortRequest = abortRequestRef.current;

        // make sure that the result is always for the current input
        resultRef.current = { forInput: JSON.stringify(getVariablesFor(0)), ...paginatedResult };

        const hasCachedResult = !!this.cache.getResponseFor(CACHE_RESULTS_KEY, getVariablesFor(nextPage));

        const revalidatePage = async (pageToRevalidate: number, maxPage: number, signal: AbortSignal) =>
            this.revalidatePage(
                input.source,
                CACHE_RESULTS_KEY,
                CACHE_PAGES_KEY,
                getVariablesFor,
                options,
                (cachedResult, revalidatedResult) =>
                    !cachedResult ||
                    !cachedResult.data?.fetchSourceManga?.mangas.length ||
                    cachedResult.data.fetchSourceManga.mangas.some(
                        (manga, index) => manga.id !== revalidatedResult.data?.fetchSourceManga?.mangas[index]?.id,
                    ),
                (revalidatedResult) => !!revalidatedResult.data?.fetchSourceManga?.hasNextPage,
                pageToRevalidate,
                maxPage,
                signal,
            );

        const revalidate = async (
            maxPage: number,
            abortRequest: AbortableRequest['abortRequest'],
            signal: AbortSignal,
        ) =>
            this.revalidatePages(
                activeRevalidationRef.current,
                (isDone) => {
                    isRevalidationDoneRef.current = isDone;
                },
                (activeRevalidation) => {
                    activeRevalidationRef.current = activeRevalidation;
                },
                getVariablesFor,
                (isValidating) => {
                    setResult({
                        ...createPaginatedResult(resultRef.current),
                        isValidating,
                        forInput: JSON.stringify(getVariablesFor(0)),
                    });
                },
                revalidatePage,
                maxPage,
                abortRequest,
                signal,
            );

        // wrap "mutate" function to align with the expected type, which allows only passing a "page" argument
        const wrappedMutate = async (newPage: number) =>
            this.fetchPaginatedMutationPage<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>(
                getVariablesFor,
                (abortRequest) => {
                    abortRequestRef.current = abortRequest;
                },
                () => ({ forType: input.type, forQuery: input.query }),
                createPaginatedResult,
                setResult,
                revalidate,
                options,
                GET_SOURCE_MANGAS_FETCH,
                CACHE_PAGES_KEY,
                CACHE_RESULTS_KEY,
                cachedPages,
                newPage,
            );

        this.fetchInitialPages(
            options,
            areFetchingInitialPages,
            areInitialPagesFetched,
            (isDone) => {
                isRevalidationDoneRef.current = isDone;
            },
            CACHE_INITIAL_PAGES_FETCHING_KEY,
            getVariablesFor,
            initialPages,
            wrappedMutate,
            (fetchedResult) => !!fetchedResult.data?.fetchSourceManga?.hasNextPage,
        );

        this.revalidateInitialPages(
            isRevalidationDoneRef.current,
            cachedResults.length,
            cachedPages,
            (isDone) => {
                isRevalidationDoneRef.current = isDone;
            },
            getVariablesFor,
            triggerRerender,
            revalidate,
        );

        const normalizedCachedResults = cachedResults.map((cachedResult) => {
            const hasResults = !!cachedResult.data?.fetchSourceManga?.mangas;
            if (!hasResults) {
                return cachedResult;
            }

            return {
                ...cachedResult,
                data: {
                    ...cachedResult.data,
                    fetchSourceManga: {
                        ...cachedResult.data?.fetchSourceManga,
                        mangas: cachedResult.data?.fetchSourceManga?.mangas.map(
                            (manga) =>
                                this.graphQLClient.client.cache.readFragment<typeof manga>({
                                    id: this.graphQLClient.client.cache.identify(manga),
                                    fragment: MANGA_BASE_FIELDS,
                                    fragmentName: 'MANGA_BASE_FIELDS',
                                }) ?? manga,
                        ),
                    },
                },
            };
        });

        return this.returnPaginatedMutationResult(
            areInitialPagesFetched,
            normalizedCachedResults,
            getVariablesFor,
            paginatedResult,
            wrappedMutate,
            hasCachedResult,
            createPaginatedResult,
        );
    }

    public useGetSourcePopularMangas(
        sourceId: string,
        initialPages?: number,
        options?: ApolloPaginatedMutationOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        return this.useGetSourceMangas(
            { type: FetchSourceMangaType.Popular, source: sourceId, page: 1 },
            initialPages,
            options,
        );
    }

    public useGetSourceLatestMangas(
        sourceId: string,
        initialPages?: number,
        options?: ApolloPaginatedMutationOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        return this.useGetSourceMangas(
            { type: FetchSourceMangaType.Latest, source: sourceId, page: 1 },
            initialPages,
            options,
        );
    }

    public setSourcePreferences(
        source: string,
        change: SourcePreferenceChangeInput,
        options?: MutationOptions<UpdateSourcePreferencesMutation, UpdateSourcePreferencesMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateSourcePreferencesMutation> {
        return this.doRequest(GQLMethod.MUTATION, UPDATE_SOURCE_PREFERENCES, { input: { source, change } }, options);
    }

    public useSourceSearch(
        source: string,
        query?: string,
        filters?: FilterChangeInput[],
        initialPages?: number,
        options?: ApolloPaginatedMutationOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        return this.useGetSourceMangas(
            { type: FetchSourceMangaType.Search, source, query, filters, page: 1 },
            initialPages,
            options,
        );
    }

    public useGetManga<Data, Variables extends OperationVariables = OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        mangaId: number | string,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest(GQLMethod.USE_QUERY, document, { id: Number(mangaId) } as unknown as Variables, options);
    }

    public getManga<Data, Variables extends OperationVariables = OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        mangaId: number | string,
        options?: QueryOptions<Variables, Data>,
    ): AbortabaleApolloQueryResponse<Data> {
        return this.doRequest(GQLMethod.QUERY, document, { id: Number(mangaId) } as unknown as Variables, options);
    }

    public getMangaToMigrate(
        mangaId: number | string,
        {
            migrateChapters = false,
            migrateCategories = false,
            migrateTracking = false,
            deleteChapters = false,
            apolloOptions: options,
        }: Partial<MetadataMigrationSettings> & {
            apolloOptions?: QueryOptions<GetMangaToMigrateQueryVariables, GetMangaToMigrateQuery>;
        } = {},
    ): AbortabaleApolloQueryResponse<GetMangaToMigrateQuery> {
        return this.doRequest(
            GQLMethod.QUERY,
            GET_MANGA_TO_MIGRATE,
            {
                id: Number(mangaId),
                getChapterData: migrateChapters || deleteChapters,
                migrateCategories,
                migrateTracking,
            },
            options,
        );
    }

    public getMangaFetch(
        mangaId: number | string,
        options?: MutationOptions<GetMangaFetchMutation, GetMangaFetchMutationVariables>,
    ): AbortableApolloMutationResponse<GetMangaFetchMutation> {
        return this.doRequest<GetMangaFetchMutation, GetMangaFetchMutationVariables>(
            GQLMethod.MUTATION,
            GET_MANGA_FETCH,
            {
                input: {
                    id: Number(mangaId),
                },
            },
            options,
        );
    }

    public getMangaToMigrateToFetch(
        mangaId: number | string,
        {
            migrateChapters = false,
            migrateCategories = false,
            migrateTracking = false,
            apolloOptions: options,
        }: Partial<Omit<MetadataMigrationSettings, 'deleteChapters'>> & {
            apolloOptions?: MutationOptions<
                GetMangaToMigrateToFetchMutation,
                GetMangaToMigrateToFetchMutationVariables
            >;
        } = {},
    ): AbortableApolloMutationResponse<GetMangaToMigrateToFetchMutation> {
        return this.doRequest<GetMangaToMigrateToFetchMutation, GetMangaToMigrateToFetchMutationVariables>(
            GQLMethod.MUTATION,
            GET_MANGA_TO_MIGRATE_TO_FETCH,
            {
                id: Number(mangaId),
                migrateChapters,
                migrateCategories,
                migrateTracking,
            },
            options,
        );
    }

    public useGetMangas<Data, Variables extends OperationVariables = OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest(GQLMethod.USE_QUERY, document, variables, options);
    }

    public getMangas<Data, Variables extends OperationVariables = OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: QueryOptions<Variables, Data>,
    ): AbortabaleApolloQueryResponse<Data> {
        return this.doRequest(GQLMethod.QUERY, document, variables, options);
    }

    public useGetMigratableSourceMangas(
        sourceId: string,
        options?: QueryHookOptions<GetMigratableSourceMangasQuery, GetMigratableSourceMangasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMigratableSourceMangasQuery, GetMigratableSourceMangasQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_MIGRATABLE_SOURCE_MANGAS, { sourceId }, options);
    }

    public useUpdateMangaCategories(
        options?: MutationHookOptions<UpdateMangaCategoriesMutation, UpdateMangaCategoriesMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateMangaCategoriesMutation, UpdateMangaCategoriesMutationVariables> {
        const [mutate, result] = this.doRequest(GQLMethod.USE_MUTATION, UPDATE_MANGA_CATEGORIES, undefined, options);

        const wrappedMutate = (mutateOptions: Parameters<typeof mutate>[0]) =>
            mutate({
                onCompleted: () => {
                    this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'categories' });
                    this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'mangas' });
                },
                ...mutateOptions,
            });

        return [wrappedMutate, result];
    }

    public updateMangasCategories(
        mangaIds: number[],
        patch: UpdateMangaCategoriesPatchInput,
        options?: MutationOptions<UpdateMangasCategoriesMutation, UpdateMangasCategoriesMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateMangasCategoriesMutation> {
        const response = this.doRequest(
            GQLMethod.MUTATION,
            UPDATE_MANGAS_CATEGORIES,
            { input: { ids: mangaIds, patch } },
            options,
        );

        response.response.then(() => {
            this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'categories' });
            this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'mangas' });
        });

        return response;
    }

    public updateManga(
        id: number,
        patch: { updateManga: UpdateMangaPatchInput; updateMangaCategories?: UpdateMangaCategoriesPatchInput },
        options?: MutationOptions<UpdateMangaMutation, UpdateMangaMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateMangaMutation> {
        const result = this.doRequest<UpdateMangaMutation, UpdateMangaMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_MANGA,
            {
                input: { id, patch: patch.updateManga },
                updateCategoryInput: { id, patch: patch.updateMangaCategories ?? {} },
                updateCategories: !!patch.updateMangaCategories,
            },
            options,
        );

        result.response.then(() => {
            this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'categories' });
            this.graphQLClient.client.cache.evict({ broadcast: true, fieldName: 'mangas' });
        });

        return result;
    }

    public updateMangas(
        ids: number[],
        patch: { updateMangas: UpdateMangaPatchInput; updateMangasCategories?: UpdateMangaCategoriesPatchInput },
        options?: MutationOptions<UpdateMangasMutation, UpdateMangasMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateMangasMutation> {
        const result = this.doRequest<UpdateMangasMutation, UpdateMangasMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_MANGAS,
            {
                input: { ids, patch: patch.updateMangas },
                updateCategoryInput: { ids, patch: patch.updateMangasCategories ?? {} },
                updateCategories: !!patch.updateMangasCategories,
            },
            options,
        );

        result.response.then(() => {
            this.graphQLClient.client.cache.evict({ fieldName: 'categories' });
            this.graphQLClient.client.cache.evict({ fieldName: 'category' });
            this.graphQLClient.client.cache.evict({ fieldName: 'mangas' });
        });

        return result;
    }

    public setMangaMeta(
        mangaId: number,
        key: string,
        value: any,
        options?: MutationOptions<SetMangaMetadataMutation, SetMangaMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<SetMangaMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            SET_MANGA_METADATA,
            {
                input: { meta: { mangaId, key, value: `${value}` } },
            },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    setMangaMeta: {
                        __typename: 'SetMangaMetaPayload',
                        meta: {
                            __typename: 'MangaMetaType',
                            mangaId,
                            key,
                            value: `${value}`,
                        },
                    },
                },
                update(cache, { data }) {
                    cache.modify({
                        id: cache.identify({ __typename: 'MangaType', id: mangaId }),
                        fields: {
                            meta(existingMetas, { readField }) {
                                return updateMetadataList(key, existingMetas, readField, () =>
                                    cache.writeFragment({
                                        data: data!.setMangaMeta!.meta,
                                        fragment: MANGA_META_FIELDS,
                                    }),
                                );
                            },
                        },
                    });
                },
                ...options,
            },
        );
    }

    public deleteMangaMeta(
        mangaId: number,
        key: string,
        options?: MutationOptions<DeleteMangaMetadataMutation, DeleteMangaMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteMangaMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            DELETE_MANGA_METADATA,
            { input: { mangaId, key } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteMangaMeta: {
                        __typename: 'DeleteMangaMetaPayload',
                        meta: {
                            __typename: 'MangaMetaType',
                            mangaId,
                            key,
                            value: '',
                        },
                    },
                },
                update(cache) {
                    cache.evict({ id: cache.identify({ __typename: 'MangaMetaType', mangaId, key }) });
                },
                ...options,
            },
        );
    }

    public useGetChapters<Data, Variables extends OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest(GQLMethod.USE_QUERY, document, variables, options);
    }

    public getChapters<Data, Variables extends OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: QueryOptions<Variables, Data>,
    ): AbortabaleApolloQueryResponse<Data> {
        return this.doRequest(GQLMethod.QUERY, document, variables, options);
    }

    public useGetMangaChapters<Data, Variables extends OperationVariables = OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        mangaId: number | string,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.useGetChapters(
            document,
            {
                condition: { mangaId: Number(mangaId) },
                order: [{ by: ChapterOrderBy.SourceOrder, byType: SortOrder.Desc }],
            } satisfies GetChaptersMangaQueryVariables as unknown as Variables,
            options,
        );
    }

    public getMangasChapterIdsWithState(
        mangaIds: number[],
        states: Pick<ChapterConditionInput, 'isRead' | 'isDownloaded' | 'isBookmarked'>,
        options?: QueryOptions<GetMangasChapterIdsWithStateQueryVariables, GetMangasChapterIdsWithStateQuery>,
    ): AbortabaleApolloQueryResponse<GetMangasChapterIdsWithStateQuery> {
        return this.doRequest(
            GQLMethod.QUERY,
            GET_MANGAS_CHAPTER_IDS_WITH_STATE,
            { mangaIds, ...states },
            {
                fetchPolicy: 'no-cache',
                ...options,
            },
        );
    }

    public getMangaChaptersFetch(
        mangaId: number | string,
        options?: MutationOptions<GetMangaChaptersFetchMutation, GetMangaChaptersFetchMutationVariables>,
    ): AbortableApolloMutationResponse<GetMangaChaptersFetchMutation> {
        return this.doRequest<GetMangaChaptersFetchMutation, GetMangaChaptersFetchMutationVariables>(
            GQLMethod.MUTATION,
            GET_MANGA_CHAPTERS_FETCH,
            { input: { mangaId: Number(mangaId) } },
            { refetchQueries: [GET_CHAPTERS_MANGA], ...options },
        );
    }

    public useGetMangaChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        options?: QueryHookOptions<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>,
    ): AbortableApolloUseQueryResponse<
        Omit<GetChaptersMangaQuery, 'chapters'> & { chapter: GetChaptersMangaQuery['chapters']['nodes'][number] },
        GetChaptersMangaQueryVariables
    > {
        type Response = AbortableApolloUseQueryResponse<
            Omit<GetChaptersMangaQuery, 'chapters'> & { chapter: GetChaptersMangaQuery['chapters']['nodes'][number] },
            GetChaptersMangaQueryVariables
        >;

        const chapterResponse = this.useGetChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
            GET_CHAPTERS_MANGA,
            { condition: { mangaId: Number(mangaId), sourceOrder: Number(chapterIndex) } },
            options,
        );

        if (!chapterResponse.data) {
            return chapterResponse as unknown as Response;
        }

        return {
            ...chapterResponse,
            data: {
                chapter: chapterResponse.data.chapters.nodes[0],
            },
        } as unknown as Response;
    }

    public useGetChapterPagesFetch(
        chapterId: string | number,
        options?: MutationHookOptions<GetChapterPagesFetchMutation, GetChapterPagesFetchMutationVariables>,
    ): AbortableApolloUseMutationResponse<GetChapterPagesFetchMutation, GetChapterPagesFetchMutationVariables> {
        return this.doRequest(
            GQLMethod.USE_MUTATION,
            GET_CHAPTER_PAGES_FETCH,
            {
                input: { chapterId: Number(chapterId) },
            },
            options,
        );
    }

    public deleteDownloadedChapter(
        id: number,
        options?: MutationOptions<DeleteDownloadedChapterMutation, DeleteDownloadedChapterMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteDownloadedChapterMutation> {
        return this.doRequest<DeleteDownloadedChapterMutation, DeleteDownloadedChapterMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_DOWNLOADED_CHAPTER,
            { input: { id } },
            options,
        );
    }

    public deleteDownloadedChapters(
        ids: number[],
        options?: MutationOptions<DeleteDownloadedChaptersMutation, DeleteDownloadedChaptersMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteDownloadedChaptersMutation> {
        return this.doRequest<DeleteDownloadedChaptersMutation, DeleteDownloadedChaptersMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_DOWNLOADED_CHAPTERS,
            { input: { ids } },
            options,
        );
    }

    public updateChapter(
        id: number,
        patch: UpdateChapterPatchInput & {
            chapterIdToDelete?: number;
            trackProgressMangaId?: number;
        },
        options?: MutationOptions<UpdateChapterMutation, UpdateChapterMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateChapterMutation> {
        const { chapterIdToDelete = -1, trackProgressMangaId = -1, ...updatePatch } = patch;

        return this.doRequest<UpdateChapterMutation, UpdateChapterMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CHAPTER,
            {
                input: { id, patch: updatePatch },
                getBookmarked: patch.isBookmarked != null,
                getRead: patch.isRead != null,
                getLastPageRead: patch.lastPageRead != null,
                chapterIdToDelete,
                deleteChapter: chapterIdToDelete >= 0,
                mangaId: trackProgressMangaId,
                trackProgress: trackProgressMangaId >= 0,
            },
            options,
        );
    }

    public setChapterMeta(
        chapterId: number,
        key: string,
        value: any,
        options?: MutationOptions<SetChapterMetadataMutation, SetChapterMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<SetChapterMetadataMutation> {
        return this.doRequest<SetChapterMetadataMutation, SetChapterMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_CHAPTER_METADATA,
            { input: { meta: { chapterId, key, value: `${value}` } } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    setChapterMeta: {
                        __typename: 'SetChapterMetaPayload',
                        meta: {
                            __typename: 'ChapterMetaType',
                            chapterId,
                            key,
                            value: `${value}`,
                        },
                    },
                },
                update(cache, { data }) {
                    cache.modify({
                        id: cache.identify({ __typename: 'ChapterType', id: chapterId }),
                        fields: {
                            meta(existingMetas, { readField }) {
                                return updateMetadataList(key, existingMetas, readField, () =>
                                    cache.writeFragment({
                                        data: data!.setChapterMeta!.meta,
                                        fragment: CHAPTER_META_FIELDS,
                                    }),
                                );
                            },
                        },
                    });
                },
                ...options,
            },
        );
    }

    public deleteChapterMeta(
        chapterId: number,
        key: string,
        options?: MutationOptions<DeleteChapterMetadataMutation, DeleteChapterMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteChapterMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            DELETE_CHAPTER_METADATA,
            { input: { chapterId, key } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteChapterMeta: {
                        __typename: 'DeleteChapterMetaPayload',
                        meta: {
                            __typename: 'ChapterMetaType',
                            chapterId,
                            key,
                            value: '',
                        },
                    },
                },
                update(cache) {
                    cache.evict({ id: cache.identify({ __typename: 'ChapterMetaType', chapterId, key }) });
                },
                ...options,
            },
        );
    }

    public getChapterPageUrl(mangaId: number | string, chapterIndex: number | string, page: number): string {
        return this.getValidImgUrlFor(
            `manga/${mangaId}/chapter/${chapterIndex}/page/${page}`,
            RequestManager.API_VERSION,
        );
    }

    public updateChapters(
        ids: number[],
        patch: UpdateChapterPatchInput & { chapterIdsToDelete?: number[]; trackProgressMangaId?: MangaIdInfo['id'] },
        options?: MutationOptions<UpdateChaptersMutation, UpdateChaptersMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateChaptersMutation> {
        const { chapterIdsToDelete = [], trackProgressMangaId = -1, ...updatePatch } = patch;

        return this.doRequest<UpdateChaptersMutation, UpdateChaptersMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CHAPTERS,
            {
                input: { ids, patch: updatePatch },
                getBookmarked: patch.isBookmarked != null,
                getRead: patch.isRead != null,
                getLastPageRead: patch.lastPageRead != null,
                chapterIdsToDelete,
                deleteChapters: !!chapterIdsToDelete.length,
                mangaId: trackProgressMangaId,
                trackProgress: trackProgressMangaId >= 0,
            },
            options,
        );
    }

    public useGetCategories<Data, Variables extends OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest<Data, Variables>(
            GQLMethod.USE_QUERY,
            document,
            {
                order: [{ by: CategoryOrderBy.Order }],
            } satisfies GetCategoriesSettingsQueryVariables as unknown as Variables,
            options,
        );
    }

    public getCategories<Data, Variables extends OperationVariables>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        options?: QueryOptions<Variables, Data>,
    ): AbortabaleApolloQueryResponse<Data> {
        return this.doRequest<Data, Variables>(
            GQLMethod.QUERY,
            document,
            {
                order: [{ by: CategoryOrderBy.Order }],
            } satisfies GetCategoriesSettingsQueryVariables as unknown as Variables,
            options,
        );
    }

    public createCategory(
        input: CreateCategoryInput,
        options?: MutationOptions<CreateCategoryMutation, CreateCategoryMutationVariables>,
    ): AbortableApolloMutationResponse<CreateCategoryMutation> {
        return this.doRequest<CreateCategoryMutation, CreateCategoryMutationVariables>(
            GQLMethod.MUTATION,
            CREATE_CATEGORY,
            { input },
            { refetchQueries: [GET_CATEGORIES_BASE, GET_CATEGORIES_LIBRARY, GET_CATEGORIES_SETTINGS], ...options },
        );
    }

    public useReorderCategory(
        options?: MutationHookOptions<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables> {
        const [mutate, result] = this.doRequest<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>(
            GQLMethod.USE_MUTATION,
            UPDATE_CATEGORY_ORDER,
            undefined,
            { refetchQueries: [GET_CATEGORIES_BASE, GET_CATEGORIES_LIBRARY], ...options },
        );

        const wrappedMutate = (mutateOptions: Parameters<typeof mutate>[0]) => {
            const variables = mutateOptions?.variables?.input;
            const cachedCategories = this.graphQLClient.client.readQuery<
                GetCategoriesSettingsQuery,
                GetCategoriesSettingsQueryVariables
            >({
                query: GET_CATEGORIES_SETTINGS,
                variables: { order: [{ by: CategoryOrderBy.Order }] },
            })?.categories.nodes;

            if (!variables) {
                throw new Error('useReorderCategory: no variables passed');
            }

            if (!cachedCategories) {
                throw new Error('useReorderCategory: there are no cached results');
            }

            const movedIndex = cachedCategories.findIndex((category) => category.id === variables.id);
            const newData = [...cachedCategories.map((category) => ({ ...category }))];
            const [removed] = newData.splice(movedIndex, 1);
            newData.splice(variables.position, 0, removed);
            removed.order = variables.position;
            newData[movedIndex].order = movedIndex;

            return mutate({
                update: (cache) => {
                    cache.updateQuery<GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables>(
                        {
                            id: cache.identify({ __typename: 'CategoryNodeList' }),
                            query: GET_CATEGORIES_SETTINGS,
                            variables: { order: [{ by: CategoryOrderBy.Order }] },
                        },
                        (data) => ({
                            ...data!,
                            categories: {
                                ...data!.categories,
                                nodes: newData,
                            },
                        }),
                    );
                },
                optimisticResponse: {
                    __typename: 'Mutation',
                    updateCategoryOrder: {
                        __typename: 'UpdateCategoryOrderPayload',
                        categories: newData,
                    },
                },
                ...mutateOptions,
            });
        };

        return [wrappedMutate, result];
    }

    public useGetCategoryMangas(
        id: number,
        options?: QueryHookOptions<GetMangasLibraryQuery, GetMangasLibraryQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMangasLibraryQuery, GetMangasLibraryQueryVariables> {
        const isDefaultCategory = id === 0;
        if (isDefaultCategory) {
            // hacky way of loading the default category mangas - some stuff won't work but since that is not used anyway, it won't be a problem
            // can't be loaded via "useGetMangas" because mangas are not actually mapped to the default category in the database
            const { data, ...result } = this.doRequest<GetCategoryMangasQuery, GetCategoryMangasQueryVariables>(
                GQLMethod.USE_QUERY,
                GET_CATEGORY_MANGAS,
                { id },
                options as QueryHookOptions<GetCategoryMangasQuery, GetCategoryMangasQueryVariables>,
            );

            return {
                ...result,
                data: data
                    ? {
                          ...data?.category,
                          __typename: 'Query',
                      }
                    : undefined,
            } as unknown as AbortableApolloUseQueryResponse<GetMangasLibraryQuery, GetMangasLibraryQueryVariables>;
        }

        return this.useGetMangas(GET_MANGAS_LIBRARY, { condition: { inLibrary: true, categoryIds: [id] } }, options);
    }

    public deleteCategory(
        categoryId: number,
        options?: MutationOptions<DeleteCategoryMutation, DeleteCategoryMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteCategoryMutation> {
        const result = this.doRequest<DeleteCategoryMutation, DeleteCategoryMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_CATEGORY,
            { input: { categoryId } },
            {
                refetchQueries: [GET_CATEGORIES_BASE, GET_CATEGORIES_LIBRARY, GET_CATEGORIES_SETTINGS],
                ...options,
            },
        );

        result.response.then(() => {
            this.graphQLClient.client.cache.evict({ fieldName: 'category', id: categoryId.toString() });
        });

        return result;
    }

    public updateCategory(
        id: number,
        patch: UpdateCategoryPatchInput,
        options?: MutationOptions<UpdateCategoryMutation, UpdateCategoryMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateCategoryMutation> {
        return this.doRequest<UpdateCategoryMutation, UpdateCategoryMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CATEGORY,
            {
                input: { id, patch },
                getIncludeInUpdate: patch.includeInUpdate != null,
                getIncludeInDownload: patch.includeInDownload != null,
                getDefault: patch.default != null,
                getName: patch.name != null,
            },
            options,
        );
    }

    public setCategoryMeta(
        categoryId: number,
        key: string,
        value: any,
        options?: MutationOptions<SetCategoryMetadataMutation, SetCategoryMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<SetCategoryMetadataMutation> {
        return this.doRequest<SetCategoryMetadataMutation, SetCategoryMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_CATEGORY_METADATA,
            { input: { meta: { categoryId, key, value: `${value}` } } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    setCategoryMeta: {
                        __typename: 'SetCategoryMetaPayload',
                        meta: {
                            __typename: 'CategoryMetaType',
                            categoryId,
                            key,
                            value: `${value}`,
                        },
                    },
                },
                update(cache, { data }) {
                    cache.modify({
                        id: cache.identify({ __typename: 'CategoryType', id: categoryId }),
                        fields: {
                            meta(existingMetas, { readField }) {
                                return updateMetadataList(key, existingMetas, readField, () =>
                                    cache.writeFragment({
                                        data: data!.setCategoryMeta!.meta,
                                        fragment: CATEGORY_META_FIELDS,
                                    }),
                                );
                            },
                        },
                    });
                },
                ...options,
            },
        );
    }

    public deleteCategoryMeta(
        categoryId: number,
        key: string,
        options?: MutationOptions<DeleteCategoryMetadataMutation, DeleteCategoryMetadataMutationVariables>,
    ): AbortableApolloMutationResponse<DeleteCategoryMetadataMutation> {
        return this.doRequest(
            GQLMethod.MUTATION,
            DELETE_CATEGORY_METADATA,
            { input: { categoryId, key } },
            {
                optimisticResponse: {
                    __typename: 'Mutation',
                    deleteCategoryMeta: {
                        __typename: 'DeleteCategoryMetaPayload',
                        meta: {
                            __typename: 'CategoryMetaType',
                            categoryId,
                            key,
                            value: '',
                        },
                    },
                },
                update(cache) {
                    cache.evict({ id: cache.identify({ __typename: 'CategoryMetaType', categoryId, key }) });
                },
                ...options,
            },
        );
    }

    public restoreBackupFile(
        file: File,
        options?: MutationOptions<RestoreBackupMutation, RestoreBackupMutationVariables>,
    ): AbortableApolloMutationResponse<RestoreBackupMutation> {
        const result = this.doRequest<RestoreBackupMutation, RestoreBackupMutationVariables>(
            GQLMethod.MUTATION,
            RESTORE_BACKUP,
            { backup: file },
            {
                ...options,
            },
        );

        result.response.then(() => {
            this.reset();
        });

        return result;
    }

    public validateBackupFile(
        file: File,
        options?: QueryOptions<ValidateBackupQueryVariables, ValidateBackupQuery>,
    ): AbortabaleApolloQueryResponse<ValidateBackupQuery> {
        return this.doRequest(GQLMethod.QUERY, VALIDATE_BACKUP, { backup: file }, options);
    }

    public useGetBackupRestoreStatus(
        id: string,
        options?: QueryHookOptions<GetRestoreStatusQuery, GetRestoreStatusQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetRestoreStatusQuery, GetRestoreStatusQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_RESTORE_STATUS, { id }, options);
    }

    public getExportBackupUrl(): string {
        return this.getValidUrlFor('backup/export/file');
    }

    public startDownloads(
        options?: MutationOptions<StartDownloaderMutation, StartDownloaderMutationVariables>,
    ): AbortableApolloMutationResponse<StartDownloaderMutation> {
        return this.doRequest<StartDownloaderMutation, StartDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            START_DOWNLOADER,
            {},
            options,
        );
    }

    public stopDownloads(
        options?: MutationOptions<StopDownloaderMutation, StopDownloaderMutationVariables>,
    ): AbortableApolloMutationResponse<StopDownloaderMutation> {
        return this.doRequest<StopDownloaderMutation, StopDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            STOP_DOWNLOADER,
            {},
            options,
        );
    }

    public clearDownloads(
        options?: MutationOptions<ClearDownloaderMutation, ClearDownloaderMutationVariables>,
    ): AbortableApolloMutationResponse<ClearDownloaderMutation> {
        return this.doRequest<ClearDownloaderMutation, ClearDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            CLEAR_DOWNLOADER,
            {},
            options,
        );
    }

    public addChapterToDownloadQueue(
        id: number,
        options?: MutationOptions<EnqueueChapterDownloadMutation, EnqueueChapterDownloadMutationVariables>,
    ): AbortableApolloMutationResponse<EnqueueChapterDownloadMutation> {
        return this.doRequest<EnqueueChapterDownloadMutation, EnqueueChapterDownloadMutationVariables>(
            GQLMethod.MUTATION,
            ENQUEUE_CHAPTER_DOWNLOAD,
            { input: { id } },
            options,
        );
    }

    public removeChapterFromDownloadQueue(
        id: number,
        options?: MutationOptions<DequeueChapterDownloadMutation, DequeueChapterDownloadMutationVariables>,
    ): AbortableApolloMutationResponse<DequeueChapterDownloadMutation> {
        return this.doRequest<DequeueChapterDownloadMutation, DequeueChapterDownloadMutationVariables>(
            GQLMethod.MUTATION,
            DEQUEUE_CHAPTER_DOWNLOAD,
            { input: { id } },
            options,
        );
    }

    public useReorderChapterInDownloadQueue(
        options?: MutationHookOptions<ReorderChapterDownloadMutation, ReorderChapterDownloadMutationVariables>,
    ): AbortableApolloUseMutationResponse<ReorderChapterDownloadMutation, ReorderChapterDownloadMutationVariables> {
        const [mutate, result] = this.doRequest(GQLMethod.USE_MUTATION, REORDER_CHAPTER_DOWNLOAD, undefined, options);

        const wrappedMutate = (mutationOptions: Parameters<typeof mutate>[0]) => {
            const variables = mutationOptions?.variables?.input;
            const cachedDownloadStatus = this.graphQLClient.client.readFragment<
                GetDownloadStatusQuery['downloadStatus']
            >({
                id: 'DownloadStatus:{}',
                fragment: DOWNLOAD_STATUS_FIELDS,
                fragmentName: 'DOWNLOAD_STATUS_FIELDS',
            });

            if (!variables) {
                throw new Error('useReorderChapterInDownloadQueue: no variables passed');
            }

            if (!cachedDownloadStatus) {
                throw new Error('useReorderChapterInDownloadQueue: there are no cached results');
            }

            const movedIndex = cachedDownloadStatus.queue.findIndex(
                ({ chapter }) => chapter.id === variables.chapterId,
            );
            const chapterDownload = cachedDownloadStatus.queue[movedIndex];
            const queueWithoutChapterDownload = cachedDownloadStatus.queue.toSpliced(movedIndex, 1);
            const updatedQueue = queueWithoutChapterDownload.toSpliced(variables.to, 0, chapterDownload);

            return mutate({
                optimisticResponse: {
                    __typename: 'Mutation',
                    reorderChapterDownload: {
                        __typename: 'ReorderChapterDownloadPayload',
                        downloadStatus: {
                            ...cachedDownloadStatus,
                            queue: updatedQueue,
                        },
                    },
                },
                ...mutationOptions,
            });
        };

        return [wrappedMutate, result];
    }

    public addChaptersToDownloadQueue(
        ids: number[],
        options?: MutationOptions<EnqueueChapterDownloadsMutation, EnqueueChapterDownloadsMutationVariables>,
    ): AbortableApolloMutationResponse<EnqueueChapterDownloadsMutation> {
        return this.doRequest<EnqueueChapterDownloadsMutation, EnqueueChapterDownloadsMutationVariables>(
            GQLMethod.MUTATION,
            ENQUEUE_CHAPTER_DOWNLOADS,
            { input: { ids } },
            options,
        );
    }

    public removeChaptersFromDownloadQueue(
        ids: number[],
        options?: MutationOptions<DequeueChapterDownloadsMutation, DequeueChapterDownloadsMutationVariables>,
    ): AbortableApolloMutationResponse<DequeueChapterDownloadsMutation> {
        return this.doRequest<DequeueChapterDownloadsMutation, DequeueChapterDownloadsMutationVariables>(
            GQLMethod.MUTATION,
            DEQUEUE_CHAPTER_DOWNLOADS,
            { input: { ids } },
            options,
        );
    }

    public useGetRecentlyUpdatedChapters(
        initialPages: number = 1,
        options?: QueryHookOptions<GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables> {
        const PAGE_SIZE = 50;
        const CACHE_KEY = 'useGetRecentlyUpdatedChapters';

        const offset = this.cache.getResponseFor<number>(CACHE_KEY, undefined) ?? 0;
        const [lastOffset] = useState(offset);

        const result = this.useGetChapters<GetChaptersUpdatesQuery, GetChaptersUpdatesQueryVariables>(
            GET_CHAPTERS_UPDATES,
            {
                filter: { inLibrary: { equalTo: true } },
                order: [
                    { by: ChapterOrderBy.FetchedAt, byType: SortOrder.Desc },
                    { by: ChapterOrderBy.SourceOrder, byType: SortOrder.Desc },
                ],
                first: initialPages * PAGE_SIZE + lastOffset,
            },
            options,
        );

        return {
            ...result,
            fetchMore: (...args: Parameters<(typeof result)['fetchMore']>) => {
                const fetchMoreOptions = args[0] ?? {};
                this.cache.cacheResponse(CACHE_KEY, undefined, fetchMoreOptions.variables?.offset);
                return result.fetchMore({
                    ...fetchMoreOptions,
                    variables: { first: PAGE_SIZE, ...fetchMoreOptions.variables },
                });
            },
        } as typeof result;
    }

    public useGetRecentlyReadChapters(
        initialPages: number = 1,
        options?: QueryHookOptions<GetChaptersHistoryQuery, GetChaptersHistoryQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetChaptersHistoryQuery, GetChaptersHistoryQueryVariables> {
        const PAGE_SIZE = 50;
        const CACHE_KEY = 'useGetRecentlyReadChapters';

        const offset = this.cache.getResponseFor<number>(CACHE_KEY, undefined) ?? 0;
        const [lastOffset] = useState(offset);

        const result = this.useGetChapters<GetChaptersHistoryQuery, GetChaptersHistoryQueryVariables>(
            GET_CHAPTERS_HISTORY,
            {
                filter: { lastReadAt: { isNull: false, notEqualToAll: ['0'] } },
                order: [
                    { by: ChapterOrderBy.LastReadAt, byType: SortOrder.Desc },
                    { by: ChapterOrderBy.SourceOrder, byType: SortOrder.Desc },
                ],
                first: initialPages * PAGE_SIZE + lastOffset,
            },
            options,
        );

        return {
            ...result,
            fetchMore: (...args: Parameters<(typeof result)['fetchMore']>) => {
                const fetchMoreOptions = args[0] ?? {};
                this.cache.cacheResponse(CACHE_KEY, undefined, fetchMoreOptions.variables?.offset);
                return result.fetchMore({
                    ...fetchMoreOptions,
                    variables: { first: PAGE_SIZE, ...fetchMoreOptions.variables },
                });
            },
        } as typeof result;
    }

    public startGlobalUpdate(
        categories?: undefined,
        options?: MutationOptions<UpdateLibraryMangasMutation, UpdateLibraryMangasMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateLibraryMangasMutation>;

    public startGlobalUpdate(
        categories?: number[],
        options?: MutationOptions<UpdateCategoryMangasMutation, UpdateCategoryMangasMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateCategoryMangasMutation>;

    public startGlobalUpdate<
        Data extends UpdateLibraryMangasMutation | UpdateCategoryMangasMutation,
        Variables extends UpdateLibraryMangasMutationVariables | UpdateCategoryMangasMutationVariables,
    >(categories?: number[], options?: MutationOptions<Data, Variables>): AbortableApolloMutationResponse<Data> {
        if (categories?.length) {
            return this.doRequest<UpdateCategoryMangasMutation, UpdateCategoryMangasMutationVariables>(
                GQLMethod.MUTATION,
                UPDATE_CATEGORY_MANGAS,
                { input: { categories } },
                options as MutationOptions<UpdateCategoryMangasMutation, UpdateCategoryMangasMutationVariables>,
            ) as AbortableApolloMutationResponse<Data>;
        }

        return this.doRequest<UpdateLibraryMangasMutation, UpdateLibraryMangasMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_LIBRARY_MANGAS,
            {},
            options as MutationOptions<UpdateLibraryMangasMutation, UpdateLibraryMangasMutationVariables>,
        ) as AbortableApolloMutationResponse<Data>;
    }

    public resetGlobalUpdate(
        options?: MutationOptions<StopUpdaterMutation, StopUpdaterMutationVariables>,
    ): AbortableApolloMutationResponse<StopUpdaterMutation> {
        return this.doRequest<StopUpdaterMutation, StopUpdaterMutationVariables>(
            GQLMethod.MUTATION,
            STOP_UPDATER,
            {},
            options,
        );
    }

    public useGetGlobalUpdateSummary(
        options?: QueryHookOptions<GetUpdateStatusQuery, GetUpdateStatusQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetUpdateStatusQuery, GetUpdateStatusQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_UPDATE_STATUS, {}, options);
    }

    public useGetDownloadStatus(
        options?: QueryHookOptions<GetDownloadStatusQuery, GetDownloadStatusQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetDownloadStatusQuery, GetDownloadStatusQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_DOWNLOAD_STATUS, {}, options);
    }

    public useDownloadSubscription(
        options?: SubscriptionHookOptions<DownloadStatusSubscription, DownloadStatusSubscriptionVariables>,
    ): SubscriptionResult<DownloadStatusSubscription, DownloadStatusSubscriptionVariables> {
        return this.doRequest(
            GQLMethod.USE_SUBSCRIPTION,
            DOWNLOAD_STATUS_SUBSCRIPTION,
            { input: { maxUpdates: 30 } },
            {
                ...options,
                onData: (onDataOptions) => {
                    const downloadChanged = onDataOptions.data.data?.downloadStatusChanged;

                    const { cache } = this.graphQLClient.client;

                    if (downloadChanged?.omittedUpdates) {
                        cache.gc();
                        cache.evict({ broadcast: true, id: 'DownloadStatus:{}' });
                        cache.evict({ broadcast: true, fieldName: 'downloadStatus' });
                        return;
                    }

                    downloadChanged?.updates.forEach((update) => {
                        if (![DownloadUpdateType.Dequeued, DownloadUpdateType.Finished].includes(update.type)) {
                            return;
                        }

                        cache.evict({
                            id: cache.identify({
                                __typename: 'DownloadType',
                                chapter: {
                                    __ref: cache.identify({
                                        __typename: 'ChapterType',
                                        id: update.download.chapter.id,
                                    }),
                                },
                            }),
                        });
                    });
                },
            },
        );
    }

    public useUpdaterSubscription(
        options?: SubscriptionHookOptions<UpdaterSubscription, UpdaterSubscriptionVariables>,
    ): SubscriptionResult<UpdaterSubscription, UpdaterSubscriptionVariables> {
        return this.doRequest(GQLMethod.USE_SUBSCRIPTION, UPDATER_SUBSCRIPTION, {}, options);
    }

    public useGetServerSettings(
        options?: QueryHookOptions<GetServerSettingsQuery, GetServerSettingsQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetServerSettingsQuery, GetServerSettingsQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_SERVER_SETTINGS, undefined, options);
    }

    public useUpdateServerSettings(
        options?: MutationHookOptions<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables> {
        const [mutate, result] = this.doRequest(GQLMethod.USE_MUTATION, UPDATE_SERVER_SETTINGS, undefined, options);

        const wrappedMutate = async (mutateOptions: Parameters<typeof mutate>[0]) =>
            mutate({
                optimisticResponse: {
                    __typename: 'Mutation',
                    setSettings: {
                        __typename: 'SetSettingsPayload',
                        settings: {
                            __typename: 'SettingsType',
                            ...(mutateOptions?.variables?.input.settings ?? {}),
                        } as SettingsType,
                    },
                },
                ...mutateOptions,
            });

        return [wrappedMutate, result];
    }

    public useGetLastGlobalUpdateTimestamp(
        options?: QueryHookOptions<GetLastUpdateTimestampQuery, GetLastUpdateTimestampQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetLastUpdateTimestampQuery, GetLastUpdateTimestampQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_LAST_UPDATE_TIMESTAMP, {}, options);
    }

    public useClearServerCache(
        input: ClearCachedImagesInput = { cachedPages: true, cachedThumbnails: true },
        options?: MutationHookOptions<ClearServerCacheMutation, ClearServerCacheMutationVariables>,
    ): AbortableApolloUseMutationResponse<ClearServerCacheMutation, ClearServerCacheMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, CLEAR_SERVER_CACHE, { input }, options);
    }

    public useWebUIUpdateSubscription(
        options?: SubscriptionHookOptions<WebuiUpdateSubscription, WebuiUpdateSubscription>,
    ): SubscriptionResult<WebuiUpdateSubscription, WebuiUpdateSubscription> {
        return this.doRequest(GQLMethod.USE_SUBSCRIPTION, WEBUI_UPDATE_SUBSCRIPTION, undefined, options);
    }

    public resetWebUIUpdateStatus(
        options?: MutationOptions<ResetWebuiUpdateStatusMutation, ResetWebuiUpdateStatusMutationVariables>,
    ): AbortableApolloMutationResponse<ResetWebuiUpdateStatusMutation> {
        return this.doRequest(GQLMethod.MUTATION, RESET_WEBUI_UPDATE_STATUS, undefined, options);
    }

    public useGetWebUIUpdateStatus(
        options?: QueryHookOptions<GetWebuiUpdateStatusQuery, GetWebuiUpdateStatusQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetWebuiUpdateStatusQuery, GetWebuiUpdateStatusQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_WEBUI_UPDATE_STATUS, undefined, options);
    }

    public useGetMigratableSources(
        options?: QueryHookOptions<GetMigratableSourcesQuery, GetMigratableSourcesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMigratableSourcesQuery, GetMigratableSourcesQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_MIGRATABLE_SOURCES, undefined, options);
    }

    public useGetTrackerList<Data, Variables extends OperationVariables = never>(
        document: DocumentNode | TypedDocumentNode<Data, Variables>,
        options?: QueryHookOptions<Data, Variables>,
    ): AbortableApolloUseQueryResponse<Data, Variables> {
        return this.doRequest(GQLMethod.USE_QUERY, document, undefined, options);
    }

    public useLogoutFromTracker(
        options?: MutationHookOptions<TrackerLogoutMutation, TrackerLogoutMutationVariables>,
    ): AbortableApolloUseMutationResponse<TrackerLogoutMutation, TrackerLogoutMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, TRACKER_LOGOUT, undefined, options);
    }

    public useLoginToTrackerOauth(
        options?: MutationHookOptions<TrackerLoginOauthMutation, TrackerLoginOauthMutationVariables>,
    ): AbortableApolloUseMutationResponse<TrackerLoginOauthMutation, TrackerLoginOauthMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, TRACKER_LOGIN_OAUTH, undefined, options);
    }

    public useLoginToTrackerCredentials(
        options?: MutationHookOptions<TrackerLoginCredentialsMutation, TrackerLoginCredentialsMutationVariables>,
    ): AbortableApolloUseMutationResponse<TrackerLoginCredentialsMutation, TrackerLoginCredentialsMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, TRACKER_LOGIN_CREDENTIALS, undefined, options);
    }

    public useTrackerSearch(
        trackerId: number,
        query: string,
        options?: QueryHookOptions<TrackerSearchQuery, TrackerSearchQueryVariables>,
    ): AbortableApolloUseQueryResponse<TrackerSearchQuery, TrackerSearchQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, TRACKER_SEARCH, { trackerId, query }, options);
    }

    public useBindTracker(
        options?: MutationHookOptions<TrackerBindMutation, TrackerBindMutationVariables>,
    ): AbortableApolloUseMutationResponse<TrackerBindMutation, TrackerBindMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, TRACKER_BIND, undefined, options);
    }

    public bindTracker(
        mangaId: number,
        trackerId: number,
        remoteId: string,
        options?: MutationOptions<TrackerBindMutation, TrackerBindMutationVariables>,
    ): AbortableApolloMutationResponse<TrackerBindMutation> {
        return this.doRequest(GQLMethod.MUTATION, TRACKER_BIND, { mangaId, remoteId, trackerId }, options);
    }

    public unbindTracker(
        recordId: number,
        deleteRemoteTrack?: boolean,
        options?: MutationHookOptions<TrackerUnbindMutation, TrackerUnbindMutationVariables>,
    ): AbortableApolloMutationResponse<TrackerUnbindMutation> {
        return this.doRequest<TrackerUnbindMutation, TrackerUnbindMutationVariables>(
            GQLMethod.MUTATION,
            TRACKER_UNBIND,
            { input: { recordId, deleteRemoteTrack } },
            { refetchQueries: [GET_MANGA_TRACK_RECORDS], ...options },
        );
    }

    public updateTrackerBind(
        id: number,
        patch: Omit<UpdateTrackInput, 'clientMutationId' | 'recordId'>,
        options?: MutationOptions<TrackerUpdateBindMutation, TrackerUpdateBindMutationVariables>,
    ): AbortableApolloMutationResponse<TrackerUpdateBindMutation> {
        return this.doRequest(GQLMethod.MUTATION, TRACKER_UPDATE_BIND, { input: { ...patch, recordId: id } }, options);
    }

    public fetchTrackBind(
        recordId: number,
        options?: MutationOptions<TrackerFetchBindMutation, TrackerFetchBindMutationVariables>,
    ): AbortableApolloMutationResponse<TrackerFetchBindMutation> {
        return this.doRequest<TrackerFetchBindMutation, TrackerFetchBindMutationVariables>(
            GQLMethod.MUTATION,
            TRACKER_FETCH_BIND,
            { recordId },
            options,
        );
    }
}

export const requestManager = new RequestManager();
