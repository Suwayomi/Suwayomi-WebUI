/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t as translate } from 'i18next';
import { TManga, TranslationKey } from '@/typings.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    ChapterConditionInput,
    GetMangasChapterIdsWithStateQuery,
    UpdateMangaCategoriesPatchInput,
} from '@/lib/graphql/generated/graphql.ts';
import { Chapters } from '@/lib/data/Chapters.ts';
import { getMetadataServerSettings } from '@/util/metadataServerSettings.ts';
import { makeToast } from '@/components/util/Toast.tsx';

export type MangaAction =
    | 'download'
    | 'delete'
    | 'mark_as_read'
    | 'mark_as_unread'
    | 'remove_from_library'
    | 'change_categories';

const actionToTranslationKey: {
    [key in MangaAction]: {
        success: TranslationKey;
        error: TranslationKey;
    };
} = {
    download: {
        success: 'chapter.action.download.add.label.success',
        error: 'chapter.action.download.add.label.error',
    },
    delete: {
        success: 'chapter.action.download.delete.label.success',
        error: 'chapter.action.download.delete.label.error',
    },
    mark_as_read: {
        success: 'chapter.action.mark_as_read.add.label.success',
        error: 'chapter.action.mark_as_read.add.label.error',
    },
    mark_as_unread: {
        success: 'chapter.action.mark_as_read.remove.label.success',
        error: 'chapter.action.mark_as_read.remove.label.error',
    },
    remove_from_library: {
        success: 'manga.action.library.remove.label.success',
        error: 'manga.action.library.remove.label.error',
    },
    change_categories: {
        success: 'manga.action.category.label.success',
        error: 'manga.action.category.label.error',
    },
};

export type MangaChapterCountInfo = { chapters: Pick<TManga['chapters'], 'totalCount'> };
export type MangaDownloadInfo = Pick<TManga, 'downloadCount'> & MangaChapterCountInfo;
export type MangaUnreadInfo = Pick<TManga, 'unreadCount'> & MangaChapterCountInfo;
export class Mangas {
    static getIds(mangas: { id: number }[]): number[] {
        return mangas.map((manga) => manga.id);
    }

    static isNotDownloaded({ downloadCount }: MangaDownloadInfo): boolean {
        return downloadCount === 0;
    }

