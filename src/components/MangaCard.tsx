/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { Avatar, Box, CardContent, Stack, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React from 'react';
import PopupState, { bindMenu } from 'material-ui-popup-state';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { SpinnerImage } from '@/components/util/SpinnerImage';
import { TManga, TPartialManga } from '@/typings.ts';
import { ContinueReadingButton } from '@/components/manga/ContinueReadingButton.tsx';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { MangaOptionButton } from '@/components/manga/MangaOptionButton.tsx';
import { MangaActionMenu } from '@/components/manga/MangaActionMenu.tsx';

const BottomGradient = styled('div')({
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '30%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
});

const BottomGradientDoubledDown = styled('div')({
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '20%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
});

const MangaTitle = styled(Typography)({
    lineHeight: '1.5rem',
    maxHeight: '3rem',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
});

const GridMangaTitle = styled(MangaTitle)({
    fontSize: '1.05rem',
});

const BadgeContainer = styled('div')({
    display: 'flex',
    height: 'fit-content',
    borderRadius: '5px',
    overflow: 'hidden',
    '& p': {
        color: 'white',
        padding: '0.1em',
        paddingInline: '0.2em',
        fontSize: '1.05rem',
    },
});

interface IProps {
    manga: TPartialManga;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
}

export const MangaCard = (props: IProps) => {
    const { t } = useTranslation();

    const { manga, gridLayout, inLibraryIndicator, selected, handleSelection } = props;
    const {
        id,
        title,
        thumbnailUrl: tmpThumbnailUrl,
        downloadCount,
        unreadCount: unread,
        inLibrary,
        lastReadChapter,
        chapters,
    } = manga;
    const thumbnailUrl = tmpThumbnailUrl ?? 'nonExistingMangaUrl';
    const {
        options: { showContinueReadingButton, showUnreadBadge, showDownloadBadge },
    } = useLibraryOptionsContext();

    const mangaLinkTo = `/manga/${id}/`;

    const nextChapterIndexToRead = (lastReadChapter?.sourceOrder ?? 0) + 1;
    const isLatestChapterRead = chapters?.totalCount === lastReadChapter?.sourceOrder;

    if (gridLayout !== GridLayout.List) {
        return (
            <PopupState variant="popover" popupId="manga-card-action-menu">
                {(popupState) => (
                    <>
                        <Link
                            onClick={(e) => {
                                if (selected === null) {
                                    return;
                                }

                                e.preventDefault();
                                handleSelection?.(id, !selected);
                            }}
                            to={mangaLinkTo}
                            style={gridLayout === GridLayout.Comfortable ? { textDecoration: 'none' } : {}}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    margin: '2px',
                                    outline: selected ? '4px solid' : undefined,
                                    borderRadius: selected ? '1px' : undefined,
                                    outlineColor: (theme) => theme.palette.primary.main,
                                    backgroundColor: (theme) => (selected ? theme.palette.primary.main : undefined),
                                    '@media (hover: hover) and (pointer: fine)': {
                                        '&:hover .manga-option-button': {
                                            visibility: 'visible',
                                            pointerEvents: 'all',
                                        },
                                    },
                                }}
                            >
                                <Card
                                    sx={{
                                        // force standard aspect ratio of manga covers
                                        aspectRatio: '225/350',
                                        display: 'flex',
                                    }}
                                >
                                    <CardActionArea
                                        sx={{
                                            position: 'relative',
                                            height: '100%',
                                        }}
                                    >
                                        <Stack
                                            alignItems="start"
                                            justifyContent="space-between"
                                            direction="row"
                                            sx={{
                                                position: 'absolute',
                                                top: 5,
                                                left: 5,
                                                right: 5,
                                            }}
                                        >
                                            <BadgeContainer>
                                                {inLibraryIndicator && inLibrary && (
                                                    <Typography sx={{ backgroundColor: 'primary.dark', zIndex: '1' }}>
                                                        {t('manga.button.in_library')}
                                                    </Typography>
                                                )}
                                                {showUnreadBadge && (unread ?? 0) > 0 && (
                                                    <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                        {unread}
                                                    </Typography>
                                                )}
                                                {showDownloadBadge && (downloadCount ?? 0) > 0 && (
                                                    <Typography
                                                        sx={{
                                                            backgroundColor: 'success.dark',
                                                        }}
                                                    >
                                                        {downloadCount}
                                                    </Typography>
                                                )}
                                            </BadgeContainer>
                                            <MangaOptionButton
                                                popupState={popupState}
                                                id={id}
                                                selected={selected}
                                                handleSelection={handleSelection}
                                            />
                                        </Stack>
                                        <SpinnerImage
                                            alt={title}
                                            src={requestManager.getValidImgUrlFor(thumbnailUrl)}
                                            imgStyle={
                                                inLibraryIndicator && inLibrary
                                                    ? {
                                                          height: '100%',
                                                          width: '100%',
                                                          objectFit: 'cover',
                                                          filter: 'brightness(0.4)',
                                                      }
                                                    : {
                                                          height: '100%',
                                                          width: '100%',
                                                          objectFit: 'cover',
                                                      }
                                            }
                                            spinnerStyle={{
                                                display: 'grid',
                                                placeItems: 'center',
                                            }}
                                        />
                                        <>
                                            {gridLayout !== GridLayout.Comfortable && (
                                                <>
                                                    <BottomGradient />
                                                    <BottomGradientDoubledDown />
                                                </>
                                            )}
                                            <Stack
                                                direction="row"
                                                justifyContent={
                                                    gridLayout !== GridLayout.Comfortable ? 'space-between' : 'end'
                                                }
                                                alignItems="end"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    width: '100%',
                                                    margin: '0.5em 0',
                                                    padding: '0 0.5em',
                                                    gap: '0.5em',
                                                }}
                                            >
                                                {gridLayout !== GridLayout.Comfortable && (
                                                    <Tooltip title={title} placement="top">
                                                        <GridMangaTitle
                                                            sx={{
                                                                color: 'white',
                                                                textShadow: '0px 0px 3px #000000',
                                                            }}
                                                        >
                                                            {title}
                                                        </GridMangaTitle>
                                                    </Tooltip>
                                                )}
                                                <ContinueReadingButton
                                                    showContinueReadingButton={showContinueReadingButton}
                                                    isLatestChapterRead={isLatestChapterRead}
                                                    nextChapterIndexToRead={nextChapterIndexToRead}
                                                    mangaLinkTo={mangaLinkTo}
                                                />
                                            </Stack>
                                        </>
                                    </CardActionArea>
                                </Card>
                                {gridLayout === GridLayout.Comfortable && (
                                    <Tooltip title={title} placement="top">
                                        <GridMangaTitle
                                            sx={{
                                                position: 'relative',
                                                width: '100%',
                                                bottom: 0,
                                                margin: '0.5em 0',
                                                padding: '0 0.5em',
                                                color: 'text.primary',
                                                height: '3rem',
                                            }}
                                        >
                                            {title}
                                        </GridMangaTitle>
                                    </Tooltip>
                                )}
                            </Box>
                        </Link>
                        {!!handleSelection && popupState.isOpen && (
                            <MangaActionMenu
                                {...bindMenu(popupState)}
                                manga={manga as React.ComponentProps<typeof MangaActionMenu>['manga']}
                                handleSelection={handleSelection}
                            />
                        )}
                    </>
                )}
            </PopupState>
        );
    }

    return (
        <PopupState variant="popover" popupId="manga-card-action-menu">
            {(popupState) => (
                <>
                    <Card>
                        <CardActionArea
                            component={Link}
                            to={mangaLinkTo}
                            onClick={(e) => {
                                if (selected === null) {
                                    return;
                                }

                                e.preventDefault();
                                handleSelection?.(id, !selected);
                            }}
                        >
                            <CardContent
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 2,
                                    position: 'relative',
                                }}
                            >
                                <Avatar
                                    variant="rounded"
                                    sx={
                                        inLibraryIndicator && inLibrary
                                            ? {
                                                  width: 56,
                                                  height: 56,
                                                  flex: '0 0 auto',
                                                  marginRight: 2,
                                                  imageRendering: 'pixelated',
                                                  filter: 'brightness(0.4)',
                                              }
                                            : {
                                                  width: 56,
                                                  height: 56,
                                                  flex: '0 0 auto',
                                                  marginRight: 2,
                                                  imageRendering: 'pixelated',
                                              }
                                    }
                                    src={requestManager.getValidImgUrlFor(thumbnailUrl)}
                                />
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexGrow: 1,
                                        width: 'min-content',
                                    }}
                                >
                                    <Tooltip title={title} placement="top">
                                        <MangaTitle variant="h5">{title}</MangaTitle>
                                    </Tooltip>
                                </Box>
                                <Stack direction="row" alignItems="center" gap="5px">
                                    <BadgeContainer>
                                        {inLibraryIndicator && inLibrary && (
                                            <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                {t('manga.button.in_library')}
                                            </Typography>
                                        )}
                                        {showUnreadBadge && unread! > 0 && (
                                            <Typography sx={{ backgroundColor: 'primary.dark' }}>{unread}</Typography>
                                        )}
                                        {showDownloadBadge && downloadCount! > 0 && (
                                            <Typography
                                                sx={{
                                                    backgroundColor: 'success.dark',
                                                }}
                                            >
                                                {downloadCount}
                                            </Typography>
                                        )}
                                    </BadgeContainer>
                                    <ContinueReadingButton
                                        showContinueReadingButton={showContinueReadingButton}
                                        isLatestChapterRead={isLatestChapterRead}
                                        nextChapterIndexToRead={nextChapterIndexToRead}
                                        mangaLinkTo={mangaLinkTo}
                                    />
                                    <MangaOptionButton
                                        popupState={popupState}
                                        id={id}
                                        selected={selected}
                                        handleSelection={handleSelection}
                                        asCheckbox
                                    />
                                </Stack>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                    {!!handleSelection && popupState.isOpen && (
                        <MangaActionMenu
                            {...bindMenu(popupState)}
                            manga={manga as React.ComponentProps<typeof MangaActionMenu>['manga']}
                            handleSelection={handleSelection}
                        />
                    )}
                </>
            )}
        </PopupState>
    );
};
