/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';
import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteResponse } from 'swr/infinite';
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
    SourcePreferences,
    SourceSearchResult,
    UpdateCheck,
} from 'typings';
import storage from 'util/localStorage';
import { HttpMethod as DefaultHttpMethod, IRestClient, RestClient } from 'lib/RestClient';

enum SWRHttpMethod {
    SWR_GET,
    SWR_GET_INFINITE,
    SWR_POST,
}

type HttpMethodType = DefaultHttpMethod | SWRHttpMethod;
const HttpMethod = { ...SWRHttpMethod, ...DefaultHttpMethod };

type RequestOption = { doOnlineFetch?: boolean };

type CustomSWROptions<Data> = {
    skipRequest?: boolean;
    getEndpoint?: (index: number, previousData: Data | null) => string | null;
};

type SWROptions<Data = any, Error = any> = SWRConfiguration<Data, Error> & CustomSWROptions<Data>;
type SWRInfiniteOptions<Data = any, Error = any> = SWRInfiniteConfiguration<Data, Error> & CustomSWROptions<Data>;

// the following endpoints have not been implemented:
//   - PUT  /api/v1/manga/{mangaId}/chapter/{chapterIndex}  - modify chapter    # PATCH endpoint used instead
//   - POST /api/v1/backup/import                           - import backup     # "import backup file" endpoint used instead
//   - POST /api/v1/backup/validate                         - validate backup   # "validate backup file" endpoint used instead
//   - GET  /api/v1/backup/export                           - export backup     # no function needed, url gets called via link triggering the download
export class RequestManager {
    private static readonly API_VERSION = '/api/v1/';

    private readonly restClient: RestClient = new RestClient();

    public getClient(): IRestClient {
        return this.restClient;
    }

    public updateClient(config: AxiosRequestConfig): void {
        this.restClient.updateConfig(config);
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
        const { skipRequest, ...swrConfig } = swrOptions ?? {};

        // in case "null" gets passed as the url, SWR won't do the request
        return useSWR(skipRequest ? null : url, {
            fetcher: (path: string) => this.restClient.fetcher(path, { data, httpMethod, config: axiosOptions }),
            ...swrConfig,
        });
    }

