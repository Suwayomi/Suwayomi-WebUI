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
import { useGetOptionForDirection } from '@/theme.tsx';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { actionToTranslationKey, ChapterAction, Chapters } from '@/modules/chapter/services/Chapters.ts';
import { useBackButton } from '@/modules/core/hooks/useBackButton.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { MobileHeaderProps } from '@/modules/reader/types/ReaderOverlay.types.ts';

export const ReaderOverlayHeaderMobile = ({
    manga: { id: mangaId, title },
    chapter: { id: chapterId, name, realUrl, isBookmarked },
    isVisible,
}: MobileHeaderProps) => {
    const { t } = useTranslation();
    const getOptionForDirection = useGetOptionForDirection();
    const handleBack = useBackButton();
    const popupState = usePopupState({ popupId: 'reader-overlay-more-menu', variant: 'popover' });

    const bookmarkAction: Extract<ChapterAction, 'unbookmark' | 'bookmark'> = isBookmarked ? 'unbookmark' : 'bookmark';

    return (
        <Slide direction="down" in={isVisible} mountOnEnter unmountOnExit>
            <Stack
                sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    p: 2,
                    backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.95),
                    pointerEvents: 'all',
                }}
            >
                <Tooltip title={t('reader.button.exit')}>
                    <IconButton sx={{ marginRight: 2 }} onClick={handleBack} color="inherit">
                        {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                    </IconButton>
                </Tooltip>
                <Stack sx={{ flexGrow: 1 }}>
                    <Tooltip title={title}>
                        <TypographyMaxLines lines={1} component="h1" variant="h5">
                            <Link
                                component={RouterLink}
                                to={`/manga/${mangaId}`}
                                sx={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                {title}
                            </Link>
                        </TypographyMaxLines>
                    </Tooltip>
                    <Tooltip title={name}>
                        <TypographyMaxLines lines={1}>{name}</TypographyMaxLines>
                    </Tooltip>
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
