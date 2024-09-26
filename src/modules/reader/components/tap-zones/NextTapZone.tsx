/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StackProps } from '@mui/material/Stack';
import { useTranslation } from 'react-i18next';
import { TapZone } from '@/modules/reader/components/tap-zones/TapZone.tsx';

export const NextTapZone = (props: StackProps) => {
    const { t } = useTranslation();

    return (
        <TapZone
            {...props}
            title={t('global.label.next')}
            sx={{ backgroundColor: 'rgba(144, 238, 144, .5)', ...props?.sx }}
        />
    );
};
