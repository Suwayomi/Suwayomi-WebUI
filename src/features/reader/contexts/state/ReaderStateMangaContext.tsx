/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { TReaderStateMangaContext } from '@/features/reader/Reader.types.ts';

export const ReaderStateMangaContext = createContext<TReaderStateMangaContext>({
    manga: undefined,
    setManga: () => undefined,
});

export const useReaderStateMangaContext = () => useContext(ReaderStateMangaContext);

export const ReaderStateMangaContextProvider = ({ children }: { children: ReactNode }) => {
    const [manga, setManga] = useState<TReaderStateMangaContext['manga']>();

    const value = useMemo(() => ({ manga, setManga }), [manga]);

    return <ReaderStateMangaContext.Provider value={value}>{children}</ReaderStateMangaContext.Provider>;
};
