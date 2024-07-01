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
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import { CheckboxInput } from '@/components/atoms/CheckboxInput.tsx';
import { Mangas, MigrateMode } from '@/lib/data/Mangas.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataMigrationSettings } from '@/typings.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

export const MigrateDialog = ({ mangaIdToMigrateTo, onClose }: { mangaIdToMigrateTo: number; onClose: () => void }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();

    const { mangaId: mangaIdAsString } = useParams<{ mangaId: string }>();
    const mangaId = Number(mangaIdAsString);

    const {
        settings: { migrateChapters, migrateCategories, migrateTracking, deleteChapters },
    } = useMetadataServerSettings();

    const [isMigrationInProcess, setIsMigrationInProcess] = useState(false);

    const setMigrationFlag = createUpdateMetadataServerSettings<keyof MetadataMigrationSettings>(
        defaultPromiseErrorHandler('MigrateDialog::updateSetting'),
    );

    const migrate = async (mode: MigrateMode) => {
        if (mangaId == null) {
            throw new Error(`MigrateDialog::migrate: unexpected mangaId "${mangaId}"`);
        }

        makeToast(t('migrate.label.info'), 'info');

        setIsMigrationInProcess(true);

        try {
            await Mangas.migrate(mangaId, mangaIdToMigrateTo, {
                mode,
                migrateChapters,
                migrateCategories,
                migrateTracking,
                deleteChapters,
            });

            navigate(`/manga/${mangaIdToMigrateTo}`, { replace: true });
        } catch (e) {
            setIsMigrationInProcess(false);
        }
    };

    return (
        <Dialog open fullWidth onClose={onClose}>
            <DialogTitle>{t('migrate.dialog.title')}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    <CheckboxInput
                        disabled={isMigrationInProcess}
                        label={t('chapter.title_one')}
                        checked={migrateChapters}
                        onChange={(_, checked) => setMigrationFlag('migrateChapters', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrationInProcess}
                        label={t('category.title.category_one')}
                        checked={migrateCategories}
                        onChange={(_, checked) => setMigrationFlag('migrateCategories', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrationInProcess}
                        label={t('tracking.title')}
                        checked={migrateTracking}
                        onChange={(_, checked) => setMigrationFlag('migrateTracking', checked)}
                    />
                    <CheckboxInput
                        disabled={isMigrationInProcess}
                        label={t('migrate.dialog.label.delete_downloaded')}
                        checked={deleteChapters}
                        onChange={(_, checked) => setMigrationFlag('deleteChapters', checked)}
                    />
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between">
                    <Button disabled={isMigrationInProcess} component={Link} to={`/manga/${mangaIdToMigrateTo}`}>
                        {t('migrate.dialog.action.button.show_entry')}
                    </Button>
                    <Stack direction="row">
                        <Button disabled={isMigrationInProcess} onClick={onClose}>
                            {t('global.button.cancel')}
                        </Button>
                        <Button disabled={isMigrationInProcess} onClick={() => migrate('copy')}>
                            {t('global.button.copy')}
                        </Button>
                        <Button disabled={isMigrationInProcess} onClick={() => migrate('migrate')}>
                            {t('global.button.migrate')}
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