    public useSwrInfinite<
        Data = any,
        ErrorResponse = any,
        OptionsSWR extends SWRInfiniteOptions<Data, ErrorResponse> = SWRInfiniteOptions<Data, ErrorResponse>,
    >(
        getEndpoint: Required<CustomSWROptions<Data>>['getEndpoint'],
        { axiosOptions, swrOptions }: { axiosOptions?: AxiosRequestConfig; swrOptions?: OptionsSWR } = {},
    ): SWRInfiniteResponse<Data, ErrorResponse> {
        const { skipRequest, ...swrConfig } = swrOptions ?? {};

        // useSWRInfinite will (by default) revalidate the first page, to check if the other pages have to be revalidated as well
        const result = useSWRInfinite<Data, ErrorResponse>(
            (index, previousData) => {
                const pageEndpoint = getEndpoint(index, previousData);
                return pageEndpoint !== null && !skipRequest ? this.getValidUrlFor(pageEndpoint) : null;
            },
            {
                fetcher: (path: string) =>
                    this.restClient.fetcher(path, { httpMethod: HttpMethod.GET, config: axiosOptions }),
                ...swrConfig,
            },
        );

        return {
            ...result,
            // SWR "isLoading" state is only updated for the first load, for every subsequent load it's "false"
            isLoading:
                result.isLoading ||
                // check if more data is being loaded
                (result.size > 0 && !!result.data && typeof result.data[result.size - 1] === 'undefined'),
        };
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
        Result extends Promise<AxiosResponse> | SWRResponse | SWRInfiniteResponse,
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
                if (value !== undefined) data.append(key, `${value}`);
            });
        }

        switch (httpMethod) {
            case HttpMethod.SWR_GET:
                return this.useSwr(url, HttpMethod.GET, { axiosOptions, swrOptions }) as Result;
            case HttpMethod.SWR_GET_INFINITE:
                // throw TypeError in case options aren't correctly passed
                return this.useSwrInfinite(swrOptions!.getEndpoint!, { axiosOptions, swrOptions }) as Result;
            case HttpMethod.SWR_POST:
                return this.useSwr(url, HttpMethod.POST, { data, axiosOptions, swrOptions }) as Result;
            default:
                return this.restClient.fetcher(url, {
                    data,
                    httpMethod,
                    config: axiosOptions,
                    checkResponseIsJson: false,
                }) as Result;
        }
    }

    public useGetGlobalMeta(swrOptions?: SWROptions<Metadata>): SWRResponse<Metadata> {
        return this.doRequest(HttpMethod.SWR_GET, 'meta', { swrOptions });
    }

    public setGlobalMetadata(key: string, value: any): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, 'meta', { formData: { key, value } });
    }

    public useGetAbout(swrOptions?: SWROptions<IAbout>): SWRResponse<IAbout> {
        return this.doRequest(HttpMethod.SWR_GET, 'settings/about', { swrOptions });
    }

    public useCheckForUpdate(swrOptions?: SWROptions<UpdateCheck[]>): SWRResponse<UpdateCheck[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'settings/check-update', { swrOptions });
    }

    public useGetExtensionList(swrOptions?: SWROptions<IExtension[]>): SWRResponse<IExtension[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'extension/list', { swrOptions });
    }

    public installExtension(extension: string | File): Promise<AxiosResponse> {
        if (typeof extension === 'string') {
            return this.doRequest(HttpMethod.GET, `extension/install/${extension}`);
        }

        return this.doRequest(HttpMethod.POST, `extension/install`, { formData: { file: extension } });
    }

    public updateExtension(extension: string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `extension/update/${extension}`);
    }

    public uninstallExtension(extension: string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `extension/uninstall/${extension}`);
    }

    public getExtensionIconUrl(extension: string): string {
        return this.getValidImgUrlFor(`extension/icon/${extension}`);
    }

    public useGetSourceList(swrOptions?: SWROptions<ISource[]>): SWRResponse<ISource[]> {
        return this.doRequest(HttpMethod.SWR_GET, 'source/list', { swrOptions });
    }

    public useGetSource(sourceId: string, swrOptions?: SWROptions<ISource>): SWRResponse<ISource> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}`, { swrOptions });
    }

    public useGetSourcePopularMangas(
        sourceId: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedList<IManga>>,
    ): SWRInfiniteResponse<PaginatedList<IManga>> {
        return this.doRequest(SWRHttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true
                        ? `source/${sourceId}/popular?pageNum=${page + 1}`
                        : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public useGetSourceLatestMangas(
        sourceId: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedList<IManga>>,
    ): SWRInfiniteResponse<PaginatedList<IManga>> {
        return this.doRequest(SWRHttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true
                        ? `source/${sourceId}/latest?pageNum=${page + 1}`
                        : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public useGetSourcePreferences(
        sourceId: string,
        swrOptions?: SWROptions<SourcePreferences[]>,
    ): SWRResponse<SourcePreferences[]> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}/preferences`, { swrOptions });
    }

    public setSourcePreferences(sourceId: string, position: number, value: string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, `source/${sourceId}/preferences`, { data: { position, value } });
    }

    public useGetSourceFilters(
        sourceId: string,
        reset?: boolean,
        swrOptions?: SWROptions<ISourceFilters[]>,
    ): SWRResponse<ISourceFilters[]> {
        return this.doRequest(HttpMethod.SWR_GET, `source/${sourceId}/filters`, { swrOptions });
    }

    public setSourceFilters(sourceId: string, filters: { position: number; state: string }[]): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, `source/${sourceId}/filters`, { data: { filters } });
    }

    public resetSourceFilters(sourceId: string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `source/${sourceId}/filters?reset=true`);
    }

    public useSourceSearch(
        sourceId: string,
        searchTerm: string,
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<SourceSearchResult>,
    ): SWRInfiniteResponse<SourceSearchResult> {
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
    ): SWRInfiniteResponse<SourceSearchResult> {
        return this.doRequest(HttpMethod.SWR_GET_INFINITE, '', {
            data: filters,
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
    ): SWRResponse<IManga> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}${onlineFetch}`, {
            swrOptions,
        });
    }

    public useGetFullManga(
        mangaId: number | string,
        { doOnlineFetch, ...swrOptions }: SWROptions<IManga> & RequestOption = {},
    ): SWRResponse<IManga> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/full${onlineFetch}`, {
            swrOptions,
        });
    }

    public getMangaThumbnailUrl(mangaId: number): string {
        return this.getValidImgUrlFor(`manga/${mangaId}/thumbnail`);
    }

    public useGetMangaCategories(mangaId: number, swrOptions?: SWROptions<ICategory[]>): SWRResponse<ICategory[]> {
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/category`, { swrOptions });
    }

    public addMangaToCategory(mangaId: number, categoryId: number): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/category/${categoryId}`);
    }

    public removeMangaFromCategory(mangaId: number, categoryId: number): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/category/${categoryId}`);
    }

    public addMangaToLibrary(mangaId: number | string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `manga/${mangaId}/library`);
    }

    public removeMangaFromLibrary(mangaId: number | string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/library`);
    }

    public setMangaMeta(mangaId: number, key: string, value: any): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, `manga/${mangaId}/meta`, { formData: { key, value } });
    }

    public useGetMangaChapters(
        mangaId: number | string,
        { doOnlineFetch, ...swrOptions }: SWROptions<IChapter[]> & RequestOption = {},
    ): SWRResponse<IChapter[]> {
        const onlineFetch = doOnlineFetch ? '?onlineFetch=true' : '';
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/chapters${onlineFetch}`, {
            swrOptions,
        });
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
    ): Promise<AxiosResponse> {
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
    ): SWRResponse<IChapter> {
        return this.doRequest(HttpMethod.SWR_GET, `manga/${mangaId}/chapter/${chapterIndex}`, {
            swrOptions,
        });
    }

    public deleteDownloadedChapter(mangaId: number | string, chapterIndex: number | string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, `manga/${mangaId}/chapter/${chapterIndex}`);
    }

    public updateChapter(
        mangaId: number | string,
        chapterIndex: number | string,
        change: { read?: boolean; bookmarked?: boolean; markPrevRead?: boolean; lastPageRead?: number } = {},
    ): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, `manga/${mangaId}/chapter/${chapterIndex}`, { formData: change });
    }

    public setChapterMeta(
        mangaId: number | string,
        chapterIndex: number | string,
        key: string,
        value: any,
    ): Promise<AxiosResponse> {
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

    public updateChapters(chapterIds: number[], change: BatchChaptersChange): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, `chapter/batch`, { data: { chapterIds, change } });
    }

    public useGetCategories(swrOptions?: SWROptions<ICategory[]>): SWRResponse<ICategory[]> {
        return this.doRequest(HttpMethod.SWR_GET, `category`, { swrOptions });
    }

    public createCategory(name: string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, `category`, { formData: { name } });
    }

    public reorderCategory(currentPosition: number, newPosition: number): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, `category/reorder`, {
            formData: { from: currentPosition, to: newPosition },
        });
    }

    public useGetCategoryMangas(categoryId: number, swrOptions?: SWROptions<IManga[]>): SWRResponse<IManga[]> {
        return this.doRequest(HttpMethod.SWR_GET, `category/${categoryId}`, { swrOptions });
    }

    public deleteCategory(categoryId: number): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, `category/${categoryId}`);
    }

    public updateCategory(
        categoryId: number,
        change: { name?: string; default?: boolean; includeInUpdate?: IncludeInGlobalUpdate } = {},
    ): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, `category/${categoryId}`, { formData: change });
    }

    public setCategoryMeta(categoryId: number, key: string, value: any): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, `category/${categoryId}`, { formData: { key, value } });
    }

    public restoreBackupFile(file: File): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, 'backup/import/file', { formData: { 'backup.proto.gz': file } });
    }

    public useValidateBackupFile(
        file: File,
        swrOptions?: SWROptions<BackupValidationResult>,
    ): SWRResponse<BackupValidationResult> {
        return this.doRequest(HttpMethod.SWR_POST, 'backup/validate/file', {
            formData: { 'backup.proto.gz': file },
            swrOptions,
        });
    }

    public getExportBackupUrl(): string {
        return this.getValidUrlFor('backup/export/file');
    }

    public startDownloads(): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, 'downloads/start');
    }

    public stopDownloads(): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, 'downloads/stop');
    }

    public clearDownloads(): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, 'downloads/clear');
    }

    public addChapterToDownloadQueue(mangaId: number | string, chapterIndex: number | string): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.GET, `download/${mangaId}/chapter/${chapterIndex}`);
    }

    public removeChapterFromDownloadQueue(
        mangaId: number | string,
        chapterIndex: number | string,
    ): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, `download/${mangaId}/chapter/${chapterIndex}`);
    }

    public reorderChapterInDownloadQueue(
        mangaId: number | string,
        chapterIndex: number | string,
        position: number,
    ): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.PATCH, `download/${mangaId}/chapter/${chapterIndex}/reorder/${position}`);
    }

    public addChaptersToDownloadQueue(chapterIds: number[]): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, 'download/batch', { data: { chapterIds } });
    }

    public removeChaptersFromDownloadQueue(chapterIds: number[]): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.DELETE, 'download/batch', { data: { chapterIds } });
    }

    public useGetRecentlyUpdatedChapters(
        initialPages?: number,
        swrOptions?: SWRInfiniteOptions<PaginatedList<IMangaChapter>>,
    ): SWRInfiniteResponse<PaginatedList<IMangaChapter>> {
        return this.doRequest(HttpMethod.SWR_GET_INFINITE, '', {
            swrOptions: {
                getEndpoint: (page, previousData) =>
                    previousData?.hasNextPage ?? true ? `update/recentChapters/${page}` : null,
                initialSize: initialPages,
                ...swrOptions,
            } as typeof swrOptions,
        });
    }

    public startGlobalUpdate(categoryId?: number): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, 'update/fetch', { formData: { categoryId } });
    }

    public resetGlobalUpdate(): Promise<AxiosResponse> {
        return this.doRequest(HttpMethod.POST, 'update/reset');
    }

    public useGetGlobalUpdateSummary(swrOptions?: SWROptions<IUpdateStatus>): SWRResponse<IUpdateStatus> {
        return this.doRequest(HttpMethod.SWR_GET, 'update/summary', { swrOptions });
    }
}

const requestManager = new RequestManager();
export default requestManager;
