/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { SplashScreen } from '@/features/authentication/components/SplashScreen.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    const { isAuthRequired } = AuthManager.useSession();

    const { data } = requestManager.useGetAbout({
        skip: isAuthRequired !== null,
    });

    useEffect(() => {
        if (!data || AuthManager.isAuthInitialized()) {
            return;
        }

        AuthManager.setAuthRequired(false);
        AuthManager.setAuthInitialized(true);
        requestManager.processQueues();
    }, [data]);

    if (isAuthRequired === null) {
        return <SplashScreen />;
    }

    return children;
};
