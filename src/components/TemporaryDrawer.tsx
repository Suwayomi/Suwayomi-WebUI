/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CollectionsBookmarkIcon from '@material-ui/icons/CollectionsBookmark';
import CollectionsBookmarkOutlinedIcon from '@material-ui/icons/CollectionsBookmarkOutlined';
import VideoLibraryOutlinedIcon from '@material-ui/icons/VideoLibraryOutlined';
import ExploreIcon from '@material-ui/icons/Explore';
import ExtensionIcon from '@material-ui/icons/Extension';
import GetAppIcon from '@material-ui/icons/GetApp';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsIcon from '@material-ui/icons/Settings';
import { Link } from 'react-router-dom';
import useLocalStorage from 'util/useLocalStorage';

const useStyles = makeStyles({
    list: {
        width: 250,
    },
});

interface IProps {
    drawerOpen: boolean

    setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function TemporaryDrawer({ drawerOpen, setDrawerOpen }: IProps) {
    const classes = useStyles();
    const [workingMode, setWorkingMode] = useLocalStorage<'manga'|'anime'>('workingMode', 'manga');

    const otherMode = () => {
        if (workingMode === 'manga') return 'Anime';
        return 'Manga';
    };

    const switchMode = () => {
        if (workingMode === 'manga') setWorkingMode('anime');
        else setWorkingMode('manga');
    };

    return (
        <div>
            <Drawer
                open={drawerOpen}
                anchor="left"
                onClose={() => setDrawerOpen(false)}
            >
                <div
                    className={classes.list}
                    role="presentation"
                    onClick={() => setDrawerOpen(false)}
                    onKeyDown={() => setDrawerOpen(false)}
                >
                    <List>
                        {workingMode === 'manga'
                        && (
                            <Link to="/library" style={{ color: 'inherit', textDecoration: 'none' }}>
                                <ListItem button key="Library">
                                    <ListItemIcon>
                                        <CollectionsBookmarkIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Library" />
                                </ListItem>
                            </Link>
                        )}
                        <Link to={`/${workingMode}/extensions`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            <ListItem button key="Extensions">
                                <ListItemIcon>
                                    <ExtensionIcon />
                                </ListItemIcon>
                                <ListItemText primary="Extensions" />
                            </ListItem>
                        </Link>
                        <Link to={`/${workingMode}/sources`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            <ListItem button key="Sources">
                                <ListItemIcon>
                                    <ExploreIcon />
                                </ListItemIcon>
                                <ListItemText primary="Sources" />
                            </ListItem>
                        </Link>
                        {workingMode === 'manga'
                        && (
                            <Link to="/manga/downloads" style={{ color: 'inherit', textDecoration: 'none' }}>
                                <ListItem button key="Manga Download Queue">
                                    <ListItemIcon>
                                        <GetAppIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Downloads" />
                                </ListItem>
                            </Link>
                        )}
                        <Link to="/settings" style={{ color: 'inherit', textDecoration: 'none' }}>
                            <ListItem button key="settings">
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Settings" />
                            </ListItem>
                        </Link>
                        <ListItem button key="SwitchMode" onClick={switchMode}>
                            <ListItemIcon>
                                {workingMode === 'manga' && <VideoLibraryOutlinedIcon />}
                                {workingMode === 'anime' && <CollectionsBookmarkOutlinedIcon />}
                            </ListItemIcon>
                            <ListItemText primary={`Switch to ${otherMode()}`} />
                        </ListItem>
                    </List>
                </div>
            </Drawer>
        </div>
    );
}
