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
import { OperationVariables } from '@apollo/client/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IRestClient, RestClient } from '@/lib/requests/client/RestClient.ts';
import { GraphQLClient } from '@/lib/requests/client/GraphQLClient.ts';
import {
    CategoryOrderBy,
    ChapterOrderBy,
    CheckForServerUpdatesQuery,
    CheckForServerUpdatesQueryVariables,
    ClearCachedImagesInput,
    CheckForWebuiUpdateQuery,
    CheckForWebuiUpdateQueryVariables,
    ClearDownloaderMutation,
    ClearDownloaderMutationVariables,
    ClearServerCacheMutation,
    ClearServerCacheMutationVariables,
    CreateCategoryInput,
    CreateCategoryMutation,
    CreateCategoryMutationVariables,
    DeleteCategoryMutation,
    DeleteCategoryMutationVariables,
    DeleteDownloadedChapterMutation,
    DeleteDownloadedChapterMutationVariables,
    DeleteDownloadedChaptersMutation,
    DeleteDownloadedChaptersMutationVariables,
    DequeueChapterDownloadMutation,
    DequeueChapterDownloadMutationVariables,
    DequeueChapterDownloadsMutation,
    DequeueChapterDownloadsMutationVariables,
    DownloadStatusSubscription,
    DownloadStatusSubscriptionVariables,
    EnqueueChapterDownloadMutation,
    EnqueueChapterDownloadMutationVariables,
    EnqueueChapterDownloadsMutation,
    EnqueueChapterDownloadsMutationVariables,
    FetchSourceMangaInput,
    FetchSourceMangaType,
    FilterChangeInput,
    GetAboutQuery,
    GetAboutQueryVariables,
    GetCategoriesQuery,
    GetCategoriesQueryVariables,
    GetCategoryMangasQuery,
    GetCategoryMangasQueryVariables,
    GetChapterPagesFetchMutation,
    GetChapterPagesFetchMutationVariables,
    GetChaptersQuery,
    GetChaptersQueryVariables,
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
    GetMangaQuery,
    GetMangaQueryVariables,
    GetMangasQuery,
    GetMangasQueryVariables,
    GetRestoreStatusQuery,
    GetRestoreStatusQueryVariables,
    GetServerSettingsQuery,
    GetSourceMangasFetchMutation,
    GetSourceMangasFetchMutationVariables,
    GetSourceQuery,
    GetSourceQueryVariables,
    GetSourcesQuery,
    GetSourcesQueryVariables,
    GetUpdateStatusQuery,
    GetUpdateStatusQueryVariables,
    InstallExternalExtensionMutation,
    InstallExternalExtensionMutationVariables,
    ReorderChapterDownloadMutation,
    ReorderChapterDownloadMutationVariables,
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
    SortOrder,
    SourcePreferenceChangeInput,
    StartDownloaderMutation,
    StartDownloaderMutationVariables,
    StopDownloaderMutation,
    StopDownloaderMutationVariables,
    StopUpdaterMutation,
    StopUpdaterMutationVariables,
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
    UpdateLibraryMangasMutation,
    UpdateLibraryMangasMutationVariables,
    UpdateMangaCategoriesMutation,
    UpdateMangaCategoriesMutationVariables,
    UpdateMangaMutation,
    UpdateMangaMutationVariables,
    UpdateMangaPatchInput,
    UpdaterSubscription,
    UpdaterSubscriptionVariables,
    UpdateServerSettingsMutation,
    UpdateServerSettingsMutationVariables,
    UpdateSourcePreferencesMutation,
    UpdateSourcePreferencesMutationVariables,
    UpdateWebuiMutation,
    UpdateWebuiMutationVariables,
    ValidateBackupQuery,
    ValidateBackupQueryVariables,
    WebuiUpdateSubscription,
    ResetWebuiUpdateStatusMutation,
    ResetWebuiUpdateStatusMutationVariables,
    GetDownloadStatusQuery,
    GetDownloadStatusQueryVariables,
    GetMangasChapterIdsWithStateQuery,
    GetMangasChapterIdsWithStateQueryVariables,
    ChapterConditionInput,
    UpdateMangasMutation,
    UpdateMangasMutationVariables,
    UpdateMangasCategoriesMutation,
    UpdateMangasCategoriesMutationVariables,
    UpdateMangaCategoriesPatchInput,
    GetWebuiUpdateStatusQuery,
    GetWebuiUpdateStatusQueryVariables,
    GetMigratableSourcesQuery,
    GetMigratableSourcesQueryVariables,
    GetMigratableSourceMangasQuery,
    GetMigratableSourceMangasQueryVariables,
    GetMangaToMigrateQuery,
    GetMangaToMigrateQueryVariables,
    GetMangaToMigrateToFetchMutation,
    GetMangaToMigrateToFetchMutationVariables,
    GetTrackersQuery,
    GetTrackersQueryVariables,
    TrackerLogoutMutation,
    TrackerLogoutMutationVariables,
    TrackerLoginOauthMutation,
    TrackerLoginOauthMutationVariables,
    TrackerLoginCredentialsMutation,
    TrackerLoginCredentialsMutationVariables,
    TrackerSearchQuery,
    TrackerSearchQueryVariables,
    TrackerBindMutation,
    TrackerBindMutationVariables,
    TrackerUpdateBindMutation,
    TrackerUpdateBindMutationVariables,
    UpdateTrackInput,
    TrackerUnbindMutation,
    TrackerUnbindMutationVariables,
    TrackerFetchBindMutation,
    TrackerFetchBindMutationVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_GLOBAL_METADATAS } from '@/lib/graphql/queries/GlobalMetadataQuery.ts';
