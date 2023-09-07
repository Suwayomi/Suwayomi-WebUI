/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AxiosInstance, AxiosRequestConfig } from 'axios';
import useSWR, { Middleware, SWRConfiguration, SWRResponse } from 'swr';
import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteResponse } from 'swr/infinite';
import {
    FetchResult,
    MutationHookOptions,
    MutationOptions,
    MutationTuple,
    QueryHookOptions,
    QueryResult,
    TypedDocumentNode,
    useMutation,
    useQuery,
} from '@apollo/client';
import { OperationVariables } from '@apollo/client/core';
import { useState } from 'react';
import {
    BackupValidationResult,
    ICategory,
    IChapter,
    IMangaChapter,
    ISourceFilters,
    PaginatedList,
    PaginatedMangaList,
    SourcePreferences,
    SourceSearchResult,
} from '@/typings.ts';
import { HttpMethod as DefaultHttpMethod, IRestClient, RestClient } from '@/lib/requests/client/RestClient.ts';
import storage from '@/util/localStorage.tsx';
import { GraphQLClient } from '@/lib/requests/client/GraphQLClient.ts';
import {
    CategoryOrderBy,
    CheckForServerUpdatesQuery,
    CheckForServerUpdatesQueryVariables,
    ClearDownloaderMutation,
    ClearDownloaderMutationVariables,
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
    EnqueueChapterDownloadMutation,
    EnqueueChapterDownloadMutationVariables,
    EnqueueChapterDownloadsMutation,
    EnqueueChapterDownloadsMutationVariables,
    FetchSourceMangaInput,
    FetchSourceMangaType,
    FilterChangeInput,
    GetAboutQuery,
    GetAboutQueryVariables,
    GetExtensionsFetchMutation,
    GetExtensionsFetchMutationVariables,
    GetCategoriesQuery,
    GetCategoriesQueryVariables,
    GetCategoryMangasQuery,
    GetCategoryMangasQueryVariables,
    GetExtensionsQuery,
    GetExtensionsQueryVariables,
    GetGlobalMetadatasQuery,
    GetGlobalMetadatasQueryVariables,
    GetMangaFetchMutation,
    GetMangaFetchMutationVariables,
    GetMangaQuery,
    GetMangaQueryVariables,
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
    SetCategoryMetadataMutation,
    SetCategoryMetadataMutationVariables,
    SetChapterMetadataMutation,
    SetChapterMetadataMutationVariables,
    SetGlobalMetadataMutation,
    SetGlobalMetadataMutationVariables,
    SetMangaMetadataMutation,
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
} from '@/lib/graphql/generated/graphql.ts';
import { GET_GLOBAL_METADATA, GET_GLOBAL_METADATAS } from '@/lib/graphql/queries/GlobalMetadataQuery.ts';
import { SET_GLOBAL_METADATA } from '@/lib/graphql/mutations/GlobalMetadataMutation.ts';
import { CHECK_FOR_SERVER_UPDATES, GET_ABOUT } from '@/lib/graphql/queries/ServerInfoQuery.ts';
import { GET_EXTENSION, GET_EXTENSIONS } from '@/lib/graphql/queries/ExtensionQuery.ts';
import {
    GET_EXTENSIONS_FETCH,
    INSTALL_EXTERNAL_EXTENSION,
    UPDATE_EXTENSION,
} from '@/lib/graphql/mutations/ExtensionMutation.ts';
import { GET_SOURCE, GET_SOURCES } from '@/lib/graphql/queries/SourceQuery.ts';
import {
    GET_MANGA_FETCH,
    SET_MANGA_METADATA,
    UPDATE_MANGA,
    UPDATE_MANGA_CATEGORIES,
} from '@/lib/graphql/mutations/MangaMutation.ts';
import { GET_MANGA, GET_MANGAS } from '@/lib/graphql/queries/MangaQuery.ts';
import { GET_CATEGORIES, GET_CATEGORY, GET_CATEGORY_MANGAS } from '@/lib/graphql/queries/CategoryQuery.ts';
import { GET_SOURCE_MANGAS_FETCH } from '@/lib/graphql/mutations/SourceMutation.ts';
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
import { GET_CHAPTER, GET_CHAPTERS } from '@/lib/graphql/queries/ChapterQuery.ts';
import { SET_CHAPTER_METADATA, UPDATE_CHAPTER, UPDATE_CHAPTERS } from '@/lib/graphql/mutations/ChapterMutation.ts';
import {
    CREATE_CATEGORY,
    DELETE_CATEGORY,
    SET_CATEGORY_METADATA,
    UPDATE_CATEGORY,
    UPDATE_CATEGORY_ORDER,
} from '@/lib/graphql/mutations/CategoryMutation.ts';
import { GET_DOWNLOAD_STATUS } from '@/lib/graphql/queries/DownloaderQuery.ts';
import {
    STOP_UPDATER,
    UPDATE_CATEGORY_MANGAS,
    UPDATE_LIBRARY_MANGAS,
} from '@/lib/graphql/mutations/UpdaterMutation.ts';
import { GET_UPDATE_STATUS } from '@/lib/graphql/queries/UpdaterQuery.ts';

