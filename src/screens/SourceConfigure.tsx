/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect } from 'react';
import NavbarContext from 'components/context/NavbarContext';
import { useParams } from 'react-router-dom';
import client, { useQuery } from 'util/client';
import { SwitchPreferenceCompat, CheckBoxPreference } from 'components/sourceConfiguration/TwoStatePreference';
import ListPreference from 'components/sourceConfiguration/ListPreference';
import EditTextPreference from 'components/sourceConfiguration/EditTextPreference';
import MultiSelectListPreference from 'components/sourceConfiguration/MultiSelectListPreference';
import List from '@mui/material/List';
import cloneObject from 'util/cloneObject';
import { SourcePreferences } from 'typings';
import { useTranslation } from 'react-i18next';

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
        case 'MultiSelectListPreference':
            return MultiSelectListPreference;
        default:
            return CheckBoxPreference;
    }
}

export default function SourceConfigure() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavbarContext);

    useEffect(() => {
        setTitle(t('source.configuration.title'));
        setAction(null);
    }, [t]);

    const { sourceId } = useParams<{ sourceId: string }>();
    const { data: sourcePreferences = [], mutate } = useQuery<SourcePreferences[]>(
        `/api/v1/source/${sourceId}/preferences`,
    );

    const convertToString = (position: number, value: any): string => {
        switch (sourcePreferences[position].props.defaultValueType) {
            case 'Set<String>':
                return JSON.stringify(value);
            default:
                return value.toString();
        }
    };

    const updateValue = (position: number) => (value: any) => {
        client
            .post(
                `/api/v1/source/${sourceId}/preferences`,
                JSON.stringify({ position, value: convertToString(position, value) }),
            )
            .then(() => mutate());
    };

    return (
        <List sx={{ padding: 0 }}>
            {sourcePreferences.map((it, index) => {
                const props = cloneObject(it.props);
                props.updateValue = updateValue(index);
                props.key = index;

                // TypeScript is dumb in detecting extra props
                // @ts-ignore
                return React.createElement(getPrefComponent(it.type), props);
            })}
        </List>
    );
}
