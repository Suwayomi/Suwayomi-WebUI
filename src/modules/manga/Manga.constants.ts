/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MangaStatus } from '@/lib/graphql/generated/graphql.ts';
import { TranslationKey } from '@/Base.types.ts';
import { MangaAction } from '@/modules/manga/Manga.types.ts';

export const MANGA_COVER_ASPECT_RATIO = '1 / 1.5';

export const statusToTranslationKey: Record<MangaStatus, TranslationKey> = {
    [MangaStatus.Cancelled]: 'manga.status.cancelled',
    [MangaStatus.Completed]: 'manga.status.completed',
    [MangaStatus.Licensed]: 'manga.status.licensed',
    [MangaStatus.Ongoing]: 'manga.status.ongoing',
    [MangaStatus.OnHiatus]: 'manga.status.hiatus',
    [MangaStatus.PublishingFinished]: 'manga.status.publishing_finished',
    [MangaStatus.Unknown]: 'manga.status.unknown',
};

export const actionToTranslationKey: {
    [key in MangaAction]: {
        action: {
            single: TranslationKey;
            selected: TranslationKey;
        };
        success: TranslationKey;
        error: TranslationKey;
    };
} = {
    download: {
        action: {
            single: 'chapter.action.download.add.label.action',
            selected: 'chapter.action.download.add.button.selected',
        },
        success: 'chapter.action.download.add.label.success',
        error: 'chapter.action.download.add.label.error',
    },
    delete: {
        action: {
            single: 'chapter.action.download.delete.label.action',
            selected: 'chapter.action.download.delete.button.selected',
        },
        success: 'chapter.action.download.delete.label.success',
        error: 'chapter.action.download.delete.label.error',
    },
    mark_as_read: {
        action: {
            single: 'chapter.action.mark_as_read.add.label.action.current',
            selected: 'chapter.action.mark_as_read.add.button.selected',
        },
        success: 'chapter.action.mark_as_read.add.label.success',
        error: 'chapter.action.mark_as_read.add.label.error',
    },
    mark_as_unread: {
        action: {
            single: 'chapter.action.mark_as_read.remove.label.action',
            selected: 'chapter.action.mark_as_read.remove.button.selected',
        },
        success: 'chapter.action.mark_as_read.remove.label.success',
        error: 'chapter.action.mark_as_read.remove.label.error',
    },
    remove_from_library: {
        action: {
            single: 'manga.action.library.remove.label.action',
            selected: 'manga.action.library.remove.button.selected',
        },
        success: 'manga.action.library.remove.label.success',
        error: 'manga.action.library.remove.label.error',
    },
    change_categories: {
        action: {
            single: 'manga.action.category.label.action',
            selected: 'manga.action.category.button.selected',
        },
        success: 'manga.action.category.label.success',
        error: 'manga.action.category.label.error',
    },
    migrate: {
        action: {
            single: 'global.button.migrate',
            selected: 'global.button.migrate', // not supported
        },
        success: 'manga.action.migrate.label.success',
        error: 'manga.action.migrate.label.error',
    },
    track: {
        action: {
            single: 'manga.action.track.add.label.action',
            selected: 'manga.action.track.add.label.action', // not supported
        },
        success: 'manga.action.track.add.label.success',
        error: 'manga.action.track.add.label.error',
    },
};
