/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { ReaderStateChaptersContextProvider } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { ReaderStateSettingsContextProvider } from '@/features/reader/contexts/state/ReaderStateSettingsContext.tsx';

export const ReaderStateContextProvider = ({ children }: { children: ReactNode }) => (
    <ReaderStateChaptersContextProvider>
        <ReaderStateSettingsContextProvider>{children}</ReaderStateSettingsContextProvider>
    </ReaderStateChaptersContextProvider>
);
