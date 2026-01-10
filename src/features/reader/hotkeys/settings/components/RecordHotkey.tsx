/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect } from 'react';
import Stack from '@mui/material/Stack';
import { useRecordHotkeys } from 'react-hotkeys-hook';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Trans, useLingui } from '@lingui/react/macro';
import { Hotkey } from '@/features/reader/hotkeys/settings/components/Hotkey.tsx';

export const RecordHotkey = ({
    onClose,
    onCreate,
    existingKeys,
}: {
    onClose: () => void;
    onCreate: (keys: string[]) => void;
    existingKeys: string[];
}) => {
    const { t } = useLingui();

    const [recordedKeys, { start, stop, resetKeys }] = useRecordHotkeys();
    const keys = [[...recordedKeys].join('+')];
    const isExistingKey = keys.some((key) =>
        existingKeys.map((existingKey) => existingKey.toLowerCase()).includes(key.toLowerCase()),
    );

    useEffect(() => {
        start();

        return () => {
            stop();
        };
    }, []);

    return (
        <Dialog open onClose={onClose} fullWidth>
            <DialogTitle>{t`Record keybind`}</DialogTitle>
            <DialogContent>
                <Stack sx={{ flexDirection: 'row', gap: 1 }}>
                    <Trans>
                        Recorded hotkeys:{' '}
                        {recordedKeys.size ? <Hotkey keys={keys} /> : <Typography>{t`Press keys`}</Typography>}
                    </Trans>
                </Stack>
                {isExistingKey && <Typography color="error">{t`Hotkey already exists`}</Typography>}
            </DialogContent>
            <DialogActions>
                <Stack
                    direction="row"
                    sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <Button onClick={resetKeys}>{t`Reset`}</Button>
                    <Stack direction="row">
                        <Button onClick={onClose}>{t`Cancel`}</Button>
                        <Button
                            disabled={isExistingKey}
                            onClick={() => {
                                onClose();
                                onCreate(keys);
                            }}
                        >
                            {t`Create`}
                        </Button>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};
