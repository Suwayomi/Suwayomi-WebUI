/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useMemo, useState, useContext, useEffect } from 'react';
import { List, ListItem, ListItemText, ListItemIcon, IconButton } from '@mui/material';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult,
    DraggingStyle,
    NotDraggingStyle,
} from 'react-beautiful-dnd';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme, Palette } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import NavbarContext from 'components/context/NavbarContext';
import client, { useQuery } from 'util/client';
import { ICategory } from 'typings';
import { useTranslation } from 'react-i18next';

const getItemStyle = (
    isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined,
    palette: Palette,
) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
        background: palette.mode === 'dark' ? '#424242' : 'rgb(235,235,235)',
    }),
});

export default function Categories() {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => {
        setTitle(t('category.title.categories'));
        setAction(null);
    }, [t]);

    const { data, mutate } = useQuery<ICategory[]>('/api/v1/category/');
    const categories = useMemo(() => {
        const res = [...(data ?? [])];
        if (res.length > 0 && res[0].name === 'Default') {
            res.shift();
        }
        return res;
    }, [data]);

    const [categoryToEdit, setCategoryToEdit] = useState<number>(-1); // -1 means new category
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogName, setDialogName] = useState<string>('');
    const [dialogDefault, setDialogDefault] = useState<boolean>(false);
    const theme = useTheme();

    const categoryReorder = (list: ICategory[], from: number, to: number) => {
        const newData = [...list];
        const [removed] = newData.splice(from, 1);
        newData.splice(to, 0, removed);
        mutate(newData, { revalidate: false });

        const formData = new FormData();
        formData.append('from', `${from + 1}`);
        formData.append('to', `${to + 1}`);
        client.patch('/api/v1/category/reorder', formData).finally(() => mutate());
    };

    const onDragEnd = (result: DropResult) => {
        // dropped outside the list?
        if (!result.destination) {
            return;
        }

        categoryReorder(categories, result.source.index, result.destination.index);
    };

    const resetDialog = () => {
        setDialogName('');
        setDialogDefault(false);
        setCategoryToEdit(-1);
    };

    const handleDialogOpen = () => {
        resetDialog();
        setDialogOpen(true);
    };

    const handleEditDialogOpen = (index: number) => {
        setDialogName(categories[index].name);
        setDialogDefault(categories[index].default);
        setCategoryToEdit(index);
        setDialogOpen(true);
    };

    const handleDialogCancel = () => {
        setDialogOpen(false);
    };

    const handleDialogSubmit = () => {
        setDialogOpen(false);

        const formData = new FormData();
        formData.append('name', dialogName);
        formData.append('default', dialogDefault.toString());

        if (categoryToEdit === -1) {
            client.post('/api/v1/category/', formData).finally(() => mutate());
        } else {
            const category = categories[categoryToEdit];
            client.patch(`/api/v1/category/${category.id}`, formData).finally(() => mutate());
        }
    };

    const deleteCategory = (index: number) => {
        const category = categories[index];
        client.delete(`/api/v1/category/${category.id}`).finally(() => mutate());
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(droppableProvided) => (
                        <List ref={droppableProvided.innerRef}>
                            {categories.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                    {(draggableProvided, snapshot) => (
                                        <ListItem
                                            ContainerProps={{ ref: draggableProvided.innerRef } as any}
                                            {...draggableProvided.draggableProps}
                                            {...draggableProvided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                draggableProvided.draggableProps.style,
                                                theme.palette,
                                            )}
                                            ref={draggableProvided.innerRef}
                                        >
                                            <ListItemIcon>
                                                <DragHandleIcon />
                                            </ListItemIcon>
                                            <ListItemText primary={item.name} />
                                            <IconButton
                                                onClick={() => {
                                                    handleEditDialogOpen(index);
                                                }}
                                                size="large"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    deleteCategory(index);
                                                }}
                                                size="large"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItem>
                                    )}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>
            <Fab
                color="primary"
                aria-label="add"
                style={{
                    position: 'fixed',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                }}
                onClick={handleDialogOpen}
            >
                <AddIcon />
            </Fab>
            <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                <DialogTitle id="form-dialog-title">
                    {categoryToEdit === -1
                        ? t('category.dialog.title.new_category')
                        : t('category.dialog.title.edit_category')}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label={t('category.label.category_name')}
                        type="text"
                        fullWidth
                        value={dialogName}
                        onChange={(e) => setDialogName(e.target.value)}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={dialogDefault}
                                onChange={(e) => setDialogDefault(e.target.checked)}
                                color="default"
                            />
                        }
                        label={t('category.label.use_as_default_category')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogCancel} color="primary">
                        {t('global.button.cancel')}
                    </Button>
                    <Button onClick={handleDialogSubmit} color="primary">
                        {t('global.button.submit')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
