/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ContextType, ReactNode, useMemo, useState } from 'react';
import { ReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';

export const ReaderStateMangaContextProvider = ({ children }: { children: ReactNode }) => {
    const [manga, setManga] = useState<ContextType<typeof ReaderStateMangaContext>['manga']>();

    const value = useMemo(() => ({ manga, setManga }), [manga]);

    return <ReaderStateMangaContext.Provider value={value}>{children}</ReaderStateMangaContext.Provider>;
};
