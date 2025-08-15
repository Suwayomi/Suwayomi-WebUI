/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReactNode, useMemo, useState } from 'react';
import { ReaderScrollbarContext } from '@/features/reader/contexts/ReaderScrollbarContext.tsx';

export const ReaderScrollbarContextProvider = ({ children }: { children: ReactNode }) => {
    const [scrollbarXSize, setScrollbarXSize] = useState(0);
    const [scrollbarYSize, setScrollbarYSize] = useState(0);

    const value = useMemo(
        () => ({ scrollbarXSize, setScrollbarXSize, scrollbarYSize, setScrollbarYSize }),
        [scrollbarXSize, scrollbarYSize],
    );

    return <ReaderScrollbarContext.Provider value={value}>{children}</ReaderScrollbarContext.Provider>;
};
