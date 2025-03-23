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
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { OptionsPanel } from '@/modules/core/components/OptionsPanel.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered';
import { getErrorMessage } from '@/lib/HelperFunctions';
import { GET_SOURCE_BROWSE } from '@/lib/graphql/queries/SourceQuery';
import { GetSourceBrowseQuery, GetSourceBrowseQueryVariables } from '@/lib/graphql/generated/graphql';
import { CustomTooltip } from '@/modules/core/components/CustomTooltip';
import { AppRoutes } from '@/modules/core/AppRoute.constants';

interface IExtensionOptions {
    extensionId: string;
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

    if (isLoading) {
        return (
            <OptionsPanel open onClose={closeDialog}>
                <LoadingPlaceholder />;
            </OptionsPanel>
        );
    }

    if (error) {
        return (
            <OptionsPanel open onClose={closeDialog}>
                <EmptyViewAbsoluteCentered
                    message={t('global.error.label.failed_to_load_data')}
                    messageExtra={getErrorMessage(error)}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('Sources::refetch'))}
                />
            </OptionsPanel>
        );
    }

    console.log(extensionId);

    const relevantSources = data?.sources.nodes
        .filter((s) => s.extension.pkgName === extensionId)
        .map((s) => {
            const { data: sourceData } = requestManager.useGetSource<
                GetSourceBrowseQuery,
                GetSourceBrowseQueryVariables
            >(GET_SOURCE_BROWSE, s.id);
            return { source: s, sourceData: sourceData?.source };
        });

    if (!relevantSources || relevantSources.filter((s) => !s.sourceData).length > 0) {
        return (
            <OptionsPanel open onClose={closeDialog}>
                <LoadingPlaceholder />;
            </OptionsPanel>
        );
    }

    return (
        <OptionsPanel open onClose={closeDialog}>
            <Box
                sx={{
                    pb: 2,
                    pt: 2,
                    mx: 2,
                }}
            >
                {relevantSources.map((s) => {
                    const { source, sourceData } = s;
                    return (
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
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        flexGrow: 1,
                                        flexShrink: 1,
                                        wordBreak: 'break-word',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="h6" component="h3">
                                        {source.lang}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: 'block',
                                        }}
                                    >
                                        {source.isNsfw && (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                                sx={{
                                                    display: 'inline',
                                                }}
                                            >
                                                {' 18+'}
                                            </Typography>
                                        )}
                                    </Typography>
                                </Box>
                                {sourceData?.isConfigurable && (
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
                    );
                })}
            </Box>
        </OptionsPanel>
    );
}
