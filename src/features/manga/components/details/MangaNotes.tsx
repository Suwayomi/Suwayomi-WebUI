/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import type { MangaIdInfo, MangaMetaInfo } from '@/features/manga/Manga.types.ts';
import { updateMangaMetadata, useGetMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

type MangaNotesState = {
    notes: string;
    setNotes: (notes: string) => void;
};

export const useMangaNotes = (manga: MangaIdInfo & MangaMetaInfo): MangaNotesState => {
    const { notes: storedNotes } = useGetMangaMetadata(manga);
    const [notes, setNotes] = useState(storedNotes);

    useEffect(() => setNotes(storedNotes), [storedNotes]);

    return { notes, setNotes };
};

export const MangaNotesButton = ({
    manga,
    notes,
    onSaved,
}: {
    manga: MangaIdInfo & MangaMetaInfo;
    notes: string;
    onSaved: (notes: string) => void;
}) => {
    const { t } = useLingui();
    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [draft, setDraft] = useState(notes);

    const openDialog = () => {
        setDraft(notes);
        setIsOpen(true);
    };

    const closeDialog = () => {
        if (!isSaving) {
            setIsOpen(false);
        }
    };

    const saveNotes = async () => {
        const nextNotes = draft.trimEnd();
        setIsSaving(true);

        try {
            await updateMangaMetadata(manga, 'notes', nextNotes);
            onSaved(nextNotes);
            setIsOpen(false);
            makeToast(t`Notes saved`, 'success');
        } catch (error) {
            makeToast(t`Could not save notes`, 'error', getErrorMessage(error));
        } finally {
            setIsSaving(false);
        }
    };

    const hasNotes = notes.trim().length > 0;
    const isUnchanged = draft.trimEnd() === notes;
    const titleId = 'manga-notes-dialog-title';

    return (
        <>
            <Button
                size="small"
                onClick={openDialog}
                variant={hasNotes ? 'text' : 'outlined'}
                startIcon={hasNotes ? <NoteAltOutlinedIcon /> : <NoteAddOutlinedIcon />}
            >
                {hasNotes ? t`Edit notes` : t`Add notes`}
            </Button>
            <Dialog open={isOpen} onClose={closeDialog} aria-labelledby={titleId} fullWidth maxWidth="sm">
                <DialogTitle id={titleId}>{hasNotes ? t`Edit notes` : t`Add notes`}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        multiline
                        minRows={5}
                        maxRows={14}
                        fullWidth
                        margin="dense"
                        label={t`Notes`}
                        placeholder={t`Add a private note about this manga`}
                        value={draft}
                        disabled={isSaving}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !isUnchanged) {
                                event.preventDefault();
                                void saveNotes();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={isSaving}>
                        {t`Cancel`}
                    </Button>
                    <Button onClick={() => void saveNotes()} disabled={isSaving || isUnchanged} variant="contained">
                        {isSaving ? t`Saving…` : t`Save`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const MangaNotes = ({ manga, expanded }: { manga: MangaIdInfo & MangaMetaInfo; expanded: boolean }) => {
    const { notes, setNotes } = useMangaNotes(manga);
    const hasNotes = notes.trim().length > 0;

    return (
        <Stack sx={{ alignItems: 'flex-start', gap: 1 }}>
            {hasNotes && (
                <Typography
                    sx={{
                        overflowWrap: 'anywhere',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {notes}
                </Typography>
            )}
            {(!hasNotes || expanded) && <MangaNotesButton manga={manga} notes={notes} onSaved={setNotes} />}
            {hasNotes && <Divider flexItem />}
        </Stack>
    );
};
