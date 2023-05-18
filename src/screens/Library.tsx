/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Chip, Tab, Tabs } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import TabPanel from 'components/util/TabPanel';
import LibraryToolbarMenu from 'components/library/LibraryToolbarMenu';
import LibraryMangaGrid from 'components/library/LibraryMangaGrid';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, NumberParam } from 'use-query-params';
import UpdateChecker from 'components/library/UpdateChecker';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/system';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';
import requestManager from 'lib/RequestManager';

const TitleWithSizeTag = styled('span')({
    display: 'flex',
    alignItems: 'center',
});

const TitleSizeTag = (props: React.ComponentProps<typeof Chip>) => (
    <Chip {...props} size="small" sx={{ marginLeft: '5px' }} />
);

export default function Library() {
    const { t } = useTranslation();

    const { options } = useLibraryOptionsContext();
    const [lastLibraryUpdate, setLastLibraryUpdate] = useState(Date.now());
    const { data: tabsData, error: tabsError, isLoading } = requestManager.useGetCategories();
    const tabs = tabsData ?? [];
    const librarySize = useMemo(() => tabs.map((tab) => tab.size).reduce((prev, curr) => prev + curr, 0), [tabs]);

    const [tabSearchParam, setTabSearchParam] = useQueryParam('tab', NumberParam);

    const activeTab = tabs.find((tab) => tab.order === tabSearchParam) ?? tabs[0];
    const {
        data: mangaData,
        error: mangaError,
        isLoading: mangaLoading,
    } = requestManager.useGetCategoryMangas(activeTab?.id, { skipRequest: !activeTab });
    const mangas = mangaData ?? [];

    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        const title = t('library.title');
        const navBarTitle = (
            <TitleWithSizeTag>
                {title}
                {mangaLoading || !options.showTabSize ? null : <TitleSizeTag label={librarySize} />}
            </TitleWithSizeTag>
        );
        setTitle(navBarTitle, title);
        setAction(
            <>
                <AppbarSearch />
                <LibraryToolbarMenu />
                <UpdateChecker handleFinishedUpdate={setLastLibraryUpdate} />
            </>,
        );
        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t, librarySize, mangaLoading, options]);

    const handleTabChange = (newTab: number) => {
        setTabSearchParam(newTab === 0 ? undefined : newTab);
    };

    if (tabsError != null) {
        return (
            <EmptyView
                message={t('category.error.label.request_failure')}
                messageExtra={tabsError?.message ?? tabsError}
            />
        );
    }

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (tabs.length === 0) {
        return <EmptyView message={t('library.error.label.empty')} />;
    }

    if (tabs.length === 1) {
        return (
            <LibraryMangaGrid
                mangas={mangas}
                lastLibraryUpdate={lastLibraryUpdate}
                message={t('library.error.label.empty') as string}
                isLoading={activeTab != null && mangaLoading}
            />
        );
    }

    // Visual Hack: 160px is min-width for viewport width of >600
    const scrollableTabs = window.innerWidth < tabs.length * 160;

    return (
        <>
            <Tabs
                key={activeTab.order}
                value={activeTab.order}
                onChange={(e, newTab) => handleTabChange(newTab)}
                indicatorColor="primary"
                textColor="primary"
                centered={!scrollableTabs}
                variant={scrollableTabs ? 'scrollable' : 'fullWidth'}
                scrollButtons
                allowScrollButtonsMobile
            >
                {tabs.map((tab) => (
                    <Tab
                        sx={{ display: 'flex' }}
                        key={tab.id}
                        label={
                            <TitleWithSizeTag>
                                {tab.name}
                                {options.showTabSize ? <TitleSizeTag label={tab.size} /> : null}
                            </TitleWithSizeTag>
                        }
                        value={tab.order}
                    />
                ))}
            </Tabs>
            {tabs.map((tab) => (
                <TabPanel key={tab.order} index={tab.order} currentIndex={activeTab.order}>
                    {tab === activeTab &&
                        (mangaError ? (
                            <EmptyView
                                message={t('manga.error.label.request_failure')}
                                messageExtra={mangaError?.message ?? mangaError}
                            />
                        ) : (
                            <LibraryMangaGrid
                                mangas={mangas}
                                lastLibraryUpdate={lastLibraryUpdate}
                                message={t('library.error.label.empty') as string}
                                isLoading={mangaLoading}
                            />
                        ))}
                </TabPanel>
            ))}
        </>
    );
}
