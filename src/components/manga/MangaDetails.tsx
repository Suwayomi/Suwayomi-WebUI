/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { styled, useTheme } from '@mui/material/styles';
import { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { t as translate } from 'i18next';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useLongPress } from 'use-long-press';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import LaunchIcon from '@mui/icons-material/Launch';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Modal from '@mui/material/Modal';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { makeToast } from '@/components/util/Toast';
import { Mangas, MangaThumbnailInfo, MangaTrackRecordInfo } from '@/lib/data/Mangas.ts';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';
import { CustomIconButton } from '@/components/atoms/CustomIconButton';
import { TrackMangaButton } from '@/components/manga/TrackMangaButton.tsx';
import { useManageMangaLibraryState } from '@/components/manga/useManageMangaLibraryState.tsx';
import { Metadata as BaseMetadata } from '@/components/atoms/Metadata.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { MangaType, SourceType } from '@/lib/graphql/generated/graphql.ts';
import { useLocalStorage } from '@/util/useStorage.tsx';
import { useResizeObserver } from '@/util/useResizeObserver.tsx';

const DetailsWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    [theme.breakpoints.up('md')]: {
        flexBasis: '40%',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
    },
}));

const TopContentWrapper = styled('div')(() => ({}));

const ThumbnailMetadataWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    paddingBottom: theme.spacing(1),
}));

const MetadataContainer = styled('div')(({ theme }) => ({
    marginLeft: theme.spacing(1),
}));

const Metadata = (props: ComponentProps<typeof BaseMetadata>) => <BaseMetadata {...props} />;

const MangaButtonsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(1),
}));

const OpenSourceButton = ({ url }: { url?: string | null }) => {
    const { t } = useTranslation();

    return (
        <Tooltip title={t('global.button.open_site')}>
            <CustomIconButton
                size="medium"
                disabled={!url}
                component={Link}
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
            >
                <LaunchIcon />
            </CustomIconButton>
        </Tooltip>
    );
};

function getSourceName(source?: Pick<SourceType, 'id' | 'displayName'> | null): string {
    if (!source) {
        return translate('global.label.unknown');
    }

    return source.displayName ?? source.id;
}

function getValueOrUnknown(val?: string | null) {
    return val ?? translate('global.label.unknown');
}

const Thumbnail = ({ manga }: { manga: Partial<MangaThumbnailInfo> }) => {
    const theme = useTheme();

    const popupState = usePopupState({ variant: 'popover', popupId: 'manga-thumbnail-fullscreen' });

    const [imageHeight, setImageHeight] = useState<number>();
    const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
    useResizeObserver(
        imageElement,
        useCallback(() => setImageHeight(imageElement?.clientHeight), [imageElement]),
    );

    const [isImageReady, setIsImageReady] = useState(false);
    const isImageHeightReady = isImageReady && !!imageHeight;

    return (
        <>
            <Stack
                sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    width: '150px',
                    height: `${isImageHeightReady ? imageHeight : 225}px`,
                    flexShrink: 0,
                    [theme.breakpoints.up('lg')]: {
                        width: '200px',
                        height: `${isImageHeightReady ? imageHeight : 300}px`,
                    },
                    [theme.breakpoints.up('xl')]: {
                        width: '300px',
                        height: `${isImageHeightReady ? imageHeight : 450}px`,
                    },
                }}
            >
                <SpinnerImage
                    ref={setImageElement}
                    src={Mangas.getThumbnailUrl(manga)}
                    alt="Manga Thumbnail"
                    onImageLoad={() => setIsImageReady(true)}
                />
                {isImageReady && (
                    <Stack
                        {...bindTrigger(popupState)}
                        sx={{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            width: '100%',
                            justifyContent: 'center',
                            alignItems: 'center',
                            opacity: 0,
                            '&:hover': {
                                background: 'rgba(0, 0, 0, 0.4)',
                                cursor: 'pointer',
                                opacity: 1,
                            },
                        }}
                    >
                        <OpenInFullIcon fontSize="large" color="primary" />
                    </Stack>
                )}
            </Stack>
            <Modal {...bindPopover(popupState)} sx={{ outline: 0 }}>
                <Stack
                    onClick={() => popupState.close()}
                    sx={{ height: '100vh', py: 2, outline: 0, justifyContent: 'center', alignItems: 'center' }}
                >
                    <SpinnerImage
                        src={Mangas.getThumbnailUrl(manga)}
                        alt="Manga Thumbnail"
                        imgStyle={{ height: '100%', width: '100%', objectFit: 'contain' }}
                    />
                </Stack>
            </Modal>
        </>
    );
};

