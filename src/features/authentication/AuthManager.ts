/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useSyncExternalStore } from 'react';
import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import type { DecodedJwt, TokenPayload } from '@/features/authentication/Auth.types.ts';
import { epochToDate } from '@/base/utils/DateHelper.ts';
import { d } from 'koration';

let notifierValue = 0;

export class AuthManager {
    static readonly REFRESH_TOKEN_KEY = 'auth-refresh-token';

    private static subscribedCount: number = 0;

    private static subscribers = new Map<number, () => void>();

    private static accessToken: TokenPayload | null = null;

    private static authInitialized: boolean = false;

    private static authRequired: boolean | null = null;

    private static refreshingToken: boolean = false;

    private static subscribe(callback: () => void): () => void {
        // oxlint-disable-next-line no-plusplus
        const key = AuthManager.subscribedCount++;
        this.subscribers.set(key, callback);

        return () => this.unsubscribe(key);
    }

    private static unsubscribe(key: number): void {
        this.subscribers.delete(key);
    }

    private static notify(): void {
        notifierValue = (notifierValue + 1) % Number.MAX_SAFE_INTEGER;
        this.subscribers.forEach((callback) => callback());
    }

    static useSession(): {
        accessToken: typeof AuthManager.accessToken;
        refreshToken: ReturnType<typeof AuthManager.getRefreshToken>;
        isAuthRequired: typeof AuthManager.authRequired;
        isInitialized: typeof AuthManager.authInitialized;
        isRefreshingToken: typeof AuthManager.refreshingToken;
    } {
        useSyncExternalStore(AuthManager.subscribe.bind(AuthManager), () => notifierValue);

        return useMemo(
            () => ({
                accessToken: AuthManager.accessToken,
                refreshToken: AuthManager.getRefreshToken(),
                isAuthRequired: AuthManager.authRequired,
                isInitialized: AuthManager.authInitialized,
                isRefreshingToken: AuthManager.refreshingToken,
            }),
            [
                AuthManager.accessToken,
                AuthManager.getRefreshToken(),
                AuthManager.authRequired,
                AuthManager.authInitialized,
                AuthManager.refreshingToken,
            ],
        );
    }

    static useIsAuthenticated(): boolean {
        const { isAuthRequired, accessToken, refreshToken } = AuthManager.useSession();

        return !isAuthRequired || (isAuthRequired && (!!accessToken || !!refreshToken));
    }

    static isAuthInitialized(): boolean {
        return AuthManager.authInitialized;
    }

    static isAuthRequired(): boolean | null {
        return AuthManager.authRequired;
    }

    static isRefreshingToken(): boolean {
        return AuthManager.refreshingToken;
    }

    static isAccessTokenExpired(): boolean {
        return (
            Date.now() >= (AuthManager.accessToken?.expireTimestamp ?? Date.now()) - d(30).seconds.inWholeMilliseconds
        );
    }

    static shouldRefreshAccessToken(): boolean {
        return (
            !!AuthManager.isAuthRequired() &&
            !!AuthManager.getRefreshToken() &&
            !AuthManager.isRefreshingToken() &&
            AuthManager.isAccessTokenExpired()
        );
    }

    static getAccessToken(): string | null {
        return AuthManager.accessToken?.token ?? null;
    }

    static getRefreshToken(): string | null {
        return AppStorage.local.getItemParsed(AuthManager.REFRESH_TOKEN_KEY, null);
    }

    static getTokens(): { accessToken: string | null; refreshToken: string | null } {
        return {
            accessToken: AuthManager.getAccessToken(),
            refreshToken: AuthManager.getRefreshToken(),
        };
    }

    static setAuthInitialized(value: boolean): void {
        AuthManager.authInitialized = value;
        AuthManager.notify();
    }

    static setAuthRequired(value: boolean | null): void {
        AuthManager.authRequired = value;
        AuthManager.notify();
    }

    static setIsRefreshingToken(value: boolean): void {
        AuthManager.refreshingToken = value;
        AuthManager.notify();
    }

    private static decodeToken<T extends object>(token: string): DecodedJwt<T> {
        const parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('Invalid JWT');
        }

        // oxlint-disable-next-line unicorn/consistent-function-scoping
        const decode = (part: string) => {
            const base64 = part.replaceAll('-', '+').replaceAll('_', '/');

            const json = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
                    .join(''),
            );

            return JSON.parse(json);
        };

        return {
            header: decode(parts[0]),
            payload: decode(parts[1]),
        };
    }

    static setAccessToken(token: string): void {
        const {
            payload: { exp },
        } = AuthManager.decodeToken(token);

        assertIsDefined(exp);

        AuthManager.accessToken = {
            token,
            expireTimestamp: epochToDate(exp).valueOf(),
        };
        AuthManager.notify();
    }

    static setRefreshToken(token: string): void {
        AppStorage.local.setItem(AuthManager.REFRESH_TOKEN_KEY, token);
        AuthManager.notify();
    }

    static setTokens(accessToken: string, refreshToken: string): void {
        AuthManager.setAccessToken(accessToken);
        AuthManager.setRefreshToken(refreshToken);
    }

    static removeAccessToken(): void {
        AuthManager.accessToken = null;
        AuthManager.notify();
    }

    static removeRefreshToken(): void {
        AppStorage.local.setItem(AuthManager.REFRESH_TOKEN_KEY, undefined);
        AuthManager.notify();
    }

    static removeTokens(): void {
        AuthManager.removeAccessToken();
        AuthManager.removeRefreshToken();
    }

    static shouldQueueRequests(): boolean {
        const isLoginRequired = AuthManager.isAuthRequired() === true && AuthManager.getAccessToken() === null;

        return !AuthManager.isAuthInitialized() || AuthManager.isRefreshingToken() || isLoginRequired;
    }
}
