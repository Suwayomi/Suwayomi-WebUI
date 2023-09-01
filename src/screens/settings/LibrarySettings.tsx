/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ListItemButton from '@mui/material/ListItemButton';
import DialogTitle from '@mui/material/DialogTitle';
import { styled } from '@mui/material';
import { t as translate } from 'i18next';
import { useTranslation } from 'react-i18next';
import requestManager from '@/lib/requests/RequestManager.ts';
import makeToast from '@/components/util/Toast';
import ThreeStateCheckboxInput from '@/components/atoms/ThreeStateCheckboxInput';
import NavbarContext, { useSetDefaultBackTo } from '@/components/context/NavbarContext';
import SearchSettings from '@/screens/settings/SearchSettings';
import { CategoryType, IncludeInUpdate } from '@/lib/graphql/generated/graphql.ts';

const CategoriesDiv = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '170px',
    overflow: 'auto',
});

const booleanToIncludeInStatus = (status: boolean | null | undefined): IncludeInUpdate => {
    switch (status) {
        case false:
            return IncludeInUpdate.Exclude;
        case true:
            return IncludeInUpdate.Include;
        case null:
        case undefined:
            return IncludeInUpdate.Unset;
        default:
            throw new Error(`booleanToIncludeInStatus: unexpected IncludeInUpdate status "${status}"`);
    }
};

const includeInUpdateStatusToBoolean = (status: IncludeInUpdate): boolean | null => {
    switch (status) {
        case IncludeInUpdate.Exclude:
            return false;
        case IncludeInUpdate.Include:
            return true;
        case IncludeInUpdate.Unset:
            return null;
        default:
            throw new Error(`includeInUpdateStatusToBoolean: unexpected IncludeInUpdate status "${status}"`);
    }
};

const getCategoryUpdateInfo = (
    categories: CategoryType[],
    areIncluded: boolean,
    unsetCategories: number,
    allCategories: number,
    error: any,
) => {
    if (error) {
        return translate('global.error.label.failed_to_load_data');
    }
    if (allCategories === -1) {
        return translate('global.label.loading');
    }

    const noSpecificallyIncludedCategories = areIncluded && !categories.length && unsetCategories;
    const includesAllCategories = categories.length === allCategories;
    if (noSpecificallyIncludedCategories || includesAllCategories) {
        return translate('extension.language.all');
    }

    if (!categories.length) {
        return translate('global.label.none');
    }

    return categories.map((category) => category.name).join(', ');
};

export default function LibrarySettings() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);

    useEffect(() => {
        setTitle(t('library.settings.title'));
        setAction(null);
    }, [t]);

    useSetDefaultBackTo('settings');

    const { data, error: requestError } = requestManager.useGetCategories();
    const categories = (data?.categories.nodes ?? []) as CategoryType[];
    const [dialogCategories, setDialogCategories] = useState<CategoryType[]>(categories);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        setDialogCategories(categories);
    }, [categories]);

    const unsetCategories: CategoryType[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInUpdate.Unset) ?? [];
    const excludedCategories: CategoryType[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInUpdate.Exclude) ?? [];
    const includedCategories: CategoryType[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInUpdate.Include) ?? [];
    const excludedCategoriesText = getCategoryUpdateInfo(
        excludedCategories,
        false,
        unsetCategories.length,
        categories?.length ?? -1,
        requestError,
    );
    const includedCategoriesText = getCategoryUpdateInfo(
        includedCategories,
        true,
        unsetCategories.length,
        categories?.length ?? -1,
        requestError,
    );

    const updateCategory = (category: CategoryType) =>
        requestManager.updateCategory(category.id, { includeInUpdate: category.includeInUpdate }).response;

    const updateCategories = async () => {
        const categoriesToUpdate = dialogCategories.filter((category) => {
            const currentCategory = categories.find((currCategory) => currCategory.id === category.id);

            if (!currentCategory) {
                return false;
            }

            return currentCategory.includeInUpdate !== category.includeInUpdate;
        });

        setIsDialogOpen(false);

        try {
            await Promise.all(categoriesToUpdate.map((category) => updateCategory(category)));
            // TODO - update cache immediately
            // mutate(categoriesEndpoint, [...dialogCategories], { revalidate: false });
        } catch (error) {
            makeToast(t('global.error.label.failed_to_save_changes'), 'error');
            // mutate(categoriesEndpoint, [...categories]);
        }
    };

    const closeDialog = () => {
        setDialogCategories(categories ?? []);
        setIsDialogOpen(false);
    };

    return (
        <>
            <List
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        {t('search.title.search')}
                    </ListSubheader>
                }
            >
                <SearchSettings />
            </List>
            <List
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader">
                        {t('library.settings.global_update.title')}
                    </ListSubheader>
                }
            >
                <ListItemButton onClick={() => setIsDialogOpen(true)}>
                    <ListItemText
                        primary={t('category.title.categories')}
                        secondary={
                            <>
                                <span>
                                    {t('library.settings.global_update.categories.label.include', {
                                        includedCategoriesText,
                                    })}
                                </span>
                                <span>
                                    {t('library.settings.global_update.categories.label.exclude', {
                                        excludedCategoriesText,
                                    })}
                                </span>
                            </>
                        }
                        secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                    />
                </ListItemButton>
            </List>

            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{t('category.title.categories')}</DialogTitle>
                    <DialogContentText sx={{ paddingBottom: '10px' }}>
                        {t('library.settings.global_update.categories.label.info')}
                    </DialogContentText>
                    <CategoriesDiv>
                        {dialogCategories.map((category) => (
                            <ThreeStateCheckboxInput
                                key={category.id}
                                label={category.name}
                                checked={includeInUpdateStatusToBoolean(category.includeInUpdate)}
                                onChange={(checked) => {
                                    const newIncludeState = booleanToIncludeInStatus(checked);

                                    const categoryIndex = dialogCategories.findIndex(
                                        (category_) => category_ === category,
                                    );
                                    const updatedDialogCategories: CategoryType[] = [
                                        ...dialogCategories.slice(0, categoryIndex),
                                        {
                                            ...category,
                                            includeInUpdate: newIncludeState,
                                        },
                                        ...dialogCategories.slice(categoryIndex + 1, dialogCategories.length),
                                    ];

                                    setDialogCategories(updatedDialogCategories);
                                }}
                            />
                        ))}
                    </CategoriesDiv>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={updateCategories} color="primary">
                        {t('global.button.ok')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
