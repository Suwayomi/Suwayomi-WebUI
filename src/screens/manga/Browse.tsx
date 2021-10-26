/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from 'components/util/TabPanel';
import Sources from 'screens/manga/Sources';
import Extensions from 'screens/manga/Extensions';

const useStyles = makeStyles({
    noCapitalize: {
        textTransform: 'none',
    },
});

export default function Browse() {
    const classes = useStyles();
    const [tabNum, setTabNum] = useState<number>(0);

    return (
        <>
            <Tabs
                value={tabNum}
                onChange={(e, newTab) => setTabNum(newTab)}
                indicatorColor="primary"
                textColor="primary"
                centered
                variant="fullWidth"
                scrollButtons
                allowScrollButtonsMobile
            >
                <Tab className={classes.noCapitalize} label="Sources" />
                <Tab className={classes.noCapitalize} label="Extensions" />
            </Tabs>
            <TabPanel index={0} currentIndex={tabNum}>
                <Sources />
            </TabPanel>
            <TabPanel index={1} currentIndex={tabNum}>
                <Extensions />
            </TabPanel>
        </>
    );
}
