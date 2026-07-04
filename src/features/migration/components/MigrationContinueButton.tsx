/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLingui } from '@lingui/react/macro';
import Fab from '@mui/material/Fab';

export const MigrationContinueButton = ({
    onClick,
    isDisabled,
    title,
}: {
    onClick: () => void;
    isDisabled?: boolean;
    title?: string;
}) => {
    const { t } = useLingui();

    return (
        <Fab
            variant="extended"
            color="primary"
            sx={{
                position: 'fixed',
                bottom: (theme) => theme.spacing(2),
                right: (theme) => theme.spacing(2),
            }}
            disabled={isDisabled}
            onClick={onClick}
        >
            {title ?? t`Continue`}
        </Fab>
    );
};
