/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Drawer, FormControlLabel, IconButton } from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import { Box } from '@mui/system';

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

export default function LibraryOptions() {
    const [filtersOpen, setFiltersOpen] = React.useState(false);
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

        </>
    );
}
