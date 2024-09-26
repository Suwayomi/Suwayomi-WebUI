/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createContext, useContext } from 'react';
import { TMangaReader } from '@/modules/manga/Manga.types.ts';

type TReaderStateMangaContext = {
    manga: TMangaReader | undefined;
    setManga: (manga: TMangaReader | undefined) => void;
};

export const ReaderStateMangaContext = createContext<TReaderStateMangaContext>({
    manga: undefined,
    setManga: () => undefined,
});

export const useReaderStateMangaContext = () => useContext(ReaderStateMangaContext);