    static getNotDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isNotDownloaded);
    }

    static isFullyDownloaded({ downloadCount, chapters: { totalCount } }: MangaDownloadInfo): boolean {
        return downloadCount === totalCount;
    }

    static getFullyDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isFullyDownloaded);
    }

    static isPartiallyDownloaded(manga: MangaDownloadInfo): boolean {
        return !Mangas.isNotDownloaded(manga) && !Mangas.isFullyDownloaded(manga);
    }

    static getPartiallyDownloaded<Mangas extends MangaDownloadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isPartiallyDownloaded);
    }

    static isUnread({ unreadCount, chapters: { totalCount } }: MangaUnreadInfo): boolean {
        return unreadCount === totalCount;
    }

    static getUnread<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isUnread);
    }

    static isFullyRead({ unreadCount }: MangaUnreadInfo): boolean {
        return unreadCount === 0;
    }

    static getFullyRead<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isFullyRead);
    }

    static isPartiallyRead(manga: MangaUnreadInfo): boolean {
        return !Mangas.isUnread(manga) && !Mangas.isFullyRead(manga);
    }

    static getPartiallyRead<Mangas extends MangaUnreadInfo>(mangas: Mangas[]): Mangas[] {
        return mangas.filter(Mangas.isPartiallyRead);
    }

    static async getChapterIdsWithState(
        mangaIds: number[],
        state: Pick<ChapterConditionInput, 'isRead' | 'isDownloaded' | 'isBookmarked'>,
    ): Promise<GetMangasChapterIdsWithStateQuery['chapters']['nodes']> {
        const { data } = await requestManager.getMangasChapterIdsWithState(mangaIds, state).response;
        return data.chapters.nodes;
    }

    static async downloadChapters(mangaIds: number[]): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isDownloaded: false });
        return Mangas.executeAction(
            'download',
            chapters.length,
            () => requestManager.addChaptersToDownloadQueue(Chapters.getIds(chapters)).response,
        );
    }

    static async deleteChapters(mangaIds: number[]): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isDownloaded: true });
        return Mangas.executeAction(
            'delete',
            chapters.length,
            () => requestManager.deleteDownloadedChapters(Chapters.getIds(chapters)).response,
        );
    }

    static async markAsRead(mangaIds: number[], deleteChapters: boolean = false): Promise<void> {
        const [chapters, { deleteChaptersWithBookmark }] = await Promise.all([
            Mangas.getChapterIdsWithState(mangaIds, { isRead: false }),
            getMetadataServerSettings(),
        ]);
        const chapterIdsToDelete = deleteChapters
            ? Chapters.getIds(Chapters.getAutoDeletable(chapters, deleteChaptersWithBookmark))
            : [];
        return Mangas.executeAction(
            'mark_as_read',
            chapterIdsToDelete.length,
            () =>
                requestManager.updateChapters(Chapters.getIds(chapters), { isRead: true, chapterIdsToDelete }).response,
        );
    }

    static async markAsUnread(mangaIds: number[]): Promise<void> {
        const chapters = await Mangas.getChapterIdsWithState(mangaIds, { isRead: true });
        return Mangas.executeAction(
            'mark_as_unread',
            chapters.length,
            () => requestManager.updateChapters(Chapters.getIds(chapters), { isRead: false }).response,
        );
    }

    static async removeFromLibrary(mangaIds: number[]): Promise<void> {
        return Mangas.executeAction(
            'remove_from_library',
            mangaIds.length,
            () => requestManager.updateMangas(mangaIds, { inLibrary: false }).response,
        );
    }

    static async changeCategories(mangaIds: number[], patch: UpdateMangaCategoriesPatchInput): Promise<void> {
        return Mangas.executeAction(
            'change_categories',
            mangaIds.length,
            () => requestManager.updateMangasCategories(mangaIds, patch).response,
        );
    }

    private static async executeAction(
        action: MangaAction,
        itemCount: number,
        fnToExecute: () => Promise<unknown>,
    ): Promise<void> {
        try {
            await fnToExecute();
            makeToast(translate(actionToTranslationKey[action].success, { count: itemCount }), 'success');
        } catch (e) {
            makeToast(translate(actionToTranslationKey[action].error, { count: itemCount }), 'error');
            throw e;
        }
    }

    static async performAction<Action extends MangaAction>(
        action: Action,
        mangaIds: number[],
        {
            autoDeleteChapters,
            changeCategoriesPatch,
        }: Action extends 'mark_as_read'
            ? { autoDeleteChapters: boolean; changeCategoriesPatch?: never }
            : Action extends 'change_categories'
              ? { autoDeleteChapters?: never; changeCategoriesPatch: UpdateMangaCategoriesPatchInput }
              : { autoDeleteChapters?: boolean; changeCategoriesPatch?: UpdateMangaCategoriesPatchInput },
    ): Promise<void> {
        switch (action) {
            case 'download':
                return Mangas.downloadChapters(mangaIds);
            case 'delete':
                return Mangas.deleteChapters(mangaIds);
            case 'mark_as_read':
                return Mangas.markAsRead(mangaIds, autoDeleteChapters!);
            case 'mark_as_unread':
                return Mangas.markAsUnread(mangaIds);
            case 'remove_from_library':
                return Mangas.removeFromLibrary(mangaIds);
            case 'change_categories':
                return Mangas.changeCategories(mangaIds, changeCategoriesPatch!);
            default:
                throw new Error(`performMangasAction::performAction: unknown action "${action}"`);
        }
    }
}
