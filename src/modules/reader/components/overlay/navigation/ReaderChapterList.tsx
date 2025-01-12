/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Virtuoso, VirtuosoProps } from 'react-virtuoso';
import { useMemo } from 'react';
import { ChapterCard } from '@/modules/chapter/components/cards/ChapterCard.tsx';
import { ReaderStateChapters } from '@/modules/reader/types/Reader.types.ts';

export const ReaderChapterList = ({
    currentChapter,
    chapters,
    style,
}: Pick<ReaderStateChapters, 'chapters' | 'currentChapter'> & Pick<VirtuosoProps<any, any>, 'style'>) => {
    const currentChapterIndex = useMemo(
        () => currentChapter && chapters.findIndex((chapter) => chapter.id === currentChapter.id),
        [currentChapter, chapters],
    );

    return (
        <Virtuoso
            style={{
                height: `calc(${chapters.length} * 100px)`,
                ...style,
            }}
            initialTopMostItemIndex={currentChapterIndex ?? 0}
            totalCount={chapters.length}
            computeItemKey={(index) => chapters[index].id}
            itemContent={(index) => (
                <ChapterCard
                    key={chapters[index].id}
                    mode="reader"
                    chapter={chapters[index]}
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
