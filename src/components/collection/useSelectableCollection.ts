/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';

export const useSelectableCollection = <Id extends number | string>(totalCount: number) => {
    const [selectedItemIds, setSelectedItemIds] = useState<Id[]>([]);

    const areAllItemsSelected = selectedItemIds.length === totalCount;
    const areNoItemsSelected = !selectedItemIds.length;

    const handleSelection = (id: Id, selected: boolean) => {
        const deselect = !selected;
        if (deselect) {
            setSelectedItemIds(selectedItemIds.filter((selectedItemId) => selectedItemId !== id));
            return;
        }

        setSelectedItemIds([...new Set([...selectedItemIds, id])]);
    };

    const handleSelectAll = (selectAll: boolean, itemIds: Id[]) => {
        switch (selectAll) {
            case true:
                setSelectedItemIds([...itemIds]);
                break;
            case false:
                setSelectedItemIds([]);
                break;
            default:
                break;
        }
    };

    return { selectedItemIds, handleSelection, handleSelectAll, areAllItemsSelected, areNoItemsSelected };
};
