/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import { IManga, ISource } from 'typings';
import { t as translate } from 'i18next';
import makeToast from 'components/util/Toast';

const useStyles = (inLibrary: boolean) =>
    makeStyles((theme: Theme) => ({
        root: {
            width: '100%',
            [theme.breakpoints.up('md')]: {
                position: 'sticky',
                top: '64px',
                left: '0px',
                width: '50vw',
                height: 'calc(100vh - 64px)',
                alignSelf: 'flex-start',
                overflowY: 'auto',
            },
        },
        top: {
            padding: '10px',
            // [theme.breakpoints.up('md')]: {
            //     minWidth: '50%',
            // },
        },
        leftRight: {
            display: 'flex',
        },
        leftSide: {
            '& img': {
                borderRadius: 4,
                maxWidth: '100%',
                minWidth: '100%',
                height: 'auto',
            },
            maxWidth: '50%',
            // [theme.breakpoints.up('md')]: {
            //     minWidth: '100px',
            // },
        },
        rightSide: {
            marginLeft: 15,
            maxWidth: '100%',
            '& span': {
                fontWeight: '400',
            },
            [theme.breakpoints.up('lg')]: {
                fontSize: '1.3em',
            },
        },
        buttons: {
            display: 'flex',
            justifyContent: 'space-around',
            '& button': {
                color: inLibrary ? '#2196f3' : 'inherit',
            },
            '& a': {
                textDecoration: 'none',
                color: '#858585',
                '& button': {
                    color: 'inherit',
                },
            },
        },
        bottom: {
            paddingLeft: '10px',
            paddingRight: '10px',
            [theme.breakpoints.up('md')]: {
                fontSize: '1.2em',
                // maxWidth: '50%',
            },
            [theme.breakpoints.up('lg')]: {
                fontSize: '1.3em',
            },
        },
        description: {
            '& h4': {
                marginTop: '1em',
                marginBottom: 0,
            },
            '& p': {
                textAlign: 'justify',
                textJustify: 'inter-word',
            },
        },
        genre: {
            display: 'flex',
            flexWrap: 'wrap',
            '& h5': {
                border: '2px solid #2196f3',
                borderRadius: '1.13em',
                marginRight: '1em',
                marginTop: 0,
                marginBottom: '10px',
                padding: '0.3em',
                color: '#2196f3',
            },
        },
    }));

interface IProps {
    manga: IManga;
}

function getSourceName(source: ISource) {
    if (!source) {
        return translate('global.label.unknown');
    }

    return source.displayName ?? source.id;
}

function getValueOrUnknown(val: string) {
    return val || 'UNKNOWN';
}

const MangaDetails: React.FC<IProps> = ({ manga }) => {
    const { t } = useTranslation();

    const [serverAddress] = useLocalStorage<String>('serverBaseURL', '');
    const [useCache] = useLocalStorage<boolean>('useCache', true);

    const classes = useStyles(manga.inLibrary)();

    useEffect(() => makeToast(translate('source.error.label.source_not_found'), 'error'), [manga.id]);

    const addToLibrary = () => {
        mutate(`/api/v1/manga/${manga.id}/?onlineFetch=false`, { ...manga, inLibrary: true }, { revalidate: false });
        client
            .get(`/api/v1/manga/${manga.id}/library/`)
            .then(() => mutate(`/api/v1/manga/${manga.id}/?onlineFetch=false`));
    };

    const removeFromLibrary = () => {
        mutate(`/api/v1/manga/${manga.id}/?onlineFetch=false`, { ...manga, inLibrary: false }, { revalidate: false });
        client
            .delete(`/api/v1/manga/${manga.id}/library/`)
            .then(() => mutate(`/api/v1/manga/${manga.id}/?onlineFetch=false`));
    };

    return (
        <div className={classes.root}>
            <div className={classes.top}>
                <div className={classes.leftRight}>
                    <div className={classes.leftSide}>
                        <img src={`${serverAddress}${manga.thumbnailUrl}?useCache=${useCache}`} alt="Manga Thumbnail" />
                    </div>
                    <div className={classes.rightSide}>
                        <h1>{manga.title}</h1>
                        <h3>
                            {`${t('manga.label.author')}: `}
                            <span>{getValueOrUnknown(manga.author)}</span>
                        </h3>
                        <h3>
                            {`${t('manga.label.artist')}: `}
                            <span>{getValueOrUnknown(manga.artist)}</span>
                        </h3>
                        <h3>{`${t('manga.label.status')}: ${manga.status}`}</h3>
                        <h3>{`${t('source.title')}: ${getSourceName(manga.source)}`}</h3>
                    </div>
                </div>
                <div className={classes.buttons}>
                    <div>
                        <IconButton onClick={manga.inLibrary ? removeFromLibrary : addToLibrary} size="large">
                            {manga.inLibrary ? <FavoriteIcon sx={{ mr: 1 }} /> : <FavoriteBorderIcon sx={{ mr: 1 }} />}
                            <Typography sx={{ fontSize: { xs: '0.75em', sm: '0.85em' } }}>
                                {manga.inLibrary ? t('manga.button.in_library') : t('manga.button.add_to_library')}
                            </Typography>
                        </IconButton>
                    </div>
                    <a href={manga.realUrl} target="_blank" rel="noreferrer">
                        <IconButton size="large">
                            <PublicIcon sx={{ mr: 1 }} />
                            <Typography sx={{ fontSize: { xs: '0.75em', sm: '0.85em' } }}>
                                {t('global.button.open_site')}
                            </Typography>
                        </IconButton>
                    </a>
                </div>
            </div>
            <div className={classes.bottom}>
                <div className={classes.description}>
                    <h4>{t('settings.about.title')}</h4>
                    <p>{manga.description}</p>
                </div>
                <div className={classes.genre}>
                    {manga.genre.map((g) => (
                        <h5 key={g}>{g}</h5>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MangaDetails;
