/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createElement, useContext, useLayoutEffect } from 'react';
import { useParams } from 'react-router-dom';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { cloneObject } from '@/util/cloneObject.tsx';
import {
    SwitchPreferenceCompat,
    CheckBoxPreference,
} from '@/modules/source/components/sourceConfiguration/TwoStatePreference.tsx';
import { ListPreference } from '@/modules/source/components/sourceConfiguration/ListPreference.tsx';
import { EditTextPreference } from '@/modules/source/components/sourceConfiguration/EditTextPreference.tsx';
import { MultiSelectListPreference } from '@/modules/source/components/sourceConfiguration/MultiSelectListPreference.tsx';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { GetCategoriesSettingsQueryVariables, GetSourceSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_SETTINGS } from '@/lib/graphql/queries/SourceQuery.ts';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { PreferenceProps } from '@/modules/source/Source.types.ts';

function getPrefComponent(type: string) {
    switch (type) {
        case 'CheckBoxPreference':
            return CheckBoxPreference;
        case 'SwitchPreference':
            return SwitchPreferenceCompat;
        case 'ListPreference':
            return ListPreference;
        case 'EditTextPreference':
            return EditTextPreference;
        case 'MultiSelectListPreference':
            return MultiSelectListPreference;
        default:
            throw new Error(`Unexpected preference type "${type}"`);
    }
}

export function SourceConfigure() {
    const { t } = useTranslation();
    const { setTitle, setAction } = useContext(NavBarContext);

    useLayoutEffect(() => {
        setTitle(t('source.configuration.title'));
        setAction(null);

        return () => {
            setTitle('');
            setAction(null);
        };
    }, [t]);

    const { sourceId } = useParams<{ sourceId: string }>();
    const { data, loading, error, refetch } = requestManager.useGetSource<
        GetSourceSettingsQuery,
        GetCategoriesSettingsQueryVariables
    >(GET_SOURCE_SETTINGS, sourceId, {
        notifyOnNetworkStatusChange: true,
    });
    const sourcePreferences = data?.source.preferences ?? [];

    const updateValue =
        (position: number): PreferenceProps['updateValue'] =>
        (type, value) => {
            requestManager
                .setSourcePreferences(sourceId, { position, [type]: value })
                .response.catch(() => makeToast(t('global.error.label.failed_to_save_changes'), 'error'));
        };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('SourceConfigure::refetch'))}
            />
        );
    }

    return (
        <List sx={{ padding: 0 }}>
            {sourcePreferences.map((it, index) => {
                const props = cloneObject(it);

                // TypeScript is dumb in detecting extra props
                // @ts-ignore
                return createElement(getPrefComponent(it.type), {
                    ...props,
                    updateValue: updateValue(index),
                });
            })}
        </List>
    );
}
