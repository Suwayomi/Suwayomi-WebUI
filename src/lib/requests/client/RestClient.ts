/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BaseClient } from '@/lib/requests/client/BaseClient.ts';

export enum HttpMethod {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    DELETE = 'delete',
}

type SimpleRestResponse<Data = any> = {
    data: Data;
};

export interface IRestClient {
    get<Data = any, Response = SimpleRestResponse<Data>>(url: string): Promise<Response>;
    delete<Data = any, Response = SimpleRestResponse<Data>>(url: string): Promise<Response>;
    post<Data = any, Response = SimpleRestResponse<Data>>(url: string, data?: any): Promise<Response>;
    put<Data = any, Response = SimpleRestResponse<Data>>(url: string, data?: any): Promise<Response>;
    patch<Data = any, Response = SimpleRestResponse<Data>>(url: string, data?: any): Promise<Response>;
}

export class RestClient
    extends BaseClient<AxiosInstance, AxiosInstance['defaults'], <Data = any>(url: string, data: any) => Promise<Data>>
    implements IRestClient
{
    public readonly fetcher = async <Data = any>(
        url: string,
        {
            data,
            httpMethod = HttpMethod.GET,
            config,
            checkResponseIsJson = true,
        }: {
            data?: any;
            httpMethod?: HttpMethod;
            config?: AxiosRequestConfig;
            checkResponseIsJson?: boolean;
        } = {},
    ): Promise<Data> => {
        let result: AxiosResponse<Data>;

        switch (httpMethod) {
            case HttpMethod.GET:
                result = await this.client[httpMethod](url, config);
                break;
            case HttpMethod.POST:
            case HttpMethod.PATCH:
            case HttpMethod.DELETE:
                result = await this.client[httpMethod](url, data, config);
                break;
            default:
                throw new Error(`Unexpected HttpMethod "${httpMethod}"`);
        }

        if (result.status !== 200) {
            throw new Error(result.statusText);
        }

        if (checkResponseIsJson && result.headers['content-type'] !== 'application/json') {
            throw new Error('Response is not json');
        }

        return result.data;
    };

    protected override createClient(): void {
        const baseURL = this.getBaseUrl();

        this.client = axios.create({
            // baseURL must not have trailing slash
            baseURL,
        });

        this.client.interceptors.request.use((config) => {
            if (config.data instanceof FormData) {
                Object.assign(config.headers, { 'Content-Type': 'multipart/form-data' });
            }
            return config;
        });
    }

    public updateConfig(config: Partial<AxiosInstance['defaults']>): void {
        this.client.defaults = { ...this.client.defaults, ...config };
    }

    public getClient(): AxiosInstance {
        return this.client;
    }

    get get() {
        return this.client.get;
    }

    get post() {
        return this.client.post;
    }

    get put() {
        return this.client.put;
    }

    get patch() {
        return this.client.patch;
    }

    get delete() {
        return this.client.delete;
    }
}
