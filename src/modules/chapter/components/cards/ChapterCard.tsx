/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CardActionArea from '@mui/material/CardActionArea';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { memo, MouseEvent, TouchEvent, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { useLongPress } from 'use-long-press';
import { getDateString } from '@/util/DateHelper.ts';
import { DownloadStateIndicator } from '@/modules/core/components/DownloadStateIndicator.tsx';
import { ChapterType } from '@/lib/graphql/generated/graphql.ts';
import { ChapterActionMenuItems } from '@/modules/chapter/components/actions/ChapterActionMenuItems.tsx';
import { Menu } from '@/modules/core/components/menu/Menu.tsx';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import {
    ChapterBookmarkInfo,
    ChapterDownloadInfo,
    ChapterIdInfo,
    ChapterMangaInfo,
    ChapterNumberInfo,
    ChapterReadInfo,
    Chapters,
    ChapterScanlatorInfo,
} from '@/modules/chapter/services/Chapters.ts';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';

type TChapter = ChapterIdInfo &
    ChapterMangaInfo &
    ChapterDownloadInfo &
    ChapterReadInfo &
    ChapterBookmarkInfo &
    ChapterNumberInfo &
    ChapterScanlatorInfo &
    Pick<ChapterType, 'name' | 'sourceOrder' | 'uploadDate'>;

interface IProps {
    mode?: 'manga.page' | 'reader';
    chapter: TChapter;
    showChapterNumber: boolean;
    onSelect: (id: number, selected: boolean, isShiftKey?: boolean) => void;
    selected: boolean | null;
    selectable?: boolean;
    isActiveChapter?: boolean; // reader
}

export const ChapterCard = memo((props: IProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const menuButtonRef = useRef<HTMLButtonElement>(null);

    const {
        mode = 'manga.page',
        chapter,
        showChapterNumber,
        onSelect,
        selected,
        selectable = true,
        isActiveChapter = false,
    } = props;
    const isSelecting = selected !== null;

    const { isDownloaded } = chapter;

    const handleClick = (event: MouseEvent | TouchEvent) => {
        if (!isSelecting) return;

        event.preventDefault();
        event.stopPropagation();
        onSelect(chapter.id, !selected, event.shiftKey);
    };

    const handleClickOpenMenu = (
        event: React.MouseEvent | React.TouchEvent,
        openMenu: (e: React.SyntheticEvent) => void,
    ) => {
        event.stopPropagation();
        event.preventDefault();
        openMenu(event);
    };

    const longPressBind = useLongPress((event, { context: openMenu }) => {
        if (!isSelecting && !!menuButtonRef.current) {
            handleClickOpenMenu(event, () => (openMenu as (event: Element) => void)?.(menuButtonRef.current!));
            return;
        }

        // eslint-disable-next-line no-param-reassign
        event.shiftKey = true;
        handleClick(event);
    });

    return (
        <PopupState variant="popover" popupId="chapter-card-action-menu">
            {(popupState) => (
                <Stack sx={{ pt: 1, px: 1 }}>
                    <Card
                        sx={{
                            touchCallout: 'none',
                            ...applyStyles(mode === 'reader' && isActiveChapter, {
                                backgroundColor: 'primary.main',
                            }),
                        }}
                    >
                        <CardActionArea
                            component={Link}
                            to={Chapters.getReaderUrl(chapter)}
                            style={{
                                color: theme.palette.text[chapter.isRead ? 'disabled' : 'primary'],
                            }}
                            state={{ resumeMode: Chapters.getReaderResumeMode(chapter) }}
                            replace={mode === 'reader'}
                            onClick={(e) => handleClick(e)}
                            {...longPressBind(popupState.open)}
                        >
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 1.5,
                                    '&:last-child': { pb: 1.5 },
                                }}
                            >
                                <Stack
                                    direction="column"
                                    sx={{
                                        flex: 1,
                                    }}
                                >
                                    <Stack
                                        sx={{
                                            flexDirection: 'row',
                                            gap: 0.5,
                                            alignItems: 'center',
                                        }}
                                    >
                                        {chapter.isBookmarked && (
                                            <BookmarkIcon
                                                color={mode === 'reader' && isActiveChapter ? 'secondary' : 'primary'}
                                            />
                                        )}
                                        <TypographyMaxLines
                                            variant="h6"
                                            component="h4"
                                            sx={{
                                                ...applyStyles(mode === 'reader' && isActiveChapter, {
                                                    color: theme.palette.primary.contrastText,
                                                }),
                                            }}
                                        >
                                            {showChapterNumber
                                                ? `${t('chapter.title_one')} ${chapter.chapterNumber}`
                                                : chapter.name}
                                        </TypographyMaxLines>
                                    </Stack>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ...applyStyles(mode === 'reader' && isActiveChapter, {
                                                color: theme.palette.primary.contrastText,
                                            }),
                                        }}
                                    >
                                        {chapter.scanlator}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            ...applyStyles(mode === 'reader' && isActiveChapter, {
                                                color: theme.palette.primary.contrastText,
                                            }),
                                        }}
                                    >
                                        {getDateString(Number(chapter.uploadDate ?? 0), true)}
                                        {isDownloaded && ` • ${t('chapter.status.label.downloaded')}`}
                                    </Typography>
                                </Stack>

                                <DownloadStateIndicator
                                    chapterId={chapter.id}
                                    color={
                                        mode === 'reader' && isActiveChapter
                                            ? theme.palette.primary.contrastText
                                            : undefined
                                    }
                                />

                                <Stack sx={{ minHeight: '48px' }}>
                                    {selected === null ? (
                                        <Tooltip title={t('global.button.options')}>
                                            <IconButton
                                                ref={menuButtonRef}
                                                {...bindTrigger(popupState)}
                                                onClick={(e) => handleClickOpenMenu(e, popupState.open)}
                                                aria-label="more"
                                                size="large"
                                                sx={{
                                                    color: 'inherit',
                                                    ...applyStyles(mode === 'reader' && isActiveChapter, {
                                                        color: 'primary.contrastText',
                                                    }),
                                                }}
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Tooltip>
                                    ) : (
                                        <Tooltip
                                            title={t(selected ? 'global.button.deselect' : 'global.button.select')}
                                        >
                                            <Checkbox checked={selected} />
                                        </Tooltip>
                                    )}
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    {!isSelecting && popupState.isOpen && (
                        <Menu {...bindMenu(popupState)}>
                            {(onClose) => (
                                <ChapterActionMenuItems
                                    onClose={onClose}
                                    chapter={chapter}
                                    handleSelection={() => onSelect(chapter.id, true)}
                                    canBeDownloaded={Chapters.isDownloadable(chapter)}
                                    selectable={selectable}
                                />
                            )}
                        </Menu>
                    )}
                </Stack>
            )}
        </PopupState>
    );
});
