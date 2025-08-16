/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Virtuoso, VirtuosoProps } from 'react-virtuoso';
import { useMemo } from 'react';
import { ReaderStateChapters } from '@/features/reader/Reader.types.ts';
import { ChapterListCard } from '@/features/chapter/components/cards/ChapterListCard.tsx';

const onSelectNoop = () => {};

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
                <ChapterListCard
                    index={index}
                    chapters={chapters}
                    isSortDesc
                    mode="reader"
                    showChapterNumber={false}
                    selected={null}
                    onSelect={onSelectNoop}
                    selectable={false}
                    isActiveChapter={index === currentChapterIndex}
                />
            )}
            increaseViewportBy={400}
        />
    );
};
