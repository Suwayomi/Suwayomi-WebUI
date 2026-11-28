/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense } from 'react';
import { lazily } from 'react-lazily';
import Typography from '@mui/material/Typography';

// the editor libraries are big, so they only get loaded once something has to be rendered with them
const { MarkdownViewerContent } = lazily(() => import('@/lib/mui-tiptap/MarkdownViewerContent.tsx'));

export const MarkdownViewer = ({ markdown }: { markdown: string }) => (
    <Suspense fallback={<Typography sx={{ whiteSpace: 'pre-wrap' }}>{markdown}</Typography>}>
        <MarkdownViewerContent markdown={markdown} />
    </Suspense>
);
