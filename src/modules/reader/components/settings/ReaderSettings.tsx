/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import Stack from '@mui/material/Stack';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { ReaderReadingMode } from '@/modules/reader/components/settings/ReaderReadingMode.tsx';
import { ReaderReadingDirection } from '@/modules/reader/components/settings/ReaderReadingDirection.tsx';
import { ReaderProgressBarType } from '@/modules/reader/components/settings/ReaderProgressBarType.tsx';
import { ProgressBarSize } from '@/modules/reader/components/settings/ProgressBarSize.tsx';
import { ReaderService } from '@/modules/reader/services/ReaderService.ts';

export const ReaderSettings = ({ isOpen, close }: { isOpen: boolean; close: () => void }) => {
    const { manga } = useReaderStateMangaContext();
    const settings = ReaderService.useSettings();

    if (!manga) {
        return null;
    }

    if (!isOpen) {
        return null;
    }

    return (
        <Dialog open={isOpen} maxWidth="md" fullWidth onClose={close}>
            <DialogContent>
                <Stack sx={{ gap: 2 }}>
                    <ReaderReadingMode
                        readingMode={settings.readingMode}
                        setReadingMode={(value) => ReaderService.updateSetting(manga, 'readingMode', value)}
                    />
                    <ReaderReadingDirection
                        readingDirection={settings.readingDirection}
                        setReadingDirection={(value) => ReaderService.updateSetting(manga, 'readingDirection', value)}
                    />
                    <ReaderProgressBarType
                        progressBarType={settings.progressBarType}
                        setProgressBarType={(value) => ReaderService.updateSetting(manga, 'progressBarType', value)}
                    />
                    <ProgressBarSize
                        progressBarType={settings.progressBarType}
                        progressBarSize={settings.progressBarSize}
                        setProgressBarSize={(value, commit) =>
                            ReaderService.updateSetting(manga, 'progressBarSize', value, commit)
                        }
                    />
                </Stack>
            </DialogContent>
        </Dialog>
    );
};
