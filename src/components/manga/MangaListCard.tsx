/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card/Card';
import CardContent from '@mui/material/CardContent/CardContent';
import CardActionArea from '@mui/material/CardActionArea/CardActionArea';
import Avatar from '@mui/material/Avatar/Avatar';
import Box from '@mui/material/Box/Box';
import Stack from '@mui/material/Stack/Stack';
import Tooltip from '@mui/material/Tooltip/Tooltip';
import { isMobile } from 'react-device-detect';
import { Link as RouterLink } from 'react-router-dom';
import { useRef } from 'react';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';
import { TypographyMaxLines } from '@/components/atoms/TypographyMaxLines.tsx';
import { SpecificMangaCardProps } from '@/components/manga/MangaCard.types.tsx';
import { Mangas } from '@/lib/data/Mangas.ts';
import { MangaOptionButton } from '@/components/manga/MangaOptionButton.tsx';

export const MangaListCard = ({
    manga,
    longPressBind,
    popupState,
    handleClick,
    mangaLinkTo,
    selected,
    inLibraryIndicator,
    isInLibrary,
    handleSelection,
    continueReadingButton,
    mangaBadges,
}: SpecificMangaCardProps) => {
    const optionButtonRef = useRef<HTMLButtonElement>(null);

    const { id, title } = manga;

    return (
        <Card>
            <CardActionArea
                component={RouterLink}
                to={mangaLinkTo}
                state={{ mangaTitle: title }}
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
                                filter: inLibraryIndicator && isInLibrary ? 'brightness(0.4)' : undefined,
                            }}
                            alt={manga.title}
                            src={Mangas.getThumbnailUrl(manga)}
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
                            <TypographyMaxLines variant="h5">{title}</TypographyMaxLines>
                        </Tooltip>
                    </Box>
                    <Stack direction="row" alignItems="center" gap="5px">
                        {mangaBadges}
                        {continueReadingButton}
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
    );
};
