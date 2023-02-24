/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useMemo } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import client, { useQuery } from 'util/client';
import { ICategory } from 'typings';

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
    mangaId: number;
}

export default function CategorySelect(props: IProps) {
    const { open, setOpen, mangaId } = props;

    const { data: mangaCategoriesData, mutate } = useQuery<ICategory[]>(`/api/v1/manga/${mangaId}/category`);
    const { data: categoriesData } = useQuery<ICategory[]>('/api/v1/category');

    const allCategories = useMemo(() => {
        const cats = [...(categoriesData ?? [])]; // make copy
        if (cats.length > 0 && cats[0].name === 'Default') {
            cats.shift(); // remove first category if it is 'Default'
        }
        return cats;
    }, [categoriesData]);

    const selectedIds = mangaCategoriesData?.map((c) => c.id) ?? [];

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, categoryId: number) => {
        const { checked } = event.target as HTMLInputElement;

        const method = checked ? client.get : client.delete;
        method(`/api/v1/manga/${mangaId}/category/${categoryId}`).then(() => mutate());
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
            <DialogTitle>Set categories</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    {allCategories.length === 0 && (
                        <span>
                            No categories found!
                            <br />
                            You should make some from settings.
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
                    Cancel
                </Button>
                <Button onClick={handleOk} color="primary">
                    Ok
                </Button>
            </DialogActions>
        </Dialog>
    );
}
