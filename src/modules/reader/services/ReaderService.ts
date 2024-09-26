/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
import { IReaderSettings } from '@/modules/reader/types/Reader.types.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { getReaderSettingsFor, useDefaultReaderSettings } from '@/modules/reader/services/ReaderSettingsMetadata.ts';

export class ReaderService {
    static useSettings(): IReaderSettings {
        const { manga } = useReaderStateMangaContext();
        const { settings } = useDefaultReaderSettings();

        return useMemo(() => getReaderSettingsFor(manga ?? { id: -1 }, settings), [manga, settings]);
    }
}
