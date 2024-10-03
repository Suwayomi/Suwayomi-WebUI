/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Button from '@mui/material/Button';
import { OffsetDoubleSpreadIcon } from '@/assets/icons/svg/OffsetDoubleSpreadIcon.tsx';

export const ReaderNavBarDesktopOffsetDoubleSpread = () => {
    const { t } = useTranslation();

    const [shouldOffsetDoubleSpread, setShouldOffsetDoubleSpread] = useState(false);

    return (
        <Button
            sx={{ justifyContent: 'start', textTransform: 'unset' }}
            size="large"
            onClick={() => setShouldOffsetDoubleSpread(!shouldOffsetDoubleSpread)}
            color={shouldOffsetDoubleSpread ? 'secondary' : 'primary'}
            variant="contained"
            startIcon={<OffsetDoubleSpreadIcon />}
        >
            {t('reader.settings.label.offset_double_spread')}
        </Button>
    );
};
