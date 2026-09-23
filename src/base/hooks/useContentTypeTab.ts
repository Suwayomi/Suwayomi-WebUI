/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StringParam, useQueryParam } from 'use-query-params';
import { SearchParam } from '@/base/Base.types.ts';
import { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

export function useContentTypeTab(defaultContentType?: SourceContentType) {
    const [tabSearchParam, setTabSearchParam] = useQueryParam(SearchParam.TAB, StringParam, {});
    const activeTab =
        tabSearchParam === 'light-novel' || defaultContentType === SourceContentType.LightNovel
            ? 'light-novel'
            : 'manga';
    const activeContentType = activeTab === 'light-novel' ? SourceContentType.LightNovel : SourceContentType.Manga;

    return { activeTab, activeContentType, setTabSearchParam };
}
