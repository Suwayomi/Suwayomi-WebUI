/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import { ReaderStateChapters, TReaderStateSettingsContext } from '@/features/reader/Reader.types.ts';
import { DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG } from '@/features/reader/settings/ReaderSettingsMetadata.ts';
import { READER_STATE_CHAPTERS_DEFAULTS } from '@/features/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { getReaderStore } from '@/features/reader/ReaderStore.ts';

export const useReaderResetStates = (
    setReaderStateChapters: ReaderStateChapters['setReaderStateChapters'],
    setSettings: TReaderStateSettingsContext['setSettings'],
) => {
    useEffect(
        () => () => {
            getReaderStore().reset();
            setReaderStateChapters(READER_STATE_CHAPTERS_DEFAULTS);

            setSettings(DEFAULT_READER_SETTINGS_WITH_DEFAULT_FLAG);
        },
        [],
    );
};
