/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getVersion } from '@/screens/settings/About.tsx';
import { useUpdateChecker } from '@/util/useUpdateChecker.tsx';
import { VersionUpdateInfoDialog } from '@/components/util/VersionUpdateInfoDialog.tsx';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';

const disabledUpdateCheck = () => Promise.resolve();

export const ServerUpdateChecker = () => {
    const { t } = useTranslation();

    const {
        settings: { serverInformAvailableUpdate },
    } = useMetadataServerSettings();

    const {
        data: serverUpdateCheckData,
        loading: isCheckingForServerUpdate,
        error: serverUpdateCheckError,
        refetch: checkForUpdate,
    } = requestManager.useCheckForServerUpdate({
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-only',
    });

    const { data } = requestManager.useGetAbout();
    const { aboutServer } = data ?? {};

    const selectedServerChannelInfo = serverUpdateCheckData?.checkForServerUpdates?.find(
        (channel) => channel.channel === aboutServer?.buildType,
    );
    const version = aboutServer ? getVersion(aboutServer) : undefined;
    const isServerUpdateAvailable = !!selectedServerChannelInfo?.tag && selectedServerChannelInfo.tag !== version;

    const updateChecker = useUpdateChecker(
        'server',
        serverInformAvailableUpdate ? checkForUpdate : disabledUpdateCheck,
        selectedServerChannelInfo?.tag,
    );

    if (!serverInformAvailableUpdate) {
        return null;
    }

    if (isCheckingForServerUpdate) {
        return null;
    }

    if (serverUpdateCheckError) {
        return null;
    }

    if (!isServerUpdateAvailable) {
        return null;
    }

    const isAboutPage = window.location.pathname === '/settings/about';
    if (isAboutPage) {
        return null;
    }

    if (!updateChecker.handleUpdate) {
        return null;
    }

    return (
        <VersionUpdateInfoDialog
            info={t('global.update.label.info', {
                channel: selectedServerChannelInfo.channel,
                version: selectedServerChannelInfo.tag,
            })}
            actionTitle={t('chapter.action.download.add.label.action')}
            actionUrl={selectedServerChannelInfo.url}
            updateCheckerProps={['server', checkForUpdate, selectedServerChannelInfo?.tag]}
        />
    );
};
