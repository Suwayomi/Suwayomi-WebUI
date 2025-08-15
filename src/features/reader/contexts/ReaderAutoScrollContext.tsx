/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { TReaderAutoScrollContext } from '@/features/reader/types/Reader.types.ts';

export const ReaderAutoScrollContext = createContext<TReaderAutoScrollContext>({
    isActive: false,
    isPaused: false,
    setScrollRef: () => {},
    start: () => {},
    cancel: () => {},
    toggleActive: () => {},
    pause: () => {},
    resume: () => {},
    setDirection: () => {},
});

export const useReaderAutoScrollContext = () => useContext(ReaderAutoScrollContext);
