/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { Avatar, CardContent, Grid } from '@mui/material';
import useLocalStorage from 'util/useLocalStorage';
import SpinnerImage from 'components/util/SpinnerImage';
import { Box, styled } from '@mui/system';
import { useLibraryOptionsContext } from 'components/context/LibraryOptionsContext';

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
    position: 'absolute',
    bottom: 0,
    padding: '0.5em',
    color: 'white',
    fontSize: '1.05rem',
    textShadow: '0px 0px 3px #000000',
});

const BadgeContainer = styled('div')({
    display: 'flex',
    position: 'absolute',
    top: 5,
    left: 5,
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

const truncateText = (str: string, maxLength: number) => {
    const ending = '...';
    // trim the string to the maximum length
    const trimmedString = str.substr(0, maxLength - ending.length);

    if (trimmedString.length < str.length) {
        return trimmedString + ending;
    }
    return str;
};

interface IProps {
    manga: IMangaCard
    gridLayout: number | undefined
}
const MangaCard = React.forwardRef<HTMLDivElement, IProps>((props: IProps, ref) => {
    const {
        manga: {
            id, title, thumbnailUrl, downloadCount, unreadCount: unread,
        },
        gridLayout,
    } = props;
    const { options: { showUnreadBadge, showDownloadBadge } } = useLibraryOptionsContext();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    if (gridLayout !== 2) {
        return (
            <Grid item xs={6} sm={4} md={3} lg={2}>
                <Link to={`/manga/${id}/`} style={(gridLayout === 1) ? { textDecoration: 'none' } : {}}>
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
                            ref={ref}
                        >
                            <CardActionArea
                                sx={{
                                    position: 'relative',
                                    height: '100%',
                                }}
                            >

                                <BadgeContainer>
                                    { showUnreadBadge && unread! > 0 && (
                                        <Typography
                                            sx={{ backgroundColor: 'primary.dark' }}
                                        >
                                            {unread}
                                        </Typography>
                                    )}
                                    { showDownloadBadge && downloadCount! > 0 && (
                                        <Typography sx={{
                                            backgroundColor: 'success.dark',
                                        }}
                                        >
                                            {downloadCount}
                                        </Typography>
                                    )}
                                </BadgeContainer>
                                <SpinnerImage
                                    alt={title}
                                    src={`${serverAddress}${thumbnailUrl}?useCache=${useCache}`}
                                    imgStyle={{
                                        height: '100%',
                                        width: '100%',
                                        objectFit: 'cover',
                                    }}
                                    spinnerStyle={{
                                        display: 'grid',
                                        placeItems: 'center',
                                    }}
                                />
                                {(gridLayout === 1) ? (<></>) : (
                                    <>
                                        <BottomGradient />
                                        <BottomGradientDoubledDown />
                                    </>
                                )}
                                {(gridLayout === 1) ? (
                                    <></>
                                ) : (
                                    <MangaTitle>
                                        {truncateText(title, 61)}
                                    </MangaTitle>
                                )}
                            </CardActionArea>
                        </Card>
                        {(gridLayout === 1) ? (
                            <MangaTitle
                                sx={{
                                    position: 'relative',
                                }}
                            >
                                {truncateText(title, 61)}
                            </MangaTitle>
                        ) : (<></>)}
                    </Box>
                </Link>
            </Grid>
        );
    }
    return (
        <Grid item xs={12} sm={12} md={12} lg={12}>
            <Link to={`/manga/${id}/`} style={{ textDecoration: 'none', color: 'unset' }}>
                <CardContent sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 2,
                    '&:hover': {
                        backgroundColor: 'action.hover',
                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    },
                    '&:active': {
                        backgroundColor: 'action.selected',
                        transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                    },
                    position: 'relative',
                }}
                >
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 56,
                            height: 56,
                            flex: '0 0 auto',
                            marginRight: 2,
                            imageRendering: 'pixelated',
                        }}
                        src={`${serverAddress}${thumbnailUrl}?useCache=${useCache}`}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexGrow: 1,
                            width: 'min-content',
                        }}
                    >
                        <Typography variant="h5" component="h2">
                            {truncateText(title, 61)}
                        </Typography>
                    </Box>
                    <BadgeContainer sx={{ position: 'relative' }}>
                        { showUnreadBadge && unread! > 0 && (
                            <Typography
                                sx={{ backgroundColor: 'primary.dark' }}
                            >
                                {unread}
                            </Typography>
                        )}
                        { showDownloadBadge && downloadCount! > 0 && (
                            <Typography sx={{
                                backgroundColor: 'success.dark',
                            }}
                            >
                                {downloadCount}
                            </Typography>
                        )}
                    </BadgeContainer>
                </CardContent>
            </Link>
        </Grid>
    );
});

export default MangaCard;
