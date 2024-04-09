/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast.tsx';

export const TrackerOAuthLogin = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const url = new URL(window.location.href);
    const { trackerId, trackerName }: { trackerId: number; trackerName: string } = JSON.parse(
        url.searchParams.get('state') ?? '{}',
    );

    const [loginTrackerOAuth, { loading: isLoginInProgress }] = requestManager.useLoginToTrackerOauth();

    useEffect(() => {
        const login = async () => {
            try {
                await loginTrackerOAuth({
                    variables: {
                        input: {
                            callbackUrl: window.location.href,
                            trackerId,
                        },
                    },
                });
            } catch (e) {
                makeToast(t('tracking.action.login.label.failure', { name: trackerName }), 'error');
            }

            navigate('/settings/trackingSettings', { replace: true });
        };

        login();
    }, [trackerId]);

    if (isLoginInProgress) {
        return t('tracking.action.login.label.progress', { name: trackerName });
    }

    return null;
};
