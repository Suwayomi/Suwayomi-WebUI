/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { IUpdateStatus } from '@/typings';
import requestManager from '@/lib/RequestManager';
import makeToast from '@/components/util/Toast';

interface IProgressProps {
    progress: number;
}

function Progress({ progress }: IProgressProps) {
    return (
        <Box sx={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
            <CircularProgress variant="determinate" value={progress} />
            <Box sx={{ position: 'absolute' }}>
                <Typography fontSize="0.8rem">{`${Math.round(progress)}%`}</Typography>
            </Box>
        </Box>
    );
}

interface IUpdateCheckerProps {
    handleFinishedUpdate: (time: number) => void;
}

function UpdateChecker({ handleFinishedUpdate }: IUpdateCheckerProps) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onClick = async () => {
        try {
            setLoading(true);
            setProgress(0);
            await requestManager.startGlobalUpdate().response;
        } catch (e) {
            makeToast(t('global.error.label.update_failed'), 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        const wsc = requestManager.getUpdateWebSocket();

        // "loading" can't be used since it will be outdated once the state gets changed
        // it could be used by adding it as a dependency of "useEffect" but then the socket would
        // get closed and connected again every time it changes
        let updateStarted = false;

        wsc.onmessage = (e) => {
            const { running, mangaStatusMap } = JSON.parse(e.data) as IUpdateStatus;
            const { COMPLETE = [], RUNNING = [], PENDING = [] } = mangaStatusMap;

            const currentProgress = 100 * (COMPLETE.length / (COMPLETE.length + RUNNING.length + PENDING.length));

            const isUpdateFinished = currentProgress === 100;
            const ignoreFaultyMessage = !updateStarted && !running && isUpdateFinished;

            // for some reason the server sends 100% completed manga updates when connecting to the
            // socket while no update is running
            if (ignoreFaultyMessage) {
                return;
            }

            updateStarted = running;
            setLoading(running);
            setProgress(Number.isNaN(currentProgress) ? 0 : currentProgress);

            if (isUpdateFinished) {
                handleFinishedUpdate(Date.now());
            }
        };

        return () => wsc.close();
    }, []);

    return (
        <IconButton onClick={onClick} disabled={loading}>
            {loading ? <Progress progress={progress} /> : <RefreshIcon />}
        </IconButton>
    );
}

export default UpdateChecker;
