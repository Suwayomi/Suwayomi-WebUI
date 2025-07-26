/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useEffect } from 'react';
import { useSessionContext } from '@/features/authentication/SessionContext.tsx';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const { isAuthRequired } = useSessionContext();

    requestManager.useGetAbout({
        skip: isAuthRequired !== null,
        onCompleted: () => AuthManager.setAuthRequired(false),
    });

    useEffect(() => {
        const onUnload = () => AuthManager.setAuthRequired(null);

        window.addEventListener('beforeunload', onUnload);

        return () => window.removeEventListener('beforeunload', onUnload);
    }, []);

    if (isAuthRequired === null) {
        return <SplashScreen />;
    }

    return children;
};
