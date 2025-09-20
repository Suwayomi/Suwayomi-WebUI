/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode } from 'react';
import { ReaderProgressBarContextProvider } from '@/features/reader/overlay/progress-bar/ReaderProgressBarContext.tsx';
import { ReaderTapZoneContextProvider } from '@/features/reader/tap-zones/ReaderTapZoneContext.tsx';

export const ReaderContextProvider = ({ children }: { children?: ReactNode }) => (
    <ReaderTapZoneContextProvider>
        <ReaderProgressBarContextProvider>{children}</ReaderProgressBarContextProvider>
    </ReaderTapZoneContextProvider>
);
