/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Slide from '@mui/material/Slide';
import { memo } from 'react';
import { useGetOptionForDirection } from '@/modules/theme/services/ThemeCreator.ts';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import {
    ReaderStateChapters,
    TReaderScrollbarContext,
    TReaderStateMangaContext,
} from '@/modules/reader/types/Reader.types.ts';
import { withPropsFrom } from '@/modules/core/hoc/withPropsFrom.tsx';
import { useReaderStateMangaContext } from '@/modules/reader/contexts/state/ReaderStateMangaContext.tsx';
import { useReaderStateChaptersContext } from '@/modules/reader/contexts/state/ReaderStateChaptersContext.tsx';
import { useReaderScrollbarContext } from '@/modules/reader/contexts/ReaderScrollbarContext.tsx';

const DEFAULT_MANGA = { id: -1, title: '' };
const DEFAULT_CHAPTER = { id: -1, name: '', realUrl: '', isBookmarked: false };

const BaseReaderOverlayHeaderMobile = ({
    isVisible,
    manga,
    currentChapter,
    scrollbarYSize,
}: MobileHeaderProps &
    Pick<TReaderStateMangaContext, 'manga'> &
    Pick<ReaderStateChapters, 'currentChapter'> &
    Pick<TReaderScrollbarContext, 'scrollbarYSize'>) => {
    const { t } = useTranslation();
    const getOptionForDirection = useGetOptionForDirection();
    const handleBack = useBackButton();
    const popupState = usePopupState({ popupId: 'reader-overlay-more-menu', variant: 'popover' });

    const { id: mangaId, title } = manga ?? DEFAULT_MANGA;
    const { id: chapterId, name, realUrl, isBookmarked } = currentChapter ?? DEFAULT_CHAPTER;

    const bookmarkAction: Extract<ChapterAction, 'unbookmark' | 'bookmark'> = currentChapter?.isBookmarked
        ? 'unbookmark'
        : 'bookmark';

    return (
        <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
            <Stack
                sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: `${scrollbarYSize}px`,
                    p: 2,
                    pt: (theme) => `max(env(safe-area-inset-top), ${theme.spacing(2)})`,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                    pointerEvents: 'all',
                    boxShadow: 2,
                }}
            >
                <Tooltip title={t('reader.button.exit')}>
                    <IconButton sx={{ marginRight: 2 }} onClick={handleBack} color="inherit">
                        {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                    </IconButton>
                </Tooltip>
                <Stack sx={{ flexGrow: 1 }}>
                    {manga && currentChapter ? (
                        <>
                            <Tooltip title={title}>
                                <TypographyMaxLines lines={1} component="h1" variant="h5">
                                    <Link
                                        component={RouterLink}
                                        to={AppRoutes.manga.path(mangaId)}
                                        sx={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {title}
                                    </Link>
                                </TypographyMaxLines>
                            </Tooltip>
                            <Tooltip title={name}>
                                <TypographyMaxLines lines={1}>{name}</TypographyMaxLines>
                            </Tooltip>
                        </>
                    ) : (
                        <LoadingPlaceholder />
                    )}
                </Stack>
                <Tooltip title={t(actionToTranslationKey[bookmarkAction].action.single)}>
                    <IconButton onClick={() => Chapters.performAction(bookmarkAction, [chapterId], {})} color="inherit">
                        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                </Tooltip>
                <IconButton {...bindTrigger(popupState)} color="inherit">
                    <MoreVertIcon />
                </IconButton>
                <Menu {...bindMenu(popupState)}>
                    <MenuItem
                        component={Link}
                        disabled={!realUrl}
                        href={realUrl ?? ''}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {t('chapter.action.label.open_on_source')}
                    </MenuItem>
                    <MenuItem
                        disabled={!realUrl}
                        onClick={async () => {
                            await navigator.clipboard.writeText(title);
                            makeToast(t('global.label.copied_clipboard'), 'info');
                        }}
                    >
                        {t('global.label.share')}
                    </MenuItem>
                </Menu>
            </Stack>
        </Slide>
    );
};

export const ReaderOverlayHeaderMobile = withPropsFrom(
    memo(BaseReaderOverlayHeaderMobile),
    [useReaderStateMangaContext, useReaderStateChaptersContext, useReaderScrollbarContext],
    ['manga', 'currentChapter', 'scrollbarYSize'],
);
