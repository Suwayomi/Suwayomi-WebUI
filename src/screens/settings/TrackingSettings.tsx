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
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { SettingsTrackerCard } from '@/components/tracker/SettingsTrackerCard.tsx';

const TrackingSettings = () => {
    const { t } = useTranslation();
    const { setTitle } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('tracking.settings.title.settings'));
    }, [t]);

    const { data, loading, error } = requestManager.useGetTrackerList();
    const trackers = data?.trackers.nodes ?? [];

    if (error) {
        return <EmptyView message={error.message ?? error} />;
    }

    if (loading) {
        return <LoadingPlaceholder />;
    }

    return (
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
    );
};

export default TrackingSettings;
