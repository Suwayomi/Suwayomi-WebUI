/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import { useLingui } from '@lingui/react/macro';
import { OffsetDoubleSpreadIcon } from '@/assets/icons/svg/OffsetDoubleSpreadIcon.tsx';
import { IReaderSettings } from '@/features/reader/Reader.types.ts';
import { isOffsetDoubleSpreadPagesEditable } from '@/features/reader/settings/ReaderSettings.utils.tsx';

export const ReaderNavBarDesktopOffsetDoubleSpread = ({
    readingMode,
    shouldOffsetDoubleSpreads,
    setShouldOffsetDoubleSpreads,
}: Pick<IReaderSettings, 'readingMode' | 'shouldOffsetDoubleSpreads'> & {
    setShouldOffsetDoubleSpreads: (offset: boolean) => void;
}) => {
    const { t } = useLingui();

    if (!isOffsetDoubleSpreadPagesEditable(readingMode)) {
        return null;
    }

    return (
        <Button
            sx={{ justifyContent: 'start', textTransform: 'unset' }}
            size="large"
            onClick={() => setShouldOffsetDoubleSpreads(!shouldOffsetDoubleSpreads)}
            color={shouldOffsetDoubleSpreads ? 'secondary' : 'primary'}
            variant="contained"
            startIcon={<OffsetDoubleSpreadIcon />}
        >
            {t`Offset double spreads`}
        </Button>
    );
};
