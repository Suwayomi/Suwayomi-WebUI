/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentProps, useLayoutEffect, useMemo, useState } from 'react';
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
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/modules/core/components/buttons/StyledFab.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetCategoriesSettingsQuery, GetCategoriesSettingsQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { GET_CATEGORIES_SETTINGS } from '@/lib/graphql/queries/CategoryQuery.ts';
import { CategorySettingsCard } from '@/modules/category/components/CategorySettingsCard.tsx';
import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { useNavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';

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

    const dndSensors = DndKitUtil.useSensorsForDevice();
    const [dndActiveCategory, setDndActiveCategory] = useState<
        ComponentProps<typeof CategorySettingsCard>['category'] | null
    >(null);

    const categoryReorder = (list: CategoryIdInfo[], from: number, to: number) => {
        const reorderedCategory = list[from];

        reorderCategory({ variables: { input: { id: reorderedCategory.id, position: to + 1 } } }).catch(() =>
            revertReorder(),
        );
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveCategory(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = categories.findIndex((category) => category.id === active.id);
        const newIndex = categories.findIndex((category) => category.id === over.id);

        categoryReorder(categories, oldIndex, newIndex);
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
            requestManager
                .createCategory({ name: dialogName, default: dialogDefault })
                .response.catch((e) =>
                    makeToast(t('category.error.label.create_failure'), 'error', getErrorMessage(e)),
                );
        } else {
            const category = categories[categoryToEdit];
            requestManager
                .updateCategory(category.id, { name: dialogName, default: dialogDefault })
                .response.catch((e) =>
                    makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
                );
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
            <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragStart={(event) =>
                    setDndActiveCategory(categories.find((category) => category.id === event.active.id) ?? null)
                }
                onDragEnd={onDragEnd}
                onDragCancel={() => setDndActiveCategory(null)}
                onDragAbort={() => setDndActiveCategory(null)}
            >
                <Box sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }}>
                    <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                        {categories.map((category, index) => (
                            <DndSortableItem
                                key={category.id}
                                id={category.id}
                                isDragging={category.id === dndActiveCategory?.id}
                            >
                                <CategorySettingsCard category={category} onEdit={() => handleEditDialogOpen(index)} />
                            </DndSortableItem>
                        ))}
                    </SortableContext>
                    <DndOverlayItem isActive={!!dndActiveCategory}>
                        <CategorySettingsCard category={dndActiveCategory!} onEdit={noOp} />
                    </DndOverlayItem>
                </Box>
            </DndContext>
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
