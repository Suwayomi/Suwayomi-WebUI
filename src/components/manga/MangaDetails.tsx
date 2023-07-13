/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublicIcon from '@mui/icons-material/Public';
import { styled } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { mutate } from 'swr';
import { t as translate } from 'i18next';
import Button from '@mui/material/Button';
import { IManga, ISource } from '@/typings';
import requestManager from '@/lib/RequestManager';
import makeToast from '@/components/util/Toast';

const DetailsWrapper = styled('div')(({ theme }) => ({
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
}));

const TopContentWrapper = styled('div')(() => ({
    padding: '10px',
    // [theme.breakpoints.up('md')]: {
    //     minWidth: '50%',
    // },
}));

const ThumbnailMetadataWrapper = styled('div')(() => ({
    display: 'flex',
}));

const Thumbnail = styled('div')(() => ({
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
}));

const Metadata = styled('div')(({ theme }) => ({
    marginLeft: 15,
    maxWidth: '100%',
    '& span': {
        fontWeight: '400',
    },
    [theme.breakpoints.up('lg')]: {
        fontSize: '1.3em',
    },
}));
const MangaButtonsContainer = styled('div', { shouldForwardProp: (prop) => prop !== 'inLibrary' })<{
    inLibrary: boolean;
}>(({ theme, inLibrary }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    '& button': {
        color: inLibrary ? '#2196f3' : 'inherit',
        borderRadius: '25px',
        textTransform: 'none',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontSize: 'x-large',
        [theme.breakpoints.down('sm')]: {
            fontSize: 'larger',
        },
    },
    '& a': {
        textDecoration: 'none',
        color: '#858585',
        '& button': {
            color: 'inherit',
        },
    },
}));
const BottomContentWrapper = styled('div')(({ theme }) => ({
    paddingLeft: '10px',
    paddingRight: '10px',
    [theme.breakpoints.up('md')]: {
        fontSize: '1.2em',
        // maxWidth: '50%',
    },
    [theme.breakpoints.up('lg')]: {
        fontSize: '1.3em',
    },
}));
const Description = styled('div')(() => ({
    '& h4': {
        marginTop: '1em',
        marginBottom: 0,
    },
    '& p': {
        textAlign: 'justify',
        textJustify: 'inter-word',
    },
}));
const Genres = styled('div')(() => ({
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

    useEffect(() => {
        if (!manga.source) {
            makeToast(translate('source.error.label.source_not_found'), 'error');
        }
    }, [manga.source]);

    const addToLibrary = () => {
        mutate(`/api/v1/manga/${manga.id}`, { ...manga, inLibrary: true }, { revalidate: false });
        requestManager.addMangaToLibrary(manga.id).response.then(() => mutate(`/api/v1/manga/${manga.id}`));
    };

    const removeFromLibrary = () => {
        mutate(`/api/v1/manga/${manga.id}`, { ...manga, inLibrary: false }, { revalidate: false });
        requestManager.removeMangaFromLibrary(manga.id).response.then(() => mutate(`/api/v1/manga/${manga.id}`));
    };

    return (
        <DetailsWrapper>
            <TopContentWrapper>
                <ThumbnailMetadataWrapper>
                    <Thumbnail>
                        <img src={requestManager.getValidImgUrlFor(manga.thumbnailUrl)} alt="Manga Thumbnail" />
                    </Thumbnail>
                    <Metadata>
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
                    </Metadata>
                </ThumbnailMetadataWrapper>
                <MangaButtonsContainer inLibrary={manga.inLibrary}>
                    <div>
                        <Button
                            startIcon={manga.inLibrary ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            onClick={manga.inLibrary ? removeFromLibrary : addToLibrary}
                            size="large"
                        >
                            {manga.inLibrary ? t('manga.button.in_library') : t('manga.button.add_to_library')}
                        </Button>
                    </div>
                    <a href={manga.realUrl} target="_blank" rel="noreferrer">
                        <Button startIcon={<PublicIcon />} size="large">
                            {t('global.button.open_site')}
                        </Button>
                    </a>
                </MangaButtonsContainer>
            </TopContentWrapper>
            <BottomContentWrapper>
                <Description>
                    <h4>{t('settings.about.title')}</h4>
                    <p>{manga.description}</p>
                </Description>
                <Genres>
                    {manga.genre.map((g) => (
                        <h5 key={g}>{g}</h5>
                    ))}
                </Genres>
            </BottomContentWrapper>
        </DetailsWrapper>
    );
};

export default MangaDetails;
