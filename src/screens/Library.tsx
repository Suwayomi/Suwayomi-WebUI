/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import { styled } from '@mui/material/styles';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryParam, NumberParam } from 'use-query-params';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { TabPanel } from '@/components/tabs/TabPanel.tsx';
import { LibraryToolbarMenu } from '@/components/library/LibraryToolbarMenu';
import { LibraryMangaGrid } from '@/components/library/LibraryMangaGrid';
import { AppbarSearch } from '@/components/util/AppbarSearch';
import { UpdateChecker } from '@/components/library/UpdateChecker';
import { useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { SelectableCollectionSelectMode } from '@/components/collection/SelectableCollectionSelectMode.tsx';
import { useGetVisibleLibraryMangas } from '@/components/library/useGetVisibleLibraryMangas.ts';
import { SelectionFAB } from '@/components/collection/SelectionFAB.tsx';
import { MangaActionMenuItems } from '@/components/manga/MangaActionMenuItems.tsx';
import { TabsMenu } from '@/components/tabs/TabsMenu.tsx';
import { TabsWrapper } from '@/components/tabs/TabsWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import {
    GetCategoriesLibraryQuery,
    GetCategoriesLibraryQueryVariables,
    MangaChapterStatFieldsFragment,
    MangaType,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_LIBRARY } from '@/lib/graphql/queries/CategoryQuery.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { MANGA_CHAPTER_STAT_FIELDS } from '@/lib/graphql/fragments/MangaFragments.ts';

const TitleWithSizeTag = styled('span')({
    display: 'flex',
    alignItems: 'center',
});

const TitleSizeTag = (props: React.ComponentProps<typeof Chip>) => (
    <Chip {...props} size="small" sx={{ marginLeft: '5px' }} />
);

