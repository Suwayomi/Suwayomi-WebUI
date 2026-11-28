/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Suspense, useState } from 'react';
import { lazily } from 'react-lazily';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLingui } from '@lingui/react/macro';
import type { MangaIdInfo, MangaMetaInfo } from '@/models/manga/Manga.types.ts';
import { useGetMangaMetadata } from '@/controllers/manga/services/MangaMetadata.ts';
import { MarkdownViewer } from '@/lib/mui-tiptap/MarkdownViewer.tsx';

const { MangaNotesDialog } = lazily(() => import('@/views/manga/components/details/MangaNotesDialog.tsx'));

export const MangaNotesButton = ({ manga, notes }: { manga: MangaIdInfo & MangaMetaInfo; notes: string }) => {
    const { t } = useLingui();

    const [isOpen, setIsOpen] = useState(false);
    // the dialog stays mounted for its closing animation, the counter resets the draft on every opening
    const [openCount, setOpenCount] = useState(0);

    const hasNotes = notes.trim().length > 0;

    return (
        <>
            <Button
                size="small"
                onClick={() => {
                    setOpenCount((count) => count + 1);
                    setIsOpen(true);
                }}
                variant="text"
            >
                {hasNotes ? t`Edit` : t`Add`}
            </Button>
            {openCount > 0 && (
                <Suspense>
                    <MangaNotesDialog
                        key={openCount}
                        manga={manga}
                        notes={notes}
                        isOpen={isOpen}
                        onClose={() => setIsOpen(false)}
                    />
                </Suspense>
            )}
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
