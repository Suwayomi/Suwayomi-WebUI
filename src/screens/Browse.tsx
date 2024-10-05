/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam } from 'use-query-params';
import { Sources } from '@/screens/Sources';
import { Extensions } from '@/screens/Extensions';
import { TabPanel } from '@/modules/core/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/modules/core/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/modules/core/components/tabs/TabsMenu.tsx';
import { Migration } from '@/screens/Migration.tsx';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';

enum Tabs {
    SOURCE = 'source',
    EXTENSIONS = 'extensions',
    MIGRATE = 'migrate',
}

export function Browse() {
    const { t } = useTranslation();
    const { setTitle } = useContext(NavBarContext);

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
    const tabName = (tabSearchParam as Tabs) ?? Tabs.SOURCE;

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
                <Tab value={Tabs.SOURCE} sx={{ textTransform: 'none' }} label={t('source.title_one')} />
                <Tab value={Tabs.EXTENSIONS} sx={{ textTransform: 'none' }} label={t('extension.title_other')} />
                <Tab value={Tabs.MIGRATE} sx={{ textTransform: 'none' }} label={t('migrate.title')} />
            </TabsMenu>
            <TabPanel index={Tabs.SOURCE} currentIndex={tabName}>
                <Sources />
            </TabPanel>
            <TabPanel index={Tabs.EXTENSIONS} currentIndex={tabName}>
                <Extensions tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={Tabs.MIGRATE} currentIndex={tabName}>
                <Migration tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
        </TabsWrapper>
    );
}
