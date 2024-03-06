/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CardActionArea, Box, styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TPartialSource } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { translateExtensionLanguage } from '@/screens/util/Extensions';
import { SourceContentType } from '@/screens/SourceMangas';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';

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
    source: TPartialSource;
    showSourceRepo: boolean;
}

export const SourceCard: React.FC<IProps> = (props: IProps) => {
    const { t } = useTranslation();

    const {
        source: {
            id,
            name,
            lang,
            iconUrl,
            supportsLatest,
            isNsfw,
            extension: { repo },
        },
        showSourceRepo,
    } = props;

    return (
        <Card
            sx={{
                margin: '10px',
                marginTop: 0,
            }}
        >
            <CardActionArea
                component={Link}
                to={`/sources/${id}`}
                state={{ contentType: SourceContentType.POPULAR, clearCache: true }}
            >
                <CardContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                            variant="rounded"
                            alt={name}
                            sx={{
                                width: 56,
                                height: 56,
                                flex: '0 0 auto',
                                mr: 2,
                                background: 'transparent',
                            }}
                        >
                            <SpinnerImage
                                spinnerStyle={{ small: true }}
                                imgStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                alt={name}
                                src={requestManager.getValidImgUrlFor(iconUrl)}
                            />
                        </Avatar>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography variant="h5" component="h2">
                                {name}
                            </Typography>
                            {id !== '0' && (
                                <Typography variant="caption" display="block" gutterBottom>
                                    {translateExtensionLanguage(lang)}
                                    {isNsfw && (
                                        <Typography variant="caption" display="inline" gutterBottom color="red">
                                            {' 18+'}
                                        </Typography>
                                    )}
                                    {showSourceRepo && (
                                        <Typography variant="caption" display="block">
                                            {repo}
                                        </Typography>
                                    )}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <>
                        <MobileWidthButtons>
                            {supportsLatest && (
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    to={`/sources/${id}`}
                                    state={{ contentType: SourceContentType.LATEST, clearCache: true }}
                                >
                                    {t('global.button.latest')}
                                </Button>
                            )}
                        </MobileWidthButtons>
                        <WiderWidthButtons>
                            {supportsLatest && (
                                <Button
                                    variant="outlined"
                                    component={Link}
                                    to={`/sources/${id}`}
                                    state={{ contentType: SourceContentType.LATEST, clearCache: true }}
                                >
                                    {t('global.button.latest')}
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                component={Link}
                                to={`/sources/${id}`}
                                state={{ contentType: SourceContentType.POPULAR, clearCache: true }}
                            >
                                {t('global.button.popular')}
                            </Button>
                        </WiderWidthButtons>
                    </>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
