/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReaderPageSpreadState, ReaderStateChapters, ReaderStatePages } from '@/features/reader/Reader.types.ts';
import { ReaderResumeMode, ReadingMode } from '@/features/reader/Reader.types.ts';
import type { UpdateChapterPatchInput } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { ChapterIdInfo, TChapterReader } from '@/features/chapter/Chapter.types.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { CHAPTER_READER_FIELDS } from '@/lib/graphql/chapter/ChapterFragments.ts';
import { isPageOfOutdatedPageLoadStates, isSpreadPage } from '@/features/reader/viewer/pager/ReaderPager.utils.tsx';
import { coerceIn } from '@/lib/HelperFunctions.ts';
import { DirectionOffset } from '@/base/Base.types.ts';
import * as ColorThief from 'colorthief';
import groupBy from 'lodash/fp/groupBy';
import mapValues from 'lodash/fp/mapValues';
import maxBy from 'lodash/fp/maxBy';
import sumBy from 'lodash/fp/sumBy';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import {
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
} from '@/features/reader/settings/ReaderSettings.utils.tsx';

export const getInitialReaderPageIndex = (
    resumeMode: ReaderResumeMode,
    lastReadPageIndex: number,
    lastPageIndex: number,
): number => {
    if (resumeMode === ReaderResumeMode.START) {
        return 0;
    }

    if (resumeMode === ReaderResumeMode.END) {
        return lastPageIndex;
    }

    return coerceIn(lastReadPageIndex, 0, lastPageIndex);
};

export const getReaderChapterFromCache = (id: ChapterIdInfo['id']): TChapterReader | null =>
    Chapters.getFromCache<TChapterReader>(id, CHAPTER_READER_FIELDS, 'CHAPTER_READER_FIELDS')!;

export const getChapterIdsToDeleteForChapterUpdate = (
    chapter: TChapterReader,
    chapters: TChapterReader[],
    previousChapters: TChapterReader[],
    patch: UpdateChapterPatchInput,
    deleteChaptersWhileReading: number,
    deleteChaptersWithBookmark: boolean,
    shouldSkipDupChapters: boolean,
): TChapterReader['id'][] => {
    const isAutoDeletionEnabled = !!patch.isRead && !!deleteChaptersWhileReading;
    if (!isAutoDeletionEnabled) {
        return [];
    }

    const maybeChapterToDelete = [chapter, ...previousChapters][deleteChaptersWhileReading - 1];
    if (!maybeChapterToDelete) {
        return [];
    }

    const maybeChaptersToDelete = shouldSkipDupChapters
        ? Chapters.addDuplicates([maybeChapterToDelete], chapters)
        : [maybeChapterToDelete];
    const chaptersToDelete = maybeChaptersToDelete
        .map(({ id }) => getReaderChapterFromCache(id))
        .filter((chapterToDeleteUpToDateData) => chapterToDeleteUpToDateData !== null)
        .filter((chapterToDeleteUpToDateData) =>
            Chapters.isDeletable(chapterToDeleteUpToDateData, deleteChaptersWithBookmark),
        );

    if (!chaptersToDelete.length) {
        return [];
    }

    return Chapters.getIds(chaptersToDelete);
};

export const isInDownloadAheadRange = (
    currentPageIndex: number,
    pageCount: number,
    direction: DirectionOffset = DirectionOffset.NEXT,
): boolean => {
    const progress = (currentPageIndex + 1) / pageCount;

    if (direction === DirectionOffset.PREVIOUS) {
        return progress < 0.75;
    }

    return progress > 0.25;
};