export function Library() {
    const { t } = useTranslation();

    const { options } = useLibraryOptionsContext();
    const {
        data: categoriesResponse,
        error: tabsError,
        loading: areCategoriesLoading,
        refetch: refetchCategories,
    } = requestManager.useGetCategories<GetCategoriesLibraryQuery, GetCategoriesLibraryQueryVariables>(
        GET_CATEGORIES_LIBRARY,
        {
            notifyOnNetworkStatusChange: true,
        },
    );
    const tabsData = categoriesResponse?.categories.nodes.filter(
        (category) => category.id !== 0 || (category.id === 0 && category.mangas.totalCount),
    );
    const tabs = tabsData ?? [];
    const librarySize = useMemo(
        () => tabs.map((tab) => tab.mangas.totalCount).reduce((prev, curr) => prev + curr, 0),
        [tabs],
    );

    const [tabSearchParam, setTabSearchParam] = useQueryParam('tab', NumberParam);

    const activeTab = tabs.find((tab) => tab.order === tabSearchParam) ?? tabs[0];
    const {
        data: categoryMangaResponse,
        error: mangaError,
        loading: mangaLoading,
        refetch: refetchCategoryMangas,
    } = requestManager.useGetCategoryMangas(activeTab?.id, { skip: !activeTab, notifyOnNetworkStatusChange: true });
    const categoryMangas = categoryMangaResponse?.mangas.nodes ?? [];
    const { visibleMangas: mangas, showFilteredOutMessage } = useGetVisibleLibraryMangas(categoryMangas);

    const retryFetchCategoryMangas = useCallback(
        () => refetchCategoryMangas().catch(defaultPromiseErrorHandler('Library::refetchCategoryMangas')),
        [refetchCategoryMangas, activeTab],
    );

    const mangaIds = useMemo(() => mangas.map((manga) => manga.id), [mangas]);

    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const {
        areNoItemsForKeySelected: areNoItemsSelected,
        areAllItemsForKeySelected: areAllItemsSelected,
        selectedItemIds,
        handleSelectAll,
        handleSelection,
        clearSelection,
    } = useSelectableCollection<MangaType['id'], string>(mangas.length, {
        itemIds: mangaIds,
        currentKey: activeTab?.id.toString(),
    });

    const handleSelect: typeof handleSelection = (id, selected, selectOptions) => {
        setIsSelectModeActive(!!(selectedItemIds.length + (selected ? 1 : -1)));
        handleSelection(id, selected, selectOptions);
    };

    const selectedMangas = useMemo(
        () =>
            selectedItemIds
                .map((id) =>
                    Mangas.getFromCache<MangaChapterStatFieldsFragment>(
                        id,
                        MANGA_CHAPTER_STAT_FIELDS,
                        'MANGA_CHAPTER_STAT_FIELDS',
                    ),
                )
                .filter((manga) => !!manga),
        [selectedItemIds.length, mangas],
    );

    const selectionFab = useMemo(() => {
        if (!isSelectModeActive) {
            return null;
        }

        return (
            <SelectionFAB selectedItemsCount={selectedItemIds.length} title="manga.title">
                {(handleClose, setHideMenu) => (
                    <MangaActionMenuItems
                        selectedMangas={selectedMangas}
                        onClose={() => {
                            handleClose();
                            setIsSelectModeActive(false);
                            clearSelection();
                        }}
                        setHideMenu={setHideMenu}
                    />
                )}
            </SelectionFAB>
        );
    }, [isSelectModeActive, selectedMangas]);

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        const title = t('library.title');
        const navBarTitle = (
            <TitleWithSizeTag>
                {title}
                {options.showTabSize && <TitleSizeTag label={librarySize} />}
            </TitleWithSizeTag>
        );
        setTitle(navBarTitle, title);
        setAction(
            <>
                {!isSelectModeActive && (
                    <>
                        <AppbarSearch />
                        <LibraryToolbarMenu />
                        <UpdateChecker categoryId={activeTab?.id} />
                    </>
                )}
                <SelectableCollectionSelectMode
                    isActive={isSelectModeActive}
                    areAllItemsSelected={areAllItemsSelected}
                    areNoItemsSelected={areNoItemsSelected}
                    onSelectAll={(selectAll) =>
                        handleSelectAll(selectAll, [...new Set(mangas.map((manga) => manga.id))])
                    }
                    onModeChange={(checked) => {
                        setIsSelectModeActive(checked);

                        if (checked) {
                            handleSelectAll(true, [...new Set(mangas.map((manga) => manga.id))]);
                        } else {
                            tabs.forEach((tab) => handleSelectAll(false, [], tab.id.toString()));
                        }
                    }}
                />
            </>,
        );
        return () => {
            setTitle('');
            setAction(null);
        };
    }, [
        t,
        librarySize,
        areCategoriesLoading,
        options,
        isSelectModeActive,
        areNoItemsSelected,
        areAllItemsSelected,
        selectedItemIds.length,
        mangas.length,
        activeTab,
    ]);

    const handleTabChange = (newTab: number) => {
        setTabSearchParam(newTab);
    };

    if (tabsError != null) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('category.error.label.request_failure')}
                messageExtra={tabsError.message}
                retry={() => refetchCategories().catch(defaultPromiseErrorHandler('Library::refetchCategories'))}
            />
        );
    }

    if (areCategoriesLoading) {
        return <LoadingPlaceholder />;
    }

    if (tabs.length === 0) {
        return <EmptyViewAbsoluteCentered message={t('library.error.label.empty')} />;
    }

    if (tabs.length === 1) {
        return (
            <>
                <LibraryMangaGrid
                    mangas={mangas}
                    message={mangaError ? t('manga.error.label.request_failure') : t('library.error.label.empty')}
                    messageExtra={mangaError?.message}
                    isLoading={mangaLoading}
                    selectedMangaIds={selectedItemIds}
                    isSelectModeActive={isSelectModeActive}
                    handleSelection={handleSelect}
                    showFilteredOutMessage={!mangaError && showFilteredOutMessage}
                    retry={mangaError && retryFetchCategoryMangas}
                />
                {selectionFab}
            </>
        );
    }

    return (
        <TabsWrapper>
            <TabsMenu value={activeTab.order} onChange={(e, newTab) => handleTabChange(newTab)} tabsCount={tabs.length}>
                {tabs.map((tab) => (
                    <Tab
                        sx={{ display: 'flex' }}
                        key={tab.id}
                        label={
                            <TitleWithSizeTag>
                                {tab.name}
                                {options.showTabSize ? <TitleSizeTag label={tab.mangas.totalCount} /> : null}
                            </TitleWithSizeTag>
                        }
                        value={tab.order}
                    />
                ))}
            </TabsMenu>
            {tabs.map((tab) => (
                <TabPanel key={tab.order} index={tab.order} currentIndex={activeTab.order}>
                    {tab === activeTab && (
                        <LibraryMangaGrid
                            mangas={mangas}
                            message={
                                mangaError ? t('manga.error.label.request_failure') : t('library.error.label.empty')
                            }
                            messageExtra={mangaError?.message}
                            isLoading={mangaLoading}
                            selectedMangaIds={selectedItemIds}
                            isSelectModeActive={isSelectModeActive}
                            handleSelection={handleSelect}
                            showFilteredOutMessage={!mangaError && showFilteredOutMessage}
                            retry={mangaError && retryFetchCategoryMangas}
                        />
                    )}
                </TabPanel>
            ))}
            {selectionFab}
        </TabsWrapper>
    );
}
