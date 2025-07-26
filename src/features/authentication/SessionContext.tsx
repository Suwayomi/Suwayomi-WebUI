/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

interface TSessionContext {
    isAuthRequired: boolean | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const SessionContext = createContext<TSessionContext>({
    isAuthRequired: null,
    accessToken: null,
    refreshToken: null,
});

export const SessionContextProvider = ({ children }: { children: ReactNode }) => {
    AuthManager.useListenToReactSessionContextRefreshEvent();

    const isAuthRequired = AuthManager.useIsAuthRequired();
    const { accessToken, refreshToken } = AuthManager.getTokens();

    const value = useMemo(
        () => ({
            isAuthRequired,
            accessToken,
            refreshToken,
        }),
        [isAuthRequired, accessToken, refreshToken],
    );

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSessionContext = () => useContext(SessionContext);
