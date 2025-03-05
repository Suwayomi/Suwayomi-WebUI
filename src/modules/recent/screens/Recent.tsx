/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import { TabsWrapper } from '@/modules/core/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/modules/core/components/tabs/TabsMenu.tsx';
import { TabPanel } from '@/modules/core/components/tabs/TabPanel.tsx';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { Updates } from '@/modules/updates/screens/Updates';
import { History } from '@/modules/history/screens/History.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

enum Tabs {
    UPDATES = 'updates',
    HISTORY = 'history',
}

export function Recent() {
    const { t } = useTranslation();
    const { setTitle } = useNavBarContext();

    useLayoutEffect(() => {
        setTitle(t('global.label.browse'));
    }, [t]);

    const tabsMenuRef = useRef<HTMLDivElement | null>(null);
    const [tabsMenuHeight, setTabsMenuHeight] = useState(0);
    useResizeObserver(
        tabsMenuRef,
        useCallback(() => setTabsMenuHeight(tabsMenuRef.current!.offsetHeight), [tabsMenuRef.current]),
    );

    const [tabSearchParam, setTabSearchParam] = useQueryParam('tab', StringParam, {});
    const tabName = (tabSearchParam as Tabs) ?? Tabs.UPDATES;

    if (!tabSearchParam) {
        setTabSearchParam(tabName, 'replaceIn');
    }

    return (
        <TabsWrapper>
            <TabsMenu
                ref={tabsMenuRef}
                variant="fullWidth"
                value={tabName}
                onChange={(_, newTab) => setTabSearchParam(newTab, 'replaceIn')}
            >
                <Tab value={Tabs.UPDATES} sx={{ textTransform: 'none' }} label={t('updates.title')} />
                <Tab value={Tabs.HISTORY} sx={{ textTransform: 'none' }} label={t('history.title')} />
            </TabsMenu>
            <TabPanel index={Tabs.UPDATES} currentIndex={tabName}>
                <Updates tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={Tabs.HISTORY} currentIndex={tabName}>
                <History />
            </TabPanel>
        </TabsWrapper>
    );
}
