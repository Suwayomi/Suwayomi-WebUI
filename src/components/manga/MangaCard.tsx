/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { Grid } from '@mui/material';
import useLocalStorage from 'util/useLocalStorage';
import SpinnerImage from 'components/SpinnerImage';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100%',
        width: '100%',
        display: 'flex',
    },
    wrapper: {
        position: 'relative',
        height: '100%',
    },
    gradient: {
        position: 'absolute',
        top: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(to bottom, transparent, #000000)',
        opacity: 0.5,
    },
    title: {
        position: 'absolute',
        bottom: 0,
        padding: '0.5em',
        color: 'white',
        fontSize: '1.05rem',
        textShadow: '0px 0px 3px #000000',
    },
    badge: {
        position: 'absolute',
        top: 2,
        left: 2,
        backgroundColor: theme.palette.primary.dark,
        borderRadius: 5,
        color: 'white',
        padding: '0.1em',
        paddingInline: '0.3em',
        fontSize: '1.05rem',
    },
    image: {
        height: '100%',
        width: '100%',
    },

    spinner: {
        minHeight: '400px',
        display: 'grid',
        placeItems: 'center',
    },
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
    const classes = useStyles();
    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    return (
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Link to={`/manga/${id}/`}>
                <Card className={classes.root} ref={ref}>
                    <CardActionArea>
                        <div className={classes.wrapper}>
                            {unread
                                ? (
                                    <Typography className={classes.badge} component="span">
                                        {unread}
                                    </Typography>
                                )
                                : null}
                            <SpinnerImage
                                alt={title}
                                src={`${serverAddress}${thumbnailUrl}?useCache=${useCache}`}
                                spinnerClassName={classes.spinner}
                                imgClassName={classes.image}
                            />
                            <div className={classes.gradient} />
                            <Typography className={classes.title}>
                                {truncateText(title, 61)}
                            </Typography>
                        </div>
                    </CardActionArea>
                </Card>
            </Link>
        </Grid>
    );
});

export default MangaCard;
