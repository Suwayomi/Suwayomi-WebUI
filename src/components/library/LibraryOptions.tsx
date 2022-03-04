/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import {
    Drawer, FormControlLabel, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import { Box } from '@mui/system';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

function Options() {
    const {
        downloaded, setDownloaded, unread, setUnread,
    } = useLibraryOptions();
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel control={<ThreeStateCheckbox name="Unread" checked={unread} onChange={setUnread} />} label="Unread" />
            <FormControlLabel control={<ThreeStateCheckbox name="Downloaded" checked={downloaded} onChange={setDownloaded} />} label="Downloaded" />
        </Box>
    );
}

function SortOptions() {
    const {
        sorts, setSorts, sortDesc, setSortDesc,
    } = useLibraryOptions();

    const handleChange = (event:
    React.MouseEvent<HTMLDivElement, MouseEvent>, index: string) => {
        if (sorts === index) {
            setSortDesc(!sortDesc);
        } else { setSortDesc(false); }
        setSorts(index);
    };

    return (
        <>
            {
                ['sortToRead', 'sortAlph', 'sortID'].map((e) => {
                    let icon;
                    if (sorts === e) {
                        icon = !sortDesc ? (<ArrowUpwardIcon color="primary" />)
                            : (<ArrowDownwardIcon color="primary" />);
                    }
                    icon = icon === undefined && sortDesc === undefined && e === 'sortID' ? (<ArrowDownwardIcon color="primary" />) : icon;
                    return (
                        <ListItem disablePadding>
                            <ListItemButton onClick={(event) => handleChange(event, e)}>
                                <ListItemIcon>{icon}</ListItemIcon>
                                <ListItemText primary={e} />
                            </ListItemButton>
                        </ListItem>
                    );
                })
            }
        </>
    );
}

export default function LibraryOptions() {
    const [filtersOpen, setFiltersOpen] = React.useState(false);
    const [sortsOpen, setSortsOpen] = React.useState(false);
    const { active } = useLibraryOptions();
    return (
        <>
            <IconButton
                onClick={() => setFiltersOpen(!filtersOpen)}
                color={active ? 'warning' : 'default'}
            >
                <FilterListIcon />
            </IconButton>

            <Drawer
                anchor="bottom"
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <Options />
            </Drawer>

            <IconButton
                onClick={() => setSortsOpen(!filtersOpen)}
                color={active ? 'warning' : 'default'}
            >
                <SortIcon />
            </IconButton>

            <Drawer
                anchor="bottom"
                open={sortsOpen}
                onClose={() => setSortsOpen(false)}
                PaperProps={{
                    style: {
                        maxWidth: 600, padding: '1em', marginLeft: 'auto', marginRight: 'auto',
                    },
                }}
            >
                <SortOptions />
            </Drawer>

        </>
    );
}
