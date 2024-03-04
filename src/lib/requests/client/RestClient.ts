/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseClient } from '@/lib/requests/client/BaseClient.ts';

export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export interface IRestClient {
    get(url: string): Promise<Response>;
    delete(url: string): Promise<Response>;
    post(url: string, data?: any): Promise<Response>;
    put(url: string, data?: any): Promise<Response>;
    patch(url: string, data?: any): Promise<Response>;
}

export class RestClient
    extends BaseClient<typeof fetch, RequestInit, (url: string, data: any) => Promise<Response>>
    implements IRestClient
{
    private config: RequestInit = {};

    public readonly fetcher = async (
        url: string,
        {
            data,
            httpMethod = HttpMethod.GET,
            config,
            checkResponseIsJson = true,
        }: {
            data?: any;
            httpMethod?: HttpMethod;
            config?: RequestInit;
            checkResponseIsJson?: boolean;
        } = {},
    ): Promise<Response> => {
        const updatedUrl = url.startsWith('http') ? url : `${this.getBaseUrl()}${url}`;

        let result: Response;

        switch (httpMethod) {
            case HttpMethod.GET:
                result = await this.client(updatedUrl, { ...this.config, ...config, method: httpMethod });
                break;
            case HttpMethod.POST:
            case HttpMethod.PATCH:
            case HttpMethod.DELETE:
                result = await this.client(updatedUrl, {
                    ...this.config,
                    ...config,
                    method: httpMethod,
                    body: JSON.stringify(data),
                });
                break;
            default:
                throw new Error(`Unexpected HttpMethod "${httpMethod}"`);
        }

        if (result.status !== 200) {
            throw new Error(result.statusText);
        }

        if (checkResponseIsJson && result.headers.get('content-type') !== 'application/json') {
            throw new Error('Response is not json');
        }

        return result;
    };

    protected override createClient(): void {
        this.client = fetch.bind(window);
    }

    public updateConfig(config: RequestInit): void {
        this.config = { ...this.config, ...config };
    }

    public getClient(): typeof fetch {
        return this.client;
    }

    get get() {
        return (url: string) => this.fetcher(url);
    }

    get post() {
        return (url: string, data?: any) => this.fetcher(url, { data, httpMethod: HttpMethod.POST });
    }

    get put() {
        return (url: string, data?: any) => this.fetcher(url, { data, httpMethod: HttpMethod.POST });
    }

    get patch() {
        return (url: string, data?: any) => this.fetcher(url, { data, httpMethod: HttpMethod.PATCH });
    }

    get delete() {
        return (url: string) => this.fetcher(url, { httpMethod: HttpMethod.DELETE });
    }
}
