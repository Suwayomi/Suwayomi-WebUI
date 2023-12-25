/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';

export type SelectableCollectionReturnType<Id extends number | string, Key extends string = string> = {
    selectedItemIds: Id[];
    keySelectedItemIds: Id[];
    areAllItemsSelected: boolean;
    areNoItemsSelected: boolean;
    areAllItemsForKeySelected: boolean;
    areNoItemsForKeySelected: boolean;
    handleSelection: (id: Id, selected: boolean, key?: Key) => void;
    handleSelectAll: (selectAll: boolean, itemIds: Id[], key?: Key) => void;
    setSelectionForKey: (key: Key, itemIds: Id[]) => void;
    getSelectionForKey: (key: Key) => Id[];
};

export const useSelectableCollection = <Id extends number | string, Key extends string = 'default'>(
    totalCount: number,
    {
        keyCount = totalCount,
        currentKey,
        initialState = {} as Record<Key, Id[]>,
    }: {
        keyCount?: number;
        currentKey: Key;
        initialState?: Record<Key, Id[]>;
    },
): SelectableCollectionReturnType<Id, Key> => {
    const [keyToSelectedItemIds, setKeyToSelectedItemIds] = useState<Record<string, Id[]>>(initialState);

    const selectedItemIds = Object.values(keyToSelectedItemIds).flat();
    const areAllItemsSelected = selectedItemIds.length === totalCount;
    const areNoItemsSelected = !selectedItemIds.length;

    const keySelectedItemIds = keyToSelectedItemIds[currentKey] ?? [];
    const areAllItemsForKeySelected = keySelectedItemIds.length === keyCount;
    const areNoItemsForKeySelected = keySelectedItemIds.length === 0;

    const handleSelection = (id: Id, selected: boolean, key: Key = currentKey) => {
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

    const handleSelectAll = (selectAll: boolean, itemIds: Id[], key: Key = currentKey) => {
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

    const setSelectionForKey = (key: Key, itemIds: Id[]) => {
        keyToSelectedItemIds[key] = itemIds;
    };

    const getSelectionForKey = (key: Key) => keyToSelectedItemIds[key];

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
        getSelectionForKey,
    };
};
