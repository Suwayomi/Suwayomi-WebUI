/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useMemo } from 'react';
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
    const [triggerMutate] = requestManager.useUpdateMangaCategories();

    const allCategories = useMemo(() => {
        const cats = [...(categoriesData ?? [])]; // make copy
        if (cats.length > 0 && cats[0].name === 'Default') {
            cats.shift(); // remove first category if it is 'Default'
        }
        return cats;
    }, [categoriesData]);

    const selectedIds = mangaResult?.manga.categories.nodes.map((c) => c.id) ?? [];

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, categoryId: number) => {
        const { checked } = event.target as HTMLInputElement;

        // TODO - update to only update categories when clicking OK - can now be updated in one go with graphql
        triggerMutate({
            variables: {
                input: {
                    id: mangaId,
                    patch: {
                        addToCategories: checked ? [categoryId] : [],
                        removeFromCategories: !checked ? [categoryId] : [],
                    },
                },
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
                                    checked={selectedIds.includes(category.id)}
                                    onChange={(e) => handleChange(e, category.id)}
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
