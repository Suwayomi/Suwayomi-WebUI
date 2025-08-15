/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { TReaderOverlayContext } from '@/features/reader/types/ReaderOverlay.types.ts';

export const ReaderOverlayContext = createContext<TReaderOverlayContext>({
    isVisible: false,
    setIsVisible: () => {},
});

export const useReaderOverlayContext = () => useContext(ReaderOverlayContext);
