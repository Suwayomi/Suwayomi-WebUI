/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { Trans, useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import { MutableListSetting } from '@/base/components/settings/MutableListSetting.tsx';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { MetadataBrowseSettings } from '@/features/browse/Browse.types.ts';
import { ServerSettings as GqlServerSettings } from '@/features/settings/Settings.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

type ExtensionsSettings = Pick<GqlServerSettings, 'maxSourcesInParallel' | 'localSourcePath' | 'extensionRepos'>;

export const BrowseSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Browse`);

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = <Setting extends keyof ExtensionsSettings>(
        setting: Setting,
        value: ExtensionsSettings[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } }).catch((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
    };

    const {
        settings: { hideLibraryEntries, showNsfw },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<keyof MetadataBrowseSettings>((e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('BrowseSettings::refetch'))}
            />
        );
    }

    const serverSettings = data!.settings;

    return (
        <List sx={{ pt: 0 }}>
            <ListItem>
                <ListItemText primary={t`Hide entries already in library`} />
                <Switch
                    edge="end"
                    checked={hideLibraryEntries}
                    onChange={() => updateMetadataServerSettings('hideLibraryEntries', !hideLibraryEntries)}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t`Show NSFW`} secondary={t`Hide NSFW extensions and sources`} />
                <Switch
                    edge="end"
                    checked={showNsfw}
                    onChange={() => updateMetadataServerSettings('showNsfw', !showNsfw)}
                />
            </ListItem>
            <NumberSetting
                settingTitle={t`Parallel source requests`}
                settingValue={plural(serverSettings.maxSourcesInParallel, {
                    one: '# Source',
                    other: '# Sources',
                })}
                valueUnit={t`Source`}
                value={serverSettings.maxSourcesInParallel}
                defaultValue={6}
                minValue={1}
                maxValue={20}
                showSlider
                stepSize={1}
                handleUpdate={(parallelSources) => updateSetting('maxSourcesInParallel', parallelSources)}
            />
            <MutableListSetting
                settingName={t`Extension repositories`}
                description={t`Add repositories from which extensions can be installed`}
                dialogDisclaimer={
                    <Trans>
                        <strong>Suwayomi does not provide any support for 3rd party repositories or extensions!</strong>
                        <br />
                        Use with caution as there could be malicious actors making those repositories.
                        <br />
                        You as the user need to verify the security and that you trust any repository or extension.
                    </Trans>
                }
                handleChange={(repos) => {
                    updateSetting('extensionRepos', repos);
                    requestManager.clearExtensionCache();
                }}
                valueInfos={serverSettings.extensionRepos.map((extensionRepo) => [extensionRepo])}
                addItemButtonTitle={t`Add repository`}
                placeholder="https://github.com/MY_ACCOUNT/MY_REPO/tree/repo"
                validateItem={(repo) =>
                    !!repo.match(
                        /https:\/\/(www\.|raw\.)?(github|githubusercontent)\.com\/([^/]+)\/([^/]+)((\/tree|\/blob)?\/([^/\n]*))?(\/([^/\n]*\.json)?)?/g,
                    )
                }
                invalidItemError={t`Invalid repository url`}
            />
            <TextSetting
                settingName={t`Local source location`}
                dialogDescription={t`The path to the directory on the server where local source files are saved in`}
                value={serverSettings.localSourcePath}
                settingDescription={serverSettings.localSourcePath.length ? serverSettings.localSourcePath : t`Default`}
                handleChange={(path) => updateSetting('localSourcePath', path)}
            />
        </List>
    );
};
