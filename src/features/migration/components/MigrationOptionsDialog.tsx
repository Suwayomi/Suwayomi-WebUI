/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

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
import type { MetadataMigrationSettings, MigrateOptions } from '@/features/migration/Migration.types.ts';
import type { AwaitableComponentProps } from 'awaitable-component';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Link } from 'react-router-dom';

export const MigrationOptionsDialog = ({
    isVisible,
    onDismiss,
    onSubmit,
    onExitComplete,
    isMigrating = false,
    mangaIdToMigrateTo,
    startMigration = onSubmit,
}: AwaitableComponentProps<Omit<MigrateOptions, 'mangaIdToMigrateTo'>> & {
    isMigrating?: boolean;
    mangaIdToMigrateTo?: MangaIdInfo['id'];
    startMigration?: (options: Omit<MigrateOptions, 'mangaIdToMigrateTo'>) => void;
}) => {
    const { t } = useLingui();

    const {
        settings: { migrateChapters, migrateCategories, migrateTracking, deleteChapters, migrateMetadata },
    } = useMetadataServerSettings();

    const options: Omit<MigrateOptions, 'mangaIdToMigrateTo' | 'mode'> = {
        migrateChapters,
        migrateCategories,
        migrateTracking,
        deleteChapters,
        migrateMetadata,
    };

    const setMigrationFlag = createUpdateMetadataServerSettings<keyof MetadataMigrationSettings>(
        defaultPromiseErrorHandler('MigrationOptionsDialog::updateSetting'),
    );

    return (
        <Dialog open={isVisible} fullWidth onClose={onDismiss} onTransitionExited={onExitComplete}>
            <DialogTitle>{t`Migration options`}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    <CheckboxInput
                        disabled={isMigrating}
                        label={t`Chapter`}
                        checked={migrateChapters}
                        onChange={(_, checked) => setMigrationFlag('migrateChapters', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrating}
                        label={t`Category`}
                        checked={migrateCategories}
                        onChange={(_, checked) => setMigrationFlag('migrateCategories', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrating}
                        label={t`Tracking`}
                        checked={migrateTracking}
                        onChange={(_, checked) => setMigrationFlag('migrateTracking', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrating}
                        label={t`Client data`}
                        checked={migrateMetadata}
                        onChange={(_, checked) => setMigrationFlag('migrateMetadata', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrating}
                        label={t`Delete downloaded`}
                        checked={deleteChapters}
                        onChange={(_, checked) => setMigrationFlag('deleteChapters', checked)}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    {mangaIdToMigrateTo !== undefined && (
                        <Button
                            disabled={isMigrating}
                            component={Link}
                            to={AppRoutes.manga.path(mangaIdToMigrateTo)}
                            onClick={() => onDismiss('show entry')}
                        >
                            {t`Show entry`}
                        </Button>
                    )}
                    <Stack direction="row">
                        <Button disabled={isMigrating} onClick={onDismiss}>
                            {t`Cancel`}
                        </Button>
                        <Button disabled={isMigrating} onClick={() => startMigration({ ...options, mode: 'copy' })}>
                            {t`Copy`}
                        </Button>
                        <Button
                            disabled={isMigrating}
                            variant="contained"
                            onClick={() => startMigration({ ...options, mode: 'migrate' })}
                        >
                            {t`Migrate`}
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
