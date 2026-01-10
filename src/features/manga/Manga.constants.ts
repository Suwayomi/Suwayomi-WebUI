/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { MangaStatus } from '@/lib/graphql/generated/graphql.ts';
import { MangaAction, MangaIdInfo, MangaType } from '@/features/manga/Manga.types.ts';
import {
    CHAPTER_ACTION_TO_CONFIRMATION_REQUIRED,
    CHAPTER_ACTION_TO_TRANSLATION,
} from '@/features/chapter/Chapter.constants.ts';
import { GqlMetaHolder } from '@/features/metadata/Metadata.types.ts';

export const FALLBACK_MANGA: MangaIdInfo & GqlMetaHolder = { id: -1 };

export const GLOBAL_READER_SETTINGS_MANGA: MangaIdInfo = { id: -2 };

export const MANGA_COVER_ASPECT_RATIO = '1 / 1.5';

export const MANGA_STATUS_TO_TRANSLATION: Record<MangaStatus, MessageDescriptor> = {
    [MangaStatus.Cancelled]: msg`Cancelled`,
    [MangaStatus.Completed]: msg`Completed`,
    [MangaStatus.Licensed]: msg`Licensed`,
    [MangaStatus.Ongoing]: msg`Ongoing`,
    [MangaStatus.OnHiatus]: msg`Hiatus`,
    [MangaStatus.PublishingFinished]: msg`Publishing finished`,
    [MangaStatus.Unknown]: msg`Unknown`,
};

export const MANGA_ACTION_TO_CONFIRMATION_REQUIRED: Record<
    MangaAction,
    { always: boolean; bulkAction: boolean; bulkActionCountForce?: number }
> = {
    ...CHAPTER_ACTION_TO_CONFIRMATION_REQUIRED,
    remove_from_library: { always: true, bulkAction: true },
    change_categories: { always: false, bulkAction: false },
    migrate: { always: false, bulkAction: false },
    track: { always: false, bulkAction: false },
};

export const MANGA_ACTION_TO_TRANSLATION: {
    [key in MangaAction]: {
        action: {
            single: MessageDescriptor;
            selected: MessageDescriptor;
        };
        confirmation?: MessageDescriptor;
        success: MessageDescriptor;
        error: MessageDescriptor;
    };
} = {
    ...CHAPTER_ACTION_TO_TRANSLATION,
    remove_from_library: {
        action: {
            single: msg`Remove from the library`,
            selected: msg`Remove selected from the library`,
        },
        confirmation: msg`{count, plural, one {You are about to remove one entry from your library} other {You are about to remove # entries from your library}}`,
        success: msg`{count, plural, one {Removed manga from the library} other {Removed # manga from the library}}`,
        error: msg`{count, plural, one {Could not remove manga from the library} other {Could not remove manga from the library}}`,
    },
    change_categories: {
        action: {
            single: msg`Change categories`,
            selected: msg`Change categories of selected`,
        },
        confirmation: msg`{count, plural, one {You are about to change the category of one entry} other {You are about to change the category of # entries}}`,
        success: msg`{count, plural, one {Changed categories of manga} other {Changed categories of # manga}}`,
        error: msg`{count, plural, one {Could not change the categories of the manga} other {Could not change the categories of the manga}}`,
    },
    migrate: {
        action: {
            single: msg`Migrate`,
            selected: msg`Migrate`, // not supported
        },
        success: msg`Successfully migrated manga`,
        error: msg`Could not migrate manga`,
    },
    track: {
        action: {
            single: msg`Track`,
            selected: msg`Track`, // not supported
        },
        success: msg`Tracked manga`,
        error: msg`Could not track manga`,
    },
};

// source: https://github.com/jobobby04/TachiyomiSY/blob/e0f40fad8c25459980ead51382c238462416f8d2/app/src/main/java/exh/util/MangaType.kt#L93
// last synced: 2025-04-18 00:06
export const SOURCES_BY_MANGA_TYPE: Record<MangaType, string[]> = {
    [MangaType.MANGA]: [],
    [MangaType.COMIC]: [
        '8muses',
        'allporncomic',
        'ciayo comics',
        'comicextra',
        'comicpunch',
        'cyanide',
        'dilbert',
        'eggporncomics',
        'existential comics',
        'hiveworks comics',
        'milftoon',
        'myhentaicomics',
        'myhentaigallery',
        'gunnerkrigg',
        'oglaf',
        'patch friday',
        'porncomix',
        'questionable content',
        'readcomiconline',
        'read comics online',
        'swords comic',
        'teabeer comics',
        'xkcd',
    ],
    [MangaType.WEBTOON]: ['mangatoon', 'manmanga', 'toomics', 'webcomics', 'webtoons', 'webtoon'],
    [MangaType.MANHWA]: [
        'hiperdex',
        'hmanhwa',
        'instamanhwa',
        'manhwa18',
        'manhwa68',
        'manhwa365',
        'manhwahentaime',
        'manhwamanga',
        'manhwatop',
        'manhwa',
        'manytoon',
        'manwha',
        'readmanhwa',
        'skymanga',
        'toonily',
        'webtoonxyz',
    ],
    [MangaType.MANHUA]: [
        '1st kiss manhua',
        'hero manhua',
        'manhuabox',
        'manhuaus',
        'manhuas',
        'manhuas',
        'readmanhua',
        'wuxiaworld',
        'manhua',
    ],
};

export const MANGA_TAGS_BY_MANGA_TYPE: Record<MangaType, MessageDescriptor[]> = {
    [MangaType.MANGA]: [msg`Manga`],
    [MangaType.COMIC]: [msg`Comic`],
    [MangaType.WEBTOON]: [msg`Webtoon`, msg`Long strip`],
    [MangaType.MANHWA]: [msg`Manhwa`, msg`Long strip`],
    [MangaType.MANHUA]: [msg`Manhua`, msg`Long strip`],
};
