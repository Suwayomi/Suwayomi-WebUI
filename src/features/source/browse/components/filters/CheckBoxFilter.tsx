/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import type { IPos } from '@/features/source/Source.types.ts';
import isEqual from 'lodash/fp/isEqual';

interface Props {
    state: boolean;
    name: string;
    positions: number[];
    updateFilterValue: (value: IPos[]) => void;
    update: any;
}

export const CheckBoxFilter: React.FC<Props> = (props: Props) => {
    const { state, name, positions, updateFilterValue, update } = props;
    const [val, setval] = React.useState(state);

    const handleChange = (event: { target: { name: any; checked: any } }) => {
        setval(event.target.checked);
        const upd = update.filter((e: { positions: number[] }) => !isEqual(positions, e.positions));
        updateFilterValue([...upd, { type: 'checkBoxState', positions, state: event.target.checked }]);
    };

    if (state !== undefined) {
        return <CheckboxInput label={name} checked={val} onChange={handleChange} />;
    }
    return null;
};
