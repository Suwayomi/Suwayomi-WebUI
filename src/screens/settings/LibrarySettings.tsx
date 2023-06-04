/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useContext, useEffect, useState } from 'react';
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
import { ICategory, IncludeInGlobalUpdate } from '@/typings';
import requestManager from '@/lib/RequestManager';
import makeToast from '@/components/util/Toast';
import ThreeStateCheckboxInput from '@/components/atoms/ThreeStateCheckboxInput';
import NavbarContext from '@/components/context/NavbarContext';

const CategoriesDiv = styled('div')({
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '170px',
    overflow: 'auto',
});

const includeInUpdateStatusToBoolean = (status: IncludeInGlobalUpdate) => {
    if (status === IncludeInGlobalUpdate.UNSET) {
        return null;
    }

    return !!status;
};

const getCategoryUpdateInfo = (
    categories: ICategory[],
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

    const { data: categories, isLoading, error: requestError, mutate } = requestManager.useGetCategories();

    const [currentCategories, setCurrentCategories] = useState<ICategory[]>(categories ?? []); // categories to check if response categories changed
    const [dialogCategories, setDialogCategories] = useState<ICategory[]>(categories ?? []); // categories that are shown and updated in the dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const retrievedCategoriesChanged = !isLoading && categories?.length && categories !== currentCategories;
    if (retrievedCategoriesChanged) {
        setCurrentCategories(categories);
        setDialogCategories(categories);
    }

    const unsetCategories: ICategory[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInGlobalUpdate.UNSET) ?? [];
    const excludedCategories: ICategory[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInGlobalUpdate.EXCLUDE) ?? [];
    const includedCategories: ICategory[] =
        categories?.filter((category) => category.includeInUpdate === IncludeInGlobalUpdate.INCLUDE) ?? [];
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

    const updateCategory = (category: ICategory) =>
        requestManager.updateCategory(category.id, { includeInUpdate: category.includeInUpdate }).response;

    const updateCategories = async () => {
        const categoriesToUpdate = dialogCategories.filter((category) => {
            const currentCategory = currentCategories.find((currCategory) => currCategory.id === category.id);

            if (!currentCategory) {
                return false;
            }

            return currentCategory.includeInUpdate !== category.includeInUpdate;
        });

        try {
            await Promise.all(categoriesToUpdate.map((category) => updateCategory(category)));
        } catch (error) {
            makeToast(t('global.error.label.failed_to_save_changes'), 'error');
        } finally {
            setIsDialogOpen(false);

            if (categoriesToUpdate.length) {
                setDialogCategories([]);
                mutate([...dialogCategories], { revalidate: false });
            }
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
                        {t('library.settings.global_update.title')}
                    </ListSubheader>
                }
            >
                <ListItemButton>
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
                        onClick={() => setIsDialogOpen(true)}
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
                                disabled={category.name === 'Default'}
                                checked={includeInUpdateStatusToBoolean(category.includeInUpdate)}
                                onChange={(checked) => {
                                    const newIncludeState: IncludeInGlobalUpdate =
                                        checked == null ? IncludeInGlobalUpdate.UNSET : Number(checked);

                                    const categoryIndex = dialogCategories.findIndex(
                                        (category_) => category_ === category,
                                    );
                                    const updatedDialogCategories: ICategory[] = [
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
