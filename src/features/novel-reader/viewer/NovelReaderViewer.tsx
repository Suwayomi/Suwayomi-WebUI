/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import {
    getReaderChaptersStore,
    useReaderChaptersStore,
    useReaderOverlayStore,
    useReaderSettingsStore,
} from '@/features/reader/stores/ReaderStore.ts';
import { useNovelReaderSettingsStore } from '@/features/novel-reader/stores/NovelReaderSettingsStore.ts';
import { useNovelReaderProgressStore } from '@/features/novel-reader/stores/NovelReaderProgressStore.ts';
import { NovelReaderChapterItem } from '@/features/novel-reader/components/NovelReaderChapterItem.tsx';
import { NovelReaderChapterSeparator } from '@/features/novel-reader/components/NovelReaderChapterSeparator.tsx';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { DirectionOffset } from '@/base/Base.types.ts';
import type { TChapterReader } from '@/features/chapter/Chapter.types.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { ReaderControls } from '@/features/reader/services/ReaderControls.ts';
import { ReaderHotkey } from '@/features/reader/Reader.types.ts';

const PROGRESS_DEBOUNCE_MS = 1000;
const PROGRESS_CHECKPOINT_MS = 5000;

const progressWritesByChapter = new Map<number, Promise<void>>();

const getChapterProgressDistance = (chapterHeight: number, viewportHeight: number) =>
    Math.max(1, chapterHeight <= viewportHeight ? chapterHeight : chapterHeight - viewportHeight);

const getChapterRestoreProgress = (chapter: TChapterReader, progress: number) =>
    chapter.isRead === false && progress >= 0.95 ? 0 : progress;

const normalizeHotkey = (key: string) => {
    const normalized = key.toLowerCase();
    if (normalized === ' ' || normalized === 'spacebar') {
        return 'space';
    }
    if (normalized === ',') {
        return 'comma';
    }
    if (normalized === '.') {
        return 'period';
    }
    return normalized === 'esc' ? 'escape' : normalized;
};

export interface NovelSeekHandle {
    scrollToProgress: (progress: number) => void;
}

export const novelSeekHandleRef = { current: null as NovelSeekHandle | null };

