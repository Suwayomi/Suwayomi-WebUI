import React, { useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemLink from 'components/util/ListItemLink';
import NavbarContext from 'components/context/NavbarContext';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import { useQuery } from 'util/client';
import { IAbout } from 'typings';
import { useTranslation } from 'react-i18next';

export default function About() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);

    useEffect(() => {
        setTitle(t('settings.about.title'));
        setAction(null);
    }, [t]);

    const { data: about } = useQuery<IAbout>('/api/v1/settings/about');

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
