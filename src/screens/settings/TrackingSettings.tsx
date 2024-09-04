/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useContext, useEffect } from 'react';
import List from '@mui/material/List';

import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { SettingsTrackerCard } from '@/components/tracker/SettingsTrackerCard.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataTrackingSettings } from '@/typings.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { GET_TRACKERS_SETTINGS } from '@/lib/graphql/queries/TrackerQuery.ts';
import { GetTrackersSettingsQuery } from '@/lib/graphql/generated/graphql.ts';

export const TrackingSettings = () => {
    const { t } = useTranslation();
    const { setTitle } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('tracking.settings.title.settings'));
    }, [t]);

    const {
        settings: { updateProgressAfterReading, updateProgressManualMarkRead },
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchServerMetadataSettings },
    } = useMetadataServerSettings();
    const updateTrackingSettings = createUpdateMetadataServerSettings<keyof MetadataTrackingSettings>(() =>
        makeToast(t('global.error.label.failed_to_save_changes'), 'error'),
    );

    const {
        data,
        loading: areTrackersLoading,
        error: trackersError,
        refetch: refetchTrackersList,
    } = requestManager.useGetTrackerList<GetTrackersSettingsQuery>(GET_TRACKERS_SETTINGS, {
        notifyOnNetworkStatusChange: true,
    });
    const trackers = data?.trackers.nodes ?? [];

    const loading = areMetadataServerSettingsLoading || areTrackersLoading;
    const error = metadataServerSettingsError ?? trackersError;

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => {
                    if (metadataServerSettingsError) {
                        refetchServerMetadataSettings().catch(
                            defaultPromiseErrorHandler('TrackingSettings::refetchMetadataServerSettings'),
                        );
                    }

                    if (trackersError) {
                        refetchTrackersList().catch(
                            defaultPromiseErrorHandler('TrackingSettings::refetchTrackersList'),
                        );
                    }
                }}
            />
        );
    }

    if (loading) {
        return <LoadingPlaceholder />;
    }

    return (
        <>
            <List sx={{ pt: 0 }}>
                <ListItem>
                    <ListItemText primary={t('tracking.settings.label.update_progress_reading')} />
                    <Switch
                        edge="end"
                        checked={updateProgressAfterReading}
                        onChange={(e) => updateTrackingSettings('updateProgressAfterReading', e.target.checked)}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('tracking.settings.label.update_progress_manual')}
                        secondary={t('tracking.settings.label.update_progress_reading_description')}
                    />
                    <Switch
                        edge="end"
                        checked={updateProgressManualMarkRead}
                        onChange={(e) => updateTrackingSettings('updateProgressManualMarkRead', e.target.checked)}
                    />
                </ListItem>
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="tracking-trackers">
                        {t('tracking.settings.title.trackers')}
                    </ListSubheader>
                }
            >
                {trackers.map((tracker) => (
                    <SettingsTrackerCard key={tracker.id} tracker={tracker} />
                ))}
            </List>
        </>
    );
};
