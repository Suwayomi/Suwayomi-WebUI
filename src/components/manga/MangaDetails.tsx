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
import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { t as translate } from 'i18next';
import { Link } from '@mui/material';
import { ISource, TManga } from '@/typings';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast';
import { useMetadataServerSettings } from '@/lib/metadata/metadataServerSettings.ts';
import { Mangas } from '@/lib/data/Mangas.ts';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { Categories } from '@/lib/data/Categories.ts';
import { CustomIconButton } from '@/components/atoms/CustomIconButton';
import { TrackMangaButton } from '@/components/manga/TrackMangaButton.tsx';
import { useCategorySelect } from '@/components/navbar/action/useCategorySelect.tsx';

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
const MangaButtonsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-around',
    '& button, a': {
        borderRadius: '25px',
        textTransform: 'none',
        paddingLeft: '20px',
        paddingRight: '20px',
        fontSize: 'x-large',
        [theme.breakpoints.down('sm')]: {
            fontSize: 'larger',
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

const OpenSourceButton = ({ url }: { url?: string | null }) => {
    const { t } = useTranslation();

    const button = useMemo(
        () => (
            <CustomIconButton
                size="large"
                disabled={!url}
                sx={{ color: 'inherit' }}
                component={Link}
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
            >
                <PublicIcon />
                {t('global.button.open_site')}
            </CustomIconButton>
        ),
        [url],
    );

    if (!url) {
        return button;
    }

    return button;
};

interface IProps {
    manga: TManga;
}

function getSourceName(source?: ISource | null) {
    if (!source) {
        return translate('global.label.unknown');
    }

    return source.displayName ?? source.id;
}

function getValueOrUnknown(val?: string | null) {
    return val || 'UNKNOWN';
}

export const MangaDetails: React.FC<IProps> = ({ manga }) => {
    const { t } = useTranslation();

    const {
        settings: { showAddToLibraryCategorySelectDialog },
        loading: areSettingsLoading,
    } = useMetadataServerSettings();

    const categories = requestManager.useGetCategories();
    const userCreatedCategories = useMemo(
        () => Categories.getUserCreated(categories.data?.categories.nodes ?? []),
        [categories.data?.categories.nodes],
    );

    useEffect(() => {
        if (!manga.source) {
            makeToast(translate('source.error.label.source_not_found'), 'error');
        }
    }, [manga.source]);

    const addToLibrary = useCallback(
        (didSubmit: boolean, addToCategories: number[] = [], removeFromCategories: number[] = []) => {
            if (!didSubmit) {
                return;
            }

            requestManager
                .updateManga(manga.id, {
                    updateManga: { inLibrary: true },
                    updateMangaCategories: { addToCategories, removeFromCategories },
                })
                .response.then(() => makeToast(t('library.info.label.added_to_library'), 'success'))
                .catch(() => {
                    makeToast(t('library.error.label.add_to_library'), 'error');
                });
        },
        [manga.id],
    );

    const { openCategorySelect, CategorySelectComponent } = useCategorySelect({
        mangaId: manga.id,
        onClose: addToLibrary,
        addToLibrary: true,
    });

    const handleAddToLibraryClick = () => {
        if (categories.loading) {
            makeToast(t('global.label.load_in_progress'), 'info');
            return;
        }

        if (categories.error) {
            makeToast(t('category.error.label.request_failure'), 'error');
            categories
                .refetch()
                .catch(defaultPromiseErrorHandler('MangaDetails::handleAddToLibraryClick: refetch categories'));
            return;
        }

        const showCategorySelectDialog = showAddToLibraryCategorySelectDialog && !!userCreatedCategories.length;
        if (!showCategorySelectDialog) {
            addToLibrary(true, Categories.getIds(Categories.getDefaults(userCreatedCategories!)));
            return;
        }

        openCategorySelect(true);
    };

    const removeFromLibrary = () => {
        Mangas.removeFromLibrary([manga.id]).catch(defaultPromiseErrorHandler('MangaDetails::removeFromLibrary'));
    };

    return (
        <>
            <DetailsWrapper>
                <TopContentWrapper>
                    <ThumbnailMetadataWrapper>
                        <Thumbnail>
                            <SpinnerImage src={Mangas.getThumbnailUrl(manga)} alt="Manga Thumbnail" />
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
                    <MangaButtonsContainer>
                        <CustomIconButton
                            disabled={areSettingsLoading || categories.loading}
                            onClick={manga.inLibrary ? removeFromLibrary : handleAddToLibraryClick}
                            size="large"
                            sx={{ color: manga.inLibrary ? '#2196f3' : 'inherit' }}
                        >
                            {manga.inLibrary ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            {manga.inLibrary ? t('manga.button.in_library') : t('manga.button.add_to_library')}
                        </CustomIconButton>
                        <TrackMangaButton manga={manga} />
                        <OpenSourceButton url={manga.realUrl} />
                    </MangaButtonsContainer>
                </TopContentWrapper>
                <BottomContentWrapper>
                    <Description>
                        <h4>{t('settings.about.title')}</h4>
                        <p style={{ whiteSpace: 'pre-line' }}>{manga.description}</p>
                    </Description>
                    <Genres>
                        {manga.genre.map((g) => (
                            <h5 key={g}>{g}</h5>
                        ))}
                    </Genres>
                </BottomContentWrapper>
            </DetailsWrapper>
            {CategorySelectComponent}
        </>
    );
};
