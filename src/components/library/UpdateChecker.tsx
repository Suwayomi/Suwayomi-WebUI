/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useMemo } from 'react';
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

export function UpdateChecker({ handleFinishedUpdate }: { handleFinishedUpdate: () => void }) {
    const { t } = useTranslation();

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

    const isUpdateFinished = progress === 100;
    if (isUpdateFinished) {
        handleFinishedUpdate();
    }

    const onClick = async () => {
        try {
            await requestManager.startGlobalUpdate().response;
        } catch (e) {
            makeToast(t('global.error.label.update_failed'), 'error');
        }
    };

    return (
        <Tooltip title={t('library.settings.global_update.title')}>
            <IconButton onClick={onClick} disabled={loading}>
                {loading ? <Progress progress={progress} /> : <RefreshIcon />}
            </IconButton>
        </Tooltip>
    );
}
