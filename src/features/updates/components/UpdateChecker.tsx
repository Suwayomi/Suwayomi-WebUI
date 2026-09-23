/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ClearIcon from '@mui/icons-material/Clear';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { CircularProgressWithText } from '@/base/components/feedback/CircularProgressWithText.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { dateTimeFormatter } from '@/base/utils/DateHelper.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import type { CategoryIdInfo } from '@/features/category/Category.types.ts';
import type { SourceContentType } from '@/lib/graphql/generated/graphql-base.types.ts';

import { getErrorMessage } from '@/lib/HelperFunctions.ts';

export function UpdateChecker({
    categoryId,
    contentType,
    handleFinishedUpdate,
}: {
    categoryId?: CategoryIdInfo['id'];
    contentType?: SourceContentType;
    handleFinishedUpdate?: () => void;
}) {
    const { t } = useLingui();
    const isTouchDevice = MediaQuery.useIsTouchDevice();

    const [isHovered, setIsHovered] = useState(false);
    const lastRunningState = useRef(false);

    const { data: lastUpdateTimestampData, refetch: reFetchLastTimestamp } =
        requestManager.useGetLastContentUpdateTimestamp(contentType);

    const { data: updaterData } = requestManager.useGetGlobalUpdateSummary(contentType);
    const status = updaterData?.libraryUpdateStatus;

    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;
    const date = lastUpdateTimestamp ? dateTimeFormatter.format(+lastUpdateTimestamp) : '-';

    const isRunning = !!status?.jobsInfo.isRunning;
    const progress = status?.jobsInfo.totalJobs ? (status.jobsInfo.finishedJobs / status.jobsInfo.totalJobs) * 100 : 0;

    useEffect(() => {
        if (!lastRunningState.current && isRunning) {
            lastRunningState.current = true;
        }

        const isUpdateFinished = lastRunningState.current && !isRunning;
        if (!isUpdateFinished) {
            return;
        }

        lastRunningState.current = false;
        handleFinishedUpdate?.();
        // this re-fetch is necessary since a running update could have been triggered by the server or another client
        reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
    }, [isRunning, status?.jobsInfo.totalJobs, status?.jobsInfo.finishedJobs]);

    const startUpdate = async (category?: CategoryIdInfo['id']) => {
        try {
            await requestManager.startGlobalUpdate(category !== undefined ? [category] : undefined, contentType)
                .response;
            reFetchLastTimestamp().catch(defaultPromiseErrorHandler('UpdateChecker::reFetchLastTimestamp'));
        } catch (e) {
            lastRunningState.current = false;
            makeToast(t`Could not check for updates`, 'error', getErrorMessage(e));
        }
    };

    const stopUpdate = async () => {
        try {
            await requestManager.resetGlobalUpdate(contentType);
        } catch (e) {
            makeToast(t`Could not stop global update`, 'error', getErrorMessage(e));
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
                    <CustomTooltip title={isRunning ? t`Stop global update` : t`Global update (last update: ${date})`}>
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
                                        <CircularProgressWithText
                                            progress={progress}
                                            showText={!isTouchDevice && !isHovered}
                                            progressProps={{ color: 'inherit' }}
                                        />
                                    </Stack>
                                </>
                            )}
                        </IconButton>
                    </CustomTooltip>
                    <Menu {...bindMenu(popupState)}>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick();
                            }}
                        >
                            {t`Update library`}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                popupState.close();
                                onClick(categoryId);
                            }}
                        >
                            {t`Update category`}
                        </MenuItem>
                    </Menu>
                </>
            )}
        </PopupState>
    );
}