export const getChapterIdsForDownloadAhead = (
    chapter: TChapterReader,
    nextChapter: TChapterReader | undefined,
    nextChapters: TChapterReader[],
    currentPageIndex: number,
    downloadAheadLimit: number,
): TChapterReader['id'][] => {
    const chapterUpToDateData = getReaderChapterFromCache(chapter.id);
    if (!chapterUpToDateData || !nextChapter) {
        return [];
    }

    const isDownloadAheadEnabled = !!downloadAheadLimit;
    const shouldCheckDownloadAhead =
        isDownloadAheadEnabled &&
        chapterUpToDateData.isDownloaded &&
        isInDownloadAheadRange(currentPageIndex, chapterUpToDateData.pageCount);
    if (!shouldCheckDownloadAhead) {
        return [];
    }

    const nextChapterUpToDateData = getReaderChapterFromCache(nextChapter.id);

    if (!nextChapterUpToDateData?.isDownloaded) {
        return [];
    }

    const unreadNextChaptersUpToDateData = Chapters.getNonRead(nextChapters)
        .map((unreadNextChapter) => getReaderChapterFromCache(unreadNextChapter.id))
        .filter((unreadNextChapterUpToDateData) => !!unreadNextChapterUpToDateData);

    return unreadNextChaptersUpToDateData
        .slice(-downloadAheadLimit)
        .filter((unreadNextChapter) => !unreadNextChapter.isDownloaded)
        .map((unreadUnDownloadedNextChapter) => unreadUnDownloadedNextChapter.id)
        .filter((id) => !Chapters.isDownloading(id));
};

const getPageBackgroundColor = (
    [top, right, bottom, left]: [
        Top: ColorThief.Color[] | null,
        Right: ColorThief.Color[] | null,
        Bottom: ColorThief.Color[] | null,
        Left: ColorThief.Color[] | null,
    ],
    readingMode: ReadingMode,
): string => {
    const isContinuousReadingModeFlag = isContinuousReadingMode(readingMode);
    const isContinuousVerticalReadingModeFlag = isContinuousVerticalReadingMode(readingMode);

    const borderColorPalettes = (() => {
        if (isContinuousVerticalReadingModeFlag) {
            return [right, left];
        }

        if (isContinuousReadingModeFlag) {
            return [top, bottom];
        }

        return [top, right, bottom, left];
    })();

    const blackThreshold = 10;
    const whiteThreshold = 246;

    const considerBlack = (color: ColorThief.Color | null): boolean => {
        if (!color) {
            return true;
        }

        const { r, g, b } = color.rgb();
        return r <= blackThreshold && g <= blackThreshold && b <= blackThreshold;
    };

    const considerWhite = (color: ColorThief.Color | null): boolean => {
        if (!color) {
            return true;
        }

        const { r, g, b } = color.rgb();
        return r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold;
    };

    const getHexValue = (color: ColorThief.Color | null) => {
        if (considerBlack(color)) {
            return '#000000';
        }

        if (considerWhite(color)) {
            return '#ffffff';
        }

        return color!.hex();
    };
    const colorsByHexValue = groupBy((color) => getHexValue(color), borderColorPalettes.flat().filter(Boolean));
    const proportionByHexValue = mapValues(
        (colors) =>
            sumBy((color) => {
                const fillsWholeBorder = color!.proportion >= 0.97;
                const multiplier = fillsWholeBorder ? borderColorPalettes.length : 1;

                return color!.proportion * multiplier;
            }, colors),
        colorsByHexValue,
    );
    const [hexValue] = maxBy(([_hex, proportion]) => proportion, Object.entries(proportionByHexValue))!;

    return hexValue;
};

const updatePageBackgroundColor = async (
    index: number,
    url: string,
    img: HTMLImageElement,
    setPageBackgroundColors: ReaderStatePages['setPageBackgroundColor'],
    readingMode: ReadingMode,
): Promise<void> => {
    const canvas = new OffscreenCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);

    const yOffset = 5;
    const xOffset = Math.trunc(img.width * 0.0275);
    const borderSampleSize = 1;

    const options = { ignoreWhite: false };

    const borderColorPalettes = await (async () => {
        try {
            return await Promise.all([
                ColorThief.getPalette(ctx.getImageData(0, yOffset, img.width, borderSampleSize), options),
                ColorThief.getPalette(ctx.getImageData(img.width - xOffset, 0, borderSampleSize, img.height), options),
                ColorThief.getPalette(ctx.getImageData(0, img.height - yOffset, img.width, borderSampleSize), options),
                ColorThief.getPalette(ctx.getImageData(xOffset, 0, borderSampleSize, img.height), options),
            ]);
        } catch (e) {
            return null;
        }
    })();

    if (!borderColorPalettes) {
        return;
    }

    setPageBackgroundColors((prevState) => {
        const pageBackgroundColor = prevState[index];

        if (isPageOfOutdatedPageLoadStates(url, pageBackgroundColor)) {
            return prevState;
        }

        if (pageBackgroundColor.color) {
            return prevState;
        }

        const color = getPageBackgroundColor(borderColorPalettes, readingMode);

        return prevState.toSpliced(index, 1, { url, color });
    });
};

