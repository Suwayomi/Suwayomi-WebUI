/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import Tab from '@mui/material/Tab';
import { StringParam, useQueryParams } from 'use-query-params';
import { useLingui } from '@lingui/react/macro';
import { Sources } from '@/features/browse/sources/Sources.tsx';
import { Extensions } from '@/features/browse/extensions/Extensions.tsx';
import { TabPanel } from '@/base/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { BrowseTab, normalizeBrowseParams } from '@/features/browse/Browse.types.ts';
import { GROUPED_VIRTUOSO_Z_INDEX } from '@/lib/virtuoso/Virtuoso.constants.ts';
import { SearchParam } from '@/base/Base.types.ts';
import { Migration } from '@/features/migration/screens/Migration.tsx';
import { OffsetComponentWithContainer } from '@/base/OffsetComponent.tsx';
import { useElementSize } from '@mantine/hooks';
import { ExtensionKind, SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

export function Browse() {
    const { t } = useLingui();
    useAppTitle(t`Browse`);

    const { ref: tabsMenuRef, height: tabsMenuHeight } = useElementSize();

    const [queryParams, setQueryParams] = useQueryParams({
        [SearchParam.TAB]: StringParam,
        [SearchParam.TYPE]: StringParam,
    });
    const tabName = normalizeBrowseParams({
        tab: queryParams[SearchParam.TAB],
        type: queryParams[SearchParam.TYPE],
    });

    useEffect(() => {
        if (queryParams[SearchParam.TAB] !== tabName || queryParams[SearchParam.TYPE]) {
            setQueryParams(
                {
                    [SearchParam.TAB]: tabName,
                    [SearchParam.TYPE]: undefined,
                },
                'replaceIn',
            );
        }
    }, [queryParams, tabName, setQueryParams]);

    return (
        <TabsWrapper>
            <OffsetComponentWithContainer
                sx={{ zIndex: 2 }}
                component={
                    <TabsMenu
                        ref={tabsMenuRef}
                        sx={{
                            zIndex: GROUPED_VIRTUOSO_Z_INDEX,
                            '& .MuiTab-root': { flexGrow: 1, minWidth: 160, textTransform: 'none' },
                        }}
                        value={tabName}
                        onChange={(_, newTab) => setQueryParams({ [SearchParam.TAB]: newTab }, 'replaceIn')}
                    >
                        <Tab value={BrowseTab.MANGA_SOURCES} label={t`Manga Sources`} />
                        <Tab value={BrowseTab.MANGA_EXTENSIONS} label={t`Manga Extensions`} />
                        <Tab value={BrowseTab.LIGHT_NOVEL_SOURCES} label={t`Light Novel Sources`} />
                        <Tab value={BrowseTab.LIGHT_NOVEL_EXTENSIONS} label={t`Light Novel Extensions`} />
                        <Tab value={BrowseTab.MIGRATE} label={t`Migration`} />
                    </TabsMenu>
                }
            >
                <TabPanel index={BrowseTab.MANGA_SOURCES} currentIndex={tabName}>
                    <Sources tabsMenuHeight={tabsMenuHeight} contentType={SourceContentType.Manga} />
                </TabPanel>
                <TabPanel index={BrowseTab.MANGA_EXTENSIONS} currentIndex={tabName}>
                    <Extensions tabsMenuHeight={tabsMenuHeight} runtimeKind={ExtensionKind.Jvm} />
                </TabPanel>
                <TabPanel index={BrowseTab.LIGHT_NOVEL_SOURCES} currentIndex={tabName}>
                    <Sources tabsMenuHeight={tabsMenuHeight} contentType={SourceContentType.LightNovel} />
                </TabPanel>
                <TabPanel index={BrowseTab.LIGHT_NOVEL_EXTENSIONS} currentIndex={tabName}>
                    <Extensions tabsMenuHeight={tabsMenuHeight} runtimeKind={ExtensionKind.Lnreader} />
                </TabPanel>
                <TabPanel index={BrowseTab.MIGRATE} currentIndex={tabName}>
                    <Migration />
                </TabPanel>
            </OffsetComponentWithContainer>
        </TabsWrapper>
    );
}
