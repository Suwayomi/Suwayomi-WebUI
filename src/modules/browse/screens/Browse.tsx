/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import Tab from '@mui/material/Tab';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam } from 'use-query-params';
import { Sources } from '@/modules/source/screens/Sources.tsx';
import { Extensions } from '@/modules/extension/screens/Extensions.tsx';
import { TabPanel } from '@/modules/core/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/modules/core/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/modules/core/components/tabs/TabsMenu.tsx';
import { Migration } from '@/modules/migration/screens/Migration.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { GROUPED_VIRTUOSO_Z_INDEX } from '@/modules/core/AppRoute.constants.ts';
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';

enum Tabs {
    SOURCE = 'source',
    EXTENSIONS = 'extensions',
    MIGRATE = 'migrate',
}

export function Browse() {
    const { t } = useTranslation();
    useAppTitle(t('global.label.browse'));

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
                sx={{ zIndex: GROUPED_VIRTUOSO_Z_INDEX }}
                variant="fullWidth"
                value={tabName}
                onChange={(_, newTab) => setTabSearchParam(newTab, 'replaceIn')}
            >
                <Tab value={Tabs.SOURCE} sx={{ textTransform: 'none' }} label={t('source.title_one')} />
                <Tab value={Tabs.EXTENSIONS} sx={{ textTransform: 'none' }} label={t('extension.title_other')} />
                <Tab value={Tabs.MIGRATE} sx={{ textTransform: 'none' }} label={t('migrate.title')} />
            </TabsMenu>
            <TabPanel index={Tabs.SOURCE} currentIndex={tabName}>
                <Sources tabsMenuHeight={tabsMenuHeight} />
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
