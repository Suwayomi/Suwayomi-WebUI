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
import { ComponentProps, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { t as translate } from 'i18next';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LaunchIcon from '@mui/icons-material/Launch';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import Modal from '@mui/material/Modal';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Vibrant } from 'node-vibrant/browser';
import { FastAverageColor } from 'fast-average-color';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { CustomButton } from '@/modules/core/components/buttons/CustomButton.tsx';
import { TrackMangaButton } from '@/modules/manga/components/TrackMangaButton.tsx';
import { useManageMangaLibraryState } from '@/modules/manga/hooks/useManageMangaLibraryState.tsx';
import { Metadata as BaseMetadata } from '@/modules/core/components/Metadata.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MangaType, SourceType } from '@/lib/graphql/generated/graphql.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { useResizeObserver } from '@/modules/core/hooks/useResizeObserver.tsx';
import { useMetadataServerSettings } from '@/modules/settings/services/ServerSettingsMetadata.ts';
import { MANGA_COVER_ASPECT_RATIO, statusToTranslationKey } from '@/modules/manga/Manga.constants.ts';
import { MangaThumbnailInfo, MangaTrackRecordInfo } from '@/modules/manga/Manga.types.ts';
import { TAppThemeContext, useAppThemeContext } from '@/modules/theme/contexts/AppThemeContext.tsx';
import { applyStyles } from '@/modules/core/utils/ApplyStyles.ts';
import { CustomButtonIcon } from '@/modules/core/components/buttons/CustomButtonIcon.tsx';

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

