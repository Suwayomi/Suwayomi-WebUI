/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLayoutEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, DropResult } from 'react-beautiful-dnd';
import { useTheme } from '@mui/material/styles';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { StrictModeDroppable } from '@/modules/core/components/StrictModeDroppable.tsx';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/modules/core/components/buttons/StyledFab.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_SETTINGS } from '@/lib/graphql/queries/CategoryQuery.ts';
import { CategorySettingsCard } from '@/modules/category/components/CategorySettingsCard.tsx';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';

export function CategorySettings() {
    const { t } = useTranslation();

    const { setTitle, setAction } = useNavBarContext();
    useLayoutEffect(() => {
        setTitle(t('category.dialog.title.edit_category_other'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const { data, loading, error, refetch } = requestManager.useGetCategories<
        GetCategoriesSettingsQuery,
        GetCategoriesSettingsQueryVariables
    >(GET_CATEGORIES_SETTINGS, { notifyOnNetworkStatusChange: true });
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

    const categoryReorder = (list: CategoryIdInfo[], from: number, to: number) => {
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

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('category.error.label.request_failure')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('CategorySettings::refetch'))}
            />
        );
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <StrictModeDroppable droppableId="droppable">
                    {(droppableProvided) => (
                        <Box ref={droppableProvided.innerRef} sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }}>
                            {categories.map((category, index) => (
                                <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                                    {(draggableProvided) => (
                                        <CategorySettingsCard
                                            provided={draggableProvided}
                                            category={category}
                                            onEdit={() => handleEditDialogOpen(index)}
                                        />
                                    )}
                                </Draggable>
                            ))}
                            {droppableProvided.placeholder}
                        </Box>
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
                        : t('category.dialog.title.edit_category_one')}
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
                            <Checkbox checked={dialogDefault} onChange={(e) => setDialogDefault(e.target.checked)} />
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
