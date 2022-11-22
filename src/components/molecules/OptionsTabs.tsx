/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
    Drawer, Tab, Tabs,
} from '@mui/material';
import { Box } from '@mui/system';
import TabPanel from 'components/util/TabPanel';
import React, { useState } from 'react';

interface IProps<T = string>{
    open: boolean
    onClose: () => void
    tabs: T[]
    tabTitle: (key: T) => React.ReactNode
    tabContent: (key: T) => React.ReactNode
    minHeight?: number
}

const OptionsTabs = <T extends string = string>({
    open, onClose, tabs, tabTitle, tabContent, minHeight,
}: IProps<T>) => {
    const [tabNum, setTabNum] = useState(0);

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
                        minHeight,
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
                        {tabs.map((tab, tabIndex) => (
                            <Tab key={tab} value={tabIndex} label={tabTitle(tab)} />
                        ))}
                    </Tabs>
                    {tabs.map((tab, tabIndex) => (
                        <TabPanel key={tab} index={tabIndex} currentIndex={tabNum}>
                            <Box
                                sx={{
                                    px: 3, py: 1, display: 'flex', flexDirection: 'column', minHeight,
                                }}
                            >
                                {tabContent(tab)}
                            </Box>
                        </TabPanel>
                    ))}
                </Box>
            </Drawer>
        </>
    );
};

OptionsTabs.defaultProps = {
    minHeight: undefined,
};

export default OptionsTabs;
