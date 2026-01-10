/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { IMAGE_PROCESSING_INPUT_WIDTH } from '@/features/settings/Settings.constants.ts';
import { TSettingsDownloadConversionKeyValueItem } from '@/features/settings/Settings.types';

export const KeyValueItem = ({
    id,
    name,
    value,
    onChange,
    isDuplicate,
}: {
    isDuplicate: boolean;
    onChange: (header: TSettingsDownloadConversionKeyValueItem | null) => void;
} & TSettingsDownloadConversionKeyValueItem) => {
    const { t } = useLingui();
    const theme = useTheme();

    return (
        <Stack
            sx={{
                gap: 1,
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
            }}
        >
            <Stack
                sx={{
                    flexDirection: 'row',
                    gap: 2,
                    [theme.breakpoints.down('md')]: {
                        flexDirection: 'column',
                        width: '100%',
                    },
                }}
            >
                <TextField
                    autoFocus
                    sx={{ width: IMAGE_PROCESSING_INPUT_WIDTH }}
                    label={t`Name`}
                    value={name}
                    error={isDuplicate}
                    helperText={isDuplicate && t`Invalid input`}
                    onChange={(e) =>
                        onChange({
                            id,
                            name: e.target.value,
                            value,
                        })
                    }
                />
                <TextField
                    sx={{ width: IMAGE_PROCESSING_INPUT_WIDTH }}
                    label={t`Value`}
                    value={value}
                    onChange={(e) =>
                        onChange({
                            id,
                            name,
                            value: e.target.value,
                        })
                    }
                />
            </Stack>
            <CustomTooltip disabled={false} title={t`Delete`}>
                <IconButton
                    onClick={() => {
                        onChange(null);
                    }}
                >
                    <DeleteIcon />
                </IconButton>
            </CustomTooltip>
        </Stack>
    );
};
