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
import { Grid } from '@mui/material';
import useLocalStorage from 'util/useLocalStorage';
import SpinnerImage from 'components/util/SpinnerImage';
import { styled } from '@mui/system';

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

const UnreadBadge = styled(Typography)(({ theme }) => ({
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: theme.palette.primary.dark,
    borderRadius: '5px',
    color: 'white',
    padding: '0.1em',
    paddingInline: '0.3em',
    fontSize: '1.05rem',
}));

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
}
const MangaCard = React.forwardRef<HTMLDivElement, IProps>((props: IProps, ref) => {
    const {
        manga: {
            id, title, thumbnailUrl, unreadCount: unread,
        },
    } = props;

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    return (
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to={`/manga/${id}/`}>
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
                        {unread! > 0
                            && (
                                <UnreadBadge>
                                    {unread}
                                </UnreadBadge>
                            ) }
                        <SpinnerImage
                            alt={title}
                            src={`${serverAddress}${thumbnailUrl}?useCache=${useCache}`}
                            imgStyle={{
                                height: '100%',
                                width: '100%',
                            }}
                            spinnerStyle={{
                                minHeight: '400px',
                                display: 'grid',
                                placeItems: 'center',
                            }}
                        />
                        <BottomGradient />
                        <BottomGradientDoubledDown />

                        <MangaTitle>
                            {truncateText(title, 61)}
                        </MangaTitle>
                    </CardActionArea>
                </Card>
            </Link>
        </Grid>
    );
});

export default MangaCard;