enum SWRHttpMethod {
    SWR_GET,
    SWR_GET_INFINITE,
    SWR_POST,
    SWR_POST_INFINITE,
}

enum GQLMethod {
    USE_QUERY = 'USE_QUERY',
    USE_MUTATION = 'USE_MUTATION',
    MUTATION = 'MUTATION',
}

type HttpMethodType = DefaultHttpMethod | SWRHttpMethod;
const HttpMethod = { ...SWRHttpMethod, ...DefaultHttpMethod };

type RequestOption = { doOnlineFetch?: boolean };

type CustomSWROptions<Data> = {
    skipRequest?: boolean;
    getEndpoint?: (index: number, previousData: Data | null) => string | null;
    disableCache?: boolean;
};

type SWROptions<Data = any, Error = any> = SWRConfiguration<Data, Error> & CustomSWROptions<Data>;
type SWRInfiniteOptions<Data = any, Error = any> = SWRInfiniteConfiguration<Data, Error> & CustomSWROptions<Data>;

type SWRInfiniteResponseLoadInfo = {
    isInitialLoad: boolean;
    isLoadMore: boolean;
};
type AbortableRequest = { abortRequest: AbortController['abort'] };
export type AbortableAxiosResponse<Data = any> = { response: Promise<Data> } & AbortableRequest;
export type AbortableSWRResponse<Data = any, Error = any> = SWRResponse<Data, Error> & AbortableRequest;
export type AbortableSWRInfiniteResponse<Data = any, Error = any> = SWRInfiniteResponse<Data, Error> &
    AbortableRequest &
    SWRInfiniteResponseLoadInfo;

type AbortableApolloUseQueryResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = QueryResult<Data, Variables> & AbortableRequest;
type AbortableApolloUseMutationResponse<Data = any, Variables extends OperationVariables = OperationVariables> = [
    MutationTuple<Data, Variables>[0],
    MutationTuple<Data, Variables>[1] & AbortableRequest,
];
type AbortableApolloUseMutationPaginatedResponse<
    Data = any,
    Variables extends OperationVariables = OperationVariables,
> = [
    (page: number) => Promise<FetchResult<Data>>,
    (MutationTuple<Data, Variables>[1] & AbortableRequest & { size: number; loadingMore: boolean })[],
];
type AbortableApolloMutationResponse<Data = any> = { response: Promise<FetchResult<Data>> } & AbortableRequest;

const isLoadingMore = (swrResult: SWRInfiniteResponse): boolean => {
    const isNextPageMissing = !!swrResult.data && typeof swrResult.data[swrResult.size - 1] === 'undefined';
    const isRequestActive = swrResult.isValidating;
    // SWR "isLoading" state is only updated for the first load, for every subsequent load it's "false"
    return !swrResult.isLoading && swrResult.size > 0 && isNextPageMissing && isRequestActive;
};

const disableSwrInfiniteCache: Middleware = (useSWRNext) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config) as unknown as SWRInfiniteResponse;
    const { size, data, isLoading, isValidating } = swr;
    const isActuallyValidating = !isLoading && !isLoadingMore(swr) && isValidating;
    return {
        ...swr,
        isLoading: isActuallyValidating ? true : isLoading,
        data: isActuallyValidating ? undefined : data,
        size: isActuallyValidating ? 1 : size,
    } as SWRResponse;
};

const disableSwrCache: Middleware = (useSWRNext) => (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);
    const { data, isLoading, isValidating } = swr;
    return { ...swr, isLoading: isValidating ? true : isLoading, data: isValidating ? undefined : data };
};

// the following endpoints have not been implemented:
//   - PUT  /api/v1/manga/{mangaId}/chapter/{chapterIndex}  - modify chapter    # PATCH endpoint used instead
//   - POST /api/v1/backup/import                           - import backup     # "import backup file" endpoint used instead
//   - POST /api/v1/backup/validate                         - validate backup   # "validate backup file" endpoint used instead
//   - GET  /api/v1/backup/export                           - export backup     # no function needed, url gets called via link triggering the download
export class RequestManager {
    public static readonly API_VERSION = '/api/v1/';

    private readonly graphQLClient = new GraphQLClient();

    private readonly restClient: RestClient = new RestClient();

    public getClient(): IRestClient {
        return this.restClient;
    }

    public updateClient(config: Partial<AxiosInstance['defaults']>): void {
        this.restClient.updateConfig(config);
        this.graphQLClient.updateConfig({ uri: config.baseURL });
    }

    public getBaseUrl(): string {
        return this.restClient.getClient().defaults.baseURL!;
    }

    public getWebSocketBaseUrl(): string {
        return this.getBaseUrl().replace('http', 'ws');
    }

    public getValidWebSocketUrl(path: string, apiVersion = RequestManager.API_VERSION): string {
        return `${this.getWebSocketBaseUrl()}${apiVersion}${path}`;
    }

    public getUpdateWebSocket(): WebSocket {
        return new WebSocket(this.getValidWebSocketUrl('update'));
    }

