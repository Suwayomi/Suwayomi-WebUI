/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import { Metadata } from '@/modules/core/components/texts/Metadata.tsx';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';

interface ClickableMetadataProps {
    title: string;
    value: string;
}

export const ClickableMetadata = ({ title, value }: ClickableMetadataProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const unknownValue = t('global.label.unknown');

    const handleClick = (searchValue: string) => {
        if (searchValue === 'Unknown' || searchValue === unknownValue) return;
        navigate(`${AppRoutes.library.path}?query=${encodeURIComponent(searchValue)}`);
    };

    const renderValue = () => {
        if (value === 'Unknown' || value === unknownValue) return value;

        // Handle multiple authors, split by delimiters like , | 、
        const artists = value.split(/\s*[,|、]\s*/);

        return (
            <Stack direction="row" spacing={1} flexWrap="wrap">
                {artists.map((artist, index) => (
                    <span key={artist}>
                        <CustomTooltip title={t('library.title')}>
                            <span>
                                <Link
                                    component="button"
                                    onClick={() => handleClick(artist)}
                                    sx={{
                                        textAlign: 'left',
                                        '&:hover': {
                                            cursor: 'pointer',
                                        },
                                    }}
                                    disabled={artist === 'Unknown' || artist === unknownValue}
                                >
                                    {artist}
                                </Link>
                            </span>
                        </CustomTooltip>
                        {index < artists.length - 1 && ', '}
                    </span>
                ))}
            </Stack>
        );
    };

    return <Metadata title={title} value={renderValue()} />;
}; 