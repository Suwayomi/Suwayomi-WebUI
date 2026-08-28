/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { makeToast } from '@/base/utils/Toast.ts';
import type { MangaIdInfo, MangaMetaInfo } from '@/features/manga/Manga.types.ts';
import { updateMangaMetadata, useGetMangaMetadata } from '@/features/manga/services/MangaMetadata.ts';
import { getErrorMessage, markdownToSafeHtml } from '@/lib/HelperFunctions.ts';
import StarterKit from '@tiptap/starter-kit';
import {
    MenuButton,
    MenuButtonBold,
    MenuButtonBulletedList,
    MenuButtonItalic,
    MenuButtonOrderedList,
    MenuButtonRedo,
    MenuButtonUndo,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditor,
    type RichTextEditorRef,
} from 'mui-tiptap';
import { Markdown } from '@tiptap/markdown';
import { Placeholder } from '@tiptap/extension-placeholder';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClearContentShortcut, SaveContentShortcut } from '@/lib/mui-tiptap/MuiTipTap.shortcut.util.ts';
import { MarkdownViewer } from '@/lib/mui-tiptap/MarkdownViewer.tsx';
import Typography from '@mui/material/Typography';

export const MangaNotesButton = ({ manga, notes }: { manga: MangaIdInfo & MangaMetaInfo; notes: string }) => {
    const { t } = useLingui();

    const rteRef = useRef<RichTextEditorRef>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [draft, setDraft] = useState(notes);

    const hasNotes = notes.trim().length > 0;
    const isUnchanged = draft.trimEnd() === notes;

    const openDialog = () => {
        setDraft(notes);
        setIsOpen(true);
    };

    const closeDialog = () => setIsOpen(false);

    const saveNotes = (content: string) => {
        const nextNotes = content.trimEnd();

        void updateMangaMetadata(manga, 'notes', nextNotes)
            .then(() => {
                makeToast(t`Notes saved`, 'success');
                setIsOpen(false);
            })
            .catch((error) => makeToast(t`Could not save notes`, 'error', getErrorMessage(error)));
    };

    return (
        <>
            <Button size="small" onClick={openDialog} variant="text">
                {hasNotes ? t`Edit` : t`Add`}
            </Button>
            <Dialog open={isOpen} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>{hasNotes ? t`Edit notes` : t`Add notes`}</DialogTitle>
                <DialogContent>
                    <RichTextEditor
                        ref={rteRef}
                        extensions={[
                            StarterKit,
                            Markdown,
                            Placeholder.configure({
                                placeholder: t`Add a private note about this manga`,
                            }),
                            ClearContentShortcut.extension,
                            SaveContentShortcut((editor, unchangedContent) => {
                                if (unchangedContent) {
                                    setIsOpen(false);
                                    return true;
                                }

                                saveNotes(editor.getMarkdown());

                                return true;
                            }).extension,
                        ]}
                        content={markdownToSafeHtml(notes.trim())}
                        contentType="markdown"
                        onUpdate={({ editor }) => {
                            setDraft(editor.getMarkdown());
                        }}
                        renderControls={() => (
                            <MenuControlsContainer>
                                <MenuButtonUndo />
                                <MenuButtonRedo />
                                <MenuDivider />
                                <MenuSelectHeading />
                                <MenuDivider />
                                <MenuButtonBold />
                                <MenuButtonItalic />
                                <MenuButtonBulletedList />
                                <MenuButtonOrderedList />
                                <MenuDivider />
                                <MenuButton
                                    tooltipLabel={t`Clear notes`}
                                    onClick={() => rteRef.current?.editor?.chain().focus().clearContent().run()}
                                    tooltipShortcutKeys={ClearContentShortcut.tooltipKeys}
                                >
                                    <DeleteIcon color="inherit" />
                                </MenuButton>
                            </MenuControlsContainer>
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>{t`Cancel`}</Button>
                    <Button onClick={() => saveNotes(draft)} disabled={isUnchanged} variant="contained">
                        {t`Save`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const MangaNotes = ({ manga, showDivider }: { manga: MangaIdInfo & MangaMetaInfo; showDivider: boolean }) => {
    const { t } = useLingui();

    const { notes } = useGetMangaMetadata(manga);
    const hasNotes = notes.trim().length > 0;

    return (
        <Stack sx={{ alignItems: 'flex-start', gap: 1 }}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1">{t`Notes`}</Typography>
                <MangaNotesButton manga={manga} notes={notes} />
            </Stack>
            {hasNotes && <MarkdownViewer markdown={notes.trim()} />}
            {showDivider && <Divider flexItem sx={{ my: 1 }} />}
        </Stack>
    );
};
