/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useHistory } from 'react-router-dom';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import useLocalStorage from 'util/useLocalStorage';
import { langCodeToName } from 'util/language';
import { Box, styled } from '@mui/system';

const MobileWidthButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
        display: 'none',
    },
}));

const WiderWidthButtons = styled('div')(({ theme }) => ({
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
        display: 'none',
    },

    '& .MuiButton-root': {
        marginLeft: '20px',
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

    const redirectTo = (e: any, to: string) => {
        history.push(to);

        // prevent parent tags from getting the event
        e.stopPropagation();
    };

    return (
        <Card
            sx={{
                margin: '10px',
                '&:hover': {
                    backgroundColor: 'action.hover',
                    transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                },
                '&:active': {
                    backgroundColor: 'action.selected',
                    transition: 'background-color 100ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                },
            }}
            onClick={(e) => redirectTo(e, `/sources/${id}/popular/`)}
        >
            <CardContent sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 2,
            }}
            >

                <Box sx={{ display: 'flex' }}>
                    <Avatar
                        variant="rounded"
                        alt={name}
                        sx={{
                            width: 56,
                            height: 56,
                            flex: '0 0 auto',
                            mr: 2,
                        }}
                        src={`${serverAddress}${iconUrl}?useCache=${useCache}`}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h5" component="h2">
                            {name}
                        </Typography>
                        {id !== '0' && (
                            <Typography variant="caption" display="block" gutterBottom>
                                {langCodeToName(lang)}
                            </Typography>
                        )}
                    </Box>
                </Box>
                <>
                    <MobileWidthButtons>
                        {supportsLatest && (
                            <Button
                                variant="outlined"
                                onClick={(e) => redirectTo(e, `/sources/${id}/latest/`)}
                            >
                                Latest
                            </Button>
                        )}
                    </MobileWidthButtons>
                    <WiderWidthButtons>
                        {supportsLatest && (
                            <Button
                                variant="outlined"
                                onClick={(e) => redirectTo(e, `/sources/${id}/latest/`)}
                            >
                                Latest
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            onClick={(e: any) => redirectTo(e, `/sources/${id}/popular/`)}
                        >
                            Browse
                        </Button>
                    </WiderWidthButtons>
                </>
            </CardContent>
        </Card>
    );
}
