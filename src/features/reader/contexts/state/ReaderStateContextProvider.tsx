/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { ReaderStatePagesContextProvider } from '@/features/reader/contexts/state/ReaderStatePagesContextProvider.tsx';
import { ReaderStateChaptersContextProvider } from '@/features/reader/contexts/state/ReaderStateChaptersContextProvider.tsx';
import { ReaderStateMangaContextProvider } from '@/features/reader/contexts/state/ReaderStateMangaContextProvider.tsx';
import { ReaderStateSettingsContextProvider } from '@/features/reader/contexts/state/ReaderStateSettingsContextProvider.tsx';

export const ReaderStateContextProvider = ({ children }: { children: ReactNode }) => (
    <ReaderStateMangaContextProvider>
        <ReaderStateChaptersContextProvider>
            <ReaderStateSettingsContextProvider>
                <ReaderStatePagesContextProvider>{children}</ReaderStatePagesContextProvider>
            </ReaderStateSettingsContextProvider>
        </ReaderStateChaptersContextProvider>
    </ReaderStateMangaContextProvider>
);
