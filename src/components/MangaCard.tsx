/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { Avatar, Box, CardContent, Stack, styled, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PopupState, { bindMenu } from 'material-ui-popup-state';
import { useState } from 'react';
import { useLongPress } from 'use-long-press';
import { GridLayout, useLibraryOptionsContext } from '@/components/context/LibraryOptionsContext';
import { SpinnerImage } from '@/components/util/SpinnerImage';
import { TManga, TPartialManga } from '@/typings.ts';
import { ContinueReadingButton } from '@/components/manga/ContinueReadingButton.tsx';
import { SelectableCollectionReturnType } from '@/components/collection/useSelectableCollection.ts';
import { MangaOptionButton } from '@/components/manga/MangaOptionButton.tsx';
import { MangaActionMenuItems, SingleModeProps } from '@/components/manga/MangaActionMenuItems.tsx';
import { Menu } from '@/components/menu/Menu.tsx';
import { MigrateDialog } from '@/components/MigrateDialog.tsx';
import { Mangas } from '@/lib/data/Mangas.ts';
import { TypographyMaxLines } from '@/components/atoms/TypographyMaxLines.tsx';

const BottomGradient = styled('div')({
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '30%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
});

const BottomGradientDoubledDown = styled('div')({
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '20%',
    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%)',
});

const MangaTitle = TypographyMaxLines;

const GridMangaTitle = styled(MangaTitle)({
    fontSize: '1.05rem',
});

const BadgeContainer = styled('div')({
    display: 'flex',
    height: 'fit-content',
    borderRadius: '5px',
    overflow: 'hidden',
    '& p': {
        color: 'white',
        padding: '0.1em',
        paddingInline: '0.2em',
        fontSize: '1.05rem',
    },
});

type MangaCardMode = 'default' | 'migrate.search' | 'migrate.select';

export interface MangaCardProps {
    manga: TPartialManga;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<TManga['id']>['handleSelection'];
    mode?: MangaCardMode;
}

const getMangaLinkTo = (
    mode: MangaCardMode,
    mangaId: number,
    sourceId: string | undefined,
    mangaTitle: string,
): string => {
    switch (mode) {
        case 'default':
            return `/manga/${mangaId}/`;
        case 'migrate.search':
            return `/migrate/source/${sourceId}/manga/${mangaId}/search?query=${mangaTitle}`;
        case 'migrate.select':
            return '';
        default:
            throw new Error(`getMangaLinkTo: unexpected MangaCardMode "${mode}"`);
    }
};

