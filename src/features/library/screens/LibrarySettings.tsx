/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import { useLingui } from '@lingui/react/macro';
import { plural, t as translate } from '@lingui/core/macro';
import { GlobalUpdateSettings } from '@/features/settings/components/globalUpdate/GlobalUpdateSettings.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import type {
    GetCategoriesSettingsQuery,
    GetCategoriesSettingsQueryVariables,
    GetMangasBaseQuery,
    GetMangasBaseQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_SETTINGS } from '@/lib/graphql/category/CategoryQuery.ts';
import { GET_MANGAS_BASE } from '@/lib/graphql/manga/MangaQuery.ts';
import type { MetadataLibrarySettings } from '@/features/library/Library.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import Tab from '@mui/material/Tab';
import { useContentTypeTab } from '@/base/hooks/useContentTypeTab.ts';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { OffsetComponent } from '@/base/OffsetComponent.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

const removeNonLibraryMangasFromCategories = async (contentType: SourceContentType): Promise<void> => {
    try {
        const nonLibraryMangas = await requestManager.getMangas<GetMangasBaseQuery, GetMangasBaseQueryVariables>(
            GET_MANGAS_BASE,
            {
                condition: {
                    inLibrary: false,
                    contentType,
                },
                filter: {
                    categoryId: { isNull: false },
                },
            },
            { fetchPolicy: 'no-cache' },
        ).response;

        if (!nonLibraryMangas.data) {
            return;
        }

        const mangaIdsToRemove = Mangas.getIds(nonLibraryMangas.data.mangas.nodes);

        if (mangaIdsToRemove.length) {
            await requestManager.updateMangasCategories(mangaIdsToRemove, {
                clearCategories: true,
            }).response;
        }
        makeToast(
            contentType === SourceContentType.LightNovel
                ? translate`Removed non library light novel from categories`
                : translate`Removed non library manga from categories`,
            'success',
        );
    } catch (e) {
        makeToast(
            contentType === SourceContentType.LightNovel
                ? translate`Could not remove non library light novel from categories`
                : translate`Could not remove non library manga from categories`,
            'error',
            getErrorMessage(e),
        );
    }
};

export interface LibrarySettingsProps {
    contentType?: SourceContentType;
}

export function LibrarySettings({ contentType: defaultContentType }: LibrarySettingsProps = {}) {
    const { t } = useLingui();
    useAppTitle(t`Library`);

    const { activeTab, activeContentType, setTabSearchParam } = useContentTypeTab(defaultContentType);

    const categories = requestManager.useGetCategories<GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables>(
        GET_CATEGORIES_SETTINGS,
        { variables: { condition: { contentType: activeContentType } } },
    );
    const serverSettings = requestManager.useGetServerSettings();
    const {
        settings,
        loading: areMetadataServerSettingsLoading,
        request: { error: metadataServerSettingsError, refetch: refetchMetadataServerSettings },
    } = useMetadataServerSettings();

    const setSettingValue = createUpdateMetadataServerSettings<keyof MetadataLibrarySettings>((e) =>
        makeToast(t`Could not save the default search settings to the server`, 'error', getErrorMessage(e)),
    );

    const scopedCategories = categories.data?.categories.nodes ?? [];

    const categoryCount = scopedCategories.filter((c) => c.id !== 0).length;

    const categoryLink = `${AppRoutes.settings.children.categories.path}?tab=${activeTab}`;

    const duplicatesLink =
        activeContentType === SourceContentType.LightNovel
            ? `${AppRoutes.settings.children.library.children.duplicates.path}?tab=light-novel`
            : AppRoutes.settings.children.library.children.duplicates.path;

    const loading = serverSettings.loading || areMetadataServerSettingsLoading || categories.loading;
    if (loading) {
        return <LoadingPlaceholder />;
    }

    const error = serverSettings.error ?? metadataServerSettingsError ?? categories.error;
    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (serverSettings.error) {
                        serverSettings
                            ?.refetch()
                            .catch(defaultPromiseErrorHandler('LibrarySettings::refetchServerSettings'));
                    }

                    if (metadataServerSettingsError) {
                        refetchMetadataServerSettings().catch(
                            defaultPromiseErrorHandler('LibrarySettings::refetchMetadataServerSettings'),
                        );
                    }

                    if (categories.error) {
                        categories.refetch().catch(defaultPromiseErrorHandler('LibrarySettings::refetchCategories'));
                    }
                }}
            />
        );
    }

    return (
        <TabsWrapper>
            <OffsetComponent sx={{ zIndex: 2 }}>
                <TabsMenu
                    variant="fullWidth"
                    value={activeTab}
                    onChange={(_, newTab) => setTabSearchParam(newTab, 'replaceIn')}
                >
                    <Tab value="manga" sx={{ textTransform: 'none' }} label={t`Manga`} />
                    <Tab value="light-novel" sx={{ textTransform: 'none' }} label={t`Light Novel`} />
                </TabsMenu>
            </OffsetComponent>
            <List sx={{ pt: 0 }}>
                <List
                    subheader={
                        <ListSubheader component="div" id="library-category-settings">
                            {t`Categories`}
                        </ListSubheader>
                    }
                >
                    <ListItemLink to={categoryLink}>
                        <ListItemText
                            primary={t`Edit categories`}
                            secondary={plural(categoryCount, {
                                one: '# category',
                                other: '# categories',
                            })}
                        />
                    </ListItemLink>
                </List>
                <List
                    subheader={
                        <ListSubheader component="div" id="library-general-settings">
                            {t`General`}
                        </ListSubheader>
                    }
                >
                    {[
                        {
                            key: 'showAddToLibraryCategorySelectDialog' as const,
                            primary: t`Category selection dialog`,
                            secondary: t`Show the category selection dialog when adding an item to the library`,
                        },
                        {
                            key: 'removeMangaFromCategories' as const,
                            primary: t`Forget categories`,
                            secondary: t`Remove items from categories when removing them from the library`,
                        },
                        {
                            key: 'ignoreFilters' as const,
                            primary: t`Ignore filters when searching`,
                            secondary: t`Search results will include items that do not match the current filters`,
                        },
                        {
                            key: 'fuzzySearch' as const,
                            primary: t`Fuzzy search`,
                            secondary: t`Match the library search even with typos or words in a different order, and show the closest matches first`,
                        },
                    ].map(({ key, primary, secondary }) => (
                        <ListItem key={key}>
                            <ListItemText primary={primary} secondary={secondary} />
                            <Switch
                                edge="end"
                                checked={settings[key]}
                                onChange={(e) => setSettingValue(key, e.target.checked)}
                            />
                        </ListItem>
                    ))}
                </List>
                <GlobalUpdateSettings serverSettings={serverSettings.data!.settings} categories={scopedCategories} />
                <List
                    subheader={
                        <ListSubheader component="div" id="library-advanced">
                            {t`Advanced`}
                        </ListSubheader>
                    }
                >
                    <ListItemButton onClick={() => removeNonLibraryMangasFromCategories(activeContentType)}>
                        <ListItemText
                            primary={t`Cleanup database`}
                            secondary={
                                activeContentType === SourceContentType.LightNovel
                                    ? t`Remove non library light novel from categories`
                                    : t`Remove non library manga from categories`
                            }
                        />
                    </ListItemButton>
                    <ListItemLink to={duplicatesLink}>
                        <ListItemText
                            primary={t`Duplicated entries`}
                            secondary={t`Show all duplicated entries in your library`}
                        />
                    </ListItemLink>
                </List>
            </List>
        </TabsWrapper>
    );
}
