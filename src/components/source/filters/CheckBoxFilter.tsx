/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */
import CheckboxInput from 'components/atoms/CheckboxInput';
import React from 'react';

interface Props {
    state: boolean;
    name: string;
    position: number;
    group: number | undefined;
    updateFilterValue: Function;
    update: any;
}

const CheckBoxFilter: React.FC<Props> = (props: Props) => {
    const { state, name, position, group, updateFilterValue, update } = props;
    const [val, setval] = React.useState(state);

    const handleChange = (event: { target: { name: any; checked: any } }) => {
        setval(event.target.checked);
        const upd = update.filter(
            (e: { position: number; group: number | undefined }) => !(position === e.position && group === e.group),
        );
        updateFilterValue([...upd, { position, state: event.target.checked.toString(), group }]);
    };

    if (state !== undefined) {
        return <CheckboxInput label={name} checked={val} onChange={handleChange} />;
    }
    return null;
};

export default CheckBoxFilter;
