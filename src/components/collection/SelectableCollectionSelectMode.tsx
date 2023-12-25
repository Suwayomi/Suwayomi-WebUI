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
import ClearIcon from '@mui/icons-material/Clear';
import { SelectableCollectionSelectAll } from '@/components/collection/SelectableCollectionSelectAll.tsx';

export const SelectableCollectionSelectMode = ({
    isActive,
    areAllItemsSelected,
    areNoItemsSelected,
    onSelectAll,
    onModeChange,
}: {
    isActive: boolean;
    areAllItemsSelected: boolean;
    areNoItemsSelected: boolean;
    onSelectAll: (selectAll: boolean) => void;
    onModeChange: (checked: boolean) => void;
}) => {
    const { t } = useTranslation();

    return (
        <>
            {isActive && (
                <SelectableCollectionSelectAll
                    areAllItemsSelected={areAllItemsSelected}
                    areNoItemsSelected={areNoItemsSelected}
                    onChange={onSelectAll}
                />
            )}
            <Tooltip title={t(!isActive ? 'global.button.select_all' : 'global.button.cancel')}>
                <Checkbox
                    checkedIcon={<ClearIcon />}
                    sx={{ padding: '8px' }}
                    checked={isActive}
                    onChange={(_, checked) => onModeChange(checked)}
                />
            </Tooltip>
        </>
    );
};
