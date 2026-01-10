/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DownloadingIcon from '@mui/icons-material/Downloading';
import { t } from '@lingui/core/macro';
import { UpdateState } from '@/lib/graphql/generated/graphql.ts';

export type BaseVersionInfoProps = {
    version: string;
    isCheckingForUpdate: boolean;
    isUpdateAvailable: boolean;
    updateCheckError: any;
    checkForUpdate: () => void;
};
export type LinkVersionInfoProps = {
    downloadAsLink: true;
    url: string;
};
export type TriggerVersionInfoProps = {
    triggerUpdate: () => void;
    updateState: UpdateState;
    progress: number;
};
export type VersionInfoProps =
    | (BaseVersionInfoProps & PropertiesNever<TriggerVersionInfoProps> & LinkVersionInfoProps)
    | (BaseVersionInfoProps & TriggerVersionInfoProps & PropertiesNever<LinkVersionInfoProps>);

const getUpdateCheckButtonIcon = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    updateState?: UpdateState,
    asLink: boolean = false,
) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;
    if (isUpdateInProgress) {
        return <DownloadingIcon />;
    }

    if (isLoading) {
        return <CircularProgress size={15} />;
    }

    const isRefreshRequired = !isUpdateAvailable || updateState === UpdateState.Error;
    if (isRefreshRequired) {
        return <RefreshIcon />;
    }

    return asLink ? <OpenInNewIcon /> : <DownloadIcon />;
};

const getUpdateCheckButtonText = (
    isLoading: boolean,
    isUpdateAvailable: boolean,
    error: any,
    updateState?: UpdateState,
    progress: number = 0,
) => {
    const isUpdating = updateState === UpdateState.Downloading;
    if (isUpdating) {
        return t`${progress}% | Updating…`;
    }

    const didUpdateFail = updateState === UpdateState.Error;
    if (didUpdateFail) {
        return t`Update failed`;
    }

    if (isLoading) {
        return t`Checking for update`;
    }

    if (error) {
        return t`Could not check for update`;
    }

    if (isUpdateAvailable) {
        return t`Update available`;
    }

    return t`This is the latest version`;
};

export const VersionInfo = ({
    version,
    isCheckingForUpdate,
    isUpdateAvailable,
    updateCheckError,
    checkForUpdate,
    triggerUpdate,
    updateState,
    progress,
    downloadAsLink,
    url,
}: VersionInfoProps) => {
    const isUpdateInProgress = updateState === UpdateState.Downloading;

    const onClick = () => {
        if (isUpdateInProgress) {
            return;
        }

        const shouldCheckForUpdate = !isUpdateAvailable || updateCheckError || updateState === UpdateState.Error;
        if (shouldCheckForUpdate) {
            checkForUpdate();
            return;
        }

        if (isUpdateAvailable) {
            triggerUpdate?.();
        }
    };

    return (
        <Stack
            sx={{
                alignItems: 'start',
            }}
        >
            <Typography component="span" variant="body2">
                {version}
            </Typography>
            <Button
                sx={{
                    marginTop: '5px',
                    backgroundColor: 'transparent',
                    pointerEvents: isUpdateInProgress ? 'none' : 'unset',
                }}
                size="small"
                variant="outlined"
                startIcon={getUpdateCheckButtonIcon(
                    isCheckingForUpdate,
                    isUpdateAvailable,
                    updateState,
                    downloadAsLink,
                )}
                onClick={onClick}
                {...(!!url && isUpdateAvailable
                    ? {
                          href: url,
                          target: '_blank',
                      }
                    : undefined)}
            >
                {getUpdateCheckButtonText(
                    isCheckingForUpdate,
                    isUpdateAvailable,
                    updateCheckError,
                    updateState,
                    progress,
                )}
            </Button>
        </Stack>
    );
};
