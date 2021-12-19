/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
    Drawer, FormControlLabel, IconButton, Typography, Tab, Tabs, Radio, RadioGroup,
} from '@mui/material';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import { Box } from '@mui/system';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import TabPanel from 'components/util/TabPanel';

interface IProps{
    options: ChapterListOptions
    setOptions: React.Dispatch<React.SetStateAction<ChapterListOptions>>
}

const SortTab: [ChapterSortMode, string][] = [['source', 'By Source'], ['fetchedAt', 'By Fetch date']];

export default function ChapterOptions(props: IProps) {
    const { options, setOptions } = props;
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [tabNum, setTabNum] = useState(0);

    const setUnread = (newUnread: NullAndUndefined<boolean>) => {
        const active = options.unread !== false
        && options.downloaded !== false
        && options.bookmarked !== false;
        setOptions({ ...options, active, unread: newUnread });
    };

    const setDownloaded = (newDownloaded: NullAndUndefined<boolean>) => {
        const active = options.unread !== false
        && options.downloaded !== false
        && options.bookmarked !== false;
        setOptions({ ...options, active, downloaded: newDownloaded });
    };

    const setBookmarked = (newBookmarked: NullAndUndefined<boolean>) => {
        const active = options.unread !== false
        && options.downloaded !== false
        && options.bookmarked !== false;
        setOptions({ ...options, active, bookmarked: newBookmarked });
    };

    const setSort = (newSort: ChapterSortMode) => {
        if (newSort !== options.sortBy) {
            setOptions({ ...options, sortBy: newSort });
        } else {
            setOptions({ ...options, reverse: !options.reverse });
        }
    };

    const handleDisplay = (e: React.ChangeEvent<HTMLInputElement>) => {
        const showChapterNumber = e.target.value === 'chapterNumber';
        if (showChapterNumber !== options.showChapterNumber) {
            setOptions({ ...options, showChapterNumber });
        }
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
                            <FormControlLabel control={<ThreeStateCheckbox name="Unread" checked={options.unread} onChange={setUnread} />} label="Unread" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Downloaded" checked={options.downloaded} onChange={setDownloaded} />} label="Downloaded" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Bookmarked" checked={options.bookmarked} onChange={setBookmarked} />} label="Bookmarked" />
                        </Box>
                    </TabPanel>
                    <TabPanel index={1} currentIndex={tabNum}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            {
                                SortTab.map((item) => (
                                    <Box
                                        onClick={() => setSort(item[0])}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            height: 42,
                                            py: 1,
                                        }}
                                    >
                                        <Box sx={{
                                            height: 24,
                                            width: 24,
                                        }}
                                        >
                                            {options.sortBy === item[0]
                                            && (options.reverse ? (
                                                <ArrowUpward color="primary" />
                                            ) : (
                                                <ArrowDownward color="primary" />
                                            ))}
                                        </Box>
                                        <Typography>{item[1]}</Typography>
                                    </Box>

                                ))
                            }
                        </Box>
                    </TabPanel>
                    <TabPanel index={2} currentIndex={tabNum}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
                            <RadioGroup name="chapter-title-display" onChange={handleDisplay} value={options.showChapterNumber}>
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
