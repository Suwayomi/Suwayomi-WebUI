/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { useCallback, useMemo } from 'react';
import { CheckboxInput } from '@/modules/core/components/inputs/CheckboxInput.tsx';
import { useSelectableCollection } from '@/modules/collection/hooks/useSelectableCollection.ts';

export function CheckboxListSetting<Item>({
    items,
    getId,
    getLabel,
    isChecked,
    open,
    onClose,
}: {
    items: Item[];
    getId: (item: Item) => string;
    getLabel: (item: Item) => string;
    isChecked: (item: Item) => boolean;
    open: boolean;
    onClose: (selectedItems?: Item[]) => void;
}) {
    const { t } = useTranslation();

    const itemIds = useMemo(() => items.map(getId), [items]);
    const currentSelectedItemIds = useMemo(() => items.filter(isChecked).map(getId), [items]);

    const { selectedItemIds, handleSelection, handleSelectAll, reset } = useSelectableCollection(items.length, {
        currentKey: 'default',
        itemIds,
        initialState: { default: currentSelectedItemIds },
    });

    const handleCancel = () => {
        onClose();
        reset();
    };

    const handleOk = useCallback(() => {
        const didSelectionChange =
            selectedItemIds.length !== currentSelectedItemIds.length ||
            selectedItemIds.some((id) => !currentSelectedItemIds.includes(id));
        const selectedItems = items.filter((item) => selectedItemIds.includes(getId(item)));

        onClose(didSelectionChange ? selectedItems : undefined);
    }, [selectedItemIds]);

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
            onClose={handleCancel}
        >
            <DialogTitle>{t('category.title.set_categories')}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    {items.length === 0 && <span>{t('category.error.no_categories_found.label.info')}</span>}
                    {items.map((item) => (
                        <CheckboxInput
                            checked={selectedItemIds.includes(getId(item))}
                            onChange={(e, checked) => handleSelection(getId(item), checked)}
                            label={getLabel(item)}
                            key={getId(item)}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack sx={{ width: '100%' }}>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'end',
                            width: '100%',
                        }}
                    >
                        <Button onClick={() => handleSelectAll(!selectedItemIds.length, items.map(getId))}>
                            {t(selectedItemIds.length ? 'global.button.reset' : 'global.button.select_all')}
                        </Button>
                        <Stack direction="row">
                            <Button autoFocus onClick={handleCancel} color="primary">
                                {t('global.button.cancel')}
                            </Button>
                            {!!items.length && (
                                <Button onClick={handleOk} color="primary">
                                    {t('global.button.ok')}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
