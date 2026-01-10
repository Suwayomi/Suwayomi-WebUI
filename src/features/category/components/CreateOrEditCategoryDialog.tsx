/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { CategoryDefaultInfo, CategoryIdInfo, CategoryNameInfo } from '@/features/category/Category.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { assertIsDefined } from '@/base/Asserts.ts';

export const CreateOrEditCategoryDialog = ({
    category,
    onClose,
}: {
    category: (CategoryIdInfo & CategoryNameInfo & CategoryDefaultInfo) | undefined;
    onClose: () => void;
}) => {
    const isEditMode = !!category;

    const { t } = useLingui();

    const [dialogName, setDialogName] = useState(category?.name);
    const [dialogDefault, setDialogDefault] = useState(!!category?.default);

    const isInvalidName = dialogName !== undefined && !dialogName.trim().length;
    const canSubmit = dialogName !== undefined && !isInvalidName;

    const handleDialogSubmit = () => {
        assertIsDefined(dialogName);

        onClose();

        if (isEditMode) {
            requestManager
                .updateCategory(category.id, { name: dialogName, default: dialogDefault })
                .response.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));

            return;
        }

        requestManager
            .createCategory({ name: dialogName, default: dialogDefault })
            .response.catch((e) => makeToast(t`Could not create category`, 'error', getErrorMessage(e)));
    };

    return (
        <Dialog open onClose={onClose}>
            <DialogTitle id="form-dialog-title">{isEditMode ? t`Edit category` : t`New category`}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label={t`Category Name`}
                    type="text"
                    fullWidth
                    value={dialogName}
                    onChange={(e) => setDialogName(e.target.value.trim())}
                    error={isInvalidName}
                    helperText={isInvalidName ? t`Invalid input` : undefined}
                />
                <FormControlLabel
                    control={<Checkbox checked={dialogDefault} onChange={(e) => setDialogDefault(e.target.checked)} />}
                    label={t`Default category when adding new manga to the library`}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    {t`Cancel`}
                </Button>
                <Button onClick={handleDialogSubmit} color="primary" disabled={!canSubmit}>
                    {t`Submit`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
