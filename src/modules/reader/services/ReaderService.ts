/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Direction, useTheme } from '@mui/material/styles';
import { t as translate } from 'i18next';
import { TChapterReader } from '@/modules/chapter/Chapter.types.ts';
import { Chapters } from '@/modules/chapter/services/Chapters.ts';
import {
    IReaderSettings,
    IReaderSettingsWithDefaultFlag,
    ReaderExitMode,
    ReaderOverlayMode,
    ReadingDirection,
} from '@/modules/reader/types/Reader.types.ts';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import {
    updateReaderSettings,
    useDefaultReaderSettings,
    useGetReaderSettingsFor,
} from '@/modules/reader/services/ReaderSettingsMetadata.ts';
import { MangaIdInfo } from '@/modules/manga/Manga.types.ts';
import { getMetadataKey } from '@/modules/metadata/services/MetadataReader.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { MANGA_META_FIELDS } from '@/lib/graphql/fragments/MangaFragments.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';
import { GLOBAL_METADATA } from '@/lib/graphql/fragments/Fragments.ts';
import { updateMetadataList } from '@/modules/metadata/services/MetadataApolloCacheHandler.ts';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { GLOBAL_READER_SETTING_KEYS } from '@/modules/reader/constants/ReaderSettings.constants.tsx';

const DIRECTION_TO_INVERTED: Record<Direction, Direction> = {
    ltr: 'rtl',
    rtl: 'ltr',
};

const DIRECTION_TO_READING_DIRECTION: Record<Direction, ReadingDirection> = {
    ltr: ReadingDirection.LTR,
    rtl: ReadingDirection.RTL,
};

const DEFAULT_MANGA: MangaIdInfo = { id: -1 };

export class ReaderService {
    static useNavigateToChapter(chapter?: TChapterReader): () => void {
        const navigate = useNavigate();

        return useCallback(() => chapter && navigate(Chapters.getReaderUrl(chapter), { replace: true }), [chapter]);
    }

    static useSettings(): IReaderSettingsWithDefaultFlag {
        const { manga } = useReaderStateMangaContext();
        const defaultReaderSettings = useDefaultReaderSettings();

        return useGetReaderSettingsFor(manga ?? DEFAULT_MANGA, defaultReaderSettings.settings);
    }

    static useGetThemeDirection(): Direction {
        const { direction } = useTheme();
        const { readingDirection } = ReaderService.useSettings();

        return DIRECTION_TO_READING_DIRECTION[direction] === readingDirection.value
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
        isGlobal: boolean = false,
    ): void {
        if (!manga) {
            return;
        }

        const key = getMetadataKey(setting);

        const { cache } = requestManager.graphQLClient.client;

        const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
        if (isGlobalSetting) {
            const reference = cache.writeFragment({
                fragment: GLOBAL_METADATA,
                data: {
                    __typename: 'GlobalMetaType',
                    key,
                    value: JSON.stringify(value),
                },
            });
            cache.modify({
                fields: {
                    metas(existingMetas, { readField }) {
                        return {
                            ...existingMetas,
                            nodes: updateMetadataList(key, existingMetas?.nodes, readField, () => reference),
                        };
                    },
                },
            });
        } else {
            const reference = cache.writeFragment({
                fragment: MANGA_META_FIELDS,
                data: {
                    __typename: 'MangaMetaType',
                    mangaId: manga.id,
                    key,
                    value: JSON.stringify(value),
                },
            });
            cache.modify({
                id: cache.identify({ __typename: 'MangaType', id: manga.id }),
                fields: {
                    meta(existingMetas, { readField }) {
                        return updateMetadataList(key, existingMetas, readField, () => reference);
                    },
                },
            });
        }

        if (commit) {
            updateReaderSettings(manga, setting, value, isGlobal).catch(() =>
                makeToast(translate('reader.settings.error.label.failed_to_save_settings'), 'error'),
            );
        }
    }

    static deleteSetting<Setting extends keyof IReaderSettings>(
        manga: MangaIdInfo,
        setting: Setting,
        isGlobal: boolean = false,
    ): void {
        if (!manga) {
            return;
        }

        const key = getMetadataKey(setting);

        const { cache } = requestManager.graphQLClient.client;

        const isGlobalSetting = isGlobal || GLOBAL_READER_SETTING_KEYS.includes(setting);
        if (isGlobalSetting) {
            cache.evict({ id: cache.identify({ __typename: 'GlobalMetaType', key }) });
        } else {
            cache.evict({ id: cache.identify({ __typename: 'MangaMetaType', mangaId: manga.id, key }) });
        }

        const deleteSetting = isGlobalSetting
            ? () => requestManager.deleteGlobalMeta(key).response
            : () => requestManager.deleteMangaMeta(manga.id, key).response;
        deleteSetting().catch(() =>
            makeToast(translate('reader.settings.error.label.failed_to_save_settings'), 'error'),
        );
    }

    static useCreateUpdateSetting<Setting extends keyof IReaderSettings>(
        manga: MangaIdInfo,
    ): (
        ...args: OmitFirst<Parameters<typeof this.updateSetting<Setting>>>
    ) => ReturnType<typeof this.updateSetting<Setting>> {
        return useCallback((...args) => this.updateSetting<Setting>(manga, ...args), [manga]);
    }

    static useCreateDeleteSetting<Setting extends keyof IReaderSettings>(
        manga: MangaIdInfo,
    ): (
        ...args: OmitFirst<Parameters<typeof this.deleteSetting<Setting>>>
    ) => ReturnType<typeof this.deleteSetting<Setting>> {
        return useCallback((...args) => this.deleteSetting<Setting>(manga, ...args), [manga]);
    }

    static useOverlayMode(): { mode: ReaderOverlayMode; isDesktop: boolean; isMobile: boolean } {
        const isTouchDevice = MediaQuery.useIsTouchDevice();
        const { overlayMode } = this.useSettings();

        const isAutoModeSelected = overlayMode === ReaderOverlayMode.AUTO;
        const isDesktopModeSelected = overlayMode === ReaderOverlayMode.DESKTOP;
        const isMobileModeSelected = overlayMode === ReaderOverlayMode.MOBILE;

        const isDesktop = isDesktopModeSelected || (isAutoModeSelected && !isTouchDevice);
        const isMobile = isMobileModeSelected || (isAutoModeSelected && isTouchDevice);

        return {
            mode: isDesktop ? ReaderOverlayMode.DESKTOP : ReaderOverlayMode.MOBILE,
            isDesktop,
            isMobile,
        };
    }

    static useExit(): () => void {
        const { manga } = useReaderStateMangaContext();
        const { exitMode } = this.useSettings();
        const handleBack = useBackButton();
        const navigate = useNavigate();

        const openMangaPage = useCallback(() => {
            if (!manga) {
                return () => {};
            }

            return navigate(`/manga/${manga.id}`);
        }, [manga]);

        switch (exitMode) {
            case ReaderExitMode.PREVIOUS:
                return handleBack;
            case ReaderExitMode.MANGA:
                return openMangaPage;
            default:
                throw new Error(`Unexpected "exitMode" (${exitMode})`);
        }
    }
}
