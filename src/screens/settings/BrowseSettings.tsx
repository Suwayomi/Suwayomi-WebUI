/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Trans, useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { NumberSetting } from '@/components/settings/NumberSetting.tsx';
import { MutableListSetting } from '@/components/settings/MutableListSetting.tsx';
import { MetadataBrowseSettings, ServerSettings as GqlServerSettings } from '@/typings.ts';
import { TextSetting } from '@/components/settings/text/TextSetting.tsx';
import { useLocalStorage } from '@/util/useStorage.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

type ExtensionsSettings = Pick<GqlServerSettings, 'maxSourcesInParallel' | 'localSourcePath' | 'extensionRepos'>;

const extractBrowseSettings = (settings: GqlServerSettings): ExtensionsSettings => ({
    maxSourcesInParallel: settings.maxSourcesInParallel,
    localSourcePath: settings.localSourcePath,
    extensionRepos: settings.extensionRepos,
});

export const BrowseSettings = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useSetDefaultBackTo('settings');

    useEffect(() => {
        setTitle(t('settings.browse.title'));
        setAction(null);
    }, [t]);

    const [showNsfw, setShowNsfw] = useLocalStorage<boolean>('showNsfw', true);

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const serverSettings = data ? extractBrowseSettings(data.settings) : undefined;
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    const updateSetting = <Setting extends keyof ExtensionsSettings>(
        setting: Setting,
        value: ExtensionsSettings[Setting],
    ) => {
        mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
    };

    const {
        settings: { hideLibraryEntries },
    } = useMetadataServerSettings();
    const updateMetadataServerSettings = createUpdateMetadataServerSettings<keyof MetadataBrowseSettings>();

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyView
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('BrowseSettings::refetch'))}
            />
        );
    }

    return (
        <List>
            <ListItem>
                <ListItemText primary={t('settings.label.hide_library_entries')} />
                <Switch
                    edge="end"
                    checked={hideLibraryEntries}
                    onChange={() => updateMetadataServerSettings('hideLibraryEntries', !hideLibraryEntries)}
                />
            </ListItem>
            <ListItem>
                <ListItemText
                    primary={t('settings.label.show_nsfw')}
                    secondary={t('settings.label.show_nsfw_description')}
                />
                <Switch edge="end" checked={showNsfw} onChange={() => setShowNsfw(!showNsfw)} />
            </ListItem>
            <NumberSetting
                settingTitle={t('settings.server.requests.sources.parallel.label.title')}
                settingValue={t('settings.server.requests.sources.parallel.label.value', {
                    value: serverSettings?.maxSourcesInParallel,
                    count: serverSettings?.maxSourcesInParallel,
                })}
                valueUnit={t('source.title')}
                value={serverSettings?.maxSourcesInParallel ?? 6}
                defaultValue={6}
                minValue={1}
                maxValue={20}
                showSlider
                stepSize={1}
                handleUpdate={(parallelSources) => updateSetting('maxSourcesInParallel', parallelSources)}
            />
            <MutableListSetting
                settingName={t('extension.settings.repositories.custom.label.title')}
                description={t('extension.settings.repositories.custom.label.description')}
                dialogDisclaimer={
                    <Trans i18nKey="extension.settings.repositories.custom.label.disclaimer">
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
                valueInfos={serverSettings?.extensionRepos.map((extensionRepo) => [extensionRepo]) as [string][]}
                addItemButtonTitle={t('extension.settings.repositories.custom.dialog.action.button.add')}
                placeholder="https://github.com/MY_ACCOUNT/MY_REPO/tree/repo"
                validateItem={(repo) =>
                    !!repo.match(
                        /https:\/\/(www\.|raw\.)?(github|githubusercontent)\.com\/([^/]+)\/([^/]+)((\/tree|\/blob)?\/([^/\n]*))?(\/([^/\n]*\.json)?)?/g,
                    )
                }
                invalidItemError={t('extension.settings.repositories.custom.error.label.invalid_url')}
            />
            <TextSetting
                settingName={t('settings.server.local_source.path.label.title')}
                dialogDescription={t('settings.server.local_source.path.label.description')}
                value={serverSettings?.localSourcePath}
                handleChange={(path) => updateSetting('localSourcePath', path)}
            />
        </List>
    );
};