export const NovelReaderViewer: React.FC = () => {
    const navigate = useNavigate();
    const muiTheme = useTheme();
    const { currentChapter, chapters } = useReaderChaptersStore('currentChapter', 'chapters');
    const { isVisible, setIsVisible } = useReaderOverlayStore('isVisible', 'setIsVisible');
    const { hotkeys, scrollAmount } = useReaderSettingsStore('hotkeys', 'scrollAmount');

    const [renderedChapters, setRenderedChapters] = useState<TChapterReader[]>([]);
    const [externalNavigationEpoch, setExternalNavigationEpoch] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const chapterContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const chapterHeightsRef = useRef<Set<number>>(new Set());

    const anchorChapterIdRef = useRef<number | null>(null);
    const anchorTopRef = useRef<number>(0);
    const pendingPrependChapterIdRef = useRef<number | null>(null);
    const isPrependingRef = useRef(false);
    const isAppendingRef = useRef(false);
    const internalNavigationChapterIdRef = useRef<number | null>(null);
    const hasRestoredInitialProgressRef = useRef(false);
    const pendingRestoreChapterIdRef = useRef<number | null>(null);
    const lastChapterIdRef = useRef<number | null>(null);
    const liveProgressMapRef = useRef<Map<number, number>>(new Map());

    // Client-side typography settings
    const settings = useNovelReaderSettingsStore(
        'fontFamily',
        'fontSize',
        'lineHeight',
        'maxWidth',
        'textAlign',
        'margin',
        'paragraphSpacing',
    );

    const themeColors = useMemo(
        () => ({
            background: muiTheme.palette.background.default,
            text: muiTheme.palette.text.primary,
            link: muiTheme.palette.primary.main,
            border: muiTheme.palette.divider,
        }),
        [
            muiTheme.palette.background.default,
            muiTheme.palette.text.primary,
            muiTheme.palette.primary.main,
            muiTheme.palette.divider,
        ],
    );

    // Initialize or reset renderedChapters when currentChapter changes externally
    useEffect(() => {
        if (!currentChapter) {
            return;
        }

        if (internalNavigationChapterIdRef.current === currentChapter.id) {
            internalNavigationChapterIdRef.current = null;
            lastChapterIdRef.current = currentChapter.id;
            return;
        }
        if (lastChapterIdRef.current === currentChapter.id) {
            return;
        }
        pendingPrependChapterIdRef.current = null;
        anchorChapterIdRef.current = null;
        lastChapterIdRef.current = currentChapter.id;
        hasRestoredInitialProgressRef.current = false;
        const progress = getChapterRestoreProgress(
            currentChapter,
            liveProgressMapRef.current.get(currentChapter.id) ?? currentChapter.textProgress ?? 0,
        );
        pendingRestoreChapterIdRef.current = progress > 0 ? currentChapter.id : null;
        useNovelReaderProgressStore.getState().setProgress(currentChapter.id, progress);
        setExternalNavigationEpoch((value) => value + 1);
        setRenderedChapters([currentChapter]);
    }, [currentChapter]);

    useLayoutEffect(() => {
        if (currentChapter && renderedChapters.length === 1 && renderedChapters[0].id === currentChapter.id) {
            const progress = getChapterRestoreProgress(
                currentChapter,
                liveProgressMapRef.current.get(currentChapter.id) ?? currentChapter.textProgress ?? 0,
            );
            if (progress <= 0 && scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
            }
        }
    }, [externalNavigationEpoch]);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) {
            return;
        }
        let previousHeight = container.clientHeight;
        const observer = new ResizeObserver(() => {
            const nextHeight = container.clientHeight;
            const el = currentChapter && chapterContainerRefs.current.get(currentChapter.id);
            if (el && pendingRestoreChapterIdRef.current === null && anchorChapterIdRef.current === null) {
                const ratio =
                    (container.scrollTop - el.offsetTop) / getChapterProgressDistance(el.offsetHeight, previousHeight);
                container.scrollTop = el.offsetTop + ratio * getChapterProgressDistance(el.offsetHeight, nextHeight);
            }
            previousHeight = nextHeight;
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, [currentChapter?.id, renderedChapters.length]);

    const progressTimersRef = useRef<
        Map<number, { timer: NodeJS.Timeout; checkpointTimer: NodeJS.Timeout; progress: number }>
    >(new Map());

    const saveProgress = useCallback((chapterId: number, targetProgress: number) => {
        const clamped = Math.min(1.0, Math.max(0.0, targetProgress));
        const previousWrite = progressWritesByChapter.get(chapterId) ?? Promise.resolve();
        const nextWrite = previousWrite
            .catch(() => undefined)
            .then(() => requestManager.updateChapterTextProgress(chapterId, clamped).response)
            .then(() => undefined)
            .catch(defaultPromiseErrorHandler('NovelReaderViewer::updateChapterTextProgress', true));
        progressWritesByChapter.set(chapterId, nextWrite);
        void nextWrite.then(() => {
            if (progressWritesByChapter.get(chapterId) === nextWrite) {
                progressWritesByChapter.delete(chapterId);
            }
        });
    }, []);

    const flushProgress = useCallback(
        (chapterId: number) => {
            const pending = progressTimersRef.current.get(chapterId);
            if (!pending) {
                return;
            }
            clearTimeout(pending.timer);
            clearTimeout(pending.checkpointTimer);
            progressTimersRef.current.delete(chapterId);
            saveProgress(chapterId, pending.progress);
        },
        [saveProgress],
    );

    const handleProgressChange = useCallback(
        (chapterId: number, newProgress: number) => {
            liveProgressMapRef.current.set(chapterId, newProgress);
            useNovelReaderProgressStore.getState().setProgress(chapterId, newProgress);
            let pending = progressTimersRef.current.get(chapterId);
            if (pending) {
                clearTimeout(pending.timer);
                pending.progress = newProgress;
                pending.timer = setTimeout(() => flushProgress(chapterId), PROGRESS_DEBOUNCE_MS);
            } else {
                pending = {
                    timer: setTimeout(() => flushProgress(chapterId), PROGRESS_DEBOUNCE_MS),
                    checkpointTimer: setTimeout(() => flushProgress(chapterId), PROGRESS_CHECKPOINT_MS),
                    progress: newProgress,
                };
                progressTimersRef.current.set(chapterId, pending);
            }
        },
        [flushProgress],
    );

    useEffect(
        () => () => {
            progressTimersRef.current.forEach(({ timer, checkpointTimer, progress }, chapterId) => {
                clearTimeout(timer);
                clearTimeout(checkpointTimer);
                saveProgress(chapterId, progress);
            });
            progressTimersRef.current.clear();
        },
        [saveProgress],
    );

    // Seek handle for NovelReaderProgressBar
    useEffect(() => {
        novelSeekHandleRef.current = {
            scrollToProgress: (targetProgress: number) => {
                const container = scrollContainerRef.current;
                if (!container || !currentChapter) {
                    return;
                }
                const el = chapterContainerRefs.current.get(currentChapter.id);
                if (!el) {
                    return;
                }
                const clamped = Math.min(1.0, Math.max(0.0, targetProgress));
                const scrollable = getChapterProgressDistance(el.offsetHeight, container.clientHeight);
                const targetY = el.offsetTop + scrollable * clamped;
                container.scrollTo({ top: targetY, behavior: 'instant' });
            },
        };
        return () => {
            novelSeekHandleRef.current = null;
        };
    }, [currentChapter]);

    const loadPreviousChapter = useCallback(() => {
        if (isPrependingRef.current || pendingPrependChapterIdRef.current !== null || renderedChapters.length === 0) {
            return;
        }
        const [topChapter] = renderedChapters;
        const prevChapter = Chapters.getNextChapter(topChapter, chapters, {
            offset: DirectionOffset.PREVIOUS,
        });
        if (!prevChapter || renderedChapters.some((c) => c.id === prevChapter.id)) {
            return;
        }

        isPrependingRef.current = true;

        const anchorEl = chapterContainerRefs.current.get(topChapter.id);
        if (anchorEl && scrollContainerRef.current) {
            anchorTopRef.current = anchorEl.getBoundingClientRect().top;
            anchorChapterIdRef.current = topChapter.id;
            pendingPrependChapterIdRef.current = prevChapter.id;
        }

        setRenderedChapters((prev) => [prevChapter, ...prev]);

        setTimeout(() => {
            isPrependingRef.current = false;
        }, 300);
    }, [renderedChapters, chapters]);

    const loadNextChapter = useCallback(() => {
        if (isAppendingRef.current || renderedChapters.length === 0) {
            return;
        }
        const bottomChapter = renderedChapters[renderedChapters.length - 1];
        const nextChapter = Chapters.getNextChapter(bottomChapter, chapters, {
            offset: DirectionOffset.NEXT,
        });
        if (!nextChapter || renderedChapters.some((c) => c.id === nextChapter.id)) {
            return;
        }

        isAppendingRef.current = true;
        setRenderedChapters((prev) => [...prev, nextChapter]);

        setTimeout(() => {
            isAppendingRef.current = false;
        }, 300);
    }, [renderedChapters, chapters]);

    const adjustScrollAnchor = useCallback(() => {
        if (anchorChapterIdRef.current !== null && scrollContainerRef.current) {
            const anchorEl = chapterContainerRefs.current.get(anchorChapterIdRef.current);
            if (anchorEl) {
                const currentTop = anchorEl.getBoundingClientRect().top;
                const diff = currentTop - anchorTopRef.current;
                if (Math.abs(diff) > 1) {
                    scrollContainerRef.current.scrollTop += diff;
                    anchorTopRef.current = anchorEl.getBoundingClientRect().top;
                }
            }
        }
    }, []);

    // Scroll anchoring when prepending
    useLayoutEffect(() => {
        adjustScrollAnchor();
        if (pendingPrependChapterIdRef.current === null) {
            anchorChapterIdRef.current = null;
        }
    }, [renderedChapters, adjustScrollAnchor]);

    const handleChapterHeight = useCallback(
        (chapterId: number, _height: number) => {
            const hasReportedHeight = chapterHeightsRef.current.has(chapterId);
            chapterHeightsRef.current.add(chapterId);
            adjustScrollAnchor();
            if (!hasReportedHeight && pendingPrependChapterIdRef.current === chapterId) {
                pendingPrependChapterIdRef.current = null;
                anchorChapterIdRef.current = null;
            }

            const container = scrollContainerRef.current;
            const activeChapterElement = currentChapter && chapterContainerRefs.current.get(currentChapter.id);
            const shouldPreserveActivePosition =
                hasReportedHeight &&
                container &&
                activeChapterElement &&
                pendingRestoreChapterIdRef.current === null &&
                anchorChapterIdRef.current === null;
            const activePositionRatio =
                shouldPreserveActivePosition && currentChapter
                    ? (liveProgressMapRef.current.get(currentChapter.id) ?? currentChapter.textProgress ?? 0)
                    : null;

            // Restore initial progress once on first chapter height measurement
            if (
                currentChapter &&
                chapterId === currentChapter.id &&
                !hasRestoredInitialProgressRef.current &&
                getChapterRestoreProgress(
                    currentChapter,
                    liveProgressMapRef.current.get(chapterId) ?? currentChapter.textProgress ?? 0,
                ) > 0
            ) {
                hasRestoredInitialProgressRef.current = true;
                const prog = getChapterRestoreProgress(
                    currentChapter,
                    liveProgressMapRef.current.get(chapterId) ?? currentChapter.textProgress ?? 0,
                );
                requestAnimationFrame(() => {
                    const restoreContainer = scrollContainerRef.current;
                    const el = chapterContainerRefs.current.get(chapterId);
                    if (restoreContainer && el) {
                        const scrollable = getChapterProgressDistance(el.offsetHeight, restoreContainer.clientHeight);
                        restoreContainer.scrollTop = el.offsetTop + scrollable * prog;
                    }
                    pendingRestoreChapterIdRef.current = null;
                });
            } else if (activePositionRatio !== null && currentChapter) {
                requestAnimationFrame(() => {
                    const restoreContainer = scrollContainerRef.current;
                    const el = chapterContainerRefs.current.get(currentChapter.id);
                    if (restoreContainer && el) {
                        const scrollable = getChapterProgressDistance(el.offsetHeight, restoreContainer.clientHeight);
                        restoreContainer.scrollTop = el.offsetTop + scrollable * activePositionRatio;
                    }
                });
            }
        },
        [currentChapter, adjustScrollAnchor],
    );

    const handleScroll = useCallback(() => {
        const container = scrollContainerRef.current;
        if (!container || renderedChapters.length === 0 || pendingRestoreChapterIdRef.current !== null) {
            return;
        }

        // Auto prepend when near top
        if (container.scrollTop <= 50) {
            loadPreviousChapter();
        }

        // Auto append when near bottom
        const distToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        const shouldLoadNext = distToBottom <= 800;

        // Determine active chapter in reading viewport
        const targetY = container.scrollTop + Math.min(250, container.clientHeight * 0.35);

        let [activeChapter] = renderedChapters;
        let activeIndex = 0;
        for (const [index, chapter] of renderedChapters.entries()) {
            const el = chapterContainerRefs.current.get(chapter.id);
            if (el && el.offsetTop <= targetY) {
                activeChapter = chapter;
                activeIndex = index;
            }
        }

        if (anchorChapterIdRef.current !== null) {
            const anchorEl = chapterContainerRefs.current.get(anchorChapterIdRef.current);
            if (!anchorEl || activeChapter.id !== anchorChapterIdRef.current) {
                anchorChapterIdRef.current = null;
            } else {
                anchorTopRef.current = anchorEl.getBoundingClientRect().top;
            }
        }

        if (renderedChapters.length > 5 && !isPrependingRef.current && !isAppendingRef.current) {
            const start = Math.max(0, Math.min(activeIndex - 2, renderedChapters.length - 5));
            const activeEl = chapterContainerRefs.current.get(activeChapter.id);
            if (activeEl && (!shouldLoadNext || start + 5 === renderedChapters.length)) {
                anchorChapterIdRef.current = activeChapter.id;
                anchorTopRef.current = activeEl.getBoundingClientRect().top;
                setRenderedChapters(renderedChapters.slice(start, start + 5));
            }
        }

        if (activeChapter && activeChapter.id !== currentChapter?.id) {
            internalNavigationChapterIdRef.current = activeChapter.id;
            navigate(AppRoutes.reader.path(activeChapter.mangaId, activeChapter.sourceOrder), { replace: true });
            const ac = activeChapter;
            getReaderChaptersStore().setReaderStateChapters((prev) => ({
                ...prev,
                currentChapter: ac,
                previousChapter: Chapters.getNextChapter(ac, prev.chapters, { offset: DirectionOffset.PREVIOUS }),
                nextChapter: Chapters.getNextChapter(ac, prev.chapters, { offset: DirectionOffset.NEXT }),
            }));
        }

        if (activeChapter) {
            const el = chapterContainerRefs.current.get(activeChapter.id);
            if (el) {
                const elHeight = el.offsetHeight;
                const elTopInContainer = el.offsetTop;
                const scrollWithinChapter = container.scrollTop - elTopInContainer;
                const scrollableDist = getChapterProgressDistance(elHeight, container.clientHeight);
                const progress = Math.min(1.0, Math.max(0.0, scrollWithinChapter / scrollableDist));
                handleProgressChange(activeChapter.id, progress);
            }
        }
        if (shouldLoadNext) {
            loadNextChapter();
        }
    }, [renderedChapters, currentChapter?.id, loadPreviousChapter, loadNextChapter, navigate, handleProgressChange]);

    if (!currentChapter && renderedChapters.length === 0) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            ref={scrollContainerRef}
            data-novel-reader-scroll=""
            onScroll={handleScroll}
            sx={{
                flex: 1,
                position: 'relative',
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                overflowX: 'hidden',
                overflowAnchor: 'none',
                backgroundColor: themeColors.background,
            }}
        >
            {renderedChapters.map((chapter, index) => {
                const prevChapter = index > 0 ? renderedChapters[index - 1] : null;
                return (
                    <React.Fragment key={`${externalNavigationEpoch}-${chapter.id}`}>
                        {prevChapter && (
                            <NovelReaderChapterSeparator previousChapter={prevChapter} currentChapter={chapter} />
                        )}
                        <div
                            id={`novel-chapter-${chapter.id}`}
                            data-chapter-id={chapter.id}
                            data-source-order={chapter.sourceOrder}
                            ref={(el) => {
                                if (el) {
                                    chapterContainerRefs.current.set(chapter.id, el);
                                } else {
                                    chapterContainerRefs.current.delete(chapter.id);
                                    chapterHeightsRef.current.delete(chapter.id);
                                }
                            }}
                            style={{
                                width: '100%',
                                contentVisibility: 'auto',
                                containIntrinsicSize: 'auto none auto 1000px',
                            }}
                        >
                            <NovelReaderChapterItem
                                chapter={chapter}
                                settings={settings}
                                themeColors={themeColors}
                                onToggleControls={() => setIsVisible(!isVisible)}
                                onHeightChange={handleChapterHeight}
                                onLoadFailure={(chapterId) => {
                                    if (pendingRestoreChapterIdRef.current === chapterId) {
                                        pendingRestoreChapterIdRef.current = null;
                                    }
                                    if (pendingPrependChapterIdRef.current === chapterId) {
                                        pendingPrependChapterIdRef.current = null;
                                        anchorChapterIdRef.current = null;
                                    }
                                }}
                                onWheelUp={() => {
                                    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop <= 50) {
                                        loadPreviousChapter();
                                    }
                                }}
                                onWheelDown={() => {
                                    const c = scrollContainerRef.current;
                                    if (c && c.scrollHeight - c.scrollTop - c.clientHeight <= 800) {
                                        const el = chapterContainerRefs.current.get(chapter.id);
                                        const nextChapter = Chapters.getNextChapter(chapter, chapters, {
                                            offset: DirectionOffset.NEXT,
                                        });
                                        if (!nextChapter && el && el.offsetHeight <= c.clientHeight) {
                                            handleProgressChange(chapter.id, 1);
                                        }
                                        loadNextChapter();
                                    }
                                }}
                                onKeyDown={(key) => {
                                    const normalizedKey = normalizeHotkey(key);
                                    const matchesHotkey = (hotkey: ReaderHotkey) =>
                                        hotkeys[hotkey].some(
                                            (configuredKey) => normalizeHotkey(configuredKey) === normalizedKey,
                                        );
                                    const container = scrollContainerRef.current;
                                    if (normalizedKey === 'escape') {
                                        navigate(AppRoutes.manga.path(chapter.mangaId));
                                    } else if (matchesHotkey(ReaderHotkey.PREVIOUS_CHAPTER)) {
                                        ReaderControls.openChapter('previous');
                                    } else if (matchesHotkey(ReaderHotkey.NEXT_CHAPTER)) {
                                        ReaderControls.openChapter('next');
                                    } else if (
                                        matchesHotkey(ReaderHotkey.PREVIOUS_PAGE) ||
                                        matchesHotkey(ReaderHotkey.NEXT_PAGE) ||
                                        matchesHotkey(ReaderHotkey.SCROLL_BACKWARD) ||
                                        matchesHotkey(ReaderHotkey.SCROLL_FORWARD)
                                    ) {
                                        const direction =
                                            matchesHotkey(ReaderHotkey.PREVIOUS_PAGE) ||
                                            matchesHotkey(ReaderHotkey.SCROLL_BACKWARD)
                                                ? -1
                                                : 1;
                                        const isPageNavigation =
                                            matchesHotkey(ReaderHotkey.PREVIOUS_PAGE) ||
                                            matchesHotkey(ReaderHotkey.NEXT_PAGE);
                                        if (container) {
                                            container.scrollBy({
                                                top:
                                                    direction *
                                                    container.clientHeight *
                                                    (isPageNavigation ? 1 : scrollAmount / 100),
                                                behavior: 'smooth',
                                            });
                                        }
                                    } else if (
                                        matchesHotkey(ReaderHotkey.TOGGLE_MENU) ||
                                        normalizedKey === 'h' ||
                                        normalizedKey === 'f'
                                    ) {
                                        setIsVisible(!isVisible);
                                    }
                                }}
                            />
                        </div>
                    </React.Fragment>
                );
            })}
            {/* Allow progress positions inside chapters shorter than the viewport. */}
            <div aria-hidden style={{ height: '100vh' }} />
        </Box>
    );
};
