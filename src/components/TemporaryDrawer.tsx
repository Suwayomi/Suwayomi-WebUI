/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExtensionIcon from '@mui/icons-material/Extension';
import GetAppIcon from '@mui/icons-material/GetApp';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ListItemText from '@mui/material/ListItemText';
import SettingsIcon from '@mui/icons-material/Settings';
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
    const [workingMode, setWorkingMode] = useLocalStorage<'manga' | 'anime'>('workingMode', 'manga');

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
                            <>
                                <Link to="/library" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <ListItem button key="Library">
                                        <ListItemIcon>
                                            <CollectionsBookmarkIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Library" />
                                    </ListItem>
                                </Link>

                                <Link to="/updates" style={{ color: 'inherit', textDecoration: 'none' }}>
                                    <ListItem button key="Updates">
                                        <ListItemIcon>
                                            <NewReleasesIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="Updates" />
                                    </ListItem>
                                </Link>
                            </>
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