const TopContentWrapper = ({
    url,
    mangaThumbnailBackdrop,
    children,
}: {
    url: string;
    mangaThumbnailBackdrop: boolean;
    children: ReactNode;
}) => (
    <Stack
        sx={{
            position: 'relative',
        }}
    >
        {mangaThumbnailBackdrop && (
            <>
                <SpinnerImage
                    spinnerStyle={{ display: 'none' }}
                    imgStyle={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    src={url}
                    alt="Manga Thumbnail"
                />
                <Stack
                    sx={{
                        '&::before': (theme) =>
                            applyStyles(mangaThumbnailBackdrop, {
                                position: 'absolute',
                                display: 'inline-block',
                                content: '""',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(to top, ${theme.palette.background.default}, transparent 100%, transparent 1px),linear-gradient(to right, ${theme.palette.background.default}, transparent 50%, transparent 1px),linear-gradient(to bottom, ${theme.palette.background.default}, transparent 50%, transparent 1px),linear-gradient(to left, ${theme.palette.background.default}, transparent 50%, transparent 1px)`,
                                backdropFilter: 'blur(4.5px) brightness(0.75)',
                            }),
                    }}
                />
            </>
        )}
        {children}
    </Stack>
);

const ThumbnailMetadataWrapper = styled('div')(({ theme }) => ({
    display: 'flex',
    paddingBottom: theme.spacing(1),
}));

const MetadataContainer = styled('div')(({ theme }) => ({
    zIndex: 1,
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
        <CustomTooltip title={t('global.button.open_site')} disabled={!url}>
            <CustomButtonIcon
                size="medium"
                disabled={!url}
                component={Link}
                href={url ?? undefined}
                target="_blank"
                rel="noreferrer"
                variant="outlined"
            >
                <LaunchIcon />
            </CustomButtonIcon>
        </CustomTooltip>
    );
};

function getSourceName(source?: Pick<SourceType, 'id' | 'displayName'> | null): string {
    if (!source) {
        return translate('global.label.unknown');
    }

    const isLocalSource = Number(source.id) === 0;
    if (isLocalSource) {
        return translate('source.local_source.title');
    }

    return source.displayName ?? source.id;
}

function getValueOrUnknown(val?: string | null) {
    return val ?? translate('global.label.unknown');
}

const Thumbnail = ({
    manga,
    mangaDynamicColorSchemes,
}: {
    manga: Partial<MangaThumbnailInfo>;
    mangaDynamicColorSchemes: boolean;
}) => {
    const theme = useTheme();
    const { setDynamicColor } = useAppThemeContext();

    const popupState = usePopupState({ variant: 'popover', popupId: 'manga-thumbnail-fullscreen' });

    const [isImageReady, setIsImageReady] = useState(false);

    useLayoutEffect(() => {
        if (!mangaDynamicColorSchemes) {
            return () => {};
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = Mangas.getThumbnailUrl(manga);

        img.onload = () => {
            Promise.all([
                Vibrant.from(img).getPalette(),
                new FastAverageColor().getColorAsync(img, {
                    algorithm: 'dominant',
                    mode: 'precision',
                    ignoredColor: [
                        [255, 255, 255, 255, 75],
                        [0, 0, 0, 255, 75],
                    ],
                }),
            ]).then(([palette, averageColor]) => {
                if (
                    !palette.Vibrant ||
                    !palette.DarkVibrant ||
                    !palette.LightVibrant ||
                    !palette.LightMuted ||
                    !palette.Muted ||
                    !palette.DarkMuted
                ) {
                    return;
                }

                setDynamicColor({
                    ...palette,
                    average: averageColor,
                } as TAppThemeContext['dynamicColor']);
            });
        };

        return () => {
            setDynamicColor(null);
        };
    }, []);

    return (
        <>
            <Stack
                sx={{
                    position: 'relative',
                    borderRadius: 1,
                    overflow: 'hidden',
                    backgroundColor: 'background.paper',
                    width: '150px',
                    maxHeight: 'fit-content',
                    aspectRatio: MANGA_COVER_ASPECT_RATIO,
                    flexShrink: 0,
                    flexGrow: 0,
                    [theme.breakpoints.up('lg')]: {
                        width: '200px',
                    },
                    [theme.breakpoints.up('xl')]: {
                        width: '300px',
                    },
                }}
            >
                <SpinnerImage
                    src={Mangas.getThumbnailUrl(manga)}
                    alt="Manga Thumbnail"
                    onLoad={() => setIsImageReady(true)}
                    imgStyle={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                    sx={{ height: '100vh', p: 2, outline: 0, justifyContent: 'center', alignItems: 'center' }}
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

    const {
        settings: { mangaThumbnailBackdrop, mangaDynamicColorSchemes },
    } = useMetadataServerSettings();

    useEffect(() => {
        if (!manga.source) {
            makeToast(translate('source.error.label.source_not_found'), 'error');
        }
    }, [manga.source]);

    const { CategorySelectComponent, updateLibraryState } = useManageMangaLibraryState(manga);

    const copyTitle = async () => {
        try {
            await navigator.clipboard.writeText(manga.title);
            makeToast(t('global.label.copied_clipboard'), 'info');
        } catch (e) {
            defaultPromiseErrorHandler('MangaDetails::copyTitleLongPress')(e);
        }
    };

    return (
        <>
            <DetailsWrapper>
                <TopContentWrapper url={Mangas.getThumbnailUrl(manga)} mangaThumbnailBackdrop={mangaThumbnailBackdrop}>
                    <ThumbnailMetadataWrapper>
                        <Thumbnail manga={manga} mangaDynamicColorSchemes={mangaDynamicColorSchemes} />
                        <MetadataContainer>
                            <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                                <Typography variant="h5" component="h2" sx={{ wordBreak: 'break-word' }}>
                                    {manga.title}
                                </Typography>
                                <CustomTooltip title={t('global.button.copy')}>
                                    <IconButton onClick={copyTitle} color="inherit">
                                        <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                </CustomTooltip>
                            </Stack>
                            <Metadata title={t('manga.label.author')} value={getValueOrUnknown(manga.author)} />
                            <Metadata title={t('manga.label.artist')} value={getValueOrUnknown(manga.artist)} />
                            <Metadata title={t('manga.label.status')} value={t(statusToTranslationKey[manga.status])} />
                            <Metadata title={t('source.title_one')} value={getSourceName(manga.source)} />
                        </MetadataContainer>
                    </ThumbnailMetadataWrapper>
                    <MangaButtonsContainer>
                        <CustomButton
                            size="medium"
                            onClick={updateLibraryState}
                            variant={manga.inLibrary ? 'contained' : 'outlined'}
                        >
                            {manga.inLibrary ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                            {manga.inLibrary ? t('manga.button.in_library') : t('manga.button.add_to_library')}
                        </CustomButton>
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
