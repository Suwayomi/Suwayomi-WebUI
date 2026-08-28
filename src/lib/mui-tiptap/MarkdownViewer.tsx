/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { markdownToSafeHtml } from '@/lib/HelperFunctions.ts';
import { RichTextReadOnly } from 'mui-tiptap';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';

export const MarkdownViewer = ({ markdown }: { markdown: string }) => (
    <RichTextReadOnly
        key={markdown}
        extensions={[StarterKit, Markdown]}
        contentType="markdown"
        content={markdownToSafeHtml(markdown)}
        sx={{
            '& .ProseMirror > p:last-child': {
                '&:has(br:only-child)': {
                    display: 'none',
                },
            },

            '& .ProseMirror': {
                display: 'flex',
                flexDirection: 'column',
                rowGap: '1rem',
            },

            '& .ProseMirror > *': {
                margin: 0,
            },
        }}
    />
);
