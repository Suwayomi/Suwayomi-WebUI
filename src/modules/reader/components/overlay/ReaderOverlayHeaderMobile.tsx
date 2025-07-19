/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import MenuItem from '@mui/material/MenuItem';
import { useTranslation } from 'react-i18next';
import Menu from '@mui/material/Menu';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Slide from '@mui/material/Slide';
import { forwardRef, memo } from 'react';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/modules/core/components/texts/TypographyMaxLines.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';
import { LoadingPlaceholder } from '@/modules/core/components/feedback/LoadingPlaceholder';
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
import { ReaderLibraryButton } from '@/modules/reader/components/overlay/navigation/ReaderLibraryButton.tsx';
import { ReaderBookmarkButton } from '@/modules/reader/components/overlay/navigation/ReaderBookmarkButton.tsx';
import { FALLBACK_CHAPTER } from '@/modules/chapter/Chapter.constants.ts';
import { FALLBACK_MANGA } from '@/modules/manga/Manga.constants.ts';
import { ReaderExitButton } from '@/modules/reader/components/overlay/navigation/ReaderExitButton.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';

const DEFAULT_MANGA = { ...FALLBACK_MANGA, title: '' };

const BaseReaderOverlayHeaderMobile = forwardRef<
    HTMLDivElement,
    MobileHeaderProps &
        Pick<TReaderStateMangaContext, 'manga'> &
        Pick<ReaderStateChapters, 'currentChapter'> &
        Pick<TReaderScrollbarContext, 'scrollbarYSize'>
>(({ isVisible, manga, currentChapter, scrollbarYSize }, ref) => {
    const { t } = useTranslation();
    const popupState = usePopupState({ popupId: 'reader-overlay-more-menu', variant: 'popover' });

    const { id: mangaId, title } = manga ?? DEFAULT_MANGA;
    const { id: chapterId, name, realUrl, isBookmarked } = currentChapter ?? FALLBACK_CHAPTER;

    return (
        <Slide direction="down" in={isVisible} ref={ref}>
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
                <ReaderExitButton />
                <Stack sx={{ flexGrow: 1 }}>
                    {manga && currentChapter ? (
                        <>
                            <CustomTooltip title={title}>
                                <TypographyMaxLines lines={1} component="h1" variant="h5">
                                    <Link
                                        component={RouterLink}
                                        to={AppRoutes.manga.path(mangaId)}
                                        sx={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        {title}
                                    </Link>
                                </TypographyMaxLines>
                            </CustomTooltip>
                            <CustomTooltip title={name}>
                                <TypographyMaxLines lines={1}>{name}</TypographyMaxLines>
                            </CustomTooltip>
                        </>
                    ) : (
                        <LoadingPlaceholder />
                    )}
                </Stack>
                <ReaderLibraryButton />
                <ReaderBookmarkButton id={chapterId} isBookmarked={isBookmarked} />
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
                        {t('global.button.open_browser')}
                    </MenuItem>
                    <MenuItem
                        component={Link}
                        disabled={!realUrl}
                        href={realUrl ? requestManager.getWebviewUrl(realUrl) : ''}
                        rel="noreferrer"
                        target="_blank"
                    >
                        {t('global.button.open_webview')}
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
});

export const ReaderOverlayHeaderMobile = withPropsFrom(
    memo(BaseReaderOverlayHeaderMobile),
    [useReaderStateMangaContext, useReaderStateChaptersContext, useReaderScrollbarContext],
    ['manga', 'currentChapter', 'scrollbarYSize'],
);
