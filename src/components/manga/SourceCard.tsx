/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FiberNewOutlinedIcon from '@mui/icons-material/FiberNewOutlined';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import useLocalStorage from 'util/useLocalStorage';
import { langCodeToName } from 'util/language';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    bullet: {
        display: 'inline-block',
        margin: '0 2px',
        transform: 'scale(0.8)',
    },
    title: {
        fontSize: 14,
    },
    pos: {
        marginBottom: 12,
    },
    icon: {
        width: theme.spacing(7),
        height: theme.spacing(7),
        flex: '0 0 auto',
        marginRight: 16,
    },
    card: {
        margin: '10px',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
        '&:active': {
            backgroundColor: theme.palette.action.selected,
            transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
        },
    },
    showMobile: {
        display: 'flex',
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    showBigger: {
        display: 'flex',
        [theme.breakpoints.down('sm')]: {
            display: 'none',
        },
    },
}));

interface IProps {
    source: ISource
}

export default function SourceCard(props: IProps) {
    const {
        source: {
            id, name, lang, iconUrl, supportsLatest,
        },
    } = props;

    const history = useHistory();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    const classes = useStyles();

    const redirectTo = (e: any, to: string) => {
        history.push(to);

        // prevent parent tags from getting the event
        e.stopPropagation();
    };

    return (
        <Card
            className={classes.card}
            onClick={(e) => redirectTo(e, `/sources/${id}/popular/`)}
        >
            <CardContent className={classes.root}>

                <div style={{ display: 'flex' }}>
                    <Avatar
                        variant="rounded"
                        className={classes.icon}
                        alt={name}
                        src={`${serverAddress}${iconUrl}?useCache=${useCache}`}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" component="h2">
                            {name}
                        </Typography>
                        <Typography variant="caption" display="block" gutterBottom>
                            {langCodeToName(lang)}
                        </Typography>
                    </div>
                </div>
                <div>
                    <div className={classes.showMobile}>
                        <IconButton
                            style={{ width: 59, height: 59 }}
                            onClick={(e) => redirectTo(e, `/sources/${id}/search/`)}
                            size="large"
                            edge="end"
                        >
                            <SearchIcon
                                fontSize="medium"
                            />
                        </IconButton>
                        {supportsLatest && (
                            <IconButton
                                onClick={(e) => redirectTo(e, `/sources/${id}/latest/`)}
                                size="large"
                            >
                                <FiberNewOutlinedIcon
                                    fontSize="large"
                                />
                            </IconButton>
                        )}
                    </div>
                    <div className={classes.showBigger}>
                        <Button
                            variant="outlined"
                            style={{ marginLeft: 20 }}
                            onClick={(e) => redirectTo(e, `/sources/${id}/search/`)}
                        >
                            Search
                        </Button>
                        {supportsLatest && (
                            <Button
                                variant="outlined"
                                style={{ marginLeft: 20 }}
                                onClick={(e) => redirectTo(e, `/sources/${id}/latest/`)}
                            >
                                Latest
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            style={{ marginLeft: 20 }}
                            onClick={(e: any) => redirectTo(e, `/sources/${id}/popular/`)}
                        >
                            Browse
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
