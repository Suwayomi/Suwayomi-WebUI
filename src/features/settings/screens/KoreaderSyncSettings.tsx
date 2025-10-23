/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { KoreaderSyncLogin } from '@/features/settings/components/koreaderSync/KoreaderSyncLogin.tsx';
import { KoreaderSyncConfig } from '@/features/settings/components/koreaderSync/KoreaderSyncConfig.tsx';

export const KoreaderSyncSettings = () => {
    const { t } = useTranslation();
    useAppTitle(t('settings.server.koreader.sync.title'));

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('KoreaderSyncSettings::refetch'))}
            />
        );
    }

    const { settings } = data!;
    const isLoggedIn = !!settings.koreaderSyncUserkey;

    if (isLoggedIn) {
        return <KoreaderSyncConfig settings={settings} />;
    }

    return <KoreaderSyncLogin settings={settings} />;
};
