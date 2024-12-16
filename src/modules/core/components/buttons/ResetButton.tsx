/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button, { ButtonProps } from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export const ResetButton = (props: ButtonProps) => {
    const { t } = useTranslation();

    return (
        <Button startIcon={<RestartAltIcon />} {...props}>
            {t('global.button.reset')}
        </Button>
    );
};
