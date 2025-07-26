/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { AppStorage } from '@/lib/storage/AppStorage.ts';
import { useSessionStorage } from '@/base/hooks/useStorage.tsx';

export class AuthManager {
    static readonly AUTH_REQUIRED_KEY = 'auth-required';

    static readonly REFRESH_TOKEN_KEY = 'auth-refresh-token';

    static readonly REACT_SESSION_REFRESH_KEY = 'auth-react-session-refresh';

    private static accessToken: string | null = null;

    static isAuthRequired(): boolean | null {
        return AppStorage.session.getItemParsed(AuthManager.AUTH_REQUIRED_KEY, null);
    }

    static setAuthRequired(value: boolean | null): void {
        AppStorage.session.setItem(AuthManager.AUTH_REQUIRED_KEY, value);
    }

    static useIsAuthRequired(): boolean | null {
        const [value] = useSessionStorage(AuthManager.AUTH_REQUIRED_KEY, null);

        return value;
    }

    static getAccessToken(): string | null {
        return AuthManager.accessToken;
    }

    static getRefreshToken(): string | null {
        return AppStorage.session.getItemParsed(AuthManager.REFRESH_TOKEN_KEY, null);
    }

    static getTokens(): { accessToken: string | null; refreshToken: string | null } {
        return {
            accessToken: AuthManager.getAccessToken(),
            refreshToken: AuthManager.getRefreshToken(),
        };
    }

    static setAccessToken(token: string): void {
        AuthManager.accessToken = token;
        AuthManager.refreshReactSessionContext();
    }

    static setRefreshToken(token: string): void {
        AppStorage.session.setItem(AuthManager.REFRESH_TOKEN_KEY, token);
        AuthManager.refreshReactSessionContext();
    }

    static setTokens(accessToken: string, refreshToken: string): void {
        AuthManager.setAccessToken(accessToken);
        AuthManager.setRefreshToken(refreshToken);
    }

    static removeAccessToken(): void {
        AuthManager.accessToken = null;
        AuthManager.refreshReactSessionContext();
    }

    static removeRefreshToken(): void {
        AppStorage.session.setItem(AuthManager.REFRESH_TOKEN_KEY, undefined);
        AuthManager.refreshReactSessionContext();
    }

    static removeTokens(): void {
        AuthManager.removeAccessToken();
        AuthManager.removeRefreshToken();
    }

    private static getNextReactSessionContextId(): number {
        const id = AppStorage.session.getItemParsed(AuthManager.REACT_SESSION_REFRESH_KEY, 0);

        return (id + 1) % Number.MAX_SAFE_INTEGER;
    }

    static refreshReactSessionContext(): void {
        AppStorage.session.setItem(AuthManager.REACT_SESSION_REFRESH_KEY, AuthManager.getNextReactSessionContextId());
    }

    static useListenToReactSessionContextRefreshEvent(): void {
        useSessionStorage(AuthManager.REACT_SESSION_REFRESH_KEY, 0);
    }
}
