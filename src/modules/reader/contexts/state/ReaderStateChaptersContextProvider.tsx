/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ContextType, ReactNode, useMemo, useState } from 'react';
import { ReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';

type TContext = ContextType<typeof ReaderStateChaptersContext>;

export const ReaderStateChaptersContextProvider = ({ children }: { children: ReactNode }) => {
    const [state, setState] = useState<Omit<TContext, 'setReaderStateChapters'>>({ mangaChapters: [], chapters: [] });

    const value = useMemo(
        () => ({
            ...state,
            setReaderStateChapters: setState,
        }),
        [state],
    );

    return <ReaderStateChaptersContext.Provider value={value}>{children}</ReaderStateChaptersContext.Provider>;
};
