/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
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
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';

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

    const [recordPhysicalKeys, setRecordPhysicalKeys] = useState(true);

    const [recordedKeys, { start, stop, resetKeys }] = useRecordHotkeys(!recordPhysicalKeys);

    const keys = [[...recordedKeys].join('+')];
    const isExistingKey = keys.some((key) =>
        existingKeys.map((existingKey) => existingKey.toLowerCase()).includes(key.toLowerCase()),
    );

    useEffect(() => {
        start();

        return () => {
            stop();
        };
    }, [start, stop]);

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
                <CheckboxInput
                    label={
                        <Stack
                            sx={{
                                // Padding comes from the MUI Checkbox component
                                pt: '9px',
                            }}
                        >
                            <Typography>{t`Record physical keys`}</Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', gap: 1 }}>
                                <Trans>
                                    enabled: records <Hotkey keys={['shift+1']} /> when the user presses Shift+1
                                </Trans>
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', gap: 1 }}>
                                <Trans>
                                    disabled: records <Hotkey keys={['!']} /> when the user presses Shift+1 on a US
                                    layout
                                </Trans>
                            </Typography>
                        </Stack>
                    }
                    checked={recordPhysicalKeys}
                    onChange={(_, checked) => setRecordPhysicalKeys(checked)}
                    sx={{ mt: 2, alignItems: 'start' }}
                />
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
