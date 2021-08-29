/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Tab, Tabs } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import MangaGrid from 'components/manga/MangaGrid';
import NavbarContext from 'context/NavbarContext';
import client from 'util/client';
import cloneObject from 'util/cloneObject';

interface IMangaCategory {
    category: ICategory
    mangas: IManga[]
    isFetched: boolean
}

interface TabPanelProps {
    children: React.ReactNode;
    index: any;
    value: any;
}

function TabPanel(props: TabPanelProps) {
    const {
        children, value, index,
    } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
        >
            {value === index && children}
        </div>
    );
}

export default function Library() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => { setTitle('Library'); setAction(<></>); }, []);

    const [tabs, setTabs] = useState<IMangaCategory[]>();
    const [tabNum, setTabNum] = useState<number>(0);

    // a hack so MangaGrid doesn't stop working. I won't change it in case
    // if I do manga pagination for library..
    const [lastPageNum, setLastPageNum] = useState<number>(1);

    const handleTabChange = (newTab: number) => {
        setTabNum(newTab);
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
                    setTabNum(categoryTabs[0].category.order);
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
        return <h3>Loading...</h3>;
    }

    if (tabs.length === 0) {
        return <h3>Library is empty</h3>;
    }

    let toRender;
    if (tabs.length > 1) {
        // eslint-disable-next-line max-len
        const tabDefines = tabs.map((tab) => (<Tab label={tab.category.name} value={tab.category.order} />));

        const tabBodies = tabs.map((tab) => (
            <TabPanel value={tabNum} index={tab.category.order}>
                <MangaGrid
                    mangas={tab.mangas}
                    hasNextPage={false}
                    lastPageNum={lastPageNum}
                    setLastPageNum={setLastPageNum}
                    message={tab.isFetched ? 'Category is Empty' : 'Loading...'}
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
                    scrollButtons="on"
                >
                    {tabDefines}
                </Tabs>
                {tabBodies}
            </>
        );
    } else {
        const mangas = tabs.length === 1 ? tabs[0].mangas : [];
        toRender = (
            <MangaGrid
                mangas={mangas}
                hasNextPage={false}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                message={tabs.length > 0 ? 'Library is Empty' : undefined}
            />
        );
    }

    return toRender;
}
