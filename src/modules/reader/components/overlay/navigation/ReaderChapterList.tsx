/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Virtuoso } from 'react-virtuoso';
import { useMemo } from 'react';
import { IChapterWithMeta } from '@/modules/chapter/components/ChapterList.tsx';
import { ChapterCard } from '@/modules/chapter/components/cards/ChapterCard.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';

export const ReaderChapterList = ({
    currentChapter,
    chapters,
}: Required<Pick<ReaderStateChapters, 'chapters' | 'currentChapter'>>) => {
    const { data: downloaderData } = requestManager.useGetDownloadStatus();
    const queue = downloaderData?.downloadStatus.queue ?? [];

    const currentChapterIndex = useMemo(
        () => currentChapter && chapters.findIndex((chapter) => chapter.id === currentChapter.id),
        [currentChapter, chapters],
    );

    const chaptersWithMeta: IChapterWithMeta[] = useMemo(
        () =>
            chapters.map((chapter) => {
                const downloadChapter = queue?.find((cd) => cd.chapter.id === chapter.id);

                return {
                    chapter,
                    downloadChapter,
                    selected: null,
                };
            }),
        [queue, chapters],
    );

    return (
        <Virtuoso
            style={{
                height: `calc(${chaptersWithMeta.length} * 100px)`,
                minHeight: '15vh',
                maxHeight: '75vh',
            }}
            initialTopMostItemIndex={currentChapterIndex ?? 0}
            totalCount={chaptersWithMeta.length}
            computeItemKey={(index) => chaptersWithMeta[index].chapter.id}
            itemContent={(index) => (
                <ChapterCard
                    key={chaptersWithMeta[index].chapter.id}
                    mode="reader"
                    chapter={chaptersWithMeta[index].chapter}
                    downloadChapter={chaptersWithMeta[index].downloadChapter}
                    allChapters={chapters}
                    showChapterNumber={false}
                    selected={null}
                    onSelect={() => undefined}
                    selectable={false}
                    isActiveChapter={index === currentChapterIndex}
                />
            )}
            increaseViewportBy={400}
        />
    );
};
