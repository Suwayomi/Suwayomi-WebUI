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
import { useLingui } from '@lingui/react/macro';
import type { MangaIdInfo, MangaMetaInfo } from '@/models/manga/Manga.types.ts';
import { updateMangaMetadata } from '@/controllers/manga/services/MangaMetadata.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
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
import { Notifications } from '@/controllers/base/services/notification/Notifications.ts';

export const MangaNotesDialog = ({
    manga,
    notes,
    isOpen,
    onClose,
}: {
    manga: MangaIdInfo & MangaMetaInfo;
    notes: string;
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { t } = useLingui();

    const rteRef = useRef<RichTextEditorRef>(null);

    const [draft, setDraft] = useState(notes);

    const hasNotes = notes.trim().length > 0;
    const isUnchanged = draft.trimEnd() === notes;

    const saveNotes = (content: string) => {
        const nextNotes = content.trimEnd();

        void updateMangaMetadata(manga, 'notes', nextNotes)
            .then(() => {
                Notifications.success(t`Notes saved`);
                onClose();
            })
            .catch((error) => Notifications.error(t`Could not save notes`, getErrorMessage(error)));
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
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
                                onClose();
                                return true;
                            }

                            saveNotes(editor.getMarkdown());

                            return true;
                        }).extension,
                    ]}
                    content={notes.trim()}
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
                <Button onClick={onClose}>{t`Cancel`}</Button>
                <Button onClick={() => saveNotes(draft)} disabled={isUnchanged} variant="contained">
                    {t`Save`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
