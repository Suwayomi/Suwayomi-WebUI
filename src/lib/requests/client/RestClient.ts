/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseClient } from '@/lib/requests/client/BaseClient.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import type { AbortableApolloMutationResponse } from '@/lib/requests/RequestManager.ts';
import type { RefreshAccessTokenMutation } from '@/lib/graphql/generated/graphql.ts';

export class RestClient extends BaseClient<typeof fetch, RequestInit, (url: string) => Promise<Response>> {
    protected client!: typeof fetch;

    private config: RequestInit = {
        credentials: 'same-origin',
    };

    public readonly fetcher = async (
        url: string,
        {
            config,
            checkResponseIsJson = true,
            isUnauthorizedRetry = false,
        }: {
            config?: RequestInit;
            checkResponseIsJson?: boolean;
            isUnauthorizedRetry?: boolean;
        } = {},
    ): Promise<Response> =>
        this.enqueueRequest(async () => {
            if (AuthManager.shouldRefreshAccessToken()) {
                await BaseClient.refreshAccessToken(this.handleRefreshToken);
            }

            const isBlobOrData = url.startsWith('blob:') || url.startsWith('data:');
            const addBaseUrl = !isBlobOrData && !url.startsWith('http');

            const updatedUrl = addBaseUrl ? `${this.getBaseUrl()}${url}` : url;
            const isAuthRequired = AuthManager.isAuthRequired();
            const accessToken = AuthManager.getAccessToken();

            await this.awaitRateLimit(updatedUrl);

            const result = await this.client(updatedUrl, {
                ...this.config,
                ...config,
                method: 'GET',
                headers: {
                    ...(isAuthRequired && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                    ...this.config.headers,
                    ...config?.headers,
                },
            });

            if (result.status === 401 && !isUnauthorizedRetry) {
                await BaseClient.refreshAccessToken(this.handleRefreshToken);
                return this.fetcher(url, { config, checkResponseIsJson, isUnauthorizedRetry: true });
            }

            if (result.status === 429) {
                this.addRateLimit(updatedUrl, result.headers.get('Retry-After'));
                return this.fetcher(url, { config, checkResponseIsJson, isUnauthorizedRetry });
            }

            if (result.status !== 200) {
                throw new Error(`status ${result.status}: ${result.statusText}`);
            }

            if (checkResponseIsJson && result.headers.get('content-type') !== 'application/json') {
                throw new Error('Response is not json');
            }

            return result;
        });

    constructor(
        handleRefreshToken: (refreshToken: string) => AbortableApolloMutationResponse<RefreshAccessTokenMutation>,
    ) {
        super(handleRefreshToken);

        this.createClient();
    }

    private createClient(): void {
        this.client = fetch.bind(window);
    }

    public updateConfig(config: RequestInit): void {
        this.config = { ...this.config, ...config };
    }
}
