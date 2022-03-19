/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useState, useContext, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
} from '@mui/material';
import {
    DragDropContext, Droppable, Draggable, DropResult, DraggingStyle, NotDraggingStyle,
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
import client from 'util/client';

/**
 * It returns a style object that is applied to the draggable element.
 * @param {boolean} isDragging - boolean
 * @param {DraggingStyle | NotDraggingStyle | undefined} draggableStyle - The style to apply to the
 * draggable element.
 * @param {Palette} palette - Palette
 */
const getItemStyle = (isDragging: boolean,
    draggableStyle: DraggingStyle | NotDraggingStyle | undefined, palette: Palette) => ({
    // styles we need to apply on draggables
    ...draggableStyle,

    ...(isDragging && {
        background: palette.mode === 'dark' ? '#424242' : 'rgb(235,235,235)',
    }),
});

/**
 * It renders a drag-and-drop list of categories, with an add button to add a new category
 * @returns A list of categories.
 */
export default function Categories() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => { setTitle('Categories'); setAction(<></>); }, []);

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [categoryToEdit, setCategoryToEdit] = useState<number>(-1); // -1 means new category
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogName, setDialogName] = useState<string>('');
    const [dialogDefault, setDialogDefault] = useState<boolean>(false);
    const theme = useTheme();

    const [updateTriggerHolder, setUpdateTriggerHolder] = useState<number>(0); // just a hack
    const triggerUpdate = () => setUpdateTriggerHolder(updateTriggerHolder + 1); // just a hack

    useEffect(() => {
        if (!dialogOpen) {
            client.get('/api/v1/category/')
                .then((response) => response.data)
                .then((data) => { if (data.length > 0 && data[0].name === 'Default') data.shift(); return data; })
                .then((data) => setCategories(data));
        }
    }, [updateTriggerHolder]);

    /**
     * It takes a list of categories, the index of the category to move, and the index of the new
     * location for that category. It then sends a PATCH request to the server to move the category
     * @param {ICategory[]} list - the list of categories to reorder
     * @param {number} from - the index of the category to move
     * @param {number} to - The index of the category to move to.
     * @returns The result of the `reorder` function is an array of categories.
     */
    const categoryReorder = (list: ICategory[], from: number, to: number) => {
        const formData = new FormData();
        formData.append('from', `${from + 1}`);
        formData.append('to', `${to + 1}`);
        client.patch('/api/v1/category/reorder', formData)
            .finally(() => triggerUpdate());

        // also move it in local state to avoid jarring moving behviour...
        const result = Array.from(list);
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
    };

    /**
     * It reorders the categories in the list.
     * @param {DropResult} result - The result of the drag and drop operation.
     * @returns Nothing.
     */
    const onDragEnd = (result: DropResult) => {
        // dropped outside the list?
        if (!result.destination) {
            return;
        }

        setCategories(categoryReorder(
            categories,
            result.source.index,
            result.destination.index,
        ));
    };

    /**
     * It resets the dialog form.
     */
    const resetDialog = () => {
        setDialogName('');
        setDialogDefault(false);
        setCategoryToEdit(-1);
    };

    /**
     * It resets the dialog and opens it.
     */
    const handleDialogOpen = () => {
        resetDialog();
        setDialogOpen(true);
    };

    /**
     * It sets the dialog name to the name of the category that is being edited.
     * It also sets the dialog default to the default value of the category that is being edited.
     * It also sets the category to edit to the index of the category that is being edited.
     * It also sets the dialog open to true.
     * @param {number} index - The index of the category to edit.
     */
    const handleEditDialogOpen = (index:number) => {
        setDialogName(categories[index].name);
        setDialogDefault(categories[index].default);
        setCategoryToEdit(index);
        setDialogOpen(true);
    };

    /**
     * It sets the dialog open to false.
     */
    const handleDialogCancel = () => {
        setDialogOpen(false);
    };

    /**
     * If we are editing a category, we send a PATCH request to the API. Otherwise, we send a POST
     * request
     */
    const handleDialogSubmit = () => {
        setDialogOpen(false);

        const formData = new FormData();
        formData.append('name', dialogName);
        formData.append('default', dialogDefault.toString());

        if (categoryToEdit === -1) {
            client.post('/api/v1/category/', formData)
                .finally(() => triggerUpdate());
        } else {
            const category = categories[categoryToEdit];
            client.patch(`/api/v1/category/${category.id}`, formData)
                .finally(() => triggerUpdate());
        }
    };

    /**
     * It deletes a category from the database.
     * @param {number} index - The index of the category to be deleted.
     */
    const deleteCategory = (index:number) => {
        const category = categories[index];
        client.delete(`/api/v1/category/${category.id}`)
            .finally(() => triggerUpdate());
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided) => (
                        <List ref={provided.innerRef}>
                            {categories.map((item, index) => (
                                <Draggable
                                    key={item.id}
                                    draggableId={item.id.toString()}
                                    index={index}
                                >
                                    {(provided, snapshot) => (
                                        <ListItem
                                            ContainerProps={{ ref: provided.innerRef } as any}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style,
                                                theme.palette,
                                            )}
                                            ref={provided.innerRef}
                                        >
                                            <ListItemIcon>
                                                <DragHandleIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.name}
                                            />
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
                            {provided.placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>
            <Fab
                color="primary"
                aria-label="add"
                style={{
                    position: 'absolute',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                }}
                onClick={handleDialogOpen}
            >
                <AddIcon />
            </Fab>
            <Dialog open={dialogOpen} onClose={handleDialogCancel}>
                <DialogTitle id="form-dialog-title">
                    {categoryToEdit === -1 ? 'New Catalog' : 'Edit Catalog'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Category Name"
                        type="text"
                        fullWidth
                        value={dialogName}
                        onChange={(e) => setDialogName(e.target.value)}
                    />
                    <FormControlLabel
                        control={(
                            <Checkbox
                                checked={dialogDefault}
                                onChange={(e) => setDialogDefault(e.target.checked)}
                                color="default"
                            />
                        )}
                        label="Default category when adding new manga to library"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDialogSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
