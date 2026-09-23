/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import React from 'react';
import { useLingui } from '@lingui/react/macro';
import { ListSubheader } from '@/base/components/lists/ListSubheader.tsx';
import type { NovelFontFamily, NovelTextAlign } from '@/features/novel-reader/stores/NovelReaderSettingsStore.ts';
import { useNovelReaderSettingsStore } from '@/features/novel-reader/stores/NovelReaderSettingsStore.ts';
import { SliderInput } from '@/base/components/inputs/SliderInput.tsx';

export interface NovelReaderSettingsFormProps {
    sx?: SxProps<Theme>;
}

export const NovelReaderSettingsForm: React.FC<NovelReaderSettingsFormProps> = ({ sx }) => {
    const { t } = useLingui();

    const settings = useNovelReaderSettingsStore(
        'fontFamily',
        'fontSize',
        'lineHeight',
        'maxWidth',
        'textAlign',
        'margin',
        'paragraphSpacing',
    );
    const setSetting = useNovelReaderSettingsStore('setSetting');
    const resetSettings = useNovelReaderSettingsStore('resetSettings');

    const renderSlider = (
        key: 'fontSize' | 'lineHeight' | 'maxWidth' | 'margin' | 'paragraphSpacing',
        label: string,
        min: number,
        max: number,
        step: number,
        unit: string,
    ) => {
        const val = settings[key];
        const displayValue = unit === '' ? val.toFixed(1) : `${unit === 'em' ? val.toFixed(1) : val}${unit}`;
        return (
            <SliderInput
                key={key}
                label={label}
                value={displayValue}
                slotProps={{
                    slider: {
                        value: val,
                        min,
                        max,
                        step,
                        onChange: (_, v) => setSetting(key, v as number),
                    },
                }}
            />
        );
    };

    return (
        <Stack sx={{ gap: 2, ...sx }}>
            <ListSubheader component="div" id="novel-typography-settings">
                {t`Typography`}
            </ListSubheader>
            <Stack sx={{ px: 2, gap: 2.5 }}>
                {/* Font Family */}
                <Stack
                    sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Typography>{t`Font Family`}</Typography>
                    <Select
                        size="small"
                        value={settings.fontFamily}
                        onChange={(e) => setSetting('fontFamily', e.target.value as NovelFontFamily)}
                        sx={{ minWidth: { sm: 220 }, maxWidth: { sm: 360 } }}
                    >
                        <MenuItem value="serif">{t`Serif (Literary)`}</MenuItem>
                        <MenuItem value="sans-serif">{t`Sans-Serif (Clean)`}</MenuItem>
                        <MenuItem value="monospace">{t`Monospace (Code)`}</MenuItem>
                        <MenuItem value="opendyslexic">{t`OpenDyslexic`}</MenuItem>
                    </Select>
                </Stack>

                {/* Font Size & Line Height */}
                {renderSlider('fontSize', t`Font Size`, 12, 36, 1, 'px')}
                {renderSlider('lineHeight', t`Line Height`, 1.2, 2.4, 0.1, '')}

                {/* Text Alignment */}
                <Stack
                    sx={{
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Typography>{t`Text Alignment`}</Typography>
                    <ToggleButtonGroup
                        value={settings.textAlign}
                        exclusive
                        onChange={(_, val) => val && setSetting('textAlign', val as NovelTextAlign)}
                        size="small"
                        sx={{ maxWidth: { sm: 360 }, width: { xs: '100%', sm: 'auto' } }}
                    >
                        <ToggleButton value="left" sx={{ flex: 1 }}>
                            <FormatAlignLeftIcon fontSize="small" sx={{ mr: 1 }} /> {t`Left`}
                        </ToggleButton>
                        <ToggleButton value="justify" sx={{ flex: 1 }}>
                            <FormatAlignJustifyIcon fontSize="small" sx={{ mr: 1 }} /> {t`Justify`}
                        </ToggleButton>
                        <ToggleButton value="center" sx={{ flex: 1 }}>
                            <FormatAlignCenterIcon fontSize="small" sx={{ mr: 1 }} /> {t`Center`}
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Stack>

            <ListSubheader component="div" id="novel-layout-settings">
                {t`Layout & Margins`}
            </ListSubheader>
            <Stack sx={{ px: 2, gap: 2.5 }}>
                {renderSlider('maxWidth', t`Content Width`, 500, 1400, 50, 'px')}
                {renderSlider('margin', t`Side Margin`, 12, 64, 4, 'px')}
                {renderSlider('paragraphSpacing', t`Paragraph Spacing`, 0.5, 2.0, 0.1, 'em')}
            </Stack>

            <Box sx={{ px: 2, pt: 1, pb: 3 }}>
                <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    startIcon={<RestartAltIcon />}
                    onClick={resetSettings}
                >
                    {t`Reset to Default`}
                </Button>
            </Box>
        </Stack>
    );
};
