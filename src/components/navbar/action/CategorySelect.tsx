/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { useSelectableCollection } from '@/components/collection/useSelectableCollection.ts';

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    mangaId: number;
}

export function CategorySelect(props: IProps) {
    const { t } = useTranslation();

    const { open, setOpen, mangaId } = props;

    const { data: mangaResult } = requestManager.useGetManga(mangaId);
    const { data } = requestManager.useGetCategories();
    const categoriesData = data?.categories.nodes;

    const allCategories = useMemo(() => {
        const cats = [...(categoriesData ?? [])]; // make copy
        if (cats.length > 0 && cats[0].name === 'Default') {
            cats.shift(); // remove first category if it is 'Default'
        }
        return cats;
    }, [categoriesData]);

    const mangaCategories = useMemo(
        () => mangaResult?.manga.categories.nodes.map((category) => category.id) ?? [],
        [mangaResult?.manga.categories.nodes],
    );

    const { selectedItemIds, handleSelection, setSelectionForKey } = useSelectableCollection<number>(
        allCategories.length,
        {
            initialState: {
                default: mangaCategories,
            },
        },
    );

    const handleCancel = () => {
        setSelectionForKey('default', mangaCategories);
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);

        Mangas.performAction('change_categories', [mangaId], {
            changeCategoriesPatch: {
                addToCategories: selectedItemIds,
                removeFromCategories: allCategories
                    .map((category) => category.id)
                    .filter((categoryId) => !selectedItemIds.includes(categoryId)),
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={selectedItemIds.includes(category.id)}
                                    onChange={(_, checked) => handleSelection(category.id, checked)}
                                    color="default"
                                />
                            }
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
