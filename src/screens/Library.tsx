/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Tab, Tabs } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import cloneObject from 'util/cloneObject';
import EmptyView from 'components/util/EmptyView';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import TabPanel from 'components/util/TabPanel';
import LibraryOptions from 'components/library/LibraryOptions';
import LibraryMangaGrid from 'components/library/LibraryMangaGrid';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, NumberParam } from 'use-query-params';
import UpdateChecker from '../components/library/UpdateChecker';

interface IMangaCategory {
    category: ICategory
    mangas: IManga[]
    isFetched: boolean
}

export default function Library() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle('Library'); setAction(
            <>
                <AppbarSearch />
                <LibraryOptions />
                <UpdateChecker />
            </>,
        );
    }, []);

    const [tabs, setTabs] = useState<IMangaCategory[]>();

    const [tabNum, setTabNum] = useState<number>(0);
    const [tabSearchParam, setTabSearchParam] = useQueryParam('tab', NumberParam);

    // a hack so MangaGrid doesn't stop working. I won't change it in case
    // if I do manga pagination for library..
    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const handleTabChange = (newTab: number) => {
        setTabNum(newTab);
        setTabSearchParam(newTab);
    };

    useEffect(() => {
        client.get('/api/v1/category')
            .then((response) => response.data)
            .then((categories: ICategory[]) => {
                const categoryTabs = categories.map((category) => ({
                    category,
                    mangas: [] as IManga[],
                    isFetched: false,
                }));
                setTabs(categoryTabs);
                if (categoryTabs.length > 0) {
                    if (
                        tabSearchParam !== undefined
                         && tabSearchParam !== null
                         && !Number.isNaN(tabSearchParam)
                         && categories.some((category) => category.order === Number(tabSearchParam))
                    ) {
                        handleTabChange(Number(tabSearchParam!));
                    } else { handleTabChange(categoryTabs[0].category.order); }
                }
            });
    }, []);

    // fetch the current tab
    useEffect(() => {
        if (tabs !== undefined) {
            tabs.forEach((tab, index) => {
                if (tab.category.order === tabNum && !tab.isFetched) {
                    // eslint-disable-next-line @typescript-eslint/no-shadow
                    client.get(`/api/v1/category/${tab.category.id}`)
                        .then((response) => response.data)
                        .then((data: IManga[]) => {
                            const tabsClone = cloneObject(tabs);
                            tabsClone[index].mangas = data;
                            tabsClone[index].isFetched = true;

                            setTabs(tabsClone);
                        });
                }
            });
        }
    }, [tabs?.length, tabNum]);

    if (tabs === undefined) {
        return <LoadingPlaceholder />;
    }

    if (tabs.length === 0) {
        return <EmptyView message="Your Library is empty" />;
    }

    let toRender;
    if (tabs.length > 1) {
        // eslint-disable-next-line max-len
        const tabDefines = tabs.map((tab) => (<Tab label={tab.category.name} value={tab.category.order} />));

        const tabBodies = tabs.map((tab) => (
            <TabPanel index={tab.category.order} currentIndex={tabNum}>
                <LibraryMangaGrid
                    mangas={tab.mangas}
                    hasNextPage={false}
                    lastPageNum={lastPageNum}
                    setLastPageNum={setLastPageNum}
                    message="Category is Empty"
                    isLoading={!tab.isFetched}
                />
            </TabPanel>
        ));

        // Visual Hack: 160px is min-width for viewport width of >600
        const scrollableTabs = window.innerWidth < tabs.length * 160;
        toRender = (
            <>
                <Tabs
                    key={tabNum}
                    value={tabNum}
                    onChange={(e, newTab) => handleTabChange(newTab)}
                    indicatorColor="primary"
                    textColor="primary"
                    centered={!scrollableTabs}
                    variant={scrollableTabs ? 'scrollable' : 'fullWidth'}
                    scrollButtons
                    allowScrollButtonsMobile
                >
                    {tabDefines}
                </Tabs>
                {tabBodies}
            </>
        );
    } else {
        const mangas = tabs.length === 1 ? tabs[0].mangas : [];
        toRender = (
            <LibraryMangaGrid
                mangas={mangas}
                hasNextPage={false}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                message="Your Library is empty"
                isLoading={!tabs[0].isFetched}
            />
        );
    }

    return toRender;
}
