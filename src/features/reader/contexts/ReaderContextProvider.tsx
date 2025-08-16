/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { ReaderStateContextProvider } from '@/features/reader/contexts/state/ReaderStateContextProvider.tsx';
import { ReaderScrollbarContextProvider } from '@/features/reader/contexts/ReaderScrollbarContext.tsx';
import { ReaderAutoScrollContextProvider } from '@/features/reader/auto-scroll/ReaderAutoScrollContext.tsx';
import { ReaderOverlayContextProvider } from '@/features/reader/overlay/ReaderOverlayContext.tsx';
import { ReaderProgressBarContextProvider } from '@/features/reader/overlay/progress-bar/ReaderProgressBarContext.tsx';
import { ReaderTapZoneContextProvider } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';

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
