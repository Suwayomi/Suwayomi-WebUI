/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';
import requestManager from '@/lib/RequestManager';
import ListItemLink from '@/components/util/ListItemLink';
import NavbarContext, { useSetDefaultBackTo } from '@/components/context/NavbarContext';
import LoadingPlaceholder from '@/components/util/LoadingPlaceholder';

export default function About() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);

    useEffect(() => {
        setTitle(t('settings.about.title'));
        setAction(null);
    }, [t]);

    const { data: about } = requestManager.useGetAbout();

    useSetDefaultBackTo('settings');

    if (about === undefined) {
        return <LoadingPlaceholder />;
    }

    const version = () => {
        if (about.buildType === 'Stable') return `${about.version}`;
        return `${about.version}-${about.revision}`;
    };

    const buildTime = () => new Date(about.buildTime * 1000).toUTCString();

    return (
        <List>
            <ListItem>
                <ListItemText
                    primary={t('settings.about.label.server')}
                    secondary={`${about.name} ${about.buildType}`}
                />
            </ListItem>
            <ListItem>
                <ListItemText primary={t('settings.about.label.server_version')} secondary={version()} />
            </ListItem>
            <ListItem>
                <ListItemText primary={t('settings.about.label.build_time')} secondary={buildTime()} />
            </ListItem>
            <ListItemLink directLink to={about.github}>
                <ListItemText primary={t('settings.about.label.github')} secondary={about.github} />
            </ListItemLink>
            <ListItemLink directLink to={about.discord}>
                <ListItemText primary={t('settings.about.label.discord')} secondary={about.discord} />
            </ListItemLink>
        </List>
    );
}