const DESCRIPTION_COLLAPSED_SIZE = 75;
const DescriptionGenre = ({
    manga: { description, genre: mangaGenres },
}: {
    manga: Pick<MangaType, 'description' | 'genre'>;
}) => {
    const [descriptionElement, setDescriptionElement] = useState<HTMLSpanElement | null>(null);
    const [descriptionHeight, setDescriptionHeight] = useState<number>();
    useResizeObserver(
        descriptionElement,
        useCallback(() => setDescriptionHeight(descriptionElement?.clientHeight), [descriptionElement]),
    );

    const [isCollapsed, setIsCollapsed] = useLocalStorage('isDescriptionGenreCollapsed', true);

    const collapsedSize = description
        ? Math.min(DESCRIPTION_COLLAPSED_SIZE, descriptionHeight ?? DESCRIPTION_COLLAPSED_SIZE)
        : 0;
    const genres = useMemo(() => mangaGenres.filter(Boolean), [mangaGenres]);

    return (
        <>
            {description && (
                <Stack sx={{ position: 'relative' }}>
                    <Collapse collapsedSize={collapsedSize} in={!isCollapsed}>
                        <Typography
                            ref={setDescriptionElement}
                            style={{ whiteSpace: 'pre-line', textAlign: 'justify', textJustify: 'inter-word' }}
                        >
                            {description}
                        </Typography>
                    </Collapse>
                    <Stack
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        sx={{
                            pt: 1,
                            alignItems: 'center',
                            cursor: 'pointer',
                            position: isCollapsed ? 'absolute' : null,
                            width: '100%',
                            bottom: 0,
                            background: (theme) =>
                                `linear-gradient(transparent 1px, ${theme.palette.background.default})`,
                        }}
                    >
                        <IconButton sx={{ color: (theme) => (theme.palette.mode === 'light' ? 'black' : 'text') }}>
                            {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                        </IconButton>
                    </Stack>
                </Stack>
            )}
            <Stack
                sx={{
                    flexDirection: 'row',
                    flexWrap: isCollapsed ? 'no-wrap' : 'wrap',
                    gap: 1,
                    overflowX: isCollapsed ? 'auto' : null,
                }}
            >
                {genres.map((genre) => (
                    <Chip key={genre} label={genre} variant="outlined" />
                ))}
            </Stack>
        </>
    );
};

export const MangaDetails = ({
    manga,
}: {
    manga: Pick<
        MangaType,
        'id' | 'title' | 'author' | 'artist' | 'status' | 'inLibrary' | 'realUrl' | 'description' | 'genre'
    > &
        MangaThumbnailInfo &
        MangaTrackRecordInfo & {
            source?: Pick<SourceType, 'id' | 'displayName'> | null;
        };
}) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (!manga.source) {
            makeToast(translate('source.error.label.source_not_found'), 'error');
        }
    }, [manga.source]);

    const { CategorySelectComponent, updateLibraryState } = useManageMangaLibraryState(manga);

    const copyTitleLongPressBind = useLongPress(async () => {
        try {
            await navigator.clipboard.writeText(manga.title);
            makeToast(t('global.label.copied'), 'info');
        } catch (e) {
            defaultPromiseErrorHandler('MangaDetails::copyTitleLongPress')(e);
        }
    });

    return (
        <>
            <DetailsWrapper>
                <TopContentWrapper>
                    <ThumbnailMetadataWrapper>
                        <Thumbnail manga={manga} />
                        <MetadataContainer>
                            <Typography
                                variant="h5"
                                component="h2"
                                sx={{ mb: 1, '@media not (pointer: fine)': { userSelect: 'none' } }}
                                {...copyTitleLongPressBind()}
                            >
                                {manga.title}
                            </Typography>
                            <Metadata title={t('manga.label.author')} value={getValueOrUnknown(manga.author)} />
                            <Metadata title={t('manga.label.artist')} value={getValueOrUnknown(manga.artist)} />
                            <Metadata title={t('manga.label.status')} value={getValueOrUnknown(manga.status)} />
                            <Metadata title={t('source.title_one')} value={getSourceName(manga.source)} />
                        </MetadataContainer>
                    </ThumbnailMetadataWrapper>
                    <MangaButtonsContainer>
                        <CustomIconButton
                            size="medium"
                            onClick={updateLibraryState}
                            variant={manga.inLibrary ? 'contained' : 'outlined'}
                        >
                            {manga.inLibrary ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            {manga.inLibrary ? t('manga.button.in_library') : t('manga.button.add_to_library')}
                        </CustomIconButton>
                        <TrackMangaButton manga={manga} />
                        <OpenSourceButton url={manga.realUrl} />
                    </MangaButtonsContainer>
                </TopContentWrapper>
                <DescriptionGenre manga={manga} />
            </DetailsWrapper>
            {CategorySelectComponent}
        </>
    );
};
