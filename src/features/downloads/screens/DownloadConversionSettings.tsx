/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { DownloadConversionSetting } from '@/features/downloads/components/DownloadConversionSetting.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';

export const DownloadConversionSettings = () => {
    const { t } = useTranslation();

    useAppTitle(t('download.title.download'));

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = (value: ServerSettings['downloadConversions']): Promise<any> => {
        const mutation = mutateSettings({ variables: { input: { settings: { downloadConversions: value } } } });
        mutation.catch((e) => makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)));

        return mutation;
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadConversionSetting::refetch'))}
            />
        );
    }

    return <DownloadConversionSetting conversions={data!.settings.downloadConversions} updateSetting={updateSetting} />;
};