import { SET_GLOBAL_METADATA } from '@/lib/graphql/mutations/GlobalMetadataMutation.ts';
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
} from '@/lib/graphql/mutations/ExtensionMutation.ts';
import { GET_MIGRATABLE_SOURCES, GET_SOURCE, GET_SOURCES } from '@/lib/graphql/queries/SourceQuery.ts';
import {
    GET_MANGA_FETCH,
    GET_MANGA_TO_MIGRATE_TO_FETCH,
    SET_MANGA_METADATA,
    UPDATE_MANGA,
    UPDATE_MANGA_CATEGORIES,
    UPDATE_MANGAS,
    UPDATE_MANGAS_CATEGORIES,
} from '@/lib/graphql/mutations/MangaMutation.ts';
import {
    GET_MANGA,
    GET_MANGA_TO_MIGRATE,
    GET_MANGAS,
    GET_MIGRATABLE_SOURCE_MANGAS,
} from '@/lib/graphql/queries/MangaQuery.ts';
import { GET_CATEGORIES, GET_CATEGORY_MANGAS } from '@/lib/graphql/queries/CategoryQuery.ts';
import { GET_SOURCE_MANGAS_FETCH, UPDATE_SOURCE_PREFERENCES } from '@/lib/graphql/mutations/SourceMutation.ts';
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
import { GET_CHAPTERS, GET_MANGAS_CHAPTER_IDS_WITH_STATE } from '@/lib/graphql/queries/ChapterQuery.ts';
import {
    GET_CHAPTER_PAGES_FETCH,
    GET_MANGA_CHAPTERS_FETCH,
    SET_CHAPTER_METADATA,
    UPDATE_CHAPTER,
    UPDATE_CHAPTERS,
} from '@/lib/graphql/mutations/ChapterMutation.ts';
import {
    CREATE_CATEGORY,
    DELETE_CATEGORY,
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
import { CustomCache } from '@/lib/requests/CustomCache.ts';
import { RESTORE_BACKUP } from '@/lib/graphql/mutations/BackupMutation.ts';
import { GET_RESTORE_STATUS, VALIDATE_BACKUP } from '@/lib/graphql/queries/BackupQuery.ts';
import { DOWNLOAD_STATUS_SUBSCRIPTION } from '@/lib/graphql/subscriptions/DownloaderSubscription.ts';
import { UPDATER_SUBSCRIPTION } from '@/lib/graphql/subscriptions/UpdaterSubscription.ts';
import { GET_SERVER_SETTINGS } from '@/lib/graphql/queries/SettingsQuery.ts';
import { UPDATE_SERVER_SETTINGS } from '@/lib/graphql/mutations/SettingsMutation.ts';
import { BASE_MANGA_FIELDS, FULL_DOWNLOAD_STATUS, FULL_EXTENSION_FIELDS } from '@/lib/graphql/Fragments.ts';
import { CLEAR_SERVER_CACHE } from '@/lib/graphql/mutations/ImageMutation.ts';
import { RESET_WEBUI_UPDATE_STATUS, UPDATE_WEBUI } from '@/lib/graphql/mutations/ServerInfoMutation.ts';
import { WEBUI_UPDATE_SUBSCRIPTION } from '@/lib/graphql/subscriptions/ServerInfoSubscription.ts';
import { GET_DOWNLOAD_STATUS } from '@/lib/graphql/queries/DownloaderQuery.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { Queue, QueuePriority } from '@/lib/Queue.ts';
import { GET_TRACKERS, TRACKER_SEARCH } from '@/lib/graphql/queries/TrackerQuery.ts';
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
    response: Promise<ApolloQueryResult<Data>>;
} & AbortableRequest;
export type AbortableApolloUseQueryResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = QueryResult<Data, Variables> & AbortableRequest;
export type AbortableApolloUseMutationResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = [MutationTuple<Data, Variables>[0], MutationTuple<Data, Variables>[1] & AbortableRequest];
export type AbortableApolloUseMutationPaginatedResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = [
    (page: number) => Promise<FetchResult<Data>>,
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
export type AbortableApolloMutationResponse<Data = any> = { response: Promise<FetchResult<Data>> } & AbortableRequest;

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
            revalidatedResult: FetchResult<Data>,
        ) => boolean,
        hasNextPage: (revalidatedResult: FetchResult<Data>) => boolean,
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
    ): Promise<FetchResult<Data>> {
        const basePaginatedResult: Partial<AbortableApolloUseMutationPaginatedResponse<Data, Variables>[1][number]> = {
            size: newPage,
            isLoading: false,
            isLoadingMore: false,
            called: true,
        };

        let response: FetchResult<Data> = {};
        try {
            const { signal, abortRequest } = this.createAbortController();
            setAbortRequest(abortRequest);

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

        const shouldCacheResult = !fetchPaginatedResult.error;
        if (shouldCacheResult) {
            const currentCachedPages = this.cache.getResponseFor<Set<number>>(cachePagesKey, getVariablesFor(0)) ?? [];
            this.cache.cacheResponse(cachePagesKey, getVariablesFor(0), new Set([...currentCachedPages, newPage]));
            this.cache.cacheResponse(cacheResultsKey, getVariablesFor(newPage), fetchPaginatedResult);
        }

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
        fetchPage: (page: number) => Promise<FetchResult<Data>>,
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

    private fetchImageViaTag(url: string, priority?: QueuePriority): ImageRequest {
        const imgRequest = new ControlledPromise<string>();
        imgRequest.promise.catch(defaultPromiseErrorHandler(`fetchImageViaTag(${url})`));

        const img = new Image();
        const abortRequest = (reason?: any) => {
            img.src = '';
            img.onload = null;
            img.onerror = null;
            img.onabort = null;
            imgRequest.reject(reason);
        };

        const response = this.imageQueue.enqueue(
            url,
            async () => {
                // throws error in case request was already aborted
                await Promise.race([imgRequest.promise, Promise.resolve()]);

                img.src = url;

                img.onload = () => imgRequest.resolve(url);
                img.onerror = (error) => imgRequest.reject(error);
                img.onabort = (error) => imgRequest.reject(error);

                return imgRequest.promise;
            },
            priority,
        );

        return { response, abortRequest, cleanup: () => {} };
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
    private fetchImageViaFetchApi(url: string, priority?: QueuePriority): ImageRequest {
        let objectUrl: string = '';
        const { abortRequest, signal } = this.createAbortController();
        const response = this.imageQueue.enqueue(
            url,
            () =>
                this.restClient
                    .fetcher(url, {
                        checkResponseIsJson: false,
                        config: {
                            signal,
                            // @ts-ignore - typing has not been updated yet
                            priority: 'low',
                        },
                    })
                    .then((data) => data.blob())
                    .then((data) => URL.createObjectURL(data))
                    .then((imageUrl) => {
                        objectUrl = imageUrl;
                        return imageUrl;
                    }),
            priority,
        );

        return { response, abortRequest, cleanup: () => URL.revokeObjectURL(objectUrl) };
    }

    /**
     * Make sure to call "cleanup" once the image is not needed anymore (only required if fetched via "fetch api")
     */
    public requestImage(url: string, priority?: QueuePriority, useFetchApi: boolean = true): ImageRequest {
        if (useFetchApi) {
            return this.fetchImageViaFetchApi(url, priority);
        }

        return this.fetchImageViaTag(url, priority);
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
        const result = this.doRequest<SetGlobalMetadataMutation, SetGlobalMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_GLOBAL_METADATA,
            { input: { meta: { key, value: `${value}` } } },
            options,
        );

        result.response.then(() => {
            this.graphQLClient.client.cache.evict({ fieldName: 'metas' });
        });

        return result;
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

            if (!result.data?.fetchExtensions.extensions) {
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
                          data: !cachedResult?.data?.fetchExtensions.extensions
                              ? cachedResult?.data
                              : {
                                    ...cachedResult.data,
                                    fetchExtensions: {
                                        ...cachedResult.data.fetchExtensions,
                                        extensions: cachedResult.data.fetchExtensions.extensions.map(
                                            (extension) =>
                                                this.graphQLClient.client.cache.readFragment<
                                                    GetExtensionsFetchMutation['fetchExtensions']['extensions'][0]
                                                >({
                                                    id: this.graphQLClient.client.cache.identify(extension),
                                                    fragment: FULL_EXTENSION_FIELDS,
                                                }) ?? extension,
                                        ),
                                    },
                                },
                      },
            [this.cache.getFetchTimestampFor(EXTENSION_LIST_CACHE_KEY, undefined)],
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

            const isExtensionCached = !!cachedExtensions.data.fetchExtensions.extensions.find(
                (extension) => installedExtension?.pkgName === extension.pkgName,
            );

            const updatedCachedExtensions: MutationResult<GetExtensionsFetchMutation> = {
                ...cachedExtensions,
                data: {
                    ...cachedExtensions.data,
                    fetchExtensions: {
                        ...cachedExtensions.data.fetchExtensions,
                        extensions: isExtensionCached
                            ? cachedExtensions.data.fetchExtensions.extensions.map((extension) => {
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
                                  ...cachedExtensions.data.fetchExtensions.extensions,
                                  installedExtension as (typeof cachedExtensions.data.fetchExtensions.extensions)[number],
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
                        extensions: cachedExtensions.data.fetchExtensions.extensions
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
                                    ...response.data?.updateExtension.extension,
                                };
                            }),
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
        options?: QueryHookOptions<GetSourcesQuery, GetSourcesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetSourcesQuery, GetSourcesQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_SOURCES, {}, options);
    }

    public useGetSource(
        id: string,
        options?: QueryHookOptions<GetSourceQuery, GetSourceQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetSourceQuery, GetSourceQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_SOURCE, { id }, options);
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
            (!!cachedResults.length && !cachedResults[cachedResults.length - 1].data?.fetchSourceManga.hasNextPage);
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
                    !cachedResult.data?.fetchSourceManga.mangas.length ||
                    cachedResult.data.fetchSourceManga.mangas.some(
                        (manga, index) => manga.id !== revalidatedResult.data?.fetchSourceManga.mangas[index]?.id,
                    ),
                (revalidatedResult) => !!revalidatedResult.data?.fetchSourceManga.hasNextPage,
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
            (fetchedResult) => !!fetchedResult.data?.fetchSourceManga.hasNextPage,
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
            const hasResults = cachedResult.data?.fetchSourceManga.mangas;
            if (!hasResults) {
                return cachedResult;
            }

            return {
                ...cachedResult,
                data: {
                    ...cachedResult.data,
                    fetchSourceManga: {
                        ...cachedResult.data?.fetchSourceManga,
                        mangas: cachedResult.data?.fetchSourceManga.mangas.map(
                            (manga) =>
                                this.graphQLClient.client.cache.readFragment<typeof manga>({
                                    id: this.graphQLClient.client.cache.identify(manga),
                                    fragment: BASE_MANGA_FIELDS,
                                    fragmentName: 'BASE_MANGA_FIELDS',
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

    public useGetManga(
        mangaId: number | string,
        options?: QueryHookOptions<GetMangaQuery, GetMangaQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMangaQuery, GetMangaQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_MANGA, { id: Number(mangaId) }, options);
    }

    public getManga(
        mangaId: number | string,
        options?: QueryOptions<GetMangaQueryVariables, GetMangaQuery>,
    ): AbortabaleApolloQueryResponse<GetMangaQuery> {
        return this.doRequest(GQLMethod.QUERY, GET_MANGA, { id: Number(mangaId) }, options);
    }

    public getMangaToMigrate(
        mangaId: number | string,
        {
            migrateChapters = false,
            migrateCategories = false,
            deleteChapters = false,
            apolloOptions: options,
        }: {
            migrateChapters?: boolean;
            migrateCategories?: boolean;
            deleteChapters?: boolean;
            apolloOptions?: QueryOptions<GetMangaToMigrateQueryVariables, GetMangaToMigrateQuery>;
        } = {},
    ): AbortabaleApolloQueryResponse<GetMangaToMigrateQuery> {
        return this.doRequest(
            GQLMethod.QUERY,
            GET_MANGA_TO_MIGRATE,
            { id: Number(mangaId), getChapterData: migrateChapters || deleteChapters, migrateCategories },
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
            apolloOptions: options,
        }: {
            migrateChapters?: boolean;
            migrateCategories?: boolean;
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
            },
            options,
        );
    }

    public useGetMangas(
        variables: GetMangasQueryVariables,
        options?: QueryHookOptions<GetMangasQuery, GetMangasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMangasQuery, GetMangasQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_MANGAS, variables, options);
    }

    public getMangas(
        variables: GetMangasQueryVariables,
        options?: QueryOptions<GetMangasQueryVariables, GetMangasQuery>,
    ): AbortabaleApolloQueryResponse<GetMangasQuery> {
        return this.doRequest(GQLMethod.QUERY, GET_MANGAS, variables, options);
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
            options,
        );
    }

    public useGetChapters(
        variables: GetChaptersQueryVariables,
        options?: QueryHookOptions<GetChaptersQuery, GetChaptersQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetChaptersQuery, GetChaptersQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_CHAPTERS, variables, options);
    }

    public getChapters(
        variables: GetChaptersQueryVariables,
        options?: QueryOptions<GetChaptersQueryVariables, GetChaptersQuery>,
    ): AbortabaleApolloQueryResponse<GetChaptersQuery> {
        return this.doRequest(GQLMethod.QUERY, GET_CHAPTERS, variables, options);
    }

    public useGetMangaChapters(
        mangaId: number | string,
        options?: QueryHookOptions<GetChaptersQuery, GetChaptersQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetChaptersQuery, GetChaptersQueryVariables> {
        return this.useGetChapters(
            {
                condition: { mangaId: Number(mangaId) },
                orderBy: ChapterOrderBy.SourceOrder,
                orderByType: SortOrder.Desc,
            },
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
            { refetchQueries: [GET_CHAPTERS], ...options },
        );
    }

    public useGetMangaChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        options?: QueryHookOptions<GetChaptersQuery, GetChaptersQueryVariables>,
    ): AbortableApolloUseQueryResponse<
        Omit<GetChaptersQuery, 'chapters'> & { chapter: GetChaptersQuery['chapters']['nodes'][number] },
        GetChaptersQueryVariables
    > {
        type Response = AbortableApolloUseQueryResponse<
            Omit<GetChaptersQuery, 'chapters'> & { chapter: GetChaptersQuery['chapters']['nodes'][number] },
            GetChaptersQueryVariables
        >;

        const chapterResponse = this.useGetChapters(
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

    public getChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        options?: QueryOptions<GetChaptersQueryVariables, GetChaptersQuery>,
    ): AbortabaleApolloQueryResponse<
        Omit<GetChaptersQuery, 'chapters'> & { chapter: GetChaptersQuery['chapters']['nodes'][number] }
    > {
        type ResponseData = Omit<GetChaptersQuery, 'chapters'> & {
            chapter: GetChaptersQuery['chapters']['nodes'][number];
        };

        const chapterRequest = this.doRequest<GetChaptersQuery, GetChaptersQueryVariables>(
            GQLMethod.QUERY,
            GET_CHAPTERS,
            {
                condition: { mangaId: Number(mangaId), sourceOrder: Number(chapterIndex) },
            },
            options,
        );

        return {
            ...chapterRequest,
            response: chapterRequest.response.then((chapterResponse) => {
                if (!chapterResponse.data) {
                    return chapterResponse;
                }

                return {
                    ...chapterResponse,
                    data: {
                        chapter: chapterResponse.data.chapters.nodes[0],
                    },
                };
            }) as Promise<ApolloQueryResult<ResponseData>>,
        };
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
            options,
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
        patch: UpdateChapterPatchInput & { chapterIdsToDelete?: number[] },
        options?: MutationOptions<UpdateChaptersMutation, UpdateChaptersMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateChaptersMutation> {
        const { chapterIdsToDelete = [], ...updatePatch } = patch;

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
            },
            options,
        );
    }

    public useGetCategories(
        options?: QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetCategoriesQuery, GetCategoriesQueryVariables> {
        return this.doRequest<GetCategoriesQuery, GetCategoriesQueryVariables>(
            GQLMethod.USE_QUERY,
            GET_CATEGORIES,
            {
                orderBy: CategoryOrderBy.Order,
            },
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
            { refetchQueries: [GET_CATEGORIES], ...options },
        );
    }

    public useReorderCategory(
        options?: MutationHookOptions<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables> {
        const [mutate, result] = this.doRequest<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>(
            GQLMethod.USE_MUTATION,
            UPDATE_CATEGORY_ORDER,
            undefined,
            options,
        );

        const wrappedMutate = (mutateOptions: Parameters<typeof mutate>[0]) => {
            const variables = mutateOptions?.variables?.input;
            const cachedCategories = this.graphQLClient.client.readQuery<
                GetCategoriesQuery,
                GetCategoriesQueryVariables
            >({
                query: GET_CATEGORIES,
                variables: { orderBy: CategoryOrderBy.Order },
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
                    cache.updateQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(
                        {
                            id: cache.identify({ __typename: 'CategoryNodeList' }),
                            query: GET_CATEGORIES,
                            variables: { orderBy: CategoryOrderBy.Order },
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
        options?: QueryHookOptions<GetMangasQuery, GetMangasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMangasQuery, GetMangasQueryVariables> {
        const isDefaultCategory = id === 0;
        if (isDefaultCategory) {
            // hacky way of loading the default category mangas - some stuff won't work but since that is not used anyway, it won't be a problem
            // can't be loaded via "useGetMangas" because mangas are not actually mapped to the default category in the database
            const { data, ...result } = this.doRequest<GetCategoryMangasQuery, GetCategoryMangasQueryVariables>(
                GQLMethod.USE_QUERY,
                GET_CATEGORY_MANGAS,
                { id },
            );

            return {
                ...result,
                data: data
                    ? {
                          ...data?.category,
                          __typename: 'Query',
                      }
                    : undefined,
            } as unknown as AbortableApolloUseQueryResponse<GetMangasQuery, GetMangasQueryVariables>;
        }

        return this.useGetMangas({ condition: { inLibrary: true, categoryIds: [id] } }, options);
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
                refetchQueries: [GET_CATEGORIES],
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
            options,
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
            this.graphQLClient.client.cache.reset();
            this.cache.clear();
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
                DownloadStatusSubscription['downloadChanged']
            >({
                id: 'DownloadStatus:{}',
                fragment: FULL_DOWNLOAD_STATUS,
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
        options?: QueryHookOptions<GetChaptersQuery, GetChaptersQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetChaptersQuery, GetChaptersQueryVariables> {
        const PAGE_SIZE = 50;
        const CACHE_KEY = 'useGetRecentlyUpdatedChapters';

        const offset = this.cache.getResponseFor<number>(CACHE_KEY, undefined) ?? 0;
        const [lastOffset] = useState(offset);

        const result = this.useGetChapters(
            {
                filter: { inLibrary: { equalTo: true } },
                orderBy: ChapterOrderBy.FetchedAt,
                orderByType: SortOrder.Desc,
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
        categories: number[],
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
        return this.doRequest(GQLMethod.USE_SUBSCRIPTION, DOWNLOAD_STATUS_SUBSCRIPTION, {}, options);
    }

    public useUpdaterSubscription(
        options?: SubscriptionHookOptions<UpdaterSubscription, UpdaterSubscriptionVariables>,
    ): SubscriptionResult<UpdaterSubscription, UpdaterSubscriptionVariables> {
        return this.doRequest(GQLMethod.USE_SUBSCRIPTION, UPDATER_SUBSCRIPTION, {}, options);
    }

    public useGetServerSettings(
        options?: QueryHookOptions<GetServerSettingsQuery, GetSourcesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetServerSettingsQuery, GetSourcesQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_SERVER_SETTINGS, undefined, options);
    }

    public useUpdateServerSettings(
        options?: MutationHookOptions<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateServerSettingsMutation, UpdateServerSettingsMutationVariables> {
        return this.doRequest(GQLMethod.USE_MUTATION, UPDATE_SERVER_SETTINGS, undefined, options);
    }

    public useGetLastGlobalUpdateTimestamp(
        options?: QueryHookOptions<GetLastUpdateTimestampQuery, GetLastUpdateTimestampQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetLastUpdateTimestampQuery, GetLastUpdateTimestampQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_LAST_UPDATE_TIMESTAMP, {}, options);
    }

    public useClearServerCache(
        input: ClearCachedImagesInput = { cachedPages: true, cachedThumbnails: true, downloadedThumbnails: true },
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

    public useGetTrackerList(
        options?: QueryHookOptions<GetTrackersQuery, GetTrackersQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetTrackersQuery, GetTrackersQueryVariables> {
        return this.doRequest(GQLMethod.USE_QUERY, GET_TRACKERS, undefined, options);
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

    public unbindTracker(
        recordId: number,
        deleteRemoteTrack?: boolean,
        options?: MutationHookOptions<TrackerUnbindMutation, TrackerUnbindMutationVariables>,
    ): AbortableApolloMutationResponse<TrackerUnbindMutation> {
        return this.doRequest<TrackerUnbindMutation, TrackerUnbindMutationVariables>(
            GQLMethod.MUTATION,
            TRACKER_UNBIND,
            { input: { recordId, deleteRemoteTrack } },
            { refetchQueries: [GET_MANGA, GET_CATEGORY_MANGAS, GET_MANGAS], ...options },
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
