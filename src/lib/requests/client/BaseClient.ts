/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { UserRefreshMutation } from '@/lib/graphql/generated/graphql.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { AbortableApolloMutationResponse } from '@/lib/requests/RequestManager.ts';

export abstract class BaseClient<Client, ClientConfig, Fetcher> {
    protected abstract client: Client;

    public abstract readonly fetcher: Fetcher;

    private static activeTokenRefreshPromise: Promise<UserRefreshMutation | null | undefined> | null = null;

    protected static async refreshAccessToken(
        refreshFn: (refreshToken: string) => AbortableApolloMutationResponse<UserRefreshMutation>,
    ): Promise<UserRefreshMutation | null | undefined> {
        const refreshToken = AuthManager.getRefreshToken();

        if (!AuthManager.isAuthRequired()) {
            AuthManager.setAuthRequired(true);
        }

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        if (this.activeTokenRefreshPromise) {
            return this.activeTokenRefreshPromise;
        }

        const refreshRequest = refreshFn(refreshToken).response;
        this.activeTokenRefreshPromise = refreshRequest.then((result) => result.data);

        try {
            const result = await refreshRequest;
            const { data } = result;

            if (!data) {
                throw new Error('No refreshed access token returned');
            }

            AuthManager.setAccessToken(data.refreshToken.accessToken);

            return data;
        } catch (e) {
            AuthManager.removeTokens();
            throw e;
        } finally {
            this.activeTokenRefreshPromise = null;
        }
    }

    protected constructor(
        protected handleRefreshToken: (refreshToken: string) => AbortableApolloMutationResponse<UserRefreshMutation>,
    ) {}

    public getBaseUrl(): string {
        const { hostname, port, protocol } = window.location;

        const defaultUrl = import.meta.env.DEV
            ? import.meta.env.VITE_SERVER_URL_DEFAULT
            : `${protocol}//${hostname}:${port}`;

        return AppStorage.local.getItemParsed('serverBaseURL', defaultUrl);
    }

    public abstract updateConfig(config: Partial<ClientConfig>): void;
}
