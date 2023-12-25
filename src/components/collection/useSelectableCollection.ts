/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';

export type SelectableCollectionReturnType<Id extends number | string> = {
    selectedItemIds: Id[];
    keySelectedItemIds: Id[];
    areAllItemsSelected: boolean;
    areNoItemsSelected: boolean;
    areAllItemsForKeySelected: boolean;
    areNoItemsForKeySelected: boolean;
    handleSelection: (id: Id, selected: boolean, key?: string) => void;
    handleSelectAll: (selectAll: boolean, itemIds: Id[], key?: string) => void;
    setSelectionForKey: (key: string, itemIds: Id[]) => void;
};

export const useSelectableCollection = <Id extends number | string>(
    totalCount: number,
    {
        keyCount = totalCount,
        currentKey = 'default',
        initialState = {},
    }: {
        keyCount?: number;
        currentKey?: string;
        initialState?: Record<string, Id[]>;
    } = {},
): SelectableCollectionReturnType<Id> => {
    const [keyToSelectedItemIds, setKeyToSelectedItemIds] = useState<Record<string, Id[]>>(initialState);

    const selectedItemIds = Object.values(keyToSelectedItemIds).flat();
    const areAllItemsSelected = selectedItemIds.length === totalCount;
    const areNoItemsSelected = !selectedItemIds.length;

    const keySelectedItemIds = keyToSelectedItemIds[currentKey] ?? [];
    const areAllItemsForKeySelected = keySelectedItemIds.length === keyCount;
    const areNoItemsForKeySelected = keySelectedItemIds.length === 0;

    const handleSelection = (id: Id, selected: boolean, key: string = currentKey) => {
        const deselect = !selected;
        if (deselect) {
            setKeyToSelectedItemIds((prevState) => ({
                ...prevState,
                [key]: prevState[key].filter((selectedItemId) => selectedItemId !== id),
            }));
            return;
        }

        setKeyToSelectedItemIds((prevState) => ({
            ...prevState,
            [key]: [...new Set([...(prevState[key] ?? []), id])],
        }));
    };

    const handleSelectAll = (selectAll: boolean, itemIds: Id[], key: string = currentKey) => {
        switch (selectAll) {
            case true:
                setKeyToSelectedItemIds((prevState) => ({
                    ...prevState,
                    [key]: [...itemIds],
                }));
                break;
            case false:
                setKeyToSelectedItemIds((prevState) => ({
                    ...prevState,
                    [key]: [],
                }));
                break;
            default:
                break;
        }
    };

    const setSelectionForKey = (key: string, itemIds: Id[]) => {
        keyToSelectedItemIds[key] = itemIds;
    };

    return {
        selectedItemIds,
        keySelectedItemIds,
        handleSelection,
        handleSelectAll,
        areAllItemsSelected,
        areNoItemsSelected,
        areAllItemsForKeySelected,
        areNoItemsForKeySelected,
        setSelectionForKey,
    };
};
