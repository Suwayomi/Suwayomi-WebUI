/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';
import { ThreeStateCheckboxInput } from '@/components/atoms/ThreeStateCheckboxInput.tsx';

type BaseProps = {
    open: boolean;
    setOpen: (value: boolean) => void;
};

type SingleMangaModeProps = {
    mangaId: number;
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

        return mangaResult.manga.categories.nodes.map((category) => category.id);
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

    const { open, setOpen, mangaId, mangaIds: passedMangaIds } = props;

    const isSingleSelectionMode = mangaId !== undefined;
    const mangaIds = passedMangaIds ?? [mangaId];

    const mangaCategoryIds = useGetMangaCategoryIds(mangaId);
    const { data } = requestManager.useGetCategories();
    const categoriesData = data?.categories.nodes;

    const allCategories = useMemo(() => {
        const cats = [...(categoriesData ?? [])]; // make copy
        if (cats.length > 0 && cats[0].name === 'Default') {
            cats.shift(); // remove first category if it is 'Default'
        }
        return cats;
    }, [categoriesData]);

    const { handleSelection, setSelectionForKey, getSelectionForKey } = useSelectableCollection<
        number,
        'categoriesToAdd' | 'categoriesToRemove'
    >(allCategories.length, {
        currentKey: 'categoriesToAdd',
        initialState: {
            categoriesToAdd: mangaCategoryIds,
            categoriesToRemove: [],
        },
    });

    useEffect(() => {
        setSelectionForKey('categoriesToAdd', mangaCategoryIds);
        setSelectionForKey('categoriesToRemove', []);
    }, [mangaCategoryIds]);

    const categoriesToAdd = getSelectionForKey('categoriesToAdd');
    const categoriesToRemove = getSelectionForKey('categoriesToRemove');

    const handleCancel = () => {
        setSelectionForKey('categoriesToAdd', mangaCategoryIds);
        setSelectionForKey('categoriesToRemove', []);
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);

        const addToCategories = isSingleSelectionMode
            ? categoriesToAdd.filter((categoryId) => !mangaCategoryIds.includes(categoryId))
            : categoriesToAdd;
        const removeFromCategories = isSingleSelectionMode
            ? mangaCategoryIds.filter((categoryId) => !categoriesToAdd.includes(categoryId))
            : categoriesToRemove;

        const isUpdateRequired = !!addToCategories.length || !!removeFromCategories.length;
        if (!isUpdateRequired) {
            return;
        }

        Mangas.performAction('change_categories', mangaIds, {
            changeCategoriesPatch: {
                addToCategories,
                removeFromCategories,
            },
        });
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
                    {allCategories.length === 0 && (
                        <span>
                            {t('category.error.no_categories_found.label.info')}
                            <br />
                            {t('category.error.no_categories_found.label.hint')}
                        </span>
                    )}
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
                <Button autoFocus onClick={handleCancel} color="primary">
                    {t('global.button.cancel')}
                </Button>
                <Button onClick={handleOk} color="primary">
                    {t('global.button.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
