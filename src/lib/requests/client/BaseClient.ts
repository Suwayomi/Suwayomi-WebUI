/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppStorage } from '@/lib/storage/AppStorage.ts';
import type { UserRefreshMutation } from '@/lib/graphql/generated/graphql.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import type { AbortableApolloMutationResponse } from '@/lib/requests/RequestManager.ts';
import { SubpathUtil } from '@/lib/utils/SubpathUtil.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { d } from 'koration';
import dayjs from 'dayjs';

interface QueuedRequest {
    execute: () => void;
    resolve: (value: any) => void;
    reject: (error: any) => void;
}

interface RateLimitInfo {
    timestamp: number;
    retryAfter: number;
}

export abstract class BaseClient<Client, ClientConfig, Fetcher> {
    private static readonly RATE_LIMIT_STORAGE_KEY = 'RATE_LIMIT_STATE';

    static readonly BASE_URL_KEY = 'serverBaseURL';

    protected abstract client: Client;

    public abstract readonly fetcher: Fetcher;

    private static activeTokenRefreshPromise: Promise<UserRefreshMutation | null | undefined> | null = null;

    private static onTokenRefreshComplete: (() => void) | null = null;

    protected requestQueue: QueuedRequest[] = [];

    private static rateLimitState = new Map<string, RateLimitInfo>();

    protected constructor(
        protected handleRefreshToken: (refreshToken: string) => AbortableApolloMutationResponse<UserRefreshMutation>,
    ) {
        const rateLimitState = AppStorage.local.getItemParsed(BaseClient.RATE_LIMIT_STORAGE_KEY, {});

        BaseClient.rateLimitState = new Map(Object.entries(rateLimitState));
    }

    public reset(): void {
        BaseClient.activeTokenRefreshPromise = null;
        this.clearQueue(new Error('Client reset'));
    }

    public static setTokenRefreshCompleteCallback(callback: (() => void) | null): void {
        BaseClient.onTokenRefreshComplete = callback;
    }

    protected static async refreshAccessToken(
        refreshFn: (refreshToken: string) => AbortableApolloMutationResponse<UserRefreshMutation>,
    ): Promise<UserRefreshMutation | null | undefined> {
        const refreshToken = AuthManager.getRefreshToken();

        if (!AuthManager.isAuthInitialized()) {
            AuthManager.setAuthInitialized(true);
            AuthManager.setAuthRequired(true);
        }

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        if (this.activeTokenRefreshPromise) {
            return this.activeTokenRefreshPromise;
        }

        AuthManager.setIsRefreshingToken(true);

        const refreshRequest = refreshFn(refreshToken).response;
        this.activeTokenRefreshPromise = refreshRequest.then((result) => result.data);

        try {
            const result = await refreshRequest;
            const { data } = result;

            if (!data) {
                throw new Error('No refreshed access token returned');
            }

            AuthManager.setAccessToken(data.refreshToken.accessToken);

            BaseClient.onTokenRefreshComplete?.();

            return data;
        } catch (e) {
            AuthManager.removeTokens();
            throw e;
        } finally {
            this.activeTokenRefreshPromise = null;
            AuthManager.setIsRefreshingToken(false);
        }
    }

    private static getBaseUrl(): string {
        const { hostname, port, protocol } = window.location;

        const defaultUrl = import.meta.env.DEV
            ? import.meta.env.VITE_SERVER_URL_DEFAULT
            : `${protocol}//${hostname}:${port}`;

        const serverBaseURL = AppStorage.local.getItemParsed(BaseClient.BASE_URL_KEY, defaultUrl);

        // Apply subpath configuration to the base URL
        return SubpathUtil.getApiBaseUrl(serverBaseURL);
    }

    public getBaseUrl(): string {
        return BaseClient.getBaseUrl();
    }

    // oxlint-disable-next-line no-unused-vars
    protected shouldQueueRequest(operationName?: string): boolean {
        return AuthManager.shouldQueueRequests();
    }

    protected enqueueRequest<T>(executor: () => Promise<T>, operationName?: string): Promise<T> {
        if (!this.shouldQueueRequest(operationName)) {
            return executor();
        }

        const queuedRequest = new ControlledPromise<T>();
        const resolve = queuedRequest.resolve.bind(queuedRequest);
        const reject = queuedRequest.reject.bind(queuedRequest);

        this.requestQueue.push({
            execute: () => {
                executor().then(resolve).catch(reject);
            },
            resolve,
            reject,
        });

        return queuedRequest.promise;
    }

    public processQueue(): void {
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        queue.forEach((request) => {
            request.execute();
        });
    }

    protected clearQueue(error?: Error): void {
        const queue = [...this.requestQueue];
        this.requestQueue = [];

        queue.forEach((request) => {
            request.reject(error ?? new Error('Request queue cleared'));
        });
    }

    public abstract updateConfig(config: Partial<ClientConfig>): void;

    private static saveRateLimits() {
        AppStorage.local.setItem(
            BaseClient.RATE_LIMIT_STORAGE_KEY,
            Object.fromEntries([...BaseClient.rateLimitState.entries()]),
        );
    }

    private convertRetryAfter(retryAfter: string | null | undefined): number {
        if (retryAfter == null) {
            return d(1).minutes.inWholeMilliseconds;
        }

        const seconds = parseInt(retryAfter, 10);
        if (!Number.isNaN(seconds)) {
            return d(seconds).seconds.inWholeMilliseconds;
        }

        const date = new Date(retryAfter);

        return dayjs(date).diff();
    }

    protected getOriginFromUrl(url: string): string {
        const { origin } = new URL(url);

        if (origin.startsWith(BaseClient.getBaseUrl())) {
            return url;
        }

        return origin;
    }

    protected addRateLimit(url: string, retryAfter: string | null | undefined) {
        BaseClient.rateLimitState.set(this.getOriginFromUrl(url), {
            timestamp: Date.now(),
            retryAfter: this.convertRetryAfter(retryAfter),
        });
        BaseClient.saveRateLimits();
    }

    private deleteRateLimit(origin: string) {
        BaseClient.rateLimitState.delete(origin);
        BaseClient.saveRateLimits();
    }

    protected getRateLimitTimeout(url: string): number {
        return BaseClient.rateLimitState.get(this.getOriginFromUrl(url))?.retryAfter ?? 0;
    }

    protected isRateLimited(url: string): boolean {
        const origin = this.getOriginFromUrl(url);

        const rateLimitInfo = BaseClient.rateLimitState.get(origin);

        if (!rateLimitInfo) {
            return false;
        }

        const shouldRetry = Date.now() >= rateLimitInfo.timestamp + rateLimitInfo.retryAfter;
        if (!shouldRetry) {
            return true;
        }

        this.deleteRateLimit(origin);

        return false;
    }

    protected async awaitRateLimit(url: string): Promise<void> {
        if (!this.isRateLimited(url)) {
            return;
        }

        await new Promise((resolve) => {
            setTimeout(resolve, this.getRateLimitTimeout(url));
        });
    }
}
