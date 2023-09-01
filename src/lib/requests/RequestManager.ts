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
import {
    BackupValidationResult,
    BatchChaptersChange,
    IAbout,
    ICategory,
    IChapter,
    IExtension,
    IManga,
    IMangaChapter,
    IncludeInGlobalUpdate,
    ISource,
    ISourceFilters,
    IUpdateStatus,
    Metadata,
    PaginatedList,
    PaginatedMangaList,
    SourcePreferences,
    SourceSearchResult,
    UpdateCheck,
} from '@/typings.ts';
import { HttpMethod as DefaultHttpMethod, IRestClient, RestClient } from '@/lib/requests/client/RestClient.ts';
import storage from '@/util/localStorage.tsx';
import { GraphQLClient } from '@/lib/requests/client/GraphQLClient.ts';

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

    public useGetGlobalMeta(swrOptions?: SWROptions<Metadata>): AbortableSWRResponse<Metadata> {
        return this.doRequest(HttpMethod.SWR_GET, 'meta', { swrOptions });
    }

    public setGlobalMetadata(key: string, value: any): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, 'meta', { formData: { key, value } });
    }

    public useGetAbout(swrOptions?: SWROptions<IAbout>): AbortableSWRResponse<IAbout> {
        return this.doRequest(HttpMethod.SWR_GET, 'settings/about', { swrOptions });
    }

    public useCheckForUpdate(swrOptions?: SWROptions<UpdateCheck[]>): AbortableSWRResponse<UpdateCheck[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'settings/check-update', { swrOptions });
    }

    public useGetExtensionList(swrOptions?: SWROptions<IExtension[]>): AbortableSWRResponse<IExtension[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'extension/list', { swrOptions });
    }

    public installExtension(extension: string | File): AbortableAxiosResponse {
        if (typeof extension === 'string') {
            return this.doRequest(HttpMethod.GET, `extension/install/${extension}`);
        }

        return this.doRequest(HttpMethod.POST, `extension/install`, { formData: { file: extension } });
    }

    public updateExtension(extension: string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `extension/update/${extension}`);
    }

    public uninstallExtension(extension: string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `extension/uninstall/${extension}`);
    }

    public getExtensionIconUrl(extension: string): string {
        return this.getValidImgUrlFor(`extension/icon/${extension}`);
    }

    public useGetSourceList(swrOptions?: SWROptions<ISource[]>): AbortableSWRResponse<ISource[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'source/list', { swrOptions });
    }

    public useGetSource(sourceId: string, swrOptions?: SWROptions<ISource>): AbortableSWRResponse<ISource> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}`, { swrOptions });
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
        sourceId: string,
        searchTerm: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<SourceSearchResult>,
    ): AbortableSWRInfiniteResponse<SourceSearchResult> {
        return this.doRequest(HttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true
                        ? `source/${sourceId}/search?searchTerm=${searchTerm}&pageNum=${page + 1}`
                        : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
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
        { doOnlineFetch, ...swrOptions }: SWROptions<IManga> & RequestOption = {},
    ): AbortableSWRResponse<IManga> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}${onlineFetch}`, {
            swrOptions,
        });
    }

    public getManga(mangaId: number | string, doOnlineFetch?: boolean): AbortableAxiosResponse<IManga> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}${onlineFetch}`);
    }

    public useGetFullManga(
        mangaId: number | string,
        { doOnlineFetch, ...swrOptions }: SWROptions<IManga> & RequestOption = {},
    ): AbortableSWRResponse<IManga> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/full${onlineFetch}`, {
            swrOptions,
        });
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

    public addMangaToCategory(mangaId: number, categoryId: number): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/category/${categoryId}`);
    }

    public removeMangaFromCategory(mangaId: number, categoryId: number): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/category/${categoryId}`);
    }

    public addMangaToLibrary(mangaId: number | string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/library`);
    }

    public removeMangaFromLibrary(mangaId: number | string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/library`);
    }

    public setMangaMeta(mangaId: number, key: string, value: any): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `manga/${mangaId}/meta`, { formData: { key, value } });
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

    public updateMangaChapters(
        mangaId: number | string,
        {
            chapterIds,
            chapterIndexes,
            change,
        }: (
            | { chapterIds?: number[]; chapterIndexes: number[] }
            | { chapterIds: number[]; chapterIndexes?: number[] }
        ) & { change: BatchChaptersChange },
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, `manga/${mangaId}/chapter/batch`, {
            data: {
                chapterIds,
                chapterIndexes,
                change,
            },
        });
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

    public deleteDownloadedChapter(mangaId: number | string, chapterIndex: number | string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/chapter/${chapterIndex}`);
    }

    public updateChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        change: { read?: boolean; bookmarked?: boolean; markPrevRead?: boolean; lastPageRead?: number } = {},
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `manga/${mangaId}/chapter/${chapterIndex}`, { formData: change });
    }

    public setChapterMeta(
        mangaId: number | string,
        chapterIndex: number | string,
        key: string,
        value: any,
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `manga/${mangaId}/chapter/${chapterIndex}/meta`, {
            formData: { key, value },
        });
    }

    public getChapterPageUrl(mangaId: number | string, chapterIndex: number | string, page: number): string {
        return this.getValidImgUrlFor(
            `manga/${mangaId}/chapter/${chapterIndex}/page/${page}`,
            RequestManager.API_VERSION,
        );
    }

    public updateChapters(chapterIds: number[], change: BatchChaptersChange): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, `chapter/batch`, { data: { chapterIds, change } });
    }

    public useGetCategories(swrOptions?: SWROptions<ICategory[]>): AbortableSWRResponse<ICategory[]> {
        return this.doRequest(HttpMethod.SWR_GET, `category`, { swrOptions });
    }

    public createCategory(name: string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, `category`, { formData: { name } });
    }

    public reorderCategory(currentPosition: number, newPosition: number): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `category/reorder`, {
            formData: { from: currentPosition, to: newPosition },
        });
    }

    public useGetCategoryMangas(categoryId: number, swrOptions?: SWROptions<IManga[]>): AbortableSWRResponse<IManga[]> {
        return this.doRequest(HttpMethod.SWR_GET, `category/${categoryId}`, { swrOptions });
    }

    public deleteCategory(categoryId: number): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, `category/${categoryId}`);
    }

    public updateCategory(
        categoryId: number,
        change: { name?: string; default?: boolean; includeInUpdate?: IncludeInGlobalUpdate } = {},
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `category/${categoryId}`, { formData: change });
    }

    public setCategoryMeta(categoryId: number, key: string, value: any): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `category/${categoryId}/meta`, { formData: { key, value } });
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

    public startDownloads(): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, 'downloads/start');
    }

    public stopDownloads(): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, 'downloads/stop');
    }

    public clearDownloads(): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, 'downloads/clear');
    }

    public addChapterToDownloadQueue(mangaId: number | string, chapterIndex: number | string): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.GET, `download/${mangaId}/chapter/${chapterIndex}`);
    }

    public removeChapterFromDownloadQueue(
        mangaId: number | string,
        chapterIndex: number | string,
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, `download/${mangaId}/chapter/${chapterIndex}`);
    }

    public reorderChapterInDownloadQueue(
        mangaId: number | string,
        chapterIndex: number | string,
        position: number,
    ): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.PATCH, `download/${mangaId}/chapter/${chapterIndex}/reorder/${position}`);
    }

    public addChaptersToDownloadQueue(chapterIds: number[]): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, 'download/batch', { data: { chapterIds } });
    }

    public removeChaptersFromDownloadQueue(chapterIds: number[]): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.DELETE, 'download/batch', { data: { chapterIds } });
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

    public startGlobalUpdate(categoryId?: number): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, 'update/fetch', { formData: { categoryId } });
    }

    public resetGlobalUpdate(): AbortableAxiosResponse {
        return this.doRequest(HttpMethod.POST, 'update/reset');
    }

    public useGetGlobalUpdateSummary(swrOptions?: SWROptions<IUpdateStatus>): AbortableSWRResponse<IUpdateStatus> {
        return this.doRequest(HttpMethod.SWR_GET, 'update/summary', { swrOptions });
    }
}

const requestManager = new RequestManager();
export default requestManager;