export const createUpdateReaderPageLoadState =
    (
        actualPages: ReaderStatePages['pages'],
        setPagesToSpreadState: React.Dispatch<React.SetStateAction<ReaderPageSpreadState[]>>,
        setPageLoadStates: ReaderStatePages['setPageLoadStates'],
        setPageBackgroundColors: ReaderStatePages['setPageBackgroundColor'],
        readingMode: ReadingMode,
    ) =>
    (pagesIndex: number, url: string, isPrimary: boolean = true) => {
        if (pagesIndex > actualPages.length - 1) {
            return;
        }

        const page = actualPages[pagesIndex];
        const { index } = isPrimary ? page.primary : page.secondary!;

        const img = new Image();
        img.onload = () => {
            updatePageBackgroundColor(index, url, img, setPageBackgroundColors, readingMode).catch(
                defaultPromiseErrorHandler('updatePageBackgroundColor'),
            );

            if (readingMode === ReadingMode.DOUBLE_PAGE) {
                const isSpreadPageFlag = isSpreadPage(img);
                if (!isSpreadPageFlag) {
                    return;
                }

                setPagesToSpreadState((prevState) => {
                    const pageSpreadState = prevState[index];

                    const isOfOutdatedSpreadState = pageSpreadState === undefined || pageSpreadState.url !== url;
                    if (isOfOutdatedSpreadState) {
                        return prevState;
                    }

                    if (pageSpreadState.isSpread === isSpreadPageFlag) {
                        return prevState;
                    }

                    return prevState.toSpliced(index, 1, { url, isSpread: isSpreadPageFlag });
                });
            }
        };
        img.crossOrigin = 'anonymous';
        img.src = url;

        setPageLoadStates((statePageLoadStates) => {
            const pageLoadState = statePageLoadStates[index];

            if (isPageOfOutdatedPageLoadStates(url, pageLoadState)) {
                return statePageLoadStates;
            }

            if (pageLoadState.loaded) {
                return statePageLoadStates;
            }

            return statePageLoadStates.toSpliced(index, 1, { url: pageLoadState.url, loaded: true });
        });
    };

export const getReaderOpenChapterResumeMode = (
    isSpecificChapterMode: boolean,
    isPreviousChapter: boolean,
): ReaderResumeMode | undefined => {
    if (!isSpecificChapterMode) {
        return undefined;
    }

    if (isPreviousChapter) {
        return ReaderResumeMode.END;
    }

    return ReaderResumeMode.START;
};

export const createHandleReaderPageLoadError =
    (setPageLoadStates: ReaderStatePages['setPageLoadStates']) => (pageIndex: number, url: string) => {
        setPageLoadStates((statePageLoadStates) => {
            const pageLoadState = statePageLoadStates[pageIndex];

            if (isPageOfOutdatedPageLoadStates(url, pageLoadState)) {
                return statePageLoadStates;
            }

            return statePageLoadStates.toSpliced(pageIndex, 1, {
                ...pageLoadState,
                loaded: false,
                error: true,
            });
        });
    };

