/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog/Dialog';
import DialogActions from '@mui/material/DialogActions/DialogActions';
import DialogContent from '@mui/material/DialogContent/DialogContent';
import DialogTitle from '@mui/material/DialogTitle/DialogTitle';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button/Button';

type Action = {
    show?: boolean;
    title?: string;
};

type Actions = {
    cancel?: Action;
    confirm?: Action;
};

export const ConfirmDialog = ({
    title,
    message,
    actions: passedActions,
    onCancel,
    onConfirm,
}: {
    title: string;
    message: string;
    actions?: Actions;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    const { t } = useTranslation();

    const actions = {
        cancel: {
            show: passedActions?.cancel?.show ?? true,
            title: passedActions?.cancel?.title ?? t('global.button.cancel'),
        },
        confirm: {
            show: passedActions?.confirm?.show ?? true,
            title: passedActions?.confirm?.title ?? t('global.button.ok'),
        },
    } satisfies Actions;

    return (
        <Dialog open>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{message}</DialogContent>
            <DialogActions>
                {actions.cancel.show && <Button onClick={onCancel}>{actions.cancel.title}</Button>}
                {actions.confirm.show && <Button onClick={onConfirm}>{actions.confirm.title}</Button>}
            </DialogActions>
        </Dialog>
    );
};
