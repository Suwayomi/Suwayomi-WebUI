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
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Radio,
} from '@mui/material';
import useLibraryOptions from 'util/useLibraryOptions';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import TabPanel from 'components/util/TabPanel';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';

/**
 * This function returns a tab panel that contains a form control label that allows the user to toggle
 * the unread and downloaded filters
 * @param {number} currentTab - The current tab index.
 * @returns The `filtersTab` function returns a `TabPanel` component.
 */
function filtersTab(currentTab: number) {
    const {
        downloaded, setDownloaded, unread, setUnread,
    } = useLibraryOptions();
    return (
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
    );
}

/**
 * This function creates a tab panel that contains a list of sort options
 * @param {number} currentTab - number
 * @returns a tab panel with a list of sort options.
 */
function sortsTab(currentTab: number) {
    const {
        sorts, setSorts, sortDesc, setSortDesc,
    } = useLibraryOptions();

    /**
     * It sets the sorts state to the index of the clicked div.
     * @param event - The event that triggered the change.
     * @param {string} index - The index of the sort option that was clicked.
     */
    const handleChange = (event:
    React.MouseEvent<HTMLDivElement, MouseEvent>, index: string) => {
        if (sorts === index) {
            setSortDesc(!sortDesc);
        } else { setSortDesc(false); }
        setSorts(index);
    };

    return (
        <>
            <TabPanel index={1} currentIndex={currentTab}>
                <Stack direction="column">
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
                </Stack>
            </TabPanel>
        </>
    );
}

/**
 * It displays the tab panel for the display options
 * @param {number} currentTab - number
 * @returns a tab panel with the options for the library.
 */
function dispalyTab(currentTab: number) {
    const { options, setOptions } = useLibraryOptionsContext();

    /**
     * It sets the options object to the value of the checked input.
     * @param e - React.ChangeEvent<HTMLInputElement>
     * @param {boolean} checked - boolean
     */
    function setContextOptions(
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) {
        setOptions((prev) => ({ ...prev, [e.target.name]: checked }));
    }

    /**
     * It sets the gridLayout option to the value of the input element.
     * @param e - React.ChangeEvent<HTMLInputElement>
     * @param {boolean} checked - boolean
     */
    function setGridContextOptions(
        e: React.ChangeEvent<HTMLInputElement>,
        checked: boolean,
    ) {
        if (checked) {
            setOptions((prev) => ({ ...prev, gridLayout: parseInt(e.target.name, 10) }));
        }
    }

    return (
        <TabPanel index={2} currentIndex={currentTab}>
            <Stack direction="column">
                DISPLAY MODE
                <FormControlLabel
                    label="Compact grid"
                    control={(
                        <Radio
                            name="0"
                            checked={options.gridLayout === 0 || options.gridLayout === undefined}
                            onChange={setGridContextOptions}
                        />
                    )}
                />
                <FormControlLabel
                    label="Comfortable grid"
                    control={(
                        <Radio
                            name="1"
                            checked={options.gridLayout === 1}
                            onChange={setGridContextOptions}
                        />
                    )}
                />
                <FormControlLabel
                    label="list"
                    control={(
                        <Radio
                            name="2"
                            checked={options.gridLayout === 2}
                            onChange={setGridContextOptions}
                        />
                    )}
                />
                BADGES
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
    );
}

/**
 * The Options component is a tabbed interface that allows the user to filter, sort, and display the
 * data
 * @returns The `Box` component is being returned.
 */
function Options() {
    const [currentTab, setCurrentTab] = useState<number>(0);

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
                <Tab label="Sort" value={1} />
                <Tab label="Display" value={2} />
            </Tabs>
            {filtersTab(currentTab)}
            {sortsTab(currentTab)}
            {dispalyTab(currentTab)}
        </Box>
    );
}

/**
 * It shows a button that opens a drawer with a list of filters
 * @returns A Drawer component.
 */
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
