import React, { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import Typography from '@mui/material/Typography';
import client from 'util/client';
import makeToast from '../util/Toast';

interface IProgressProps {
    progress: number
}

function Progress({ progress }: IProgressProps) {
    return (
        <Box sx={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
            <CircularProgress variant="determinate" value={progress} />
            <Box sx={{ position: 'absolute' }}>
                <Typography fontSize="0.8rem">
                    {`${Math.round(progress)}%`}
                </Typography>
            </Box>
        </Box>

    );
}

const baseWebsocketUrl = JSON.parse(window.localStorage.getItem('serverBaseURL')!).replace('http', 'ws');

function UpdateChecker() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    const onClick = async () => {
        try {
            setLoading(true);
            setProgress(0);
            await client.post('/api/v1/update/fetch');
        } catch (e) {
            makeToast('Checking for updates failed!', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        const wsc = new WebSocket(`${baseWebsocketUrl}/api/v1/update`);
        wsc.onmessage = (e) => {
            const data = JSON.parse(e.data) as IUpdateStatus;
            const { COMPLETE, RUNNING, PENDING } = data.statusMap;

            setLoading(data.running);
            const currentProgress = 100 * (COMPLETE / (COMPLETE + RUNNING + PENDING));

            setProgress(Number.isNaN(currentProgress) ? 0 : currentProgress);
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
