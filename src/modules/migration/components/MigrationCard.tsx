/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetMigratableSourcesQuery } from '@/lib/graphql/generated/graphql.ts';
import { SpinnerImage } from '@/modules/core/components/SpinnerImage.tsx';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';

export type TMigratableSource = NonNullable<GetMigratableSourcesQuery['mangas']['nodes'][number]['source']> & {
    mangaCount: number;
};

// TODO - cleanup source/extension components
export const MigrationCard = ({ id, name, lang, iconUrl, mangaCount }: TMigratableSource) => {
    const { t } = useTranslation();

    const isLocalSource = Number(id) === 0;
    const sourceName = isLocalSource ? t('source.local_source.title') : name;

    return (
        <Card>
            <CardActionArea component={Link} to={`/migrate/source/${id}/`}>
                <CardContent
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex' }}>
                        <Avatar
                            variant="rounded"
                            sx={{
                                width: 56,
                                height: 56,
                                flex: '0 0 auto',
                                mr: 1,
                                background: 'transparent',
                            }}
                        >
                            <SpinnerImage
                                spinnerStyle={{ small: true }}
                                imgStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                alt={sourceName}
                                src={requestManager.getValidImgUrlFor(iconUrl)}
                            />
                        </Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <Typography variant="h6" component="h3">
                                {sourceName}
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    display: 'block',
                                }}
                            >
                                {translateExtensionLanguage(lang)}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip sx={{ borderRadius: 1 }} size="small" label={mangaCount} />
                </CardContent>
            </CardActionArea>
        </Card>
    );
};
