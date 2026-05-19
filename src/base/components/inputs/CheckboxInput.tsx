/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CheckboxProps } from '@mui/material/Checkbox';
import Checkbox from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type BaseProps = CheckboxProps;
type LabelProps = { label?: FormControlLabelProps['label'] };
type PrimaryTextProps = {
    primaryText?: FormControlLabelProps['label'];
    secondaryText?: FormControlLabelProps['label'];
};

type Props = BaseProps &
    ((LabelProps & PropertiesNever<PrimaryTextProps>) | (PropertiesNever<LabelProps> & PrimaryTextProps));

export const CheckboxInput = ({ label, primaryText, secondaryText, sx, ...rest }: Props) => (
    <FormControlLabel
        control={<Checkbox {...rest} />}
        label={(() => {
            if (label) {
                return label;
            }

            if (primaryText && !secondaryText) {
                return primaryText;
            }

            return (
                <Stack
                    sx={{
                        // Padding comes from the MUI Checkbox component
                        pt: '9px',
                    }}
                >
                    {typeof primaryText === 'string' ? <Typography>{primaryText}</Typography> : primaryText}
                    {typeof secondaryText === 'string' ? (
                        <Typography variant="body2" color="textSecondary">
                            {secondaryText}
                        </Typography>
                    ) : (
                        secondaryText
                    )}
                </Stack>
            );
        })()}
        sx={sx}
    />
);
