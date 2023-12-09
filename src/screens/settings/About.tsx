/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useTranslation } from 'react-i18next';
import ListSubheader from '@mui/material/ListSubheader';
import { Divider } from '@mui/material';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListItemLink } from '@/components/util/ListItemLink';
import { NavBarContext, useSetDefaultBackTo } from '@/components/context/NavbarContext';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';

export function About() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useEffect(() => {
        setTitle(t('settings.about.title'));
        setAction(null);
    }, [t]);

    const { data } = requestManager.useGetAbout();
    const { aboutServer, aboutWebUI } = data ?? {};

    useSetDefaultBackTo('settings');

    if (!aboutServer || !aboutWebUI) {
        return <LoadingPlaceholder />;
    }

    const version = () => {
        if (aboutServer.buildType === 'Stable') return `${aboutServer.version}`;
        return `${aboutServer.version}-${aboutServer.revision}`;
    };

    const buildTime = () => new Date(aboutServer.buildTime * 1000).toUTCString();

    return (
        <List>
            <List
                sx={{ padding: 0 }}
                subheader={
                    <ListSubheader component="div" id="about-server-info">
                        {t('settings.server.title.server')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText
                        primary={t('settings.server.title.server')}
                        secondary={`${aboutServer.name} ${aboutServer.buildType}`}
                    />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t('settings.about.server.label.version')} secondary={version()} />
                </ListItem>
                <ListItem>
                    <ListItemText primary={t('settings.about.server.label.build_time')} secondary={buildTime()} />
                </ListItem>
            </List>
            <Divider />
            <List
                sx={{ padding: 0 }}
                subheader={
                    <ListSubheader component="div" id="about-webui-info">
                        {t('settings.webui.title.webui')}
                    </ListSubheader>
                }
            >
                <ListItem>
                    <ListItemText primary={t('settings.about.webui.label.version')} secondary={aboutWebUI.tag} />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary={t('settings.about.webui.label.channel')}
                        secondary={aboutWebUI.channel.toLocaleUpperCase()}
                    />
                </ListItem>
            </List>
            <Divider />
            <List
                subheader={
                    <ListSubheader component="div" id="about-links">
                        {t('global.label.links')}
                    </ListSubheader>
                }
            >
                <ListItemLink to={aboutServer.github}>
                    <ListItemText primary={t('settings.about.server.label.github')} secondary={aboutServer.github} />
                </ListItemLink>
                <ListItemLink to="https://github.com/Suwayomi/Tachidesk-WebUI">
                    <ListItemText
                        primary={t('settings.about.webui.label.github')}
                        secondary="https://github.com/Suwayomi/Tachidesk-WebUI"
                    />
                </ListItemLink>
                <ListItemLink to={aboutServer.discord}>
                    <ListItemText primary={t('global.label.discord')} secondary={aboutServer.discord} />
                </ListItemLink>
            </List>
        </List>
    );
}
