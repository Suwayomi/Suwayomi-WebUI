/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import { useTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Link, useHistory } from 'react-router-dom';
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transition: 'background-color 0ms ease',
        },
        '&:active': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            transition: 'background-color 100ms ease-out',
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            id, name, lang, iconUrl, supportsLatest, isConfigurable,
        },
    } = props;

    const theme = useTheme();
    const history = useHistory();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');

    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <Link
                to={`/sources/${id}/popular/`}
                style={{
                    textDecoration: 'none',
                    color: theme.palette.text.primary,
                }}
            >
                <CardContent className={classes.root}>

                    <div style={{ display: 'flex' }}>
                        <Avatar
                            variant="rounded"
                            className={classes.icon}
                            alt={name}
                            src={serverAddress + iconUrl}
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
                                onClick={() => history.push(`/sources/${id}/search/`)}
                                size="large"
                                edge="end"
                            >
                                <SearchIcon
                                    fontSize="medium"
                                />
                            </IconButton>
                            {supportsLatest && (
                                <IconButton
                                    onClick={() => history.push(`/sources/${id}/latest/`)}
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
                                onClick={() => history.push(`/sources/${id}/search/`)}
                            >
                                Search
                            </Button>
                            {supportsLatest && (
                                <Button
                                    variant="outlined"
                                    style={{ marginLeft: 20 }}
                                    onClick={() => history.push(`/sources/${id}/latest/`)}
                                >
                                    Latest
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                style={{ marginLeft: 20 }}
                                onClick={() => history.push(`/sources/${id}/popular/`)}
                            >
                                Browse
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Link>
        </Card>
    );
}
