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
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { useMemo } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/features/core/components/feedback/LoadingPlaceholder';
import { EmptyViewAbsoluteCentered } from '@/features/core/components/feedback/EmptyViewAbsoluteCentered';
import { getErrorMessage } from '@/lib/HelperFunctions';
import { CustomTooltip } from '@/features/core/components/CustomTooltip';
import { AppRoutes } from '@/features/core/AppRoute.constants';
import { translateExtensionLanguage } from '@/features/extension/Extensions.utils';
import { StyledGroupItemWrapper } from '@/features/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { TExtension } from '@/features/extension/Extensions.types.ts';
import { Sources } from '@/features/source/services/Sources.ts';
import { ListCardContent } from '@/features/core/components/lists/cards/ListCardContent.tsx';

interface IExtensionOptions {
    extensionId: TExtension['pkgName'] | undefined;
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

    const relevantSources = useMemo(() => {
        if (!extensionId) return [];

        return data?.sources.nodes.filter((source) => source.extension.pkgName === extensionId);
    }, [data?.sources.nodes, extensionId]);

    return (
        <Dialog open={!!extensionId} onClose={closeDialog} maxWidth="md" fullWidth>
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
                    <Box>
                        {relevantSources?.map((source) => (
                            <StyledGroupItemWrapper key={source.id} sx={{ px: 0 }}>
                                <Card>
                                    <ListCardContent>
                                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                                            {translateExtensionLanguage(Sources.getLanguage(source))}
                                        </Typography>
                                        {source.isConfigurable && (
                                            <CustomTooltip title={t('settings.title')}>
                                                <IconButton
                                                    onClick={() =>
                                                        navigate(
                                                            AppRoutes.sources.childRoutes.configure.path(source.id),
                                                        )
                                                    }
                                                    color="inherit"
                                                >
                                                    <SettingsIcon />
                                                </IconButton>
                                            </CustomTooltip>
                                        )}
                                    </ListCardContent>
                                </Card>
                            </StyledGroupItemWrapper>
                        ))}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
}
