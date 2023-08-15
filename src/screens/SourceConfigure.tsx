/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createElement, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';
import requestManager from '@/lib/requests/RequestManager.ts';
import cloneObject from '@/util/cloneObject';
import NavbarContext from '@/components/context/NavbarContext';
import { SwitchPreferenceCompat, CheckBoxPreference } from '@/components/sourceConfiguration/TwoStatePreference';
import ListPreference from '@/components/sourceConfiguration/ListPreference';
import EditTextPreference from '@/components/sourceConfiguration/EditTextPreference';
import MultiSelectListPreference from '@/components/sourceConfiguration/MultiSelectListPreference';

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
    const { data: sourcePreferences = [], mutate } = requestManager.useGetSourcePreferences(sourceId);

    const convertToString = (position: number, value: any): string => {
        switch (sourcePreferences[position].props.defaultValueType) {
            case 'Set<String>':
                return JSON.stringify(value);
            default:
                return value.toString();
        }
    };

    const updateValue = (position: number) => (value: any) => {
        requestManager
            .setSourcePreferences(sourceId, position, convertToString(position, value))
            .response.then(() => mutate());
    };

    return (
        <List sx={{ padding: 0 }}>
            {sourcePreferences.map((it, index) => {
                const props = cloneObject(it.props);
                props.updateValue = updateValue(index);
                props.key = index;

                // TypeScript is dumb in detecting extra props
                // @ts-ignore
                return createElement(getPrefComponent(it.type), props);
            })}
        </List>
    );
}
