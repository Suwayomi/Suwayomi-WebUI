/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import { useParams } from 'react-router-dom';
import client from 'util/client';
import { SwitchPreferenceCompat, CheckBoxPreference } from 'components/sourceConfiguration/TwoStatePreference';
import ListPreference from 'components/sourceConfiguration/ListPreference';
import EditTextPreference from 'components/sourceConfiguration/EditTextPreference';
import List from '@mui/material/List';
import cloneObject from 'util/cloneObject';

function getPrefComponent(type: string) {
    switch (type) {
        case 'CheckBoxPreference':
            return CheckBoxPreference;
        case 'SwitchPreferenceCompat':
            return SwitchPreferenceCompat;
        case 'ListPreference':
            return ListPreference;
        case 'EditTextPreference':
            return EditTextPreference;
        default:
            return CheckBoxPreference;
    }
}

export default function SourceConfigure() {
    const [sourcePreferences, setSourcePreferences] = useState<SourcePreferences[]>([]);
    const { setTitle, setAction } = useContext(NavbarContext);

    const [updateTriggerHolder, setUpdateTriggerHolder] = useState<number>(0); // just a hack
    const triggerUpdate = () => setUpdateTriggerHolder(updateTriggerHolder + 1); // just a hack

    useEffect(() => { setTitle('Source Configuration'); setAction(<></>); }, []);

    const { sourceId } = useParams<{ sourceId: string }>();

    useEffect(() => {
        client.get(`/api/v1/source/${sourceId}/preferences`)
            .then((response) => response.data)
            .then((data) => setSourcePreferences(data));
    }, [updateTriggerHolder]);

    const updateValue = (position: number) => (
        (value: any) => {
            client.post(`/api/v1/source/${sourceId}/preferences`,
                JSON.stringify({ position, value: value.toString() }))
                .then(() => triggerUpdate());
        }
    );

    return (
        <>
            <List style={{ padding: 0 }}>
                {sourcePreferences.map(
                    (it, index) => {
                        const props = cloneObject(it.props);
                        props.updateValue = updateValue(index);
                        props.key = index;

                        // TypeScript is dumb in detecting extra props
                        // @ts-ignore
                        return React.createElement(getPrefComponent(it.type), props);
                    },
                )}
            </List>
        </>
    );
}
