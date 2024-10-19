/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Direction, useTheme } from '@mui/material/styles';
import { t as translate } from 'i18next';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import { IReaderSettings, ReadingDirection } from '@/modules/reader-deprecated/Reader.types.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import {
    getReaderSettingsFor,
    updateReaderSettings,
    useDefaultReaderSettings,
} from '@/modules/reader-deprecated/services/ReaderSettingsMetadata.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { getMetadataKey } from '@/modules/metadata/services/MetadataReader.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MANGA_META_FIELDS } from '@/lib/graphql/fragments/MangaFragments.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';

const DIRECTION_TO_INVERTED: Record<Direction, Direction> = {
    ltr: 'rtl',
    rtl: 'ltr',
};

const DIRECTION_TO_READING_DIRECTION: Record<Direction, ReadingDirection> = {
    ltr: ReadingDirection.LTR,
    rtl: ReadingDirection.RTL,
};

export class ReaderService {
    static useNavigateToChapter(chapter?: TChapterReader): () => void {
        const navigate = useNavigate();

        return useCallback(() => chapter && navigate(Chapters.getReaderUrl(chapter), { replace: true }), [chapter]);
    }

    static useSettings(): IReaderSettings {
        const { manga } = useReaderStateMangaContext();
        const defaultReaderSettings = useDefaultReaderSettings();

        return useMemo(
            () => getReaderSettingsFor(manga, defaultReaderSettings.settings),
            [manga, defaultReaderSettings],
        );
    }

    static useGetThemeDirection(): Direction {
        const { direction } = useTheme();
        const { readingDirection } = ReaderService.useSettings();

        return DIRECTION_TO_READING_DIRECTION[direction] === readingDirection
            ? direction
            : DIRECTION_TO_INVERTED[direction];
    }

    /**
     * Writes the change immediately to the cache and sends a mutation in case "commit" is true.
     */
    static updateSetting<Setting extends keyof IReaderSettings>(
        manga: MangaIdInfo,
        setting: Setting,
        value: IReaderSettings[Setting],
        commit: boolean = true,
    ): void {
        if (!manga) {
            return;
        }

        const key = getMetadataKey(setting);

        const { cache } = requestManager.graphQLClient.client;
        cache.writeFragment({
            id: cache.identify({ __typename: 'MangaMetaType', mangaId: manga.id, key }),
            fragment: MANGA_META_FIELDS,
            data: {
                mangaId: manga.id,
                key,
                value: `${value}`,
            },
        });

        if (commit) {
            updateReaderSettings(manga, setting, value).catch(() =>
                makeToast(translate('reader.settings.error.label.failed_to_save_settings')),
            );
        }
    }

    static useCreateUpdateSetting<Setting extends keyof IReaderSettings>(
        manga: MangaIdInfo,
    ): (
        ...args: OmitFirst<Parameters<typeof this.updateSetting<Setting>>>
    ) => ReturnType<typeof this.updateSetting<Setting>> {
        return useCallback((...args) => this.updateSetting<Setting>(manga, ...args), [manga]);
    }
}
