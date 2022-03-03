/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Drawer,
    FormControlLabel,
    IconButton,
    Tabs,
    Tab,
    Box,
    Stack,
    Checkbox,
    Radio,
    Switch,
} from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import TabPanel from 'components/util/TabPanel';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import SortIcon from '@mui/icons-material/Sort';

function Options() {
    const {
        downloaded, setDownloaded, unread, setUnread,
    } = useLibraryOptions();
    const [currentTab, setCurrentTab] = useState<number>(0);
    const { options, setOptions } = useLibraryOptionsContext();

    function setContextOptions(
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) {
        setOptions((prev) => ({ ...prev, [e.target.name]: checked }));
    }

    return (
        <Box>
            <Tabs
                key={currentTab}
                value={currentTab}
                variant="fullWidth"
                onChange={(e, newTab) => setCurrentTab(newTab)}
                indicatorColor="primary"
                textColor="primary"
            >
                <Tab label="Filter" value={0} />
                <Tab label="Display" value={1} />
            </Tabs>
            <TabPanel index={0} currentIndex={currentTab}>
                <Stack direction="column">
                    <FormControlLabel
                        control={(
                            <ThreeStateCheckbox
                                name="Unread"
                                checked={unread}
                                onChange={setUnread}
                            />
                        )}
                        label="Unread"
                    />
                    <FormControlLabel
                        control={(
                            <ThreeStateCheckbox
                                name="Downloaded"
                                checked={downloaded}
                                onChange={setDownloaded}
                            />
                        )}
                        label="Downloaded"
                    />
                </Stack>
            </TabPanel>
            <TabPanel index={1} currentIndex={currentTab}>
                <Stack direction="column">
                    <FormControlLabel
                        label="Unread Badges"
                        control={(
                            <Checkbox
                                name="showUnreadBadge"
                                checked={options.showUnreadBadge}
                                onChange={setContextOptions}
                            />
                        )}
                    />
                    <FormControlLabel
                        label="Download Badges"
                        control={(
                            <Checkbox
                                name="showDownloadBadge"
                                checked={options.showDownloadBadge}
                                onChange={setContextOptions}
                            />
                        )}
                    />
                </Stack>
            </TabPanel>
        </Box>
    );
}

function SortOptions() {
    const {
        sorts, setSorts, sortDesc, setSortDesc,
    } = useLibraryOptions();

    const handleSortChange = (name: string) => (event: { target: { checked: boolean } }) => {
        setSorts(event.target.checked ? name : undefined);
    };

    const handleOrderChange = () => (event: { target: { checked: boolean } }) => {
        setSortDesc(event.target.checked);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
                control={(
                    <Switch
                        name="sortDesc"
                        checked={sortDesc === true}
                        onChange={handleOrderChange()}
                        color="default"
                    />
                )}
                label="Asc/Desc"
            />
            <FormControlLabel
                control={(
                    <Radio
                        name="sortToRead"
                        checked={sorts === 'sortToRead'}
                        onChange={handleSortChange('sortToRead')}
                    />
                )}
                label="Sort by left to read"
            />
            <FormControlLabel
                control={(
                    <Radio
                        name="sortAlph"
                        checked={sorts === 'sortAlph'}
                        onChange={handleSortChange('sortAlph')}
                    />
                )}
                label="Sort alphbetical"
            />
            <FormControlLabel
                control={(
                    <Radio
                        name="sortID"
                        checked={sorts === 'sortID' || sorts === undefined}
                        onChange={handleSortChange('sortID')}
                    />
                )}
                label="Sort by ID"
            />
        </Box>
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
                        maxWidth: 600,
                        padding: '1em',
                        marginLeft: 'auto',
                        marginRight: 'auto',
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
                        maxWidth: 600,
                        padding: '1em',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    },
                }}
            >
                <SortOptions />
            </Drawer>
        </>
    );
}
