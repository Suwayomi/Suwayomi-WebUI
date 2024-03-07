/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { Box, CardActionArea, Chip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GetMigratableSourcesQuery } from '@/lib/graphql/generated/graphql.ts';
import { translateExtensionLanguage } from '@/screens/util/Extensions.ts';
import { SpinnerImage } from '@/components/util/SpinnerImage.tsx';

export type TMigratableSource = NonNullable<GetMigratableSourcesQuery['mangas']['nodes'][number]['source']> & {
    mangaCount: number;
};

// TODO - cleanup source/extension components
export const MigrationCard = ({ id, name, lang, iconUrl, mangaCount }: TMigratableSource) => (
    <Card>
        <CardActionArea component={Link} to={`/migrate/source/${id}/`}>
            <CardContent
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                }}
            >
                <Box sx={{ display: 'flex' }}>
                    <Avatar
                        variant="rounded"
                        sx={{
                            width: 56,
                            height: 56,
                            flex: '0 0 auto',
                            mr: 2,
                            background: 'transparent',
                        }}
                    >
                        <SpinnerImage
                            spinnerStyle={{ small: true }}
                            imgStyle={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            alt={name}
                            src={requestManager.getValidImgUrlFor(iconUrl)}
                        />
                    </Avatar>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h5" component="h2">
                            {name}
                        </Typography>
                        <Typography variant="caption" display="block">
                            {translateExtensionLanguage(lang)}
                        </Typography>
                    </Box>
                </Box>
                <Chip sx={{ borderRadius: '5px' }} size="small" label={mangaCount} />
            </CardContent>
        </CardActionArea>
    </Card>
);
