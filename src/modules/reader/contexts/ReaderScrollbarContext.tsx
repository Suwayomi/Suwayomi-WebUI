/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';

type TReaderScrollbarContext = {
    scrollbarXSize: number;
    setScrollbarXSize: (size: number) => void;
    scrollbarYSize: number;
    setScrollbarYSize: (size: number) => void;
};

export const ReaderScrollbarContext = createContext<TReaderScrollbarContext>({
    scrollbarXSize: 0,
    setScrollbarXSize: () => undefined,
    scrollbarYSize: 0,
    setScrollbarYSize: () => undefined,
});

export const useReaderScrollbarContext = () => useContext(ReaderScrollbarContext);
