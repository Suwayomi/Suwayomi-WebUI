/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from 'components/util/TabPanel';
import Sources from 'screens/Sources';
import Extensions from 'screens/Extensions';
import { useTranslation } from 'react-i18next';

export default function Browse() {
    const { t } = useTranslation();

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
                <Tab sx={{ textTransform: 'none' }} label={t('source.title')} />
                <Tab sx={{ textTransform: 'none' }} label={t('extension.title')} />
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
