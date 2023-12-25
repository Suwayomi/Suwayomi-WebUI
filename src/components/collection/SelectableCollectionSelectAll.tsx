/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Tooltip } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useTranslation } from 'react-i18next';

export const SelectableCollectionSelectAll = ({
    areAllItemsSelected,
    areNoItemsSelected,
    onChange,
}: {
    areAllItemsSelected: boolean;
    areNoItemsSelected: boolean;
    onChange: (checked: boolean) => void;
}) => {
    const { t } = useTranslation();

    return (
        <Tooltip title={t(!areAllItemsSelected ? 'global.button.select_all' : 'global.button.clear')}>
            <Checkbox
                sx={{ padding: '8px' }}
                checked={areAllItemsSelected}
                indeterminate={!areNoItemsSelected && !areAllItemsSelected}
                onChange={(_, checked) => onChange(checked)}
            />
        </Tooltip>
    );
};
