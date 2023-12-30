/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import BookmarkIcon from '@mui/icons-material/Bookmark';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { CardActionArea, Checkbox, Stack, Tooltip } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { getUploadDateString } from '@/util/date';
import { DownloadStateIndicator } from '@/components/molecules/DownloadStateIndicator';
import { DownloadType } from '@/lib/graphql/generated/graphql.ts';
import { TChapter } from '@/typings.ts';
import { ChapterActionMenuItems } from '@/components/manga/ChapterActionMenuItems.tsx';
import { Menu } from '@/components/manga/Menu.tsx';

interface IProps {
    chapter: TChapter;
    allChapters: TChapter[];
    downloadChapter: DownloadType | undefined;
    showChapterNumber: boolean;
    onSelect: (selected: boolean) => void;
    selected: boolean | null;
}

export const ChapterCard: React.FC<IProps> = (props: IProps) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const { chapter, allChapters, downloadChapter: dc, showChapterNumber, onSelect, selected } = props;
    const isSelecting = selected !== null;

    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (isSelecting) {
            event.preventDefault();
            event.stopPropagation();
            onSelect(!selected);
        }
    };

    const { isDownloaded } = chapter;

    return (
        <li>
            <PopupState variant="popover" popupId="chapter-card-action-menu">
                {(popupState) => {
                    const bindTriggerProps = bindTrigger(popupState);

                    const preventDefaultAction = (e: React.BaseSyntheticEvent<unknown>) => {
                        e.stopPropagation();
                        e.preventDefault();
                    };

                    const handleClickOpenMenu = (e: React.BaseSyntheticEvent<unknown>) => {
                        preventDefaultAction(e);
                        bindTriggerProps.onClick(e as any);
                    };

                    const handleTouchStart = (e: React.BaseSyntheticEvent<unknown>) => {
                        preventDefaultAction(e);
                        bindTriggerProps.onTouchStart(e as TouchEvent);
                    };

                    return (
                        <>
                            <Card
                                sx={{
                                    position: 'relative',
                                    margin: 1,
                                }}
                            >
                                <CardActionArea
                                    component={Link}
                                    to={`/manga/${chapter.manga.id}/chapter/${chapter.sourceOrder}`}
                                    style={{
                                        color: theme.palette.text[chapter.isRead ? 'disabled' : 'primary'],
                                    }}
                                    onClick={handleClick}
                                >
                                    <CardContent
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: 2,
                                            '&:last-child': { pb: 2 },
                                        }}
                                    >
                                        <Stack direction="column" flex={1}>
                                            <Typography variant="h5" component="h2">
                                                {chapter.isBookmarked && (
                                                    <BookmarkIcon
                                                        color="primary"
                                                        sx={{ mr: 0.5, position: 'relative', top: '0.15em' }}
                                                    />
                                                )}
                                                {showChapterNumber
                                                    ? `${t('chapter.title')} ${chapter.chapterNumber}`
                                                    : chapter.name}
                                            </Typography>
                                            <Typography variant="caption">{chapter.scanlator}</Typography>
                                            <Typography variant="caption">
                                                {getUploadDateString(Number(chapter.uploadDate ?? 0))}
                                                {isDownloaded && ` • ${t('chapter.status.label.downloaded')}`}
                                            </Typography>
                                        </Stack>

                                        {dc && <DownloadStateIndicator download={dc} />}

                                        {selected === null ? (
                                            <Tooltip title={t('global.button.options')}>
                                                <IconButton
                                                    {...bindTriggerProps}
                                                    onClick={handleClickOpenMenu}
                                                    onTouchStart={handleTouchStart}
                                                    aria-label="more"
                                                    size="large"
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
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                            {!isSelecting && popupState.isOpen && (
                                <Menu {...bindMenu(popupState)}>
                                    {(onClose) => (
                                        <ChapterActionMenuItems
                                            onClose={onClose}
                                            chapter={chapter}
                                            allChapters={allChapters}
                                            handleSelection={() => onSelect(true)}
                                            canBeDownloaded={!chapter.isDownloaded && !dc}
                                        />
                                    )}
                                </Menu>
                            )}
                        </>
                    );
                }}
            </PopupState>
        </li>
    );
};
