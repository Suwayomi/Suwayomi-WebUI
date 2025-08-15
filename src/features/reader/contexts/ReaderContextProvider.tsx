/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { ReaderTapZoneContextProvider } from '@/features/reader/contexts/ReaderTapZoneContextProvider.tsx';
import { ReaderProgressBarContextProvider } from '@/features/reader/contexts/ReaderProgressBarContextProvider.tsx';
import { ReaderOverlayContextProvider } from '@/features/reader/contexts/ReaderOverlayContextProvider.tsx';
import { ReaderStateContextProvider } from '@/features/reader/contexts/state/ReaderStateContextProvider.tsx';
import { ReaderScrollbarContextProvider } from '@/features/reader/contexts/ReaderScrollbarContextProvider.tsx';
import { ReaderAutoScrollContextProvider } from '@/features/reader/contexts/ReaderAutoScrollContextProvider.tsx';

export const ReaderContextProvider = ({ children }: { children?: ReactNode }) => (
    <ReaderStateContextProvider>
        <ReaderTapZoneContextProvider>
            <ReaderOverlayContextProvider>
                <ReaderProgressBarContextProvider>
                    <ReaderScrollbarContextProvider>
                        <ReaderAutoScrollContextProvider>{children}</ReaderAutoScrollContextProvider>
                    </ReaderScrollbarContextProvider>
                </ReaderProgressBarContextProvider>
            </ReaderOverlayContextProvider>
        </ReaderTapZoneContextProvider>
    </ReaderStateContextProvider>
);
