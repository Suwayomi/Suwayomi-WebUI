/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';

export class ReaderService {
    static useNavigateToChapter(chapter?: TChapterReader): () => void {
        const navigate = useNavigate();

        return useCallback(() => chapter && navigate(Chapters.getReaderUrl(chapter), { replace: true }), [chapter]);
    }
}
