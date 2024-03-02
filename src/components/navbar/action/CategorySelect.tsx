/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Stack } from '@mui/material';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { ThreeStateCheckboxInput } from '@/components/atoms/ThreeStateCheckboxInput.tsx';
import { Categories } from '@/lib/data/Categories.ts';
import { CheckboxInput } from '@/components/atoms/CheckboxInput.tsx';
import { useMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { convertToGqlMeta, requestUpdateServerMetadata } from '@/util/metadata.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

type BaseProps = {
    open: boolean;
    onClose: (didUpdateCategories: boolean, addToCategories?: number[], removeFromCategories?: number[]) => void;
};

type SingleMangaModeProps = {
    mangaId: number;
    addToLibrary?: boolean;
};

type MultiMangaModeProps = {
    mangaIds: number[];
};

type Props =
    | (BaseProps & SingleMangaModeProps & PropertiesNever<MultiMangaModeProps>)
    | (BaseProps & PropertiesNever<SingleMangaModeProps> & MultiMangaModeProps);

const useGetMangaCategoryIds = (mangaId: number | undefined): number[] => {
    const { data: mangaResult } = requestManager.useGetManga(mangaId ?? -1, { skip: mangaId === undefined });

    return useMemo(() => {
        if (mangaId === undefined || !mangaResult) {
            return [];
        }

        return Categories.getIds(mangaResult.manga.categories.nodes);
    }, [mangaResult?.manga.categories.nodes, mangaId]);
};

const getCategoryCheckedState = (
    categoryId: number,
    categoriesToAdd: number[],
    categoriesToRemove: number[],
    isSingleSelectionMode: boolean,
): boolean | undefined => {
    if (categoriesToAdd.includes(categoryId)) {
        return true;
    }

    if (isSingleSelectionMode) {
        return undefined;
    }

    if (categoriesToRemove.includes(categoryId)) {
        return false;
    }

    return undefined;
};

export function CategorySelect(props: Props) {
    const { t } = useTranslation();

    const { open, onClose, mangaId, mangaIds: passedMangaIds, addToLibrary = false } = props;

    const isSingleSelectionMode = mangaId !== undefined;
    const mangaIds = passedMangaIds ?? [mangaId];

    const [doNotShowAddToLibraryDialogAgain, setDoNotShowAddToLibraryDialogAgain] = useState(false);
    const { metadata: serverMetadata } = useMetadataServerSettings();

    const mangaCategoryIds = useGetMangaCategoryIds(mangaId);
    const { data } = requestManager.useGetCategories();
    const categoriesData = data?.categories.nodes;

    const allCategories = useMemo(() => Categories.getUserCreated(categoriesData ?? []), [categoriesData]);

    const defaultCategoryIds = useMemo(
        () => (addToLibrary ? Categories.getIds(Categories.getDefaults(allCategories)) : []),
        [allCategories],
    );

    const { handleSelection, setSelectionForKey, getSelectionForKey } = useSelectableCollection<
        number,
        'categoriesToAdd' | 'categoriesToRemove'
    >(allCategories.length, {
        currentKey: 'categoriesToAdd',
        initialState: {
            categoriesToAdd: [...mangaCategoryIds, ...defaultCategoryIds],
            categoriesToRemove: [],
        },
    });

    useEffect(() => {
        setSelectionForKey('categoriesToAdd', [...mangaCategoryIds, ...defaultCategoryIds]);
        setSelectionForKey('categoriesToRemove', []);
    }, [mangaCategoryIds]);

    const categoriesToAdd = getSelectionForKey('categoriesToAdd');
    const categoriesToRemove = getSelectionForKey('categoriesToRemove');

    const handleCancel = () => {
        setSelectionForKey('categoriesToAdd', mangaCategoryIds);
        setSelectionForKey('categoriesToRemove', []);
        onClose(false);
    };

    const handleOk = () => {
        const addToCategories = isSingleSelectionMode
            ? categoriesToAdd.filter((categoryId) => !mangaCategoryIds.includes(categoryId))
            : categoriesToAdd;
        const removeFromCategories = isSingleSelectionMode
            ? mangaCategoryIds.filter((categoryId) => !categoriesToAdd.includes(categoryId))
            : categoriesToRemove;

        onClose(true, addToCategories, removeFromCategories);

        if (doNotShowAddToLibraryDialogAgain) {
            requestUpdateServerMetadata(convertToGqlMeta(serverMetadata)! ?? {}, [
                ['showAddToLibraryCategorySelectDialog', false],
            ]).catch(() => makeToast(t('search.error.label.failed_to_save_settings'), 'error'));
        }

        const isUpdateRequired = !!addToCategories.length || !!removeFromCategories.length;
        if (!isUpdateRequired) {
            return;
        }

        if (addToLibrary) {
            // categories get updated in MangaDetails
            return;
        }

        Mangas.performAction('change_categories', mangaIds, {
            changeCategoriesPatch: {
                addToCategories,
                removeFromCategories,
            },
        }).catch(defaultPromiseErrorHandler('CategorySelect::handleOk'));
    };

    return (
        <Dialog
            sx={{
                '.MuiDialog-paper': {
                    maxHeight: 435,
                    width: '80%',
                },
            }}
            maxWidth="xs"
            open={open}
        >
            <DialogTitle>{t('category.title.set_categories')}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    {allCategories.length === 0 && <span>{t('category.error.no_categories_found.label.info')}</span>}
                    {allCategories.map((category) => (
                        <ThreeStateCheckboxInput
                            checked={getCategoryCheckedState(
                                category.id,
                                categoriesToAdd,
                                categoriesToRemove,
                                isSingleSelectionMode,
                            )}
                            onChange={(checked) => {
                                handleSelection(category.id, false, 'categoriesToAdd');
                                handleSelection(category.id, false, 'categoriesToRemove');

                                if (checked) {
                                    handleSelection(category.id, true, 'categoriesToAdd');
                                }

                                if (checked === false) {
                                    handleSelection(category.id, true, 'categoriesToRemove');
                                }
                            }}
                            label={category.name}
                            key={category.id}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack sx={{ width: '100%' }}>
                    {addToLibrary && (
                        <CheckboxInput
                            sx={{ margin: 0 }}
                            size="small"
                            label={t('global.button.dont_show_dialog_again')}
                            onChange={(e) => setDoNotShowAddToLibraryDialogAgain(e.target.checked)}
                        />
                    )}
                    <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between" alignItems="end">
                        <Button component={Link} to="/settings/categories">
                            {t(allCategories.length ? 'global.button.edit' : 'global.button.create')}
                        </Button>
                        <Stack direction="row">
                            <Button autoFocus onClick={handleCancel} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                            {!!allCategories.length && (
                                <Button onClick={handleOk} color="primary">
                                    {t('global.button.ok')}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
