/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { memo, useRef } from 'react';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/modules/core/components/TypographyMaxLines.tsx';
import { SpecificMangaCardProps } from '@/modules/manga/Manga.types.ts';
import { Mangas } from '@/modules/manga/services/Mangas.ts';
import { MangaOptionButton } from '@/modules/manga/components/MangaOptionButton.tsx';
import { ListCardAvatar } from '@/modules/core/components/cards/list/ListCardAvatar.tsx';
import { ListCardContent } from '@/modules/core/components/cards/list/ListCardContent';

export const MangaListCard = memo(
    ({
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
        mode,
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
                            '&:hover .source-manga-library-state-button': {
                                display: 'inline-flex',
                            },
                            '&:hover .source-manga-library-state-indicator': {
                                display: mode === 'source' ? 'none' : 'inline-flex',
                            },
                        },
                    }}
                >
                    <ListCardContent
                        sx={{
                            justifyContent: 'space-between',
                            position: 'relative',
                        }}
                    >
                        <ListCardAvatar
                            iconUrl={Mangas.getThumbnailUrl(manga)}
                            alt={manga.title}
                            slots={{
                                spinnerImageProps: {
                                    imgStyle: {
                                        imageRendering: 'pixelated',
                                        filter: inLibraryIndicator && isInLibrary ? 'brightness(0.4)' : undefined,
                                    },
                                },
                            }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexGrow: 1,
                                width: 'min-content',
                            }}
                        >
                            <CustomTooltip title={title} placement="top">
                                <TypographyMaxLines variant="h6" component="h3">
                                    {title}
                                </TypographyMaxLines>
                            </CustomTooltip>
                        </Box>
                        <Stack
                            direction="row"
                            sx={{
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
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
                    </ListCardContent>
                </CardActionArea>
            </Card>
        );
    },
);
