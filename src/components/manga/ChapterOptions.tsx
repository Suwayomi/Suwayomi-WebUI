/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import {
    Drawer, FormControlLabel, Radio, RadioGroup, Tab, Tabs,
} from '@mui/material';
import { Box } from '@mui/system';
import TabPanel from 'components/util/TabPanel';
import ThreeStateCheckbox from 'components/util/ThreeStateCheckbox';
import React, { useCallback, useState } from 'react';
import { SORT_OPTIONS } from './util';

interface IProps{
    open: boolean
    onClose: () => void;
    options: ChapterListOptions
    optionsDispatch: React.Dispatch<ChapterOptionsReducerAction>
}

const TabContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Box sx={{
        px: 3, py: 1, display: 'flex', flexDirection: 'column', minHeight: 150,
    }}
    >
        {children}
    </Box>
);

const ChapterOptions: React.FC<IProps> = ({
    open, onClose, options, optionsDispatch,
}) => {
    const [tabNum, setTabNum] = useState(0);

    const handleFilterChange = useCallback(
        (value: NullAndUndefined<boolean>, name: string) => {
            optionsDispatch({ type: 'filter', filterType: name.toLowerCase(), filterValue: value });
        }, [],
    );

    return (
        <>
            <Drawer
                anchor="bottom"
                open={open}
                onClose={onClose}
                PaperProps={{
                    style: {
                        maxWidth: 600,
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        minHeight: '150px',
                    },
                }}
            >
                <Box>
                    <Tabs
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
                        <TabContent>
                            <FormControlLabel control={<ThreeStateCheckbox name="Unread" checked={options.unread} onChange={handleFilterChange} />} label="Unread" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Downloaded" checked={options.downloaded} onChange={handleFilterChange} />} label="Downloaded" />
                            <FormControlLabel control={<ThreeStateCheckbox name="Bookmarked" checked={options.bookmarked} onChange={handleFilterChange} />} label="Bookmarked" />
                        </TabContent>
                    </TabPanel>
                    <TabPanel index={1} currentIndex={tabNum}>
                        <TabContent>
                            {
                                SORT_OPTIONS.map(([mode, label]) => (
                                    <FormControlLabel
                                        control={(
                                            <Radio
                                                checked={options.sortBy === mode}
                                                checkedIcon={options.reverse ? <ArrowUpward color="primary" /> : <ArrowDownward color="primary" />}
                                                onClick={() => (mode !== options.sortBy
                                                    ? optionsDispatch({ type: 'sortBy', sortBy: mode })
                                                    : optionsDispatch({ type: 'sortReverse' }))}
                                            />
                                        )}
                                        label={label}
                                    />
                                ))
                            }
                        </TabContent>
                    </TabPanel>
                    <TabPanel index={2} currentIndex={tabNum}>
                        <TabContent>
                            <RadioGroup onChange={() => optionsDispatch({ type: 'showChapterNumber' })} value={options.showChapterNumber}>
                                <FormControlLabel label="Source Title" value="title" control={<Radio checked={!options.showChapterNumber} />} />
                                <FormControlLabel label="Chapter Number" value="chapterNumber" control={<Radio checked={options.showChapterNumber} />} />
                            </RadioGroup>
                        </TabContent>
                    </TabPanel>
                </Box>
            </Drawer>
        </>
    );
};

export default ChapterOptions;
