/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo, useState, useContext, useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { DragDropContext, Draggable, DropResult, DraggingStyle, NotDraggingStyle } from 'react-beautiful-dnd';
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
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { StrictModeDroppable } from '@/lib/StrictModeDroppable';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/components/util/StyledFab';
import { NavBarContext } from '@/components/context/NavbarContext';
import { TCategory } from '@/typings.ts';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/components/util/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

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

export function Categories() {
    const { t } = useTranslation();

    const { setTitle, setAction } = useContext(NavBarContext);
    useEffect(() => {
        setTitle(t('category.title.category_other'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const { data, loading, error, refetch } = requestManager.useGetCategories({ notifyOnNetworkStatusChange: true });
    const categories = useMemo(() => {
        const res = [...(data?.categories.nodes ?? [])];
        if (res.length > 0 && res[0].name === 'Default') {
            res.shift();
        }
        return res;
    }, [data]);

    const [categoryToEdit, setCategoryToEdit] = useState<number>(-1); // -1 means new category
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogName, setDialogName] = useState<string>('');
    const [dialogDefault, setDialogDefault] = useState<boolean>(false);
    const [reorderCategory, { reset: revertReorder }] = requestManager.useReorderCategory();
    const theme = useTheme();

    const categoryReorder = (list: TCategory[], from: number, to: number) => {
        const reorderedCategory = list[from];

        reorderCategory({ variables: { input: { id: reorderedCategory.id, position: to + 1 } } }).catch(() =>
            revertReorder(),
        );
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

        if (categoryToEdit === -1) {
            requestManager.createCategory({ name: dialogName, default: dialogDefault });
        } else {
            const category = categories[categoryToEdit];
            requestManager.updateCategory(category.id, { name: dialogName, default: dialogDefault });
        }
    };

    const deleteCategory = (index: number) => {
        const category = categories[index];
        requestManager.deleteCategory(category.id);
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('category.error.label.request_failure')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('Categories::refetch'))}
            />
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable droppableId="droppable">
                    {(droppableProvided) => (
                        <List ref={droppableProvided.innerRef} sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }}>
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
                                            <Tooltip title={t('global.button.edit')}>
                                                <IconButton
                                                    onClick={() => {
                                                        handleEditDialogOpen(index);
                                                    }}
                                                    size="large"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('chapter.action.download.delete.label.action')}>
                                                <IconButton
                                                    onClick={() => {
                                                        deleteCategory(index);
                                                    }}
                                                    size="large"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItem>
                                    )}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                        </List>
                    )}
                </StrictModeDroppable>
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