export const updateReaderStateVisibleChapters = (
    isPreviousChapter: boolean,
    state: Omit<ReaderStateChapters, 'setReaderStateChapters'>,
    chapterToOpenSourceOrder: TChapterReader['sourceOrder'],
    scrollIntoView: boolean,
    isLeadingChapterPreloadMode?: boolean,
    isTrailingChapterPreloadMode?: boolean,
): Omit<ReaderStateChapters, 'setReaderStateChapters'> => {
    const { leading, trailing, lastLeadingChapterSourceOrder, lastTrailingChapterSourceOrder } = state.visibleChapters;

    const isNewLeadingChapter = isPreviousChapter && chapterToOpenSourceOrder < lastLeadingChapterSourceOrder;
    const isNewTrailingChapter = !isPreviousChapter && chapterToOpenSourceOrder > lastTrailingChapterSourceOrder;

    return {
        ...state,
        visibleChapters: {
            ...state.visibleChapters,
            leading: leading + Number(isNewLeadingChapter),
            trailing: trailing + Number(isNewTrailingChapter),
            lastLeadingChapterSourceOrder: isNewLeadingChapter
                ? chapterToOpenSourceOrder
                : lastLeadingChapterSourceOrder,
            lastTrailingChapterSourceOrder: isNewTrailingChapter
                ? chapterToOpenSourceOrder
                : lastTrailingChapterSourceOrder,
            isLeadingChapterPreloadMode:
                isLeadingChapterPreloadMode !== undefined
                    ? isLeadingChapterPreloadMode
                    : state.visibleChapters.isLeadingChapterPreloadMode,
            isTrailingChapterPreloadMode:
                isTrailingChapterPreloadMode !== undefined
                    ? isTrailingChapterPreloadMode
                    : state.visibleChapters.isTrailingChapterPreloadMode,
            scrollIntoView,
            resumeMode: isPreviousChapter ? ReaderResumeMode.END : ReaderResumeMode.START,
        },
    };
};

export const getReaderChapterViewerCurrentPageIndex = (
    currentPageIndex: number,
    chapter: TChapterReader,
    currentChapter: TChapterReader,
    isCurrentChapter: boolean,
    isCurrentChapterReady: boolean,
    isLeadingChapter: boolean,
    isTrailingChapter: boolean,
    visibleChapters: ReaderStateChapters['visibleChapters'],
): number => {
    if (isCurrentChapter) {
        if (isCurrentChapterReady) {
            return coerceIn(currentPageIndex, 0, chapter.pageCount - 1);
        }

        if (visibleChapters.scrollIntoView && visibleChapters.resumeMode !== undefined) {
            return getInitialReaderPageIndex(visibleChapters.resumeMode, 0, chapter.pageCount - 1);
        }

        if (isLeadingChapter) {
            return Math.max(0, chapter.pageCount - 1);
        }

        if (isTrailingChapter) {
            return 0;
        }
    }

    const isPreviousChapter = chapter.sourceOrder < currentChapter.sourceOrder;
    if (isPreviousChapter) {
        return Math.max(chapter.pageCount - 1, 0);
    }

    return 0;
};

export const getReaderChapterViewResumeMode = (
    isCurrentChapter: boolean,
    isInitialChapter: boolean,
    isLeadingChapter: boolean,
    isTrailingChapter: boolean,
    forcedResumeMode: ReaderResumeMode | undefined,
    resumeMode: ReaderResumeMode,
): ReaderResumeMode => {
    if (isCurrentChapter && forcedResumeMode !== undefined) {
        return forcedResumeMode;
    }

    if (isInitialChapter) {
        return resumeMode;
    }

    if (isLeadingChapter) {
        return ReaderResumeMode.END;
    }

    if (isTrailingChapter) {
        return ReaderResumeMode.START;
    }

    return ReaderResumeMode.START;
};

export const getPreviousNextChapterVisibility = (
    chapterIndex: number,
    chaptersToRender: TChapterReader[],
    visibleChapters: ReaderStateChapters['visibleChapters'],
): { previous: boolean; next: boolean } => {
    const isPreviousChapterLoaded = !!chaptersToRender[chapterIndex + 1];
    const isPreviousChapterLastLeadingChapter = chapterIndex + 1 >= chaptersToRender.length - 1;
    const isPreviousChapterPreloading =
        isPreviousChapterLastLeadingChapter && visibleChapters.isLeadingChapterPreloadMode;
    const isPreviousChapterVisible = isPreviousChapterLoaded && !isPreviousChapterPreloading;

    const isNextChapterLoaded = !!chaptersToRender[chapterIndex - 1];
    const isNextChapterLastTrailingChapter = chapterIndex - 1 <= 0;
    const isNextChapterPreloading = isNextChapterLastTrailingChapter && visibleChapters.isTrailingChapterPreloadMode;
    const isNextChapterVisible = isNextChapterLoaded && !isNextChapterPreloading;

    return {
        previous: isPreviousChapterVisible,
        next: isNextChapterVisible,
    };
};
