/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t as translate } from 'i18next';
import gql from 'graphql-tag';
import { DocumentNode } from '@apollo/client';
import { ChapterOffset, TChapter, TManga, TranslationKey } from '@/typings.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { getMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { FULL_CHAPTER_FIELDS } from '@/lib/graphql/Fragments.ts';

export type ChapterAction = 'download' | 'delete' | 'bookmark' | 'unbookmark' | 'mark_as_read' | 'mark_as_unread';

export const actionToTranslationKey: {
    [key in ChapterAction]: {
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
    bookmark: {
        action: {
            single: 'chapter.action.bookmark.add.label.action',
            selected: 'chapter.action.bookmark.add.button.selected',
        },
        success: 'chapter.action.bookmark.add.label.success',
        error: 'chapter.action.bookmark.add.label.error',
    },
    unbookmark: {
        action: {
            single: 'chapter.action.bookmark.remove.label.action',
            selected: 'chapter.action.bookmark.remove.button.selected',
        },
        success: 'chapter.action.bookmark.remove.label.success',
        error: 'chapter.action.bookmark.remove.label.error',
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
};

export type ChapterIdInfo = Pick<TChapter, 'id'>;
export type ChapterMangaInfo = Pick<TChapter, 'mangaId'>;
export type ChapterDownloadInfo = ChapterIdInfo & Pick<TChapter, 'isDownloaded'>;
export type ChapterBookmarkInfo = ChapterIdInfo & Pick<TChapter, 'isBookmarked'>;
export type ChapterReadInfo = ChapterIdInfo & Pick<TChapter, 'isRead'>;
export type ChapterNumberInfo = ChapterIdInfo & Pick<TChapter, 'chapterNumber'>;
export type ChapterScanlatorInfo = ChapterIdInfo & Pick<TChapter, 'scanlator'>;
export type ChapterRealUrlInfo = Pick<TChapter, 'realUrl'>;

export class Chapters {
    static getIds(chapters: { id: number }[]): number[] {
        return chapters.map((chapter) => chapter.id);
    }

    static getFromCache<T>(
        id: number,
        fragment: DocumentNode = FULL_CHAPTER_FIELDS,
        fragmentName: string = 'FULL_CHAPTER_FIELDS',
    ): T | null {
        return requestManager.graphQLClient.client.cache.readFragment<T>({
            id: requestManager.graphQLClient.client.cache.identify({
                __typename: 'ChapterType',
                id,
            }),
            fragment,
            fragmentName,
        });
    }

    static isDownloading(id: number): boolean {
        return !!requestManager.graphQLClient.client.cache.readFragment<TChapter>({
            id: requestManager.graphQLClient.client.cache.identify({
                __typename: 'DownloadType',
                chapter: {
                    __ref: requestManager.graphQLClient.client.cache.identify({
                        __typename: 'ChapterType',
                        id,
                    }),
                },
            }),
            fragment: gql`
                fragment CHAPTER_DOWNLOAD_QUEUE_CHECK on ChapterType {
                    id
                }
            `,
            fragmentName: 'CHAPTER_DOWNLOAD_QUEUE_CHECK',
        });
    }

    static isDownloaded({ isDownloaded }: ChapterDownloadInfo): boolean {
        return isDownloaded;
    }

    static getDownloaded<Chapter extends ChapterDownloadInfo>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(Chapters.isDownloaded);
    }

    static isDeletable(
        { isBookmarked, ...chapter }: ChapterDownloadInfo & ChapterBookmarkInfo,
        canDeleteBookmarked: boolean = false,
    ): boolean {
        return Chapters.isDownloaded(chapter) && (!isBookmarked || canDeleteBookmarked);
    }

    static getDeletable<Chapters extends ChapterDownloadInfo & ChapterBookmarkInfo>(
        chapters: Chapters[],
        canDeleteBookmarked?: boolean,
    ): Chapters[] {
        return chapters.filter((chapter) => Chapters.isDeletable(chapter, canDeleteBookmarked));
    }

    static isBookmarked({ isBookmarked }: ChapterBookmarkInfo): boolean {
        return isBookmarked;
    }

    static getBookmarked<Chapter extends ChapterBookmarkInfo>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(Chapters.isBookmarked);
    }

    static getNonBookmarked<Chapter extends ChapterBookmarkInfo>(chapters: Chapter[]): Chapter[] {
        return chapters.filter((chapter) => !Chapters.isBookmarked(chapter));
    }

    static isRead({ isRead }: ChapterReadInfo): boolean {
        return isRead;
    }

    static getRead<Chapter extends ChapterReadInfo>(chapters: Chapter[]): Chapter[] {
        return chapters.filter(Chapters.isRead);
    }

    static getNonRead<Chapter extends ChapterReadInfo>(chapters: Chapter[]): Chapter[] {
        return chapters.filter((chapter) => !Chapters.isRead(chapter));
    }

    static getMatchingChapterNumberChapters<Chapter extends ChapterNumberInfo>(
        chaptersA: Chapter[],
        chaptersB: Chapter[],
    ): [ChapterA: Chapter, ChapterB: Chapter][] {
        return chaptersA
            .map((chapterA) => {
                const matchingChapter = chaptersB.find((chapterB) => chapterA.chapterNumber === chapterB.chapterNumber);

                if (!matchingChapter) {
                    return null;
                }

                return [chapterA, matchingChapter];
            })
            .filter((matchingChapters) => matchingChapters !== null) as [Chapter, Chapter][];
    }

    static async download(chapterIds: number[]): Promise<void> {
        return Chapters.executeAction(
            'download',
            chapterIds.length,
            () => requestManager.addChaptersToDownloadQueue(chapterIds).response,
        );
    }

    static async delete(chapterIds: number[]): Promise<void> {
        return Chapters.executeAction(
            'delete',
            chapterIds.length,
            () => requestManager.deleteDownloadedChapters(chapterIds).response,
        );
    }

    static async markAsRead(
        chapters: (ChapterDownloadInfo & ChapterBookmarkInfo)[],
        wasManuallyMarkedAsRead: boolean = false,
        trackProgressMangaId?: TManga['id'],
    ): Promise<void> {
        const { deleteChaptersManuallyMarkedRead, deleteChaptersWithBookmark, updateProgressManualMarkRead } =
            await getMetadataServerSettings();
        const chapterIdsToDelete =
            deleteChaptersManuallyMarkedRead && wasManuallyMarkedAsRead
                ? Chapters.getIds(Chapters.getDeletable(chapters, deleteChaptersWithBookmark))
                : [];
        return Chapters.executeAction(
            'mark_as_read',
            chapters.length,
            () =>
                requestManager.updateChapters(Chapters.getIds(chapters), {
                    isRead: true,
                    lastPageRead: 0,
                    chapterIdsToDelete,
                    trackProgressMangaId:
                        updateProgressManualMarkRead && wasManuallyMarkedAsRead ? trackProgressMangaId : undefined,
                }).response,
        );
    }

    static async markAsUnread(chapterIds: number[]): Promise<void> {
        return Chapters.executeAction(
            'mark_as_unread',
            chapterIds.length,
            () => requestManager.updateChapters(chapterIds, { isRead: false }).response,
        );
    }

    static async bookmark(chapterIds: number[]): Promise<void> {
        return Chapters.executeAction(
            'bookmark',
            chapterIds.length,
            () => requestManager.updateChapters(chapterIds, { isBookmarked: true }).response,
        );
    }

    static async unBookmark(chapterIds: number[]): Promise<void> {
        return Chapters.executeAction(
            'unbookmark',
            chapterIds.length,
            () => requestManager.updateChapters(chapterIds, { isBookmarked: false }).response,
        );
    }

    private static async executeAction(
        action: ChapterAction,
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

    static async performAction<Action extends ChapterAction>(
        action: Action,
        chapterIds: number[],
        {
            wasManuallyMarkedAsRead,
            trackProgressMangaId,
            chapters,
        }: Action extends 'mark_as_read'
            ? {
                  wasManuallyMarkedAsRead: boolean;
                  trackProgressMangaId?: TManga['id'];
                  chapters: (ChapterDownloadInfo & ChapterBookmarkInfo & ChapterReadInfo)[];
              }
            : {
                  wasManuallyMarkedAsRead?: never;
                  trackProgressMangaId?: never;
                  chapters?: never;
              },
    ): Promise<void> {
        switch (action) {
            case 'download':
                return Chapters.download(chapterIds);
            case 'delete':
                return Chapters.delete(chapterIds);
            case 'mark_as_read':
                return Chapters.markAsRead(chapters!, wasManuallyMarkedAsRead!, trackProgressMangaId);
            case 'mark_as_unread':
                return Chapters.markAsUnread(chapterIds);
            case 'bookmark':
                return Chapters.bookmark(chapterIds);
            case 'unbookmark':
                return Chapters.unBookmark(chapterIds);
            default:
                throw new Error(`Chapters::performAction: unknown action "${action}"`);
        }
    }

    static removeDuplicates<T extends ChapterScanlatorInfo & ChapterNumberInfo>(currentChapter: T, chapters: T[]): T[] {
        const chapterNumberToChapters = Object.groupBy(chapters, ({ chapterNumber }) => chapterNumber);

        return Object.values(chapterNumberToChapters)
            .map(
                (groupedChapters) =>
                    // the result of groupBy can't result in undefined values
                    groupedChapters!.find((chapter) => chapter.id === currentChapter.id) ??
                    groupedChapters!.findLast((chapter) => chapter.scanlator === currentChapter.scanlator) ??
                    groupedChapters!.slice(-1)[0],
            )
            .sort((a, b) => b.chapterNumber - a.chapterNumber);
    }

    static getNextChapter<Chapter extends ChapterScanlatorInfo & ChapterNumberInfo & ChapterReadInfo>(
        currentChapter: Chapter,
        chapters: Chapter[],
        {
            offset = ChapterOffset.NEXT,
            ...options
        }: { offset?: ChapterOffset; onlyUnread?: boolean; skipDupe?: boolean } = {},
    ): Chapter | undefined {
        const nextChapters = Chapters.getNextChapters(currentChapter, chapters, { offset, ...options });

        const isNextChapterOffset = offset === ChapterOffset.NEXT;
        const sliceStartIndex = isNextChapterOffset ? -1 : 0;
        const sliceEndIndex = isNextChapterOffset ? undefined : 1;

        return nextChapters.slice(sliceStartIndex, sliceEndIndex)[0];
    }

    static getNextChapters<Chapter extends ChapterScanlatorInfo & ChapterNumberInfo & ChapterReadInfo>(
        fromChapter: Chapter,
        chapters: Chapter[],
        {
            offset = ChapterOffset.NEXT,
            onlyUnread = false,
            skipDupe = false,
        }: { offset?: ChapterOffset; onlyUnread?: boolean; skipDupe?: boolean } = {},
    ): Chapter[] {
        const fromChapterIndex = chapters.findIndex((chapter) => chapter.id === fromChapter.id);

        const isNextChapterOffset = offset === ChapterOffset.NEXT;
        const sliceStartIndex = isNextChapterOffset ? 0 : fromChapterIndex;
        const sliceEndIndex = isNextChapterOffset ? fromChapterIndex + 1 : undefined;

        const nextChaptersIncludingCurrent = chapters.slice(sliceStartIndex, sliceEndIndex);
        const uniqueNextChapters = skipDupe
            ? Chapters.removeDuplicates(fromChapter, nextChaptersIncludingCurrent)
            : nextChaptersIncludingCurrent;
        const nextChapters = uniqueNextChapters.toSpliced(isNextChapterOffset ? -1 : 0, 1);

        return onlyUnread ? Chapters.getNonRead(nextChapters) : nextChapters;
    }
}
