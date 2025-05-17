/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import IconButton from '@mui/material/IconButton';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { SourceContentType } from '@/modules/source/screens/SourceMangas.tsx';
import { GetSourcesListQuery } from '@/lib/graphql/generated/graphql.ts';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils.ts';
import { AppRoutes } from '@/modules/core/AppRoute.constants.ts';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { Sources } from '@/modules/source/services/Sources.ts';
import { ListCardAvatar } from '@/modules/core/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/modules/core/components/lists/cards/ListCardContent.tsx';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip.tsx';
import { createUpdateSourceMetadata, useGetSourceMetadata } from '@/modules/source/services/SourceMetadata.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

interface IProps {
    source: GetSourcesListQuery['sources']['nodes'][number];
    showSourceRepo: boolean;
}

export const SourceCard: React.FC<IProps> = (props: IProps) => {
    const { t } = useTranslation();

    const { source, showSourceRepo } = props;
    const {
        id,
        name,
        lang,
        iconUrl,
        supportsLatest,
        isNsfw,
        extension: { repo },
    } = source;

    const { isPinned } = useGetSourceMetadata(source);

    const sourceName = Sources.isLocalSource(source) ? t('source.local_source.title') : name;

    const updateSetting = createUpdateSourceMetadata(source, (e) =>
        makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)),
    );

    return (
        <Card
            sx={{
                margin: 1,
                marginTop: 0,
            }}
        >
            <CardActionArea
                component={Link}
                to={AppRoutes.sources.childRoutes.browse.path(id)}
                state={{ contentType: SourceContentType.POPULAR, clearCache: true }}
            >
                <ListCardContent>
                    <ListCardAvatar iconUrl={requestManager.getValidImgUrlFor(iconUrl)} alt={sourceName} />
                    <Stack
                        sx={{
                            justifyContent: 'center',
                            flexGrow: 1,
                            flexShrink: 1,
                            wordBreak: 'break-word',
                        }}
                    >
                        <Typography variant="h6" component="h3">
                            {sourceName}
                        </Typography>
                        <Typography variant="caption">
                            {translateExtensionLanguage(lang)}
                            {isNsfw && (
                                <Typography variant="caption" color="error">
                                    {' 18+'}
                                </Typography>
                            )}
                        </Typography>
                        {showSourceRepo && <Typography variant="caption">{repo}</Typography>}
                    </Stack>
                    {supportsLatest && (
                        <Button
                            {...MUIUtil.preventRippleProp()}
                            variant="outlined"
                            component={Link}
                            to={AppRoutes.sources.childRoutes.browse.path(id)}
                            state={{ contentType: SourceContentType.LATEST, clearCache: true }}
                        >
                            {t('global.button.latest')}
                        </Button>
                    )}
                    <CustomTooltip title={t(isPinned ? 'source.pin.remove' : 'source.pin.add')}>
                        <IconButton
                            {...MUIUtil.preventRippleProp()}
                            onClick={(e) => {
                                e.preventDefault();
                                updateSetting('isPinned', !isPinned);
                            }}
                            color={isPinned ? 'primary' : 'inherit'}
                        >
                            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
                        </IconButton>
                    </CustomTooltip>
                </ListCardContent>
            </CardActionArea>
        </Card>
    );
};
