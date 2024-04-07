/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, CardContent, Link, Stack, styled, Tooltip } from '@mui/material';
import PopupState, { bindMenu } from 'material-ui-popup-state';
import { useRef, useState } from 'react';
import { useLongPress } from 'use-long-press';
import { isMobile } from 'react-device-detect';
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
import { useManageMangaLibraryState } from '@/components/manga/useManageMangaLibraryState.tsx';
import { MangaBadges } from '@/components/manga/MangaBadges.tsx';

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

type MangaCardMode = 'default' | 'source' | 'migrate.search' | 'migrate.select';

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
        case 'source':
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
    const optionButtonRef = useRef<HTMLButtonElement>(null);

    const { manga, gridLayout, inLibraryIndicator, selected, handleSelection, mode = 'default' } = props;
    const { id, title, downloadCount, unreadCount: unread, latestReadChapter, firstUnreadChapter, chapters } = manga;
    const thumbnailUrl = Mangas.getThumbnailUrl(manga);
    const {
        options: { showContinueReadingButton },
    } = useLibraryOptionsContext();

    const { CategorySelectComponent, updateLibraryState, isInLibrary } = useManageMangaLibraryState(manga);

    const mangaLinkTo = getMangaLinkTo(mode, manga.id, manga.source?.id, manga.title);

    const nextChapterIndexToRead = firstUnreadChapter?.sourceOrder ?? 1;
    const isLatestChapterRead = chapters?.totalCount === latestReadChapter?.sourceOrder;

    const [isMigrateDialogOpen, setIsMigrateDialogOpen] = useState(false);

    const handleClick = (event: React.MouseEvent | React.TouchEvent, openMenu?: () => void) => {
        const isDefaultMode = mode === 'default';
        const isSourceMode = mode === 'source';
        const isMigrateSelectMode = mode === 'migrate.select';
        const isSelectionMode = selected !== null;
        const isLongPress = !!openMenu;

        const shouldHandleClick =
            isMigrateSelectMode || isSelectionMode || ((isDefaultMode || isSourceMode) && isLongPress);
        if (!shouldHandleClick) {
            return;
        }

        event.preventDefault();

        if (isSourceMode) {
            updateLibraryState();
            return;
        }

        if (isSelectionMode) {
            handleSelection?.(id, !selected, { selectRange: event.shiftKey });
            return;
        }

        if (isDefaultMode) {
            openMenu?.();
            return;
        }

        if (isMigrateSelectMode) {
            setIsMigrateDialogOpen(true);
        }
    };

    const longPressBind = useLongPress((e, { context }) => {
        e.shiftKey = true;
        handleClick(e, context as () => {});
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
                                component={RouterLink}
                                {...longPressBind(() => popupState.open(optionButtonRef.current))}
                                onClick={handleClick}
                                to={mangaLinkTo}
                                sx={{ textDecoration: 'none', touchCallout: 'none' }}
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
                                        '&:hover .source-manga-library-state-button': {
                                            display: isMobile ? 'none' : 'inline-flex',
                                        },
                                        '&:hover .source-manga-library-state-indicator': {
                                            display: 'none',
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
                                                    inLibraryIndicator && isInLibrary
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
                                                <MangaBadges
                                                    inLibraryIndicator={inLibraryIndicator}
                                                    isInLibrary={isInLibrary}
                                                    unread={unread}
                                                    downloadCount={downloadCount}
                                                    updateLibraryState={updateLibraryState}
                                                />
                                                <MangaOptionButton
                                                    ref={optionButtonRef}
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
                            {CategorySelectComponent}
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
                                component={RouterLink}
                                to={mangaLinkTo}
                                onClick={handleClick}
                                {...longPressBind(() => popupState.open(optionButtonRef.current))}
                                sx={{
                                    touchCallout: 'none',
                                    '@media (hover: hover) and (pointer: fine)': {
                                        '&:hover .manga-option-button': {
                                            visibility: 'visible',
                                            pointerEvents: 'all',
                                        },
                                    },
                                    '&:hover .source-manga-library-state-button': {
                                        display: isMobile ? 'none' : 'inline-flex',
                                    },
                                    '&:hover .source-manga-library-state-indicator': {
                                        display: 'none',
                                    },
                                }}
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
                                                filter:
                                                    inLibraryIndicator && isInLibrary ? 'brightness(0.4)' : undefined,
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
                                        <MangaBadges
                                            inLibraryIndicator={inLibraryIndicator}
                                            isInLibrary={isInLibrary}
                                            unread={unread}
                                            downloadCount={downloadCount}
                                            updateLibraryState={updateLibraryState}
                                        />
                                        <ContinueReadingButton
                                            showContinueReadingButton={showContinueReadingButton}
                                            isLatestChapterRead={isLatestChapterRead}
                                            nextChapterIndexToRead={nextChapterIndexToRead}
                                            mangaLinkTo={mangaLinkTo}
                                        />
                                        <MangaOptionButton
                                            ref={optionButtonRef}
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
                        {CategorySelectComponent}
                    </>
                )}
            </PopupState>
        </>
    );
};
