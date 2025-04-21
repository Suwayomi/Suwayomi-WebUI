/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import {
    SourceDisplayNameInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceNsfwInfo,
    SourceRepoInfo,
} from '@/modules/source/Source.types.ts';
import { langSortCmp } from '@/modules/core/utils/Languages.ts';

export class Sources {
    static readonly LOCAL_SOURCE_ID = '0';

    static isLocalSource(source: SourceIdInfo): boolean {
        return source.id === Sources.LOCAL_SOURCE_ID;
    }

    static getLanguages(sources: SourceLanguageInfo[]): string[] {
        return [...new Set(sources.map((source) => source.lang))].toSorted(langSortCmp);
    }

    static groupByLanguage<Source extends SourceLanguageInfo & SourceDisplayNameInfo>(
        sources: Source[],
    ): Record<string, Source[]> {
        const sourcesByLanguage = Object.groupBy(sources, (source) => source.lang);
        const sourcesBySortedLanguage = Object.entries(sourcesByLanguage).toSorted(([a], [b]) => langSortCmp(a, b));
        const sortedSourcesBySortedLanguage = sourcesBySortedLanguage.map(([language, sourcesOfLanguage]) => [
            language,
            (sourcesOfLanguage ?? []).toSorted((a, b) => a.displayName.localeCompare(b.displayName)),
        ]);

        return Object.fromEntries(sortedSourcesBySortedLanguage);
    }

    static filter<Source extends SourceIdInfo & SourceLanguageInfo & SourceNsfwInfo>(
        sources: Source[],
        {
            showNsfw,
            languages,
            keepLocalSource,
        }: { showNsfw?: boolean; languages?: string[]; keepLocalSource?: boolean } = {},
    ): Source[] {
        return sources
            .filter((source) => showNsfw || !source.isNsfw || (keepLocalSource && Sources.isLocalSource(source)))
            .filter(
                (source) =>
                    !languages || languages.includes(source.lang) || (keepLocalSource && Sources.isLocalSource(source)),
            );
    }

    static areFromMultipleRepos<Source extends SourceIdInfo & SourceRepoInfo>(sources: Source[]): boolean {
        const repo = sources.find((source) => !!source.extension.repo)?.extension.repo;

        if (!repo || !sources.length) {
            return false;
        }

        return sources.some((source) => source.extension.repo !== repo && !Sources.isLocalSource(source));
    }
}
