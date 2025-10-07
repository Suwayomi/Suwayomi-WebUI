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
import FormGroup from '@mui/material/FormGroup';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { DialogProps } from '@/base/global-dialog/GlobalDialogManager.tsx';
import {
    BACKUP_FLAG_GROUP_TO_TRANSLATION,
    BACKUP_FLAGS,
    BACKUP_FLAGS_BY_GROUP,
    BACKUP_FLAGS_TO_TRANSLATION,
} from '@/features/backup/Backup.constants.ts';
import { BackupFlagGroup, BackupFlagInclusionState } from '@/features/backup/Backup.types.ts';

export const BackupFlagInclusionDialog = ({
    onCancel,
    onConfirm,
    title,
}: DialogProps<BackupFlagInclusionState> & { title: string }) => {
    const { t } = useTranslation();

    const [includeStateByFlag, setIncludeStateByFlag] = useState(
        Object.fromEntries(BACKUP_FLAGS.map((flag) => [flag, true])) as BackupFlagInclusionState,
    );

    return (
        <Dialog open onAbort={onCancel} maxWidth="xs" fullWidth onClose={onCancel}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <FormGroup sx={{ gap: 2 }}>
                    {Object.entries(BACKUP_FLAGS_BY_GROUP).map(([group, flags]) => (
                        <Stack key={group}>
                            <Typography>{t(BACKUP_FLAG_GROUP_TO_TRANSLATION[group as BackupFlagGroup])}</Typography>
                            {flags.map((flag) => (
                                <CheckboxInput
                                    key={flag}
                                    label={t(BACKUP_FLAGS_TO_TRANSLATION[flag])}
                                    checked={includeStateByFlag[flag]}
                                    onChange={(_, checked) => {
                                        setIncludeStateByFlag({
                                            ...includeStateByFlag,
                                            [flag]: checked,
                                        });
                                    }}
                                />
                            ))}
                        </Stack>
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={onCancel} color="primary">
                    {t('global.button.cancel')}
                </Button>
                <Button onClick={() => onConfirm(includeStateByFlag)} color="primary">
                    {t('global.button.ok')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
