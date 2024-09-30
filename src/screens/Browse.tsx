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
import { Sources } from '@/screens/Sources';
import { Extensions } from '@/screens/Extensions';
import { TabPanel } from '@/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/components/tabs/TabsMenu.tsx';
import { Migration } from '@/screens/Migration.tsx';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useResizeObserver } from '@/util/useResizeObserver.tsx';

export function Browse() {
    const { t } = useTranslation();
    const { setTitle } = useContext(NavBarContext);

    const tabsMenuRef = useRef<HTMLDivElement | null>(null);
    const [tabsMenuHeight, setTabsMenuHeight] = useState(0);
    useResizeObserver(
        tabsMenuRef,
        useCallback(() => setTabsMenuHeight(tabsMenuRef.current!.offsetHeight), [tabsMenuRef.current]),
    );

    const [tabNum, setTabNum] = useState<number>(0);

    useLayoutEffect(() => {
        setTitle(t('global.label.browse'));
    }, [t]);

    return (
        <TabsWrapper>
            <TabsMenu
                ref={tabsMenuRef}
                variant="fullWidth"
                value={tabNum}
                tabsCount={2}
                onChange={(e, newTab) => setTabNum(newTab)}
            >
                <Tab sx={{ textTransform: 'none' }} label={t('source.title_one')} />
                <Tab sx={{ textTransform: 'none' }} label={t('extension.title_other')} />
                <Tab sx={{ textTransform: 'none' }} label={t('migrate.title')} />
            </TabsMenu>
            <TabPanel index={0} currentIndex={tabNum}>
                <Sources />
            </TabPanel>
            <TabPanel index={1} currentIndex={tabNum}>
                <Extensions tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
            <TabPanel index={2} currentIndex={tabNum}>
                <Migration tabsMenuHeight={tabsMenuHeight} />
            </TabPanel>
        </TabsWrapper>
    );
}
