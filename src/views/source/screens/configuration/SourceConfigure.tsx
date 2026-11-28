/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createElement } from 'react';
import { useParams } from 'react-router-dom';
import List from '@mui/material/List';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { cloneObject } from '@/utils/base/cloneObject.tsx';
import {
    CheckBoxPreference,
    SwitchPreferenceCompat,
} from '@/views/source/components/configuration/TwoStatePreference.tsx';
import { ListPreference } from '@/views/source/components/configuration/ListPreference.tsx';
import { EditTextPreference } from '@/views/source/components/configuration/EditTextPreference.tsx';
import { MultiSelectListPreference } from '@/views/source/components/configuration/MultiSelectListPreference.tsx';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { GetCategoriesSettingsQueryVariables, GetSourceSettingsQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_SOURCE_SETTINGS } from '@/lib/graphql/source/SourceQuery.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/controllers/navigation-bar/hooks/useAppTitle.ts';
import { STABLE_EMPTY_ARRAY } from '@/models/base/Base.constants.ts';
import type { PreferenceProps } from '@/models/source/Source.types.ts';
import { Notifications } from '@/controllers/base/services/notification/Notifications.ts';

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
    const { t } = useLingui();

    useAppTitle(t`Source Configuration`);

    const { sourceId } = useParams<{ sourceId: string }>();
    const { data, loading, error, refetch } = requestManager.useGetSource<
        GetSourceSettingsQuery,
        GetCategoriesSettingsQueryVariables
    >(GET_SOURCE_SETTINGS, sourceId);
    const sourcePreferences = data?.source.preferences ?? STABLE_EMPTY_ARRAY;

    const updateValue =
        (position: number): PreferenceProps['updateValue'] =>
        (type, value) => {
            requestManager
                .setSourcePreferences(sourceId, { position, [type]: value })
                .response.catch((e) => Notifications.error(t`Failed to save changes`, getErrorMessage(e)));
        };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
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
