/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Editor } from '@tiptap/core';
import { Extension } from '@tiptap/core';

const RESERVED_CHAR = ['mod'];

const getKey = (key: string): string => `suwayomi-webui-mui-tiptap-shortcut-${key}`;

export interface ShortcutExtension {
    key: string;
    tooltipKeys: string[];
    extension: Extension;
}

export const createShortcutExtension = (
    name: string,
    key: string,
    action: (editor: Editor, initialDoc: any) => boolean,
): ShortcutExtension => ({
    key,
    tooltipKeys: key
        .split('-')
        .map((char) => (RESERVED_CHAR.includes(char.toLowerCase()) ? char.toLowerCase() : char.toUpperCase())),
    extension: Extension.create({
        name,
        addStorage() {
            return {
                initialDoc: null as Editor['state']['doc'] | null,
            };
        },
        onCreate() {
            this.storage.initialDoc = this.editor.state.doc;
        },
        addKeyboardShortcuts() {
            return {
                [key]: () => action(this.editor, this.storage.initialDoc),
            };
        },
    }),
});

export const ClearContentShortcut = createShortcutExtension(getKey('clear-content'), 'Mod-d', (editor) => {
    editor.commands.clearContent();
    return true;
});
export const SaveContentShortcut = (action: (editor: Editor, unchangedContent: boolean) => boolean) =>
    createShortcutExtension('save-content', 'Mod-s', (editor, initialDoc) => {
        const currentDoc = editor.state.doc;

        if (initialDoc == null) {
            return true;
        }

        const unchanged = currentDoc.eq(initialDoc);

        return action(editor, unchanged);
    });
