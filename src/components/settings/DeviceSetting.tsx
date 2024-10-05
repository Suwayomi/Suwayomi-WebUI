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
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import { useContext, useLayoutEffect } from 'react';
import { updateMetadataServerSettings, useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataServerSettingKeys, MetadataServerSettings } from '@/typings.ts';
import { makeToast } from '@/lib/ui/Toast.ts';
import { MutableListSetting } from '@/modules/core/components/settings/MutableListSetting.tsx';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { ActiveDevice, DEFAULT_DEVICE } from '@/util/device.ts';
import { Select } from '@/modules/core/components/inputs/Select.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';

export const DeviceSetting = () => {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useLayoutEffect(() => {
        setTitle(t('settings.device.title.settings'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const {
        metadata,
        settings: { devices },
        loading,
        request: { error, refetch },
    } = useMetadataServerSettings();

    const { activeDevice, setActiveDevice } = useContext(ActiveDevice);

    const updateMetadataSetting = <Setting extends MetadataServerSettingKeys>(
        setting: Setting,
        value: MetadataServerSettings[Setting],
    ) => {
        if (!metadata) {
            return;
        }

        const wasActiveDeviceDeleted = setting === 'devices' && !(value as string[]).includes(activeDevice);
        if (wasActiveDeviceDeleted) {
            setActiveDevice(DEFAULT_DEVICE);
        }

        updateMetadataServerSettings(setting, value).catch(() =>
            makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
        );
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DeviceSetting::refetch'))}
            />
        );
    }

    return (
        <List sx={{ pt: 0 }}>
            <MutableListSetting
                settingName={t('settings.device.devices.label.title')}
                description={t('settings.device.devices.label.description')}
                handleChange={(deviceList) => {
                    updateMetadataSetting('devices', [...new Set([DEFAULT_DEVICE, ...deviceList])]);
                }}
                valueInfos={devices.map((device) => [device, { mutable: false, deletable: device !== DEFAULT_DEVICE }])}
                addItemButtonTitle={t('global.button.create')}
                validateItem={(device) => device.length <= 16 && !!device.match(/^[a-zA-Z0-9\-_]+$/g)}
                placeholder={t('settings.device.label.placeholder')}
            />
            <ListItem>
                <ListItemText
                    primary={t('settings.device.active_device.label.title')}
                    secondary={t('settings.device.active_device.label.description')}
                />
                <Select value={activeDevice} onChange={({ target: { value: device } }) => setActiveDevice(device)}>
                    {devices.map((device) => (
                        <MenuItem key={device} value={device}>
                            {device}
                        </MenuItem>
                    ))}
                </Select>
            </ListItem>
        </List>
    );
};
