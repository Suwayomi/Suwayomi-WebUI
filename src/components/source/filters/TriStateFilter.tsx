/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import ThreeStateCheckboxInput from '@/components/atoms/ThreeStateCheckboxInput';

interface Props {
    state: number;
    name: string;
    position: number;
    group: number | undefined;
    updateFilterValue: Function;
    update: any;
}

const TriStateFilter: React.FC<Props> = (props) => {
    const { state, name, position, group, updateFilterValue, update } = props;
    const [val, setval] = React.useState<number>(Number(state));

    const handleChange = (checked: boolean | null | undefined) => {
        // eslint-disable-next-line no-nested-ternary
        const newState = checked === undefined ? 0 : checked ? 1 : 2;
        setval(newState);
        const upd = update.filter(
            (e: { position: number; group: number | undefined }) => !(position === e.position && group === e.group),
        );
        updateFilterValue([
            ...upd,
            {
                position,
                state: newState.toString(),
                group,
            },
        ]);
    };

    if (state !== undefined) {
        return (
            <ThreeStateCheckboxInput
                label={name}
                checked={[undefined, true, false][val]}
                onChange={(checked) => handleChange(checked)}
            />
        );
    }
    return null;
};

export default TriStateFilter;
