/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Notifications } from '@/base/notification/Notifications.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { parseTrackerOAuthState } from '@/features/tracker/services/TrackerOAuthState.ts';

export const TrackerOAuthLogin = () => {
    const { t } = useLingui();
    const navigate = useNavigate();

    const { trackerId, trackerName = '' } = parseTrackerOAuthState(window.location.href) ?? {};

    useEffect(() => {
        const login = async () => {
            try {
                if (trackerId === undefined) {
                    throw new Error('Invalid login redirect');
                }

                await requestManager.loginToTrackerOauth(trackerId, window.location.href).response;
            } catch (e) {
                Notifications.error(t`Could not log in to ${trackerName}`, getErrorMessage(e));
            }

            navigate(AppRoutes.settings.children.tracking.path, { replace: true });
        };

        login();
    }, [trackerId]);

    return t`Logging in to ${trackerName}…`;
};
