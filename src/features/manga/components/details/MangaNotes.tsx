/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useLingui } from '@lingui/react/macro';
import type { MangaIdInfo, MangaMetaInfo } from '@/features/manga/Manga.types.ts';
import { useGetMangaMetadata, createUpdateMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';

export const MangaNotes = ({ manga }: { manga: MangaIdInfo & MangaMetaInfo }) => {
    const { t } = useLingui();
    const { notes } = useGetMangaMetadata(manga);
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    const handleOpen = () => {
        setDraft(notes);
        setIsEditing(true);
    };

    const handleSave = () => {
        const updateMetadata = createUpdateMangaMetadata(manga);
        updateMetadata('notes', draft);
        setIsEditing(false);
    };

    return (
        <>
            <Stack
                sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 0.5,
                }}
            >
                <Typography variant="subtitle2" color="text.secondary">
                    {t`Notes`}
                </Typography>
                <IconButton size="small" onClick={handleOpen} color="inherit">
                    <EditIcon fontSize="small" />
                </IconButton>
            </Stack>
            {notes && (
                <Typography
                    sx={{
                        whiteSpace: 'pre-line',
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                    }}
                >
                    {notes}
                </Typography>
            )}
            <Dialog open={isEditing} onClose={() => setIsEditing(false)} fullWidth maxWidth="sm">
                <DialogTitle>{t`Edit Notes`}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        minRows={3}
                        maxRows={10}
                        fullWidth
                        margin="dense"
                        placeholder={t`Add your notes here...`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditing(false)}>{t`Cancel`}</Button>
                    <Button onClick={handleSave} variant="contained">{t`Save`}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
