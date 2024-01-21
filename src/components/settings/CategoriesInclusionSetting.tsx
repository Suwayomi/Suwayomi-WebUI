/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { t as translate } from 'i18next';
import { ThreeStateCheckboxInput } from '@/components/atoms/ThreeStateCheckboxInput.tsx';
import { makeToast } from '@/components/util/Toast.tsx';
import { IncludeOrExclude } from '@/lib/graphql/generated/graphql.ts';
import { TCategory } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { CheckboxContainer } from '@/components/settings/globalUpdate/CheckboxContainer.ts';

const booleanToIncludeOrExcludeStatus = (status: boolean | null | undefined): IncludeOrExclude => {
    switch (status) {
        case false:
            return IncludeOrExclude.Exclude;
        case true:
            return IncludeOrExclude.Include;
        case null:
        case undefined:
            return IncludeOrExclude.Unset;
        default:
            throw new Error(`booleanToIncludeInStatus: unexpected IncludeOrExclude status "${status}"`);
    }
};

const includeInUpdateStatusToBoolean = (status: IncludeOrExclude): boolean | null => {
    switch (status) {
        case IncludeOrExclude.Exclude:
            return false;
        case IncludeOrExclude.Include:
            return true;
        case IncludeOrExclude.Unset:
            return null;
        default:
            throw new Error(`includeInUpdateStatusToBoolean: unexpected IncludeOrExclude status "${status}"`);
    }
};

const getCategoryUpdateInfo = (
    categories: TCategory[],
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

type CategoryIncludeField = keyof Pick<TCategory, 'includeInUpdate' | 'includeInDownload'>;

type CategoriesInclusionSettingProps = {
    includeField: CategoryIncludeField;
    dialogText?: string;
};

export const CategoriesInclusionSetting = (props: CategoriesInclusionSettingProps) => {
    const { t } = useTranslation();

    const { includeField, dialogText } = props;
    const { data, error: requestError } = requestManager.useGetCategories();
    const categories = data?.categories.nodes;
    const [dialogCategories, setDialogCategories] = useState<TCategory[]>(categories ?? []);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (!categories) {
            return;
        }

        setDialogCategories(categories);
    }, [categories]);

    const unsetCategories: TCategory[] =
        categories?.filter((category) => category[includeField] === IncludeOrExclude.Unset) ?? [];
    const excludedCategories: TCategory[] =
        categories?.filter((category) => category[includeField] === IncludeOrExclude.Exclude) ?? [];
    const includedCategories: TCategory[] =
        categories?.filter((category) => category[includeField] === IncludeOrExclude.Include) ?? [];
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

    const updateCategory = (category: TCategory) =>
        requestManager.updateCategory(category.id, { [includeField]: category[includeField] }).response;

    const updateCategories = async () => {
        const categoriesToUpdate = dialogCategories.filter((category) => {
            const currentCategory = categories?.find((currCategory) => currCategory.id === category.id);

            if (!currentCategory) {
                return false;
            }

            return currentCategory[includeField] !== category[includeField];
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
            <ListItemButton onClick={() => setIsDialogOpen(true)}>
                <ListItemText
                    primary={t('category.title.categories')}
                    secondary={
                        <>
                            <span>
                                {t('category.settings.inclusion.label.include', {
                                    includedCategoriesText,
                                })}
                            </span>
                            <span>
                                {t('category.settings.inclusion.label.exclude', {
                                    excludedCategoriesText,
                                })}
                            </span>
                        </>
                    }
                    secondaryTypographyProps={{ style: { display: 'flex', flexDirection: 'column' } }}
                />
            </ListItemButton>

            <Dialog open={isDialogOpen} onClose={closeDialog}>
                <DialogContent>
                    <DialogTitle sx={{ paddingLeft: 0 }}>{t('category.title.categories')}</DialogTitle>
                    {dialogText && <DialogContentText sx={{ paddingBottom: '10px' }}>{dialogText}</DialogContentText>}
                    <CheckboxContainer>
                        {dialogCategories.map((category) => (
                            <ThreeStateCheckboxInput
                                key={category.id}
                                label={category.name}
                                checked={includeInUpdateStatusToBoolean(category[includeField])}
                                onChange={(checked) => {
                                    const newIncludeState = booleanToIncludeOrExcludeStatus(checked);

                                    const categoryIndex = dialogCategories.findIndex(
                                        (category_) => category_ === category,
                                    );
                                    const updatedDialogCategories: TCategory[] = [
                                        ...dialogCategories.slice(0, categoryIndex),
                                        {
                                            ...category,
                                            [includeField]: newIncludeState,
                                        },
                                        ...dialogCategories.slice(categoryIndex + 1, dialogCategories.length),
                                    ];

                                    setDialogCategories(updatedDialogCategories);
                                }}
                            />
                        ))}
                    </CheckboxContainer>
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
};