export const MangaCard = (props: MangaCardProps) => {
    const { t } = useTranslation();

    const { manga, gridLayout, inLibraryIndicator, selected, handleSelection, mode = 'default' } = props;
    const {
        id,
        title,
        downloadCount,
        unreadCount: unread,
        inLibrary,
        latestReadChapter,
        firstUnreadChapter,
        chapters,
    } = manga;
    const thumbnailUrl = Mangas.getThumbnailUrl(manga);
    const {
        options: { showContinueReadingButton, showUnreadBadge, showDownloadBadge },
    } = useLibraryOptionsContext();

    const mangaLinkTo = getMangaLinkTo(mode, manga.id, manga.source?.id, manga.title);

    const nextChapterIndexToRead = firstUnreadChapter?.sourceOrder ?? 1;
    const isLatestChapterRead = chapters?.totalCount === latestReadChapter?.sourceOrder;

    const [isMigrateDialogOpen, setIsMigrateDialogOpen] = useState(false);

    const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
        if (selected === null) {
            return;
        }

        e.preventDefault();
        handleSelection?.(id, !selected, { selectRange: e.shiftKey });
    };

    const longPressBind = useLongPress((e) => {
        e.shiftKey = true;
        handleClick(e);
    });

    if (gridLayout !== GridLayout.List) {
        return (
            <>
                {isMigrateDialogOpen && (
                    <MigrateDialog mangaIdToMigrateTo={manga.id} onClose={() => setIsMigrateDialogOpen(false)} />
                )}
                <PopupState variant="popover" popupId="manga-card-action-menu">
                    {(popupState) => (
                        <>
                            <Link
                                {...longPressBind()}
                                onClick={(e) => {
                                    const isMigrateSelectMode = mode === 'migrate.select';
                                    const isSelectionMode = selected !== null;

                                    const shouldHandleClick = isMigrateSelectMode || isSelectionMode;
                                    if (!shouldHandleClick) {
                                        return;
                                    }

                                    e.preventDefault();

                                    if (isMigrateSelectMode) {
                                        setIsMigrateDialogOpen(true);
                                        return;
                                    }

                                    handleClick(e);
                                }}
                                to={mangaLinkTo}
                                style={{ textDecoration: 'none' }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        margin: '2px',
                                        outline: selected ? '4px solid' : undefined,
                                        borderRadius: selected ? '1px' : undefined,
                                        outlineColor: (theme) => theme.palette.primary.main,
                                        backgroundColor: (theme) => (selected ? theme.palette.primary.main : undefined),
                                        '@media (hover: hover) and (pointer: fine)': {
                                            '&:hover .manga-option-button': {
                                                visibility: 'visible',
                                                pointerEvents: 'all',
                                            },
                                        },
                                    }}
                                >
                                    <Card
                                        sx={{
                                            // force standard aspect ratio of manga covers
                                            aspectRatio: '225/350',
                                            display: 'flex',
                                        }}
                                    >
                                        <CardActionArea
                                            sx={{
                                                position: 'relative',
                                                height: '100%',
                                            }}
                                        >
                                            <SpinnerImage
                                                alt={title}
                                                src={thumbnailUrl}
                                                imgStyle={
                                                    inLibraryIndicator && inLibrary
                                                        ? {
                                                              height: '100%',
                                                              width: '100%',
                                                              objectFit: 'cover',
                                                              filter: 'brightness(0.4)',
                                                          }
                                                        : {
                                                              height: '100%',
                                                              width: '100%',
                                                              objectFit: 'cover',
                                                          }
                                                }
                                                spinnerStyle={{
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                }}
                                            />
                                            <Stack
                                                alignItems="start"
                                                justifyContent="space-between"
                                                direction="row"
                                                sx={{
                                                    position: 'absolute',
                                                    top: 5,
                                                    left: 5,
                                                    right: 5,
                                                }}
                                            >
                                                <BadgeContainer>
                                                    {inLibraryIndicator && inLibrary && (
                                                        <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                            {t('manga.button.in_library')}
                                                        </Typography>
                                                    )}
                                                    {showUnreadBadge && (unread ?? 0) > 0 && (
                                                        <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                            {unread}
                                                        </Typography>
                                                    )}
                                                    {showDownloadBadge && (downloadCount ?? 0) > 0 && (
                                                        <Typography
                                                            sx={{
                                                                backgroundColor: 'success.dark',
                                                            }}
                                                        >
                                                            {downloadCount}
                                                        </Typography>
                                                    )}
                                                </BadgeContainer>
                                                <MangaOptionButton
                                                    popupState={popupState}
                                                    id={id}
                                                    selected={selected}
                                                    handleSelection={handleSelection}
                                                />
                                            </Stack>
                                            <>
                                                {gridLayout !== GridLayout.Comfortable && (
                                                    <>
                                                        <BottomGradient />
                                                        <BottomGradientDoubledDown />
                                                    </>
                                                )}
                                                <Stack
                                                    direction="row"
                                                    justifyContent={
                                                        gridLayout !== GridLayout.Comfortable ? 'space-between' : 'end'
                                                    }
                                                    alignItems="end"
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        width: '100%',
                                                        margin: '0.5em 0',
                                                        padding: '0 0.5em',
                                                        gap: '0.5em',
                                                    }}
                                                >
                                                    {gridLayout !== GridLayout.Comfortable && (
                                                        <Tooltip title={title} placement="top">
                                                            <GridMangaTitle
                                                                sx={{
                                                                    color: 'white',
                                                                    textShadow: '0px 0px 3px #000000',
                                                                }}
                                                            >
                                                                {title}
                                                            </GridMangaTitle>
                                                        </Tooltip>
                                                    )}
                                                    <ContinueReadingButton
                                                        showContinueReadingButton={showContinueReadingButton}
                                                        isLatestChapterRead={isLatestChapterRead}
                                                        nextChapterIndexToRead={nextChapterIndexToRead}
                                                        mangaLinkTo={mangaLinkTo}
                                                    />
                                                </Stack>
                                            </>
                                        </CardActionArea>
                                    </Card>
                                    {gridLayout === GridLayout.Comfortable && (
                                        <Tooltip title={title} placement="top">
                                            <GridMangaTitle
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    bottom: 0,
                                                    margin: '0.5em 0',
                                                    padding: '0 0.5em',
                                                    color: 'text.primary',
                                                    height: '3rem',
                                                }}
                                            >
                                                {title}
                                            </GridMangaTitle>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Link>
                            {!!handleSelection && popupState.isOpen && (
                                <Menu {...bindMenu(popupState)}>
                                    {(onClose, setHideMenu) => (
                                        <MangaActionMenuItems
                                            manga={manga as SingleModeProps['manga']}
                                            handleSelection={handleSelection}
                                            onClose={onClose}
                                            setHideMenu={setHideMenu}
                                        />
                                    )}
                                </Menu>
                            )}
                        </>
                    )}
                </PopupState>
            </>
        );
    }

    return (
        <>
            {isMigrateDialogOpen && (
                <MigrateDialog mangaIdToMigrateTo={manga.id} onClose={() => setIsMigrateDialogOpen(false)} />
            )}
            <PopupState variant="popover" popupId="manga-card-action-menu">
                {(popupState) => (
                    <>
                        <Card>
                            <CardActionArea
                                component={Link}
                                to={mangaLinkTo}
                                onClick={handleClick}
                                {...longPressBind()}
                            >
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 2,
                                        position: 'relative',
                                    }}
                                >
                                    <Avatar
                                        variant="rounded"
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            flex: '0 0 auto',
                                            marginRight: 2,
                                        }}
                                    >
                                        <SpinnerImage
                                            spinnerStyle={{ small: true }}
                                            imgStyle={{
                                                objectFit: 'cover',
                                                width: '100%',
                                                height: '100%',
                                                imageRendering: 'pixelated',
                                                filter: inLibraryIndicator && inLibrary ? 'brightness(0.4)' : undefined,
                                            }}
                                            alt={manga.title}
                                            src={thumbnailUrl}
                                        />
                                    </Avatar>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            flexGrow: 1,
                                            width: 'min-content',
                                        }}
                                    >
                                        <Tooltip title={title} placement="top">
                                            <MangaTitle variant="h5">{title}</MangaTitle>
                                        </Tooltip>
                                    </Box>
                                    <Stack direction="row" alignItems="center" gap="5px">
                                        <BadgeContainer>
                                            {inLibraryIndicator && inLibrary && (
                                                <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                    {t('manga.button.in_library')}
                                                </Typography>
                                            )}
                                            {showUnreadBadge && unread! > 0 && (
                                                <Typography sx={{ backgroundColor: 'primary.dark' }}>
                                                    {unread}
                                                </Typography>
                                            )}
                                            {showDownloadBadge && downloadCount! > 0 && (
                                                <Typography
                                                    sx={{
                                                        backgroundColor: 'success.dark',
                                                    }}
                                                >
                                                    {downloadCount}
                                                </Typography>
                                            )}
                                        </BadgeContainer>
                                        <ContinueReadingButton
                                            showContinueReadingButton={showContinueReadingButton}
                                            isLatestChapterRead={isLatestChapterRead}
                                            nextChapterIndexToRead={nextChapterIndexToRead}
                                            mangaLinkTo={mangaLinkTo}
                                        />
                                        <MangaOptionButton
                                            popupState={popupState}
                                            id={id}
                                            selected={selected}
                                            handleSelection={handleSelection}
                                            asCheckbox
                                        />
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                        {!!handleSelection && popupState.isOpen && (
                            <Menu {...bindMenu(popupState)}>
                                {(onClose, setHideMenu) => (
                                    <MangaActionMenuItems
                                        manga={manga as SingleModeProps['manga']}
                                        handleSelection={handleSelection}
                                        onClose={onClose}
                                        setHideMenu={setHideMenu}
                                    />
                                )}
                            </Menu>
                        )}
                    </>
                )}
            </PopupState>
        </>
    );
};
