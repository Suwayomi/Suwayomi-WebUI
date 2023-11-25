/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/components/util/Toast';
import { UpdaterSubscription } from '@/lib/graphql/generated/graphql.ts';
import { Progress } from '@/components/util/Progress';

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

export function UpdateChecker({ handleFinishedUpdate }: { handleFinishedUpdate?: () => void }) {
    const { t } = useTranslation();

    const { data: lastUpdateTimestampData, refetch: reFetchLastTimestamp } =
        requestManager.useGetLastGlobalUpdateTimestamp();
    const lastUpdateTimestamp = lastUpdateTimestampData?.lastUpdateTimestamp.timestamp;
    const { data: updaterData } = requestManager.useUpdaterSubscription();
    const status = updaterData?.updateStatusChanged;

    const loading = !!status?.isRunning;
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
        reFetchLastTimestamp().catch(() => {});
    }, [status?.isRunning]);

    const onClick = async () => {
        try {
            lastRunningState = true;
            await requestManager.startGlobalUpdate().response;
            reFetchLastTimestamp().catch(() => {});
        } catch (e) {
            lastRunningState = false;
            makeToast(t('global.error.label.update_failed'), 'error');
        }
    };

    return (
        <Tooltip
            title={t('library.settings.global_update.label.last_update_tooltip', {
                date: lastUpdateTimestamp ? new Date(+lastUpdateTimestamp).toLocaleString() : '-',
            })}
        >
            <IconButton onClick={onClick} disabled={loading}>
                {loading ? <Progress progress={progress} /> : <RefreshIcon />}
            </IconButton>
        </Tooltip>
    );
}
