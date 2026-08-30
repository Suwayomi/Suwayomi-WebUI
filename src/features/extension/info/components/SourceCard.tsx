/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Switch from '@mui/material/Switch';
import CardActionArea from '@mui/material/CardActionArea';
import { useLingui } from '@lingui/react/macro';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { Sources } from '@/features/source/services/Sources.ts';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils.ts';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { StyledGroupItemWrapper } from '@/base/components/virtuoso/StyledGroupItemWrapper.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { createUpdateSourceMetadata, useGetSourceMetadata } from '@/features/source/services/SourceMetadata.ts';
import type {
    SourceConfigurableInfo,
    SourceIdInfo,
    SourceLanguageInfo,
    SourceMetaInfo,
} from '@/features/source/Source.types.ts';
import { useMemo } from 'react';
import { getISOLanguage } from '@/lib/ISOLanguageUtil.ts';
import Stack from '@mui/material/Stack';

export const SourceCard = (source: SourceIdInfo & SourceMetaInfo & SourceLanguageInfo & SourceConfigurableInfo) => {
    const { id, isConfigurable } = source;

    const { t } = useLingui();
    const { isEnabled } = useGetSourceMetadata(source);
    const { languages, setLanguages } = Sources.useLanguages();

    const isLanguageEnabled = useMemo(() => Sources.isLanguageEnabled(source, languages), [languages, source.lang]);
    const finalIsEnabled = useMemo(() => Sources.isEnabled(source, languages), [source, languages]);

    const updateSetting = createUpdateSourceMetadata(source, (e) =>
        makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)),
    );

    return (
        <StyledGroupItemWrapper key={id} sx={{ px: 0 }}>
            <Card>
                <CardActionArea
                    onClick={() => {
                        if (!isLanguageEnabled) {
                            setLanguages([...languages, source.lang]);

                            if (!isEnabled) {
                                updateSetting('isEnabled', !isEnabled);
                            }

                            return;
                        }

                        updateSetting('isEnabled', !isEnabled);
                    }}
                >
                    <ListCardContent>
                        <Stack sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="h3">
                                {translateExtensionLanguage(Sources.getLanguage(source))}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                {getISOLanguage(Sources.getLanguage(source))?.name}
                            </Typography>
                        </Stack>
                        {isConfigurable && (
                            <CustomTooltip title={t`Settings`}>
                                <IconButton
                                    component={Link}
                                    to={AppRoutes.sources.children.configure.path(id)}
                                    color="inherit"
                                    onClick={(e) => e.stopPropagation()}
                                    {...MUIUtil.preventRippleProp()}
                                >
                                    <SettingsIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        <Switch checked={finalIsEnabled} />
                    </ListCardContent>
                </CardActionArea>
            </Card>
        </StyledGroupItemWrapper>
    );
};
