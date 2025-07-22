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
import { useAppTitle } from '@/modules/navigation-bar/hooks/useAppTitle.ts';
import { BrowseTab } from '@/modules/browse/Browse.types.ts';
import { GROUPED_VIRTUOSO_Z_INDEX } from '@/lib/virtuoso/Virtuoso.constants.ts';
import { SearchParam } from '@/modules/core/Core.types.ts';

export function Browse() {
    const { t } = useTranslation();
    useAppTitle(t('global.label.browse'));

    const tabsMenuRef = useRef<HTMLDivElement | null>(null);
    const [tabsMenuHeight, setTabsMenuHeight] = useState(0);
    useResizeObserver(
        tabsMenuRef,
        useCallback(() => setTabsMenuHeight(tabsMenuRef.current!.offsetHeight), [tabsMenuRef.current]),
    );

    const [tabSearchParam, setTabSearchParam] = useQueryParam(SearchParam.TAB, StringParam, {});
    const tabName = (tabSearchParam as BrowseTab) ?? BrowseTab.SOURCES;

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
                <Tab value={BrowseTab.SOURCES} sx={{ textTransform: 'none' }} label={t('source.title_other')} />
                <Tab value={BrowseTab.EXTENSIONS} sx={{ textTransform: 'none' }} label={t('extension.title_other')} />
                <Tab value={BrowseTab.MIGRATE} sx={{ textTransform: 'none' }} label={t('migrate.title')} />
            </TabsMenu>
            <TabPanel index={BrowseTab.SOURCE_DEPRECATED} currentIndex={tabName}>
                <Sources tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={BrowseTab.SOURCES} currentIndex={tabName}>
                <Sources tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={BrowseTab.EXTENSIONS} currentIndex={tabName}>
                <Extensions tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={BrowseTab.MIGRATE} currentIndex={tabName}>
                <Migration tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
        </TabsWrapper>
    );
}