    public getDownloadWebSocket(): WebSocket {
        return new WebSocket(this.getValidWebSocketUrl('downloads'));
    }

    public getValidUrlFor(endpoint: string, apiVersion: string = RequestManager.API_VERSION): string {
        return `${this.getBaseUrl()}${apiVersion}${endpoint}`;
    }

    public getValidImgUrlFor(imageUrl: string, apiVersion: string = ''): string {
        const useCache = storage.getItem('useCache', true);
        const useCacheQuery = `?useCache=${useCache}`;
        // server provided image urls already contain the api version
        return `${this.getValidUrlFor(imageUrl, apiVersion)}${useCacheQuery}`;
    }

    private doRequestNew<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.USE_QUERY,
        operation: TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: Partial<QueryHookOptions<Data, Variables>>,
    ): AbortableApolloUseQueryResponse<Data, Variables>;

    private doRequestNew<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.USE_MUTATION,
        operation: TypedDocumentNode<Data, Variables>,
        variables: Variables | undefined,
        options?: Partial<MutationHookOptions<Data, Variables>>,
    ): AbortableApolloUseMutationResponse<Data, Variables>;

    private doRequestNew<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod.MUTATION,
        operation: TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?: Partial<MutationOptions<Data, Variables>>,
    ): AbortableApolloMutationResponse<Data>;

    private doRequestNew<Data, Variables extends OperationVariables = OperationVariables>(
        method: GQLMethod,
        operation: TypedDocumentNode<Data, Variables>,
        variables: Variables,
        options?:
            | QueryHookOptions<Data, Variables>
            | MutationHookOptions<Data, Variables>
            | MutationOptions<Data, Variables>,
    ):
        | AbortableApolloUseQueryResponse<Data, Variables>
        | AbortableApolloUseMutationResponse<Data, Variables>
        | AbortableApolloMutationResponse<Data> {
        const abortController = new AbortController();
        const abortRequest = (reason?: any): void => {
            if (!abortController.signal.aborted) {
                abortController.abort(reason);
            }
        };

        switch (method) {
            case GQLMethod.USE_QUERY:
                return {
                    ...useQuery<Data, Variables>(operation, {
                        variables,
                        client: this.graphQLClient.client,
                        ...options,
                        context: {
                            ...options?.context,
                            fetchOptions: {
                                signal: abortController.signal,
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
                            signal: abortController.signal,
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
                                signal: abortController.signal,
                                ...options?.context?.fetchOptions,
                            },
                        },
                    }),
                    abortRequest,
                };
            default:
                throw new Error(`unexpected GQLRequest type "${method}"`);
        }
    }

    private useSwr<
        Data = any,
        ErrorResponse = any,
        OptionsSWR extends SWROptions<Data, ErrorResponse> = SWROptions<Data, ErrorResponse>,
    >(
        url: string,
        httpMethod: DefaultHttpMethod,
        {
            data,
            axiosOptions,
            swrOptions,
        }: {
            data?: Data;
            axiosOptions?: AxiosRequestConfig;
            swrOptions?: OptionsSWR;
        } = {},
    ): SWRResponse<Data, ErrorResponse> {
        const { skipRequest, disableCache, ...swrConfig } = swrOptions ?? {};

        // in case "null" gets passed as the url, SWR won't do the request
        return useSWR(skipRequest ? null : url, {
            fetcher: (path: string) => this.restClient.fetcher(path, { data, httpMethod, config: axiosOptions }),
            use: disableCache ? [disableSwrCache] : undefined,
            ...swrConfig,
        });
    }

    public useSwrInfinite<
        Data = any,
        ErrorResponse = any,
        OptionsSWR extends SWRInfiniteOptions<Data, ErrorResponse> = SWRInfiniteOptions<Data, ErrorResponse>,
    >(
        getEndpoint: Required<CustomSWROptions<Data>>['getEndpoint'],
        httpMethod: DefaultHttpMethod,
        {
            data,
            axiosOptions,
            swrOptions,
        }: { data?: any; axiosOptions?: AxiosRequestConfig; swrOptions?: OptionsSWR } = {},
    ): SWRInfiniteResponse<Data, ErrorResponse> & SWRInfiniteResponseLoadInfo {
        const { skipRequest, disableCache, ...swrConfig } = swrOptions ?? {};

        // useSWRInfinite will (by default) revalidate the first page, to check if the other pages have to be revalidated as well
        const swrResult = useSWRInfinite<Data, ErrorResponse>(
            (index, previousData) => {
                const pageEndpoint = getEndpoint(index, previousData);
                return pageEndpoint !== null && !skipRequest ? this.getValidUrlFor(pageEndpoint) : null;
            },
            {
                fetcher: (path: string) => this.restClient.fetcher(path, { httpMethod, data, config: axiosOptions }),
                use: disableCache ? [disableSwrInfiniteCache] : undefined,
                ...swrConfig,
            },
        );

        const customSwrResult = {
            ...swrResult,
            isInitialLoad: swrResult.isLoading,
            isLoadMore: isLoadingMore(swrResult),
        };
        customSwrResult.isLoading = customSwrResult.isInitialLoad || customSwrResult.isLoadMore;

        return customSwrResult;
    }

    /**
     * Performs the actual server request.
     *
     * In case {@link HttpMethod.GET_SWR} gets passed, the "useSWR" hook gets called.
     * In case {@link HttpMethod.GET_SWR_INFINITE} gets passed, the "useSWRInfinite" hook gets called.
     * In that case "getEndpoint" has to be passed, which gets used over "endpoint"
     *
     * Pass "skipRequest" to make SWR skip sending the request to the server.
     * In case "formData" is passed, "data" gets ignored.
     */
    private doRequest<
        Result extends AbortableAxiosResponse | AbortableSWRResponse | AbortableSWRInfiniteResponse,
        OptionsSWR extends SWROptions | SWRInfiniteOptions,
    >(
        httpMethod: HttpMethodType,
        endpoint: string,
        {
            apiVersion = RequestManager.API_VERSION,
            data: dataToSend,
            formData,
            axiosOptions,
            swrOptions,
        }: {
            apiVersion?: string;
            data?: any;
            formData?: { [key: string]: any };
            axiosOptions?: AxiosRequestConfig;
            swrOptions?: OptionsSWR;
        } = {},
    ): Result {
        const url = `${apiVersion}${endpoint}`;

        let data = dataToSend;
        if (formData) {
            data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined) data.append(key, value); // "append" automatically converts non string or blob values to strings
            });
        }

        const abortController = new AbortController();
        const abortRequest = (reason?: any): void => {
            if (!abortController.signal.aborted) {
                abortController.abort(reason);
            }
        };
        const axiosOptionsWithAbortController = { ...axiosOptions, signal: abortController.signal };
        switch (httpMethod) {
            case HttpMethod.SWR_GET:
                return {
                    ...(this.useSwr(url, HttpMethod.GET, { axiosOptions, swrOptions }) as Result),
                    abortRequest,
                };
            case HttpMethod.SWR_GET_INFINITE:
                // throw TypeError in case options aren't correctly passed
                return {
                    ...(this.useSwrInfinite(swrOptions!.getEndpoint!, HttpMethod.GET, {
                        axiosOptions: axiosOptionsWithAbortController,
                        swrOptions,
                    }) as Result),
                    abortRequest,
                };
            case SWRHttpMethod.SWR_POST_INFINITE:
                return {
                    ...(this.useSwrInfinite(swrOptions!.getEndpoint!, HttpMethod.POST, {
                        data,
                        axiosOptions: axiosOptionsWithAbortController,
                        swrOptions,
                    }) as Result),
                    abortRequest,
                };
            case HttpMethod.SWR_POST:
                return {
                    ...(this.useSwr(url, HttpMethod.POST, {
                        data,
                        axiosOptions: axiosOptionsWithAbortController,
                        swrOptions,
                    }) as Result),
                    controller: abortController,
                };
            default:
                return {
                    response: this.restClient.fetcher(url, {
                        data,
                        httpMethod,
                        config: axiosOptionsWithAbortController,
                        checkResponseIsJson: false,
                    }),
                    abortRequest,
                } as Result;
        }
    }

    public useGetGlobalMeta(
        options?: QueryHookOptions<GetGlobalMetadatasQuery, GetGlobalMetadatasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetGlobalMetadatasQuery, GetGlobalMetadatasQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_GLOBAL_METADATAS, {}, options);
    }

    public setGlobalMetadata(key: string, value: any): AbortableApolloMutationResponse<SetGlobalMetadataMutation> {
        return this.doRequestNew<SetGlobalMetadataMutation, SetGlobalMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_GLOBAL_METADATA,
            { input: { meta: { key, value: `${value}` } } },
            { refetchQueries: [GET_GLOBAL_METADATA, GET_GLOBAL_METADATAS] },
        );
    }

    public useGetAbout(
        options?: QueryHookOptions<GetAboutQuery, GetAboutQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetAboutQuery, GetAboutQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_ABOUT, {}, options);
    }

    public useCheckForUpdate(
        options?: QueryHookOptions<CheckForServerUpdatesQuery, CheckForServerUpdatesQueryVariables>,
    ): AbortableApolloUseQueryResponse<CheckForServerUpdatesQuery, CheckForServerUpdatesQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, CHECK_FOR_SERVER_UPDATES, {}, options);
    }

    public useGetExtensionList(
        options?: QueryHookOptions<GetExtensionsQuery, GetExtensionsQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetExtensionsQuery, GetExtensionsQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_EXTENSIONS, {}, options);
    }

    public useExtensionListFetch(
        options?: MutationHookOptions<GetExtensionsFetchMutation, GetExtensionsFetchMutationVariables>,
    ): AbortableApolloUseMutationResponse<GetExtensionsFetchMutation, GetExtensionsFetchMutationVariables> {
        return this.doRequestNew(GQLMethod.USE_MUTATION, GET_EXTENSIONS_FETCH, {}, options);
    }

    public installExternalExtension(
        extensionFile: File,
    ): AbortableApolloMutationResponse<InstallExternalExtensionMutation> {
        return this.doRequestNew<InstallExternalExtensionMutation, InstallExternalExtensionMutationVariables>(
            GQLMethod.MUTATION,
            INSTALL_EXTERNAL_EXTENSION,
            { file: extensionFile },
            { refetchQueries: [GET_EXTENSION, GET_EXTENSIONS] },
        );
    }

    public updateExtension(
        id: string,
        patch: UpdateExtensionPatchInput,
    ): AbortableApolloMutationResponse<UpdateExtensionMutation> {
        return this.doRequestNew<UpdateExtensionMutation, UpdateExtensionMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_EXTENSION,
            { input: { id, patch } },
            { refetchQueries: [GET_EXTENSION, GET_EXTENSIONS, GET_SOURCES] },
        );
    }

    public getExtensionIconUrl(extension: string): string {
        return this.getValidImgUrlFor(`extension/icon/${extension}`);
    }

    public useGetSourceList(
        options?: QueryHookOptions<GetSourcesQuery, GetSourcesQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetSourcesQuery, GetSourcesQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_SOURCES, {}, options);
    }

    public useGetSource(
        id: string,
        options?: QueryHookOptions<GetSourceQuery, GetSourceQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetSourceQuery, GetSourceQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_SOURCE, { id }, options);
    }

    public useGetSourceMangas(
        input: FetchSourceMangaInput,
        options?: MutationHookOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        const createPaginatedResult = (
            result: AbortableApolloUseMutationResponse[1],
            page: number,
        ): AbortableApolloUseMutationPaginatedResponse[1][number] => {
            const loading = result.loading || !result.called;
            return {
                ...result,
                loading,
                size: page,
                loadingMore: loading && page > 1,
            };
        };

        // TODO - implement caching
        //  - ? global cache with revalidating (same as SWR does, revalidate each page starting with 1st until the first page is reached whose data didn't change)
        //  - ? saving fetched mangas in location state and only "cache" when navigating prev/next
        const [mutate, result] = this.doRequestNew<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>(
            GQLMethod.USE_MUTATION,
            GET_SOURCE_MANGAS_FETCH,
            { input },
            options,
        );

        const [previousResults, setPreviousResults] = useState<AbortableApolloUseMutationPaginatedResponse[1]>([
            createPaginatedResult(result, input.page),
        ]);

        const [contentType, setContentType] = useState(input.type);
        const [query, setQuery] = useState(input.query);
        const [page, setPage] = useState(input.page);

        const paginatedResult = createPaginatedResult(result, page);

        // TODO - option "global cache with revalidating"
        // replace previousResults with cache
        // cache specific response
        // cache "base" key to specific page keys to be able to retrieve all necessary cached pages
        // get cached results
        // revalidate in background - revalidate first page -> result changed? revalidate every page until cached result and response is the same

        // wrap "mutate" function to align with the expected type, which allows only passing a "page" argument
        const wrappedMutate = (newPage: number) => {
            const resetPreviousResultForInitialLoad = newPage < page;
            if (resetPreviousResultForInitialLoad) {
                setPreviousResults(previousResults.filter((prevResult) => prevResult.size <= newPage));
            }

            if (newPage !== page) {
                setPage(newPage);
            }

            return mutate({
                variables: {
                    input: {
                        ...input,
                        page: newPage,
                    },
                },
            });
        };

        const contentTypeChanged = contentType !== input.type;
        const queryChanged = query !== input.query;
        // instantly return empty results in case the provided variables changed - wait until the hook returns empty data,
        // otherwise, updating the previous results will revert the reset
        const resetPreviousResult = (queryChanged || contentTypeChanged) && !paginatedResult.data;
        let updatedResults = [
            ...(resetPreviousResult ? [{ ...paginatedResult, size: page, loadingMore: false }] : previousResults),
        ];

        if (resetPreviousResult) {
            setContentType(input.type);
            setQuery(input.query);
            setPreviousResults([paginatedResult]);
        }

        const resultChanged = previousResults[page - 1]?.loading !== paginatedResult.loading;
        const updatePreviousResult = resultChanged && !resetPreviousResult;
        if (updatePreviousResult) {
            updatedResults = [...previousResults.slice(0, page - 1), paginatedResult];
            setPreviousResults(updatedResults);
        }

        return [wrappedMutate, updatedResult];
    }

    public useGetSourcePopularMangas(
        sourceId: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedMangaList>,
    ): AbortableSWRInfiniteResponse<PaginatedMangaList> {
        return this.doRequest(SWRHttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true ? `source/${sourceId}/popular/${page + 1}` : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public useGetSourceLatestMangas(
        sourceId: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedMangaList>,
    ): AbortableSWRInfiniteResponse<PaginatedMangaList> {
        return this.doRequest(SWRHttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true ? `source/${sourceId}/latest/${page + 1}` : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public useGetSourcePreferences(
        sourceId: string,
        swrOptions?: SWROptions<SourcePreferences[]>,
    ): AbortableSWRResponse<SourcePreferences[]> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}/preferences`, { swrOptions });
    }

    public setSourcePreferences(sourceId: string, position: number, value: string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, `source/${sourceId}/preferences`, { data: { position, value } });
    }

    public useGetSourceFilters(
        sourceId: string,
        reset?: boolean,
        swrOptions?: SWROptions<ISourceFilters[]>,
    ): AbortableSWRResponse<ISourceFilters[]> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}/filters`, { swrOptions });
    }

    public setSourceFilters(sourceId: string, filters: { position: number; state: string }[]): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, `source/${sourceId}/filters`, { data: filters });
    }

    public resetSourceFilters(sourceId: string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `source/${sourceId}/filters?reset=true`);
    }

    public useSourceSearch(
        source: string,
        query: string,
        filters?: FilterChangeInput[],
        options?: MutationHookOptions<GetSourceMangasFetchMutation, GetSourceMangasFetchMutationVariables>,
    ): AbortableApolloUseMutationPaginatedResponse<
        GetSourceMangasFetchMutation,
        GetSourceMangasFetchMutationVariables
    > {
        return this.useGetSourceMangas({ type: FetchSourceMangaType.Search, source, query, filters, page: 1 }, options);
    }

    public useSourceQuickSearch(
        sourceId: string,
        searchTerm: string,
        filters: { position: number; state: string }[],
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<SourceSearchResult>,
    ): AbortableSWRInfiniteResponse<SourceSearchResult> {
        return this.doRequest(HttpMethod.SWR_POST_INFINITE, '', {
            data: { searchTerm, filter: filters },
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true
                        ? `source/${sourceId}/quick-search?searchTerm=${searchTerm}&pageNum=${page + 1}`
                        : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public useGetManga(
        mangaId: number | string,
        options?: QueryHookOptions<GetMangaQuery, GetMangaQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetMangaQuery, GetMangaQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_MANGA, { id: Number(mangaId) }, options);
    }

    public getMangaFetch(
        mangaId: number | string,
        options?: MutationOptions<GetMangaFetchMutation, GetMangaFetchMutationVariables>,
    ): AbortableApolloMutationResponse<GetMangaFetchMutation> {
        return this.doRequestNew<GetMangaFetchMutation, GetMangaFetchMutationVariables>(
            GQLMethod.MUTATION,
            GET_MANGA_FETCH,
            {
                input: {
                    id: Number(mangaId),
                },
            },
            {
                refetchQueries: [GET_MANGA, GET_MANGAS],
                ...options,
            },
        );
    }

    public getMangaThumbnailUrl(mangaId: number): string {
        return this.getValidImgUrlFor(`manga/${mangaId}/thumbnail`);
    }

    public useGetMangaCategories(
        mangaId: number,
        swrOptions?: SWROptions<ICategory[]>,
    ): AbortableSWRResponse<ICategory[]> {
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/category`, { swrOptions });
    }

    public useUpdateMangaCategories(
        options?: MutationHookOptions<UpdateMangaCategoriesMutation, UpdateMangaCategoriesMutationVariables>,
    ): AbortableApolloUseMutationResponse<UpdateMangaCategoriesMutation, UpdateMangaCategoriesMutationVariables> {
        return this.doRequestNew(GQLMethod.USE_MUTATION, UPDATE_MANGA_CATEGORIES, undefined, {
            refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY, GET_CATEGORIES, GET_CATEGORY_MANGAS],
            ...options,
        });
    }

    public updateManga(
        id: number,
        patch: UpdateMangaPatchInput,
        options?: MutationHookOptions<UpdateMangaMutation, UpdateMangaMutationVariables>,
    ): AbortableApolloMutationResponse<UpdateMangaMutation> {
        return this.doRequestNew<UpdateMangaMutation, UpdateMangaMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_MANGA,
            { input: { id, patch } },
            {
                refetchQueries: [
                    GET_MANGA,
                    GET_MANGAS,
                    GET_CATEGORY_MANGAS,
                    GET_CATEGORY,
                    GET_CATEGORIES,
                    GET_SOURCE_MANGAS_FETCH,
                ],
                ...options,
            },
        );
    }

    public setMangaMeta(
        mangaId: number,
        key: string,
        value: any,
    ): AbortableApolloMutationResponse<SetMangaMetadataMutation> {
        return this.doRequestNew(
            GQLMethod.MUTATION,
            SET_MANGA_METADATA,
            {
                input: { meta: { mangaId, key, value: `${value}` } },
            },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY_MANGAS, GET_SOURCE_MANGAS_FETCH] },
        );
    }

    public useGetMangaChapters(
        mangaId: number | string,
        { doOnlineFetch, ...swrOptions }: SWROptions<IChapter[]> & RequestOption = {},
    ): AbortableSWRResponse<IChapter[]> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/chapters${onlineFetch}`, {
            swrOptions,
        });
    }

    public getMangaChapters(mangaId: number | string, doOnlineFetch?: boolean): AbortableAxiosResponse<IChapter[]> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/chapters${onlineFetch}`);
    }

    public useGetChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        swrOptions?: SWROptions<IChapter>,
    ): AbortableSWRResponse<IChapter> {
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/chapter/${chapterIndex}`, {
            swrOptions,
        });
    }

    public getChapter(mangaId: number | string, chapterIndex: number | string): AbortableAxiosResponse<IChapter> {
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/chapter/${chapterIndex}`);
    }

    public deleteDownloadedChapter(id: number): AbortableApolloMutationResponse<DeleteDownloadedChapterMutation> {
        return this.doRequestNew<DeleteDownloadedChapterMutation, DeleteDownloadedChapterMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_DOWNLOADED_CHAPTER,
            { input: { id } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY_MANGAS, GET_CHAPTERS] },
        );
    }

    public deleteDownloadedChapters(ids: number[]): AbortableApolloMutationResponse<DeleteDownloadedChaptersMutation> {
        return this.doRequestNew<DeleteDownloadedChaptersMutation, DeleteDownloadedChaptersMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_DOWNLOADED_CHAPTERS,
            { input: { ids } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY_MANGAS, GET_CHAPTERS] },
        );
    }

    public updateChapter(
        id: number,
        patch: UpdateChapterPatchInput,
    ): AbortableApolloMutationResponse<UpdateChapterMutation> {
        return this.doRequestNew<UpdateChapterMutation, UpdateChapterMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CHAPTER,
            { input: { id, patch } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY_MANGAS, GET_CHAPTER, GET_CHAPTERS] },
        );
    }

    public setChapterMeta(
        chapterId: number,
        key: string,
        value: any,
    ): AbortableApolloMutationResponse<SetChapterMetadataMutation> {
        return this.doRequestNew<SetChapterMetadataMutation, SetChapterMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_CHAPTER_METADATA,
            { input: { meta: { chapterId, key, value: `${value}` } } },
            { refetchQueries: [GET_CHAPTER, GET_CHAPTERS] },
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
        patch: UpdateChapterPatchInput,
    ): AbortableApolloMutationResponse<UpdateChaptersMutation> {
        return this.doRequestNew<UpdateChaptersMutation, UpdateChaptersMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CHAPTERS,
            { input: { ids, patch } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY_MANGAS, GET_CHAPTER, GET_CHAPTERS] },
        );
    }

    public useGetCategories(): AbortableApolloUseQueryResponse<GetCategoriesQuery, GetCategoriesQueryVariables> {
        return this.doRequestNew<GetCategoriesQuery, GetCategoriesQueryVariables>(GQLMethod.USE_QUERY, GET_CATEGORIES, {
            orderBy: CategoryOrderBy.Order,
        });
    }

    public createCategory(input: CreateCategoryInput): AbortableApolloMutationResponse<CreateCategoryMutation> {
        return this.doRequestNew<CreateCategoryMutation, CreateCategoryMutationVariables>(
            GQLMethod.MUTATION,
            CREATE_CATEGORY,
            { input },
            { refetchQueries: [GET_CATEGORIES] },
        );
    }

    public reorderCategory(id: number, position: number): AbortableApolloMutationResponse<UpdateCategoryOrderMutation> {
        return this.doRequestNew<UpdateCategoryOrderMutation, UpdateCategoryOrderMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CATEGORY_ORDER,
            { input: { id, position } },
            { refetchQueries: [GET_CATEGORIES] },
        );
    }

    public useGetCategoryMangas(
        id: number,
        options?: QueryHookOptions<GetCategoryMangasQuery, GetCategoryMangasQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetCategoryMangasQuery, GetCategoryMangasQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_CATEGORY_MANGAS, { id }, options);
    }

    public deleteCategory(categoryId: number): AbortableApolloMutationResponse<DeleteCategoryMutation> {
        return this.doRequestNew<DeleteCategoryMutation, DeleteCategoryMutationVariables>(
            GQLMethod.MUTATION,
            DELETE_CATEGORY,
            { input: { categoryId } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORIES] },
        );
    }

    public updateCategory(
        id: number,
        patch: UpdateCategoryPatchInput,
    ): AbortableApolloMutationResponse<UpdateCategoryMutation> {
        return this.doRequestNew<UpdateCategoryMutation, UpdateCategoryMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_CATEGORY,
            { input: { id, patch } },
            { refetchQueries: [GET_CATEGORY, GET_CATEGORIES] },
        );
    }

    public setCategoryMeta(
        categoryId: number,
        key: string,
        value: any,
    ): AbortableApolloMutationResponse<SetCategoryMetadataMutation> {
        return this.doRequestNew<SetCategoryMetadataMutation, SetCategoryMetadataMutationVariables>(
            GQLMethod.MUTATION,
            SET_CATEGORY_METADATA,
            { input: { meta: { categoryId, key, value: `${value}` } } },
            { refetchQueries: [GET_MANGA, GET_MANGAS, GET_CATEGORY, GET_CATEGORIES] },
        );
    }

    public restoreBackupFile(file: File): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, 'backup/import/file', { formData: { 'backup.proto.gz': file } });
    }

    public useValidateBackupFile(
        file: File,
        swrOptions?: SWROptions<BackupValidationResult>,
    ): AbortableSWRResponse<BackupValidationResult> {
        return this.doRequest(HttpMethod.SWR_POST, 'backup/validate/file', {
            formData: { 'backup.proto.gz': file },
            swrOptions,
        });
    }

    public getExportBackupUrl(): string {
        return this.getValidUrlFor('backup/export/file');
    }

    public startDownloads(): AbortableApolloMutationResponse<StartDownloaderMutation> {
        return this.doRequestNew<StartDownloaderMutation, StartDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            START_DOWNLOADER,
            {},
        );
    }

    public stopDownloads(): AbortableApolloMutationResponse<StopDownloaderMutation> {
        return this.doRequestNew<StopDownloaderMutation, StopDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            STOP_DOWNLOADER,
            {},
        );
    }

    public clearDownloads(): AbortableApolloMutationResponse<ClearDownloaderMutation> {
        return this.doRequestNew<ClearDownloaderMutation, ClearDownloaderMutationVariables>(
            GQLMethod.MUTATION,
            CLEAR_DOWNLOADER,
            {},
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public addChapterToDownloadQueue(id: number): AbortableApolloMutationResponse<EnqueueChapterDownloadMutation> {
        return this.doRequestNew<EnqueueChapterDownloadMutation, EnqueueChapterDownloadMutationVariables>(
            GQLMethod.MUTATION,
            ENQUEUE_CHAPTER_DOWNLOAD,
            { input: { id } },
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public removeChapterFromDownloadQueue(id: number): AbortableApolloMutationResponse<DequeueChapterDownloadMutation> {
        return this.doRequestNew<DequeueChapterDownloadMutation, DequeueChapterDownloadMutationVariables>(
            GQLMethod.MUTATION,
            DEQUEUE_CHAPTER_DOWNLOAD,
            { input: { id } },
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public reorderChapterInDownloadQueue(
        chapterId: number,
        position: number,
    ): AbortableApolloMutationResponse<ReorderChapterDownloadMutation> {
        return this.doRequestNew<ReorderChapterDownloadMutation, ReorderChapterDownloadMutationVariables>(
            GQLMethod.MUTATION,
            REORDER_CHAPTER_DOWNLOAD,
            { input: { chapterId, to: position } },
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public addChaptersToDownloadQueue(ids: number[]): AbortableApolloMutationResponse<EnqueueChapterDownloadsMutation> {
        return this.doRequestNew<EnqueueChapterDownloadsMutation, EnqueueChapterDownloadsMutationVariables>(
            GQLMethod.MUTATION,
            ENQUEUE_CHAPTER_DOWNLOADS,
            { input: { ids } },
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public removeChaptersFromDownloadQueue(
        ids: number[],
    ): AbortableApolloMutationResponse<DequeueChapterDownloadsMutation> {
        return this.doRequestNew<DequeueChapterDownloadsMutation, DequeueChapterDownloadsMutationVariables>(
            GQLMethod.MUTATION,
            DEQUEUE_CHAPTER_DOWNLOADS,
            { input: { ids } },
            { refetchQueries: [GET_DOWNLOAD_STATUS] },
        );
    }

    public useGetRecentlyUpdatedChapters(
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedList<IMangaChapter>>,
    ): AbortableSWRInfiniteResponse<PaginatedList<IMangaChapter>> {
        return this.doRequest(HttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true ? `update/recentChapters/${page}` : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public startGlobalUpdate(): AbortableApolloMutationResponse<UpdateLibraryMangasMutation>;

    public startGlobalUpdate(categories: number[]): AbortableApolloMutationResponse<UpdateCategoryMangasMutation>;

    public startGlobalUpdate(
        categories?: number[],
    ): AbortableApolloMutationResponse<UpdateCategoryMangasMutation | UpdateLibraryMangasMutation> {
        if (categories?.length) {
            return this.doRequestNew<UpdateCategoryMangasMutation, UpdateCategoryMangasMutationVariables>(
                GQLMethod.MUTATION,
                UPDATE_CATEGORY_MANGAS,
                { input: { categories } },
            );
        }

        return this.doRequestNew<UpdateLibraryMangasMutation, UpdateLibraryMangasMutationVariables>(
            GQLMethod.MUTATION,
            UPDATE_LIBRARY_MANGAS,
            {},
        );
    }

    public resetGlobalUpdate(): AbortableApolloMutationResponse<StopUpdaterMutation> {
        return this.doRequestNew<StopUpdaterMutation, StopUpdaterMutationVariables>(
            GQLMethod.MUTATION,
            STOP_UPDATER,
            {},
        );
    }

    public useGetGlobalUpdateSummary(
        options?: QueryHookOptions<GetUpdateStatusQuery, GetUpdateStatusQueryVariables>,
    ): AbortableApolloUseQueryResponse<GetUpdateStatusQuery, GetUpdateStatusQueryVariables> {
        return this.doRequestNew(GQLMethod.USE_QUERY, GET_UPDATE_STATUS, {}, options);
    }
}

const requestManager = new RequestManager();
export default requestManager;
