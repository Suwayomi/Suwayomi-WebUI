/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { MetadataMigrationSettings, MigrateMode } from '@/features/migration/Migration.types.ts';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';

export const MigrationOptionsDialog = ({ onClose }: { onClose: () => void }) => {
    const { t } = useLingui();

    const {
        settings: { migrateChapters, migrateCategories, migrateTracking, deleteChapters, migrateMetadata },
    } = useMetadataServerSettings();

    const [isStarting, setIsStarting] = useState(false);

    const setMigrationFlag = createUpdateMetadataServerSettings<keyof MetadataMigrationSettings>(
        defaultPromiseErrorHandler('MigrationOptionsDialog::updateSetting'),
    );

    const handleStart = async (mode: MigrateMode) => {
        setIsStarting(true);
        onClose();

        await MigrationManager.startMigration({
            mode,
            migrateChapters,
            migrateCategories,
            migrateTracking,
            deleteChapters,
            migrateMetadata,
        });
    };

    return (
        <Dialog open fullWidth onClose={onClose}>
            <DialogTitle>{t`Migration options`}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    <CheckboxInput
                        disabled={isStarting}
                        label={t`Chapter`}
                        checked={migrateChapters}
                        onChange={(_, checked) => setMigrationFlag('migrateChapters', checked)}
                    />
                    <CheckboxInput
                        disabled={isStarting}
                        label={t`Category`}
                        checked={migrateCategories}
                        onChange={(_, checked) => setMigrationFlag('migrateCategories', checked)}
                    />
                    <CheckboxInput
                        disabled={isStarting}
                        label={t`Tracking`}
                        checked={migrateTracking}
                        onChange={(_, checked) => setMigrationFlag('migrateTracking', checked)}
                    />
                    <CheckboxInput
                        disabled={isStarting}
                        label={t`Client data`}
                        checked={migrateMetadata}
                        onChange={(_, checked) => setMigrationFlag('migrateMetadata', checked)}
                    />
                    <CheckboxInput
                        disabled={isStarting}
                        label={t`Delete downloaded`}
                        checked={deleteChapters}
                        onChange={(_, checked) => setMigrationFlag('deleteChapters', checked)}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack direction="row" sx={{ justifyContent: 'flex-end', width: '100%', gap: 1 }}>
                    <Button disabled={isStarting} onClick={onClose}>
                        {t`Cancel`}
                    </Button>
                    <Button disabled={isStarting} onClick={() => handleStart('copy')}>
                        {t`Copy`}
                    </Button>
                    <Button disabled={isStarting} variant="contained" onClick={() => handleStart('migrate')}>
                        {t`Migrate`}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
