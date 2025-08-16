/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TReaderScrollbarContext } from '@/features/reader/Reader.types.ts';

export const ReaderScrollbarContext = createContext<TReaderScrollbarContext>({
    scrollbarXSize: 0,
    setScrollbarXSize: () => undefined,
    scrollbarYSize: 0,
    setScrollbarYSize: () => undefined,
});

export const useReaderScrollbarContext = () => useContext(ReaderScrollbarContext);

export const ReaderScrollbarContextProvider = ({ children }: { children: ReactNode }) => {
    const [scrollbarXSize, setScrollbarXSize] = useState(0);
    const [scrollbarYSize, setScrollbarYSize] = useState(0);

    const value = useMemo(
        () => ({ scrollbarXSize, setScrollbarXSize, scrollbarYSize, setScrollbarYSize }),
        [scrollbarXSize, scrollbarYSize],
    );

    return <ReaderScrollbarContext.Provider value={value}>{children}</ReaderScrollbarContext.Provider>;
};
