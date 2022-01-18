/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Drawer, FormControlLabel, IconButton, Typography, Tab, Tabs, Radio, RadioGroup, Stack,
} from '@mui/material';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import { Box } from '@mui/system';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import TabPanel from 'components/util/TabPanel';

interface IProps{
    options: ChapterListOptions
    optionsDispatch: React.Dispatch<OptionsReducerActions>
}

const SortTab: [ChapterSortMode, string][] = [['source', 'By Source'], ['fetchedAt', 'By Fetch date']];

export default function ChapterOptions(props: IProps) {
    const { options, optionsDispatch } = props;
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [tabNum, setTabNum] = useState(0);

    const filterOptions = (value: NullAndUndefined<boolean>, name: string) => {
        optionsDispatch({ type: 'filter', filterType: name.toLowerCase(), filterValue: value });
    };

    return (
        <>
            <IconButton
                onClick={() => setFiltersOpen(!filtersOpen)}
                color={options.active ? 'warning' : 'default'}
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
                        minHeight: '150px',
                    },
                }}
            >
                <Box>
                    <Tabs
                        key={tabNum}
                        value={tabNum}
                        variant="fullWidth"
                        onChange={(e, newTab) => setTabNum(newTab)}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab value={0} label="Filter" />
                        <Tab value={1} label="Sort" />
                        <Tab value={2} label="Display" />
                    </Tabs>
                    <TabPanel index={0} currentIndex={tabNum}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            <FormControlLabel control={<ThreeStateCheckbox name="Unread" checked={options.unread} onChange={filterOptions} />} label="Unread" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Downloaded" checked={options.downloaded} onChange={filterOptions} />} label="Downloaded" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Bookmarked" checked={options.bookmarked} onChange={filterOptions} />} label="Bookmarked" />
                        </Box>
                    </TabPanel>
                    <TabPanel index={1} currentIndex={tabNum}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            {
                                SortTab.map((item) => (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing="2"
                                        sx={{ py: 1, height: 42 }}
                                        onClick={() => (item[0] !== options.sortBy
                                            ? optionsDispatch({ type: 'sortBy', sortBy: item[0] })
                                            : optionsDispatch({ type: 'sortReverse' }))}
                                    >
                                        <Box sx={{ height: 24, width: 24 }}>
                                            {
                                                options.sortBy === item[0]
                                                && (options.reverse
                                                    ? (<ArrowUpward color="primary" />) : (<ArrowDownward color="primary" />))
                                            }
                                        </Box>
                                        <Typography>{item[1]}</Typography>
                                    </Stack>

                                ))
                            }
                        </Box>
                    </TabPanel>
                    <TabPanel index={2} currentIndex={tabNum}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            <RadioGroup name="chapter-title-display" onChange={() => optionsDispatch({ type: 'showChapterNumber' })} value={options.showChapterNumber}>
                                <FormControlLabel label="By Source Title" value="title" control={<Radio checked={!options.showChapterNumber} />} />
                                <FormControlLabel label="By Chapter Number" value="chapterNumber" control={<Radio checked={options.showChapterNumber} />} />
                            </RadioGroup>
                        </Box>
                    </TabPanel>
                </Box>
            </Drawer>

        </>
    );
}
