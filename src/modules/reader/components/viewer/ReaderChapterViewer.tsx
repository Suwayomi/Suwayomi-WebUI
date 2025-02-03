/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { memo, MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import {
    IReaderSettings,
    ReaderPageSpreadState,
    ReaderResumeMode,
    ReaderStateChapters,
    ReaderTransitionPageMode,
    ReadingDirection,
    ReadingMode,
} from '@/modules/reader/types/Reader.types.ts';
import { getDoublePageModePages } from '@/modules/reader/utils/ReaderPager.utils.tsx';
import { ReaderControls } from '@/modules/reader/services/ReaderControls.ts';
import {
    getPagerForReadingMode,
    isContinuousReadingMode,
    isContinuousVerticalReadingMode,
    shouldApplyReaderWidth,
} from '@/modules/reader/utils/ReaderSettings.utils.tsx';
import { ReaderStatePages } from '@/modules/reader/types/ReaderProgressBar.types.ts';
import {
    createHandleReaderPageLoadError,
    createUpdateReaderPageLoadState,
} from '@/modules/reader/utils/Reader.utils.ts';
import { useReaderConvertPagesForReadingMode } from '@/modules/reader/hooks/useReaderConvertPagesForReadingMode.ts';
import { ReaderTransitionPage } from '@/modules/reader/components/viewer/ReaderTransitionPage.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { ChapterIdInfo } from '@/modules/chapter/services/Chapters.ts';
import { READER_STATE_PAGES_DEFAULTS } from '@/modules/reader/constants/ReaderContext.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useReaderSetPagesState } from '@/modules/reader/hooks/useReaderSetPagesState.ts';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { ReaderInfiniteScrollUpdateChapter } from '@/modules/reader/components/viewer/ReaderInfiniteScrollUpdateChapter.tsx';

const BaseReaderChapterViewer = ({
    currentPageIndex,
    setPages: setContextPages,
    setPageLoadStates: setContextPageLoadStates,
    setTotalPages: setContextTotalPages,
    setCurrentPageIndex: setContextCurrentPageIndex,
    updateCurrentPageIndex,
    setPageToScrollToIndex,
    transitionPageMode,
    retryFailedPagesKeyPrefix,
    setTransitionPageMode,
    readingMode,
    readerWidth,
    pageScaleMode,
    shouldOffsetDoubleSpreads,
    readingDirection,
    chapterId,
    previousChapterId,
    nextChapterId,
    isPreviousChapterVisible,
    isNextChapterVisible,
    lastPageRead,
    isInitialChapter,
    isCurrentChapter,
    isPreviousChapter,
    isNextChapter,
    isLeadingChapter,
    isTrailingChapter,
    imageRefs: globalImageRefs,
    scrollIntoView,
    setReaderStateChapters,
    resumeMode,
}: Pick<
    ReaderStatePages,
    | 'currentPageIndex'
    | 'setPages'
    | 'setPageLoadStates'
    | 'setTotalPages'
    | 'setCurrentPageIndex'
    | 'setPageToScrollToIndex'
    | 'transitionPageMode'
    | 'retryFailedPagesKeyPrefix'
    | 'setTransitionPageMode'
> &
    Pick<
        IReaderSettings,
        'readingMode' | 'shouldOffsetDoubleSpreads' | 'readingDirection' | 'readerWidth' | 'pageScaleMode'
    > &
    Pick<ReaderStateChapters, 'setReaderStateChapters'> & {
        updateCurrentPageIndex: ReturnType<typeof ReaderControls.useUpdateCurrentPageIndex>;
        chapterId: ChapterIdInfo['id'];
        previousChapterId?: ChapterIdInfo['id'];
        nextChapterId?: ChapterIdInfo['id'];
        isPreviousChapterVisible: boolean;
        isNextChapterVisible: boolean;
        lastPageRead: number;
        isInitialChapter: boolean;
        isCurrentChapter: boolean;
        isPreviousChapter: boolean;
        isNextChapter: boolean;
        isLeadingChapter: boolean;
        isTrailingChapter: boolean;
        imageRefs: MutableRefObject<(HTMLElement | null)[]>;
        scrollIntoView: boolean;
        resumeMode: ReaderResumeMode;
    }) => {
    const { t } = useTranslation();
    const { direction: themeDirection } = useTheme();

    const [fetchPages, pagesResponse] = requestManager.useGetChapterPagesFetch(chapterId ?? -1);

    const [arePagesFetched, setArePagesFetched] = useState(false);
    const [totalPages, setTotalPages] = useState<ReaderStatePages['totalPages']>(
        READER_STATE_PAGES_DEFAULTS.totalPages,
    );
    const [pageUrls, setPageUrls] = useState<ReaderStatePages['pageUrls']>(READER_STATE_PAGES_DEFAULTS.pageUrls);
    const [pages, setPages] = useState<ReaderStatePages['pages']>(READER_STATE_PAGES_DEFAULTS.pages);
    const [pageLoadStates, setPageLoadStates] = useState<ReaderStatePages['pageLoadStates']>(
        READER_STATE_PAGES_DEFAULTS.pageLoadStates,
    );
    const [pagesToSpreadState, setPagesToSpreadState] = useState<ReaderPageSpreadState[]>(
        pageLoadStates.map(({ url }) => ({ url, isSpread: false })),
    );

    const isCurrentChapterRef = useRef(isCurrentChapter);
    const imageRefs = useRef<(HTMLElement | null)[]>(pages.map(() => null));

    const actualPages = useMemo(() => {
        const arePagesLoaded = !!totalPages;
        if (!arePagesLoaded) {
            return pages;
        }

        const isSpreadStateUpdated = totalPages === pagesToSpreadState.length;
        if (!isSpreadStateUpdated) {
            return pages;
        }

        if (readingMode === ReadingMode.DOUBLE_PAGE) {
            return getDoublePageModePages(pageUrls, pagesToSpreadState, shouldOffsetDoubleSpreads, readingDirection);
        }

        return pages;
    }, [pagesToSpreadState, readingMode, shouldOffsetDoubleSpreads, readingDirection, totalPages]);

    const Pager = useMemo(() => getPagerForReadingMode(readingMode), [readingMode]);
    const isLtrReadingDirection = readingDirection === ReadingDirection.LTR;
    const isContinuousReadingModeActive = isContinuousReadingMode(readingMode);
    const shouldHideChapter = !isContinuousReadingModeActive && !isCurrentChapter;

    isCurrentChapterRef.current = isCurrentChapter;
    if (isCurrentChapter) {
        // eslint-disable-next-line no-param-reassign
        globalImageRefs.current = imageRefs.current;
    }

    const doFetchPages = useCallback(() => {
        if (!chapterId) {
            return;
        }

        setArePagesFetched(false);

        fetchPages({ variables: { input: { chapterId } } }).catch(
            defaultPromiseErrorHandler(`ReaderChapterViewer(${chapterId})::fetchPages`),
        );
    }, [fetchPages, chapterId]);

    const onLoad = useMemo(
        () =>
            createUpdateReaderPageLoadState(
                actualPages,
                pagesToSpreadState,
                setPagesToSpreadState,
                pageLoadStates,
                (value) => {
                    if (isCurrentChapterRef.current) {
                        setContextPageLoadStates(value);
                    }

                    setPageLoadStates(value);
                },
                readingMode,
            ),
        // do not add "pagesToSpreadState" and "pageLoadStates" as a dependency, otherwise, every page gets re-rendered
        // when they change which impacts the performance massively (depending on the total page count)
        [actualPages, readingMode],
    );

    const onError = useMemo(
        () =>
            createHandleReaderPageLoadError((value) => {
                if (isCurrentChapterRef.current) {
                    setContextPageLoadStates(value);
                }

                setPageLoadStates(value);
            }),
        [],
    );

    useEffect(() => {
        doFetchPages();
    }, [chapterId]);

    const updatePageState = <T,>(
        value: T,
        setLocalState: (value: T) => void,
        setGlobalState: (value: T) => void,
        forceLocal: boolean = false,
    ) => {
        if (forceLocal || !arePagesFetched) {
            setLocalState(value);
        }

        if (isCurrentChapter) {
            setGlobalState(value);
        }
    };
    useReaderSetPagesState(
        isCurrentChapter,
        pagesResponse,
        resumeMode,
        lastPageRead,
        actualPages,
        pageLoadStates,
        pagesToSpreadState,
        arePagesFetched,
        setArePagesFetched,
        setReaderStateChapters,
        (value) => updatePageState(value, setTotalPages, setContextTotalPages),
        (value) => updatePageState(value, setPages, setContextPages),
        (value) => updatePageState(value, setPageUrls, noOp),
        (value) => updatePageState(value, setPageLoadStates, setContextPageLoadStates),
        (value) => updatePageState(value, setPagesToSpreadState, noOp),
        (value) => updatePageState(value, noOp, setContextCurrentPageIndex),
        (value) => {
            if ((isInitialChapter && !arePagesFetched) || scrollIntoView) {
                setPageToScrollToIndex(value);
                setReaderStateChapters((prevState) => ({
                    ...prevState,
                    visibleChapters: { ...prevState.visibleChapters, scrollIntoView: false, resumeMode: undefined },
                }));
            }
        },
        (value) => updatePageState(value, noOp, setTransitionPageMode),
    );

    useReaderConvertPagesForReadingMode(
        currentPageIndex,
        actualPages,
        pageUrls,
        (value) => updatePageState(value, setPages, setContextPages, true),
        (value) => updatePageState(value, setPagesToSpreadState, noOp, true),
        (value) => updatePageState(value, noOp, updateCurrentPageIndex),
        readingMode,
    );

    // for non-continuous reading modes, only the current, previous and next chapter are relevant
    // every other chapter does not need to be rendered all the time since it's not affecting the
    // visible content anyway
    // the previous and next chapter are rendered so that going to the previous/next chapter feels smoother
    // since the relevant pages are already rendered
    const shouldRenderChapterViewer =
        isContinuousReadingModeActive || isCurrentChapter || isPreviousChapter || isNextChapter;
    if (!shouldRenderChapterViewer) {
        return null;
    }

    if (pagesResponse.error) {
        if (shouldHideChapter) {
            return null;
        }

        return (
            <Box
                sx={{
                    minHeight: '100%',
                    minWidth: '100%',
                    display: 'grid',
                    placeItems: 'center',
                    position: 'relative',
                }}
            >
                <EmptyViewAbsoluteCentered
                    message={t('global.error.label.failed_to_load_data')}
                    messageExtra={getErrorMessage(pagesResponse.error)}
                    retry={() => {
                        doFetchPages();
                    }}
                />
            </Box>
        );
    }

    if (pagesResponse.loading || !arePagesFetched) {
        if (shouldHideChapter) {
            return null;
        }

        return (
            <Box
                sx={{
                    minHeight: '100%',
                    minWidth: '100%',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <LoadingPlaceholder />
            </Box>
        );
    }

    if (chapterId != null && !totalPages) {
        if (shouldHideChapter) {
            return null;
        }

        return (
            <Box sx={{ minWidth: '100%', minHeight: '100%', position: 'relative' }}>
                <EmptyViewAbsoluteCentered message={t('reader.error.label.no_pages_found')} retry={doFetchPages} />
            </Box>
        );
    }

    return (
        <Stack
            sx={{
                width: '100%',
                minWidth: 'fit-content',
                height: '100%',
                minHeight: 'fit-content',
                margin: 'auto',
                flexWrap: 'nowrap',
                ...applyStyles(shouldHideChapter, {
                    maxWidth: 0,
                    maxHeight: 0,
                    minWidth: 'unset',
                    minHeight: 'unset',
                    overflow: 'hidden',
                }),
                ...applyStyles(
                    isContinuousVerticalReadingMode(readingMode) && shouldApplyReaderWidth(readerWidth, pageScaleMode),
                    { alignItems: 'center' },
                ),
                ...applyStyles(readingMode === ReadingMode.CONTINUOUS_HORIZONTAL, {
                    ...applyStyles(themeDirection === 'ltr', {
                        flexDirection: isLtrReadingDirection ? 'row' : 'row-reverse',
                    }),
                    ...applyStyles(themeDirection === 'rtl', {
                        flexDirection: isLtrReadingDirection ? 'row-reverse' : 'row',
                    }),
                }),
            }}
        >
            <ReaderInfiniteScrollUpdateChapter
                readingMode={readingMode}
                readingDirection={readingDirection}
                chapterId={chapterId}
                previousChapterId={previousChapterId}
                nextChapterId={nextChapterId}
                isCurrentChapter={isCurrentChapter}
                isPreviousChapterVisible={isPreviousChapterVisible}
                isNextChapterVisible={isNextChapterVisible}
                firstImage={imageRefs.current[0]}
                lastImage={imageRefs.current[imageRefs.current.length - 1]}
            />
            {((!isContinuousReadingModeActive && isCurrentChapter) ||
                (isContinuousReadingModeActive && (isInitialChapter || isLeadingChapter))) && (
                <ReaderTransitionPage chapterId={chapterId} type={ReaderTransitionPageMode.PREVIOUS} />
            )}
            <Pager
                totalPages={totalPages}
                currentPageIndex={currentPageIndex}
                pages={actualPages}
                transitionPageMode={transitionPageMode}
                pageLoadStates={pageLoadStates}
                retryFailedPagesKeyPrefix={retryFailedPagesKeyPrefix}
                imageRefs={imageRefs}
                onLoad={onLoad}
                onError={onError}
                isCurrentChapter={isCurrentChapter}
                isPreviousChapter={isPreviousChapter}
                isNextChapter={isNextChapter}
            />
            {((!isContinuousReadingModeActive && isCurrentChapter) ||
                (isContinuousReadingModeActive && (isInitialChapter || isTrailingChapter))) && (
                <ReaderTransitionPage chapterId={chapterId} type={ReaderTransitionPageMode.NEXT} />
            )}
        </Stack>
    );
};

export const ReaderChapterViewer = memo(BaseReaderChapterViewer);
