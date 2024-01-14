/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { Sources } from '@/screens/Sources';
import { Extensions } from '@/screens/Extensions';
import { TabPanel } from '@/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/components/tabs/TabsMenu.tsx';

export function Browse() {
    const { t } = useTranslation();

    const [tabNum, setTabNum] = useState<number>(0);

    return (
        <TabsWrapper>
            <TabsMenu value={tabNum} tabsCount={2} onChange={(e, newTab) => setTabNum(newTab)}>
                <Tab sx={{ textTransform: 'none' }} label={t('source.title')} />
                <Tab sx={{ textTransform: 'none' }} label={t('extension.title')} />
            </TabsMenu>
            <TabPanel index={0} currentIndex={tabNum}>
                <Sources />
            </TabPanel>
            <TabPanel index={1} currentIndex={tabNum}>
                <Extensions />
            </TabPanel>
        </TabsWrapper>
    );
}
