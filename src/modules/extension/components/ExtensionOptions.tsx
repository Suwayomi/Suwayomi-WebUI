/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered';
import { getErrorMessage } from '@/lib/HelperFunctions';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip';
import { AppRoutes } from '@/modules/core/AppRoute.constants';
import { translateExtensionLanguage } from '@/modules/extension/Extensions.utils';

interface IExtensionOptions {
    extensionId: string | null;
    closeDialog: () => void;
}

export function ExtensionOptions({ extensionId, closeDialog }: IExtensionOptions) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const {
        data,
        loading: isLoading,
        error,
        refetch,
    } = requestManager.useGetSourceList({ notifyOnNetworkStatusChange: true });

    if (error) {
        return <Dialog open={!!extensionId} onClose={closeDialog} />;
    }

    const relevantSources = data?.sources.nodes.filter((s) => s.extension.pkgName === extensionId);

    return (
        <Dialog open={!!extensionId} onClose={closeDialog}>
            <DialogTitle>{t('extension.settings.dialog.title')}</DialogTitle>
            <DialogContent>
                {isLoading && <LoadingPlaceholder />}
                {error && (
                    <EmptyViewAbsoluteCentered
                        message={t('global.error.label.failed_to_load_data')}
                        messageExtra={getErrorMessage(error)}
                        retry={() => refetch().catch(defaultPromiseErrorHandler('ExtensionOptions::refetch'))}
                    />
                )}
                {!isLoading && !error && (
                    <Box
                        sx={{
                            pb: 2,
                            pt: 2,
                            mx: 2,
                        }}
                    >
                        {relevantSources?.map((source) => (
                            <Card key={source.id}>
                                <CardContent
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        p: 1.5,
                                        '&:last-child': {
                                            paddingBottom: 1.5,
                                        },
                                    }}
                                >
                                    <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                                        {translateExtensionLanguage(source.lang)}
                                    </Typography>
                                    {source.isConfigurable && (
                                        <CustomTooltip title={t('settings.title')}>
                                            <IconButton
                                                onClick={() =>
                                                    navigate(AppRoutes.sources.childRoutes.configure.path(source.id))
                                                }
                                                aria-label="display more actions"
                                                edge="end"
                                                color="inherit"
                                                size="large"
                                            >
                                                <SettingsIcon />
                                            </IconButton>
                                        </CustomTooltip>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
