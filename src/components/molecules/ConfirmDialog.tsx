/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useTranslation } from 'react-i18next';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

type Action = {
    show?: boolean;
    title?: string;
};

type Actions = {
    extra?: Action;
    cancel?: Action;
    confirm?: Action;
};

export const ConfirmDialog = ({
    title,
    message,
    actions: passedActions,
    onExtra,
    onCancel,
    onConfirm,
}: {
    title: string;
    message: string;
    actions?: Actions;
    onExtra?: () => void;
    onCancel: () => void;
    onConfirm: () => void;
}) => {
    const { t } = useTranslation();

    const actions = {
        extra: {
            show: passedActions?.extra?.show ?? false,
            title: passedActions?.extra?.title ?? '',
        },
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
            <DialogContent
                sx={{
                    whiteSpace: 'pre-line',
                }}
            >
                {message}
            </DialogContent>
            <DialogActions>
                <Stack
                    sx={{ width: '100%' }}
                    direction="row"
                    justifyContent={actions.extra.show ? 'space-between' : 'end'}
                >
                    {actions.extra.show && <Button onClick={onExtra}>{actions.extra.title}</Button>}
                    <Stack direction="row">
                        {actions.cancel.show && <Button onClick={onCancel}>{actions.cancel.title}</Button>}
                        {actions.confirm.show && <Button onClick={onConfirm}>{actions.confirm.title}</Button>}
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
