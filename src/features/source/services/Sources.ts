/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import type {
    SourceDisplayNameInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceNsfwInfo,
    SourceMetaInfo,
    SourceStoreInfo,
} from '@/features/source/Source.types.ts';
import {
    DefaultLanguage,
    languageSpecialSortComparator,
    toComparableLanguage,
    toComparableLanguages,
    toUniqueLanguageCodes,
} from '@/base/utils/Languages.ts';
import { getSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import type { SourceBaseFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { DocumentNode, Unmasked } from '@apollo/client';
import { SOURCE_BASE_FIELDS } from '@/lib/graphql/source/SourceFragments.ts';
import { isNsfw as isNsfwFnc } from '@/features/extension/Extensions.utils.ts';
import { SortBy, SortOrder, type SortSettings, type TMigratableSource } from '@/features/migration/Migration.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

export class Sources {
    static readonly LOCAL_SOURCE_ID = '0';

    static getIds(sources: SourceIdInfo[]): SourceIdInfo['id'][] {
        return sources.map((source) => source.id);
    }

    static getFromCache<T = SourceBaseFieldsFragment>(
        id: SourceIdInfo['id'],
        fragment: DocumentNode = SOURCE_BASE_FIELDS,
        fragmentName: string = 'SOURCE_BASE_FIELDS',
    ): Unmasked<T> | null {
        return requestManager.graphQLClient.client.cache.readFragment<T>({
            id: requestManager.graphQLClient.client.cache.identify({
                __typename: 'SourceType',
                id,
            }),
            fragment,
            fragmentName,
        });
    }

    static isLocalSource(source: SourceIdInfo): boolean {
        return source.id === Sources.LOCAL_SOURCE_ID;
    }

    static getLanguage(source: SourceIdInfo & SourceLanguageInfo): string {
        if (Sources.isLocalSource(source)) {
            return DefaultLanguage.OTHER;
        }

        return source.lang;
    }

    static getLanguages(
        sources: (SourceIdInfo & SourceLanguageInfo)[],
        { excludeLocalSource = false }: { excludeLocalSource?: boolean } = {},
    ): string[] {
        const filteredSources = excludeLocalSource
            ? sources.filter((source) => !Sources.isLocalSource(source))
            : sources;

        return [...new Set(filteredSources.map(Sources.getLanguage))];
    }

    static groupByLanguage<Source extends SourceIdInfo & SourceLanguageInfo & SourceDisplayNameInfo & SourceMetaInfo>(
        sources: Source[],
        { withPinnedGroup = false }: { withPinnedGroup?: boolean } = {},
    ): Record<string, Source[]> {
        const sourcesByLanguage = Object.groupBy(sources, (source) => {
            if (withPinnedGroup && getSourceMetadata(source).isPinned) {
                return DefaultLanguage.PINNED;
            }

            return Sources.getLanguage(source);
        });
        const sourcesBySortedLanguage = Object.entries(sourcesByLanguage).toSorted(([a], [b]) => {
            const isAPinned = a === DefaultLanguage.PINNED;
            const isBPinned = b === DefaultLanguage.PINNED;

            if (withPinnedGroup && isAPinned) {
                return -1;
            }

            if (withPinnedGroup && isBPinned) {
                return 1;
            }

            return languageSpecialSortComparator(a, b);
        });
        const sortedSourcesBySortedLanguage = sourcesBySortedLanguage.map(([language, sourcesOfLanguage]) => [
            language,
            (sourcesOfLanguage ?? []).toSorted((a, b) => a.displayName.localeCompare(b.displayName)),
        ]);

        return Object.fromEntries(sortedSourcesBySortedLanguage);
    }

    static filter<Source extends SourceIdInfo & SourceLanguageInfo & SourceNsfwInfo>(
        sources: Source[],
        {
            isNsfw,
            languages,
            keepLocalSource,
            pinned,
            enabled,
            removeLocalSource,
        }: {
            isNsfw?: boolean;
            languages?: string[];
            keepLocalSource?: boolean;
            pinned?: boolean;
            enabled?: boolean;
            removeLocalSource?: boolean;
        } = {},
    ): Source[] {
        const normalizedLanguages = toComparableLanguages(toUniqueLanguageCodes(languages ?? []));

        const filters: [Condition: any, CheckKeepLocalSource: boolean, Filter: (source: Source) => boolean][] = [
            [isNsfw, true, (source: Source) => isNsfwFnc(source.contentWarning) === isNsfw],
            [
                languages,
                true,
                (source: Source) => normalizedLanguages.includes(toComparableLanguage(Sources.getLanguage(source))),
            ],
            [pinned, true, (source: Source) => getSourceMetadata(source).isPinned === pinned],
            [enabled, true, (source: Source) => getSourceMetadata(source).isEnabled === enabled],
            [removeLocalSource, false, (source: Source) => !removeLocalSource || !Sources.isLocalSource(source)],
        ];

        return filters.reduce((sourcesToFilter, [condition, checkKeepLocalSource, filter]) => {
            if (condition === undefined) {
                return sourcesToFilter;
            }

            return sourcesToFilter.filter(
                (source) =>
                    filter(source) || (checkKeepLocalSource && keepLocalSource && Sources.isLocalSource(source)),
            );
        }, sources);
    }

    static areFromMultipleStores<Source extends SourceIdInfo & SourceStoreInfo>(sources: Source[]): boolean {
        const store = sources.find((source) => !!source.extension.storeIndexUrl)?.extension.storeIndexUrl;

        if (!store || !sources.length) {
            return false;
        }

        return sources.some((source) => source.extension.storeIndexUrl !== store && !Sources.isLocalSource(source));
    }

    static getLastUsedSource<Source extends SourceIdInfo & SourceMetaInfo>(
        lastUsedSourceId: SourceIdInfo['id'] | null,
        sources: Source[],
    ): Source | undefined {
        return sources.find((source) => source.id === lastUsedSourceId);
    }

    static isLanguageEnabled<Source extends SourceMetaInfo & SourceLanguageInfo>(
        source: Source,
        browseLanguage: string[],
    ): boolean {
        return toComparableLanguages(toUniqueLanguageCodes(browseLanguage)).includes(source.lang);
    }

    static isEnabled<Source extends SourceIdInfo & SourceMetaInfo & SourceLanguageInfo>(
        source: Source,
        browseLanguages: string[],
    ): boolean {
        const isLanguageEnabled = Sources.isLanguageEnabled(source, browseLanguages);
        const { isEnabled } = getSourceMetadata(source);

        return isEnabled && isLanguageEnabled;
    }

    static useLanguages(): {
        languages: string[];
        setLanguages: (languages: string[]) => Promise<void>;
    } {
        const { t } = useLingui();
        const {
            settings: { browseLanguages },
        } = useMetadataServerSettings();

        const updateSetting = createUpdateMetadataServerSettings<'browseLanguages'>((e) =>
            makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
        );
        const setLanguages = useCallback((languages: string[]) => updateSetting('browseLanguages', languages), []);

        return {
            languages: browseLanguages,
            setLanguages,
        };
    }

    static useGetMigratableSources(
        { sortBy, sortOrder }: SortSettings = { sortBy: SortBy.SOURCE_NAME, sortOrder: SortOrder.ASC },
    ): {
        sources: TMigratableSource[];
        request: ReturnType<typeof requestManager.useGetMigratableSources>;
    } {
        const migratableSourcesRequest = requestManager.useGetMigratableSources();
        const mangas = migratableSourcesRequest.data?.mangas.nodes ?? STABLE_EMPTY_ARRAY;

        if (!mangas) {
            return { sources: STABLE_EMPTY_ARRAY, request: migratableSourcesRequest };
        }

        const sourcesSortedBy = useMemo(() => {
            const sourceBySourceId: Record<string, TMigratableSource> = {};

            mangas.forEach(({ sourceId, source }) => {
                const uniqueSource = sourceBySourceId[sourceId] ?? {
                    ...{ id: sourceId, name: sourceId, lang: 'unknown', iconUrl: null, mangaCount: 0, ...source },
                };

                sourceBySourceId[sourceId] = {
                    ...uniqueSource,
                    mangaCount: uniqueSource.mangaCount + 1,
                };
            });

            return Object.values(sourceBySourceId).toSorted((a, b) => {
                switch (sortBy) {
                    case SortBy.SOURCE_NAME:
                        return a.name.localeCompare(b.name);
                    case SortBy.MANGA_COUNT:
                        return a.mangaCount - b.mangaCount;
                    default:
                        throw new Error(`Unexpected "sortBy" "${sortBy}"`);
                }
            });
        }, [mangas, sortBy, sortOrder]);

        switch (sortOrder) {
            case SortOrder.ASC:
                return { sources: sourcesSortedBy, request: migratableSourcesRequest };
            case SortOrder.DESC:
                return { sources: sourcesSortedBy.toReversed(), request: migratableSourcesRequest };
            default:
                throw new Error(`Unexpected "sortOrder" "${sortOrder}"`);
        }
    }
}
