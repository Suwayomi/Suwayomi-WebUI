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
import { Avatar, Box, CardContent, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IMangaCard } from '@/typings';
import requestManager from '@/lib/RequestManager';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import SpinnerImage from '@/components/util/SpinnerImage';

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
    width: '100%',
    position: 'absolute',
    bottom: 0,
    margin: '0.5em 0',
    padding: '0 0.5em',
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
    manga: IMangaCard;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
}

const MangaCard = (props: IProps) => {
    const { t } = useTranslation();

    const {
        manga: { id, title, thumbnailUrl, downloadCount, unreadCount: unread, inLibrary },
        gridLayout,
        inLibraryIndicator,
    } = props;
    const {
        options: { showUnreadBadge, showDownloadBadge },
    } = useLibraryOptionsContext();

    const mangaLinkTo = `/manga/${id}/`;

    if (gridLayout !== GridLayout.List) {
        return (
            <Link to={mangaLinkTo} style={gridLayout === GridLayout.Comfortable ? { textDecoration: 'none' } : {}}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
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
                            <BadgeContainer
                                sx={{
                                    position: 'absolute',
                                    top: 5,
                                    left: 5,
                                }}
                            >
                                {inLibraryIndicator && inLibrary && (
                                    <Typography sx={{ backgroundColor: 'primary.dark', zIndex: '1' }}>
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
                            {gridLayout !== GridLayout.Comfortable && (
                                <>
                                    <BottomGradient />
                                    <BottomGradientDoubledDown />
                                    <GridMangaTitle
                                        sx={{
                                            color: 'white',
                                            textShadow: '0px 0px 3px #000000',
                                        }}
                                        title={title}
                                    >
                                        {title}
                                    </GridMangaTitle>
                                </>
                            )}
                        </CardActionArea>
                    </Card>
                    {gridLayout === GridLayout.Comfortable && (
                        <GridMangaTitle
                            sx={{
                                position: 'relative',
                                color: 'text.primary',
                                height: '3rem',
                            }}
                            title={title}
                        >
                            {title}
                        </GridMangaTitle>
                    )}
                </Box>
            </Link>
        );
    }

    return (
        <Card>
            <CardActionArea component={Link} to={mangaLinkTo}>
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
                        <MangaTitle variant="h5" title={title}>
                            {title}
                        </MangaTitle>
                    </Box>
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
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default MangaCard;
