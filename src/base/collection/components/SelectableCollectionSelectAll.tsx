/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Checkbox from '@mui/material/Checkbox';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';

export const SelectableCollectionSelectAll = ({
    areAllItemsSelected,
    areNoItemsSelected,
    onChange,
}: {
    areAllItemsSelected: boolean;
    areNoItemsSelected: boolean;
    onChange: (checked: boolean) => void;
}) => {
    const { t } = useLingui();

    return (
        <CustomTooltip title={!areAllItemsSelected ? t`Select all` : t`Clear`}>
            <Checkbox
                sx={{
                    padding: '8px',
                    color: 'inherit',
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': {
                        color: 'inherit',
                    },
                }}
                checked={areAllItemsSelected}
                indeterminate={!areNoItemsSelected && !areAllItemsSelected}
                onChange={(_, checked) => onChange(checked)}
            />
        </CustomTooltip>
    );
};
