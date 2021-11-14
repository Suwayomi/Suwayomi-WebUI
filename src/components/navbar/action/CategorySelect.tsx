/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import client from 'util/client';

interface IProps {
    open: boolean
    setOpen: (value: boolean) => void
    mangaId: number
}

interface ICategoryInfo {
    category: ICategory
    selected: boolean
}

export default function CategorySelect(props: IProps) {
    const { open, setOpen, mangaId } = props;
    const [categoryInfos, setCategoryInfos] = useState<ICategoryInfo[]>([]);

    const [updateTriggerHolder, setUpdateTriggerHolder] = useState(0); // just a hack
    const triggerUpdate = () => setUpdateTriggerHolder(updateTriggerHolder + 1); // just a hack

    useEffect(() => {
        let tmpCategoryInfos: ICategoryInfo[] = [];
        client.get('/api/v1/category/')
            .then((response) => response.data)
            .then((data: ICategory[]) => {
                if (data.length > 0 && data[0].name === 'Default') { data.shift(); }
                tmpCategoryInfos = data.map((category) => ({ category, selected: false }));
            })
            .then(() => {
                client.get(`/api/v1/manga/${mangaId}/category/`)
                    .then((response) => response.data)
                    .then((data: ICategory[]) => {
                        data.forEach((category) => {
                            tmpCategoryInfos[category.order - 1].selected = true;
                        });
                        setCategoryInfos(tmpCategoryInfos);
                    });
            });
    }, [updateTriggerHolder, open]);

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        setOpen(false);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, categoryId: number) => {
        const { checked } = event.target as HTMLInputElement;

        const method = checked ? client.get : client.delete;
        method(`/api/v1/manga/${mangaId}/category/${categoryId}`)
            .then(() => triggerUpdate());
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
                    {categoryInfos.length === 0
                        && (
                            <span>
                                No categories found!
                                <br />
                                You should make some from settings.
                            </span>
                        )}
                    {categoryInfos.map((categoryInfo) => (
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    checked={categoryInfo.selected}
                                    onChange={(e) => handleChange(e, categoryInfo.category.id)}
                                    color="default"
                                />
                            )}
                            label={categoryInfo.category.name}
                            key={categoryInfo.category.id}
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
