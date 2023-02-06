/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Tab, Tabs } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import TabPanel from 'components/util/TabPanel';
import LibraryToolbarMenu from 'components/library/LibraryToolbarMenu';
import LibraryMangaGrid from 'components/library/LibraryMangaGrid';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, NumberParam } from 'use-query-params';
import { useQuery } from 'util/client';
import UpdateChecker from 'components/library/UpdateChecker';

export default function Library() {
    const [lastLibraryUpdate, setLastLibraryUpdate] = useState(Date.now());
    const { data: tabsData, error: tabsError, loading } = useQuery<ICategory[]>('/api/v1/category');
    const tabs = tabsData ?? [];

    const [tabSearchParam, setTabSearchParam] = useQueryParam('tab', NumberParam);

    const activeTab = tabs.find((t) => t.order === tabSearchParam) ?? tabs[0];
    const {
        data: mangaData,
        error: mangaError,
        loading: mangaLoading,
    } = useQuery<IManga[]>(`/api/v1/category/${activeTab?.id}`, {
        isPaused: () => activeTab == null,
    });
    const mangas = mangaData ?? [];

    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle('Library');
        setAction(
            <>
                <AppbarSearch />
                <LibraryToolbarMenu />
                <UpdateChecker handleFinishedUpdate={setLastLibraryUpdate} />
            </>,
        );
        return () => {
            setTitle('');
            setAction(<></>);
        };
    }, []);

    // a hack so MangaGrid doesn't stop working. I won't change it in case
    // if I do manga pagination for library..
    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const handleTabChange = (newTab: number) => {
        setTabSearchParam(newTab === 0 ? undefined : newTab);
    };

    if (tabsError != null) {
        return (
            <EmptyView
                message="Could not load categories"
                messageExtra={tabsError?.message ?? tabsError}
            />
        );
    }

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (tabs.length === 0) {
        return <EmptyView message="Your Library is empty" />;
    }

    if (tabs.length === 1) {
        return (
            <LibraryMangaGrid
                mangas={mangas}
                lastLibraryUpdate={lastLibraryUpdate}
                hasNextPage={false}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                message="Your Library is empty"
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
                    <Tab key={tab.id} label={tab.name} value={tab.order} />
                ))}
            </Tabs>
            {tabs.map((tab) => (
                <TabPanel key={tab.order} index={tab.order} currentIndex={activeTab.order}>
                    {tab === activeTab &&
                        (mangaError ? (
                            <EmptyView
                                message="Could not load manga"
                                messageExtra={mangaError?.message ?? mangaError}
                            />
                        ) : (
                            <LibraryMangaGrid
                                mangas={mangas}
                                lastLibraryUpdate={lastLibraryUpdate}
                                hasNextPage={false}
                                lastPageNum={lastPageNum}
                                setLastPageNum={setLastPageNum}
                                message="Category is Empty"
                                isLoading={mangaLoading}
                            />
                        ))}
                </TabPanel>
            ))}
        </>
    );
}
