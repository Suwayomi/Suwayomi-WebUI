/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import Tooltip from '@mui/material/Tooltip';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ClearIcon from '@mui/icons-material/Clear';
import Stack from '@mui/material/Stack';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { UpdaterSubscription } from '@/lib/graphql/generated/graphql.ts';
import { Progress } from '@/modules/core/components/Progress.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { dateTimeFormatter } from '@/util/DateHelper.ts';
import { MediaQuery } from '@/modules/core/utils/MediaQuery.tsx';

import { CategoryIdInfo } from '@/modules/category/Category.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';

const calcProgress = (status: UpdaterSubscription['updateStatusChanged'] | undefined) => {
    if (!status) {
        return 0;
    }

    const finishedUpdates = status.failedJobs.mangas.totalCount + status.completeJobs.mangas.totalCount;
    const totalMangas = finishedUpdates + status.pendingJobs.mangas.totalCount + status.runningJobs.mangas.totalCount;

    const progress = 100 * (finishedUpdates / totalMangas);

    return Number.isNaN(progress) ? 0 : progress;
};

let lastRunningState = false;

export function UpdateChecker({
    categoryId,
    handleFinishedUpdate,
}: {
    categoryId?: CategoryIdInfo['id'];
    handleFinishedUpdate?: () => void;
}) {
    const { t } = useTranslation();
    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const [isHovered, setIsHovered] = useState(false);

    const { data: lastUpdateTimestampData, refetch: reFetchLastTimestamp } =
        requestManager.useGetLastGlobalUpdateTimestamp();
    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;
    const { data: updaterData } = requestManager.useGetGlobalUpdateSummary();
    const status = updaterData?.updateStatus;

    const isRunning = !!status?.isRunning;
    const progress = useMemo(
        () => calcProgress(status),
        [
            status?.failedJobs.mangas.totalCount,
            status?.completeJobs.mangas.totalCount,
            status?.pendingJobs.mangas.totalCount,
            status?.runningJobs.mangas.totalCount,
        ],
    );

    useEffect(() => {
        if (!lastRunningState && status?.isRunning) {
            lastRunningState = true;
        }

        const isUpdateFinished = lastRunningState && progress === 100;
        if (!isUpdateFinished) {
            return;
        }

        lastRunningState = false;
        handleFinishedUpdate?.();
        // this re-fetch is necessary since a running update could have been triggered by the server or another client
        reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
    }, [status?.isRunning]);

    const startUpdate = async (category?: CategoryIdInfo['id']) => {
        try {
            lastRunningState = true;
            await requestManager.startGlobalUpdate(category !== undefined ? [category] : undefined).response;
            reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
        } catch (e) {
            lastRunningState = false;
            makeToast(t('global.error.label.update_failed'), 'error', getErrorMessage(e));
        }
    };

    const stopUpdate = async () => {
        try {
            await requestManager.resetGlobalUpdate();
        } catch (e) {
            makeToast(t('library.error.label.stop_global_update'), 'error', getErrorMessage(e));
        }
    };

    const onClick = async (category?: CategoryIdInfo['id']) => {
        if (isRunning) {
            stopUpdate();
        } else {
            startUpdate(category);
        }
    };

    return (
        <PopupState variant="popover" popupId="library-update-checker-menu">
            {(popupState) => (
                <>
                    <Tooltip
                        title={
                            isRunning
                                ? t('library.action.label.stop_update')
                                : t('library.settings.global_update.label.last_update_tooltip', {
                                      date: lastUpdateTimestamp ? dateTimeFormatter.format(+lastUpdateTimestamp) : '-',
                                  })
                        }
                    >
                        <IconButton
                            sx={{ position: 'relative' }}
                            {...(categoryId !== undefined && !isRunning
                                ? bindTrigger(popupState)
                                : { onClick: () => onClick() })}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            color="inherit"
                        >
                            {!isRunning ? (
                                <RefreshIcon />
                            ) : (
                                <>
                                    <ClearIcon sx={{ opacity: Number(isTouchDevice || isHovered) }} />
                                    <Stack sx={{ position: 'absolute' }}>
                                        <Progress
                                            progress={progress}
                                            showText={!isTouchDevice && !isHovered}
                                            progressProps={{ color: 'inherit' }}
                                        />
                                    </Stack>
                                </>
                            )}
                        </IconButton>
                    </Tooltip>
                    <Menu {...bindMenu(popupState)}>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick();
                            }}
                        >
                            {t('library.action.label.update_library')}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick(categoryId);
                            }}
                        >
                            {t('library.action.label.update_category')}
                        </MenuItem>
                    </Menu>
                </>
            )}
        </PopupState>
    );
}
