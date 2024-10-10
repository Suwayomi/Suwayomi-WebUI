/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ComponentProps } from 'react';
import { ChapterType, MangaType } from '@/lib/graphql/generated/graphql.ts';
import {
    ChapterBookmarkInfo,
    ChapterMangaInfo,
    ChapterNumberInfo,
    ChapterRealUrlInfo,
} from '@/modules/chapter/services/Chapters.ts';
import { ChapterCard } from '@/modules/chapter/components/cards/ChapterCard.tsx';
import { ReaderProgressBarProps } from '@/modules/reader/types/ReaderProgressBar.types.ts';

export interface BaseReaderOverlayProps {
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
}

export interface MobileHeaderProps extends Pick<BaseReaderOverlayProps, 'isVisible'> {
    manga: Pick<MangaType, 'title'>;
    chapter: Pick<ChapterType, 'name'> &
        ChapterBookmarkInfo &
        ChapterRealUrlInfo &
        ChapterNumberInfo &
        ChapterMangaInfo;
}

interface ReaderNavBarBaseProps extends BaseReaderOverlayProps {
    openSettings: () => void;
}

export interface ReaderBottomBarMobileProps extends Omit<ReaderNavBarBaseProps, 'setIsVisible'> {
    chapters: ComponentProps<typeof ChapterCard>['allChapters'];
    currentChapterIndex: number;
}

export interface ReaderNavBarDesktopProps
    extends ReaderNavBarBaseProps,
        MobileHeaderProps,
        ReaderBottomBarMobileProps,
        Pick<ReaderProgressBarProps, 'pages' | 'currentPageIndex' | 'setCurrentPageIndex'> {}
