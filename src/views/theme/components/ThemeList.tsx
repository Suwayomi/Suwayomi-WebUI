/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { appThemes } from '@/controllers/theme/services/AppThemes.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/controllers/settings/services/ServerSettingsMetadata.ts';
import { EmptyView } from '@/views/base/components/feedback/EmptyView.tsx';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { CreateThemeButton } from '@/views/theme/components/CreateThemeButton.tsx';
import { ThemePreview } from '@/views/theme/components/ThemePreview.tsx';
import type { MetadataThemeSettings } from '@/models/theme/AppTheme.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Notifications } from '@/controllers/base/services/notification/Notifications.ts';

export const ThemeList = () => {
    const { t } = useLingui();

    const {
        settings: { customThemes },
        request: { loading, error, refetch },
    } = useMetadataServerSettings();

    const allThemes = useMemo(
        () => [
            ...appThemes,
            ...Object.values(customThemes).map((customTheme) => ({
                ...customTheme,
                getName: () => customTheme.id,
            })),
        ],
        [customThemes],
    );

    const updateCustomThemes = createUpdateMetadataServerSettings<keyof MetadataThemeSettings>((e) => {
        throw e;
    });

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyView
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('ThemeList::refetch'))}
            />
        );
    }

    return (
        <Stack
            sx={{ flexDirection: 'row', flexWrap: 'no-wrap', alignItems: 'start', overflowX: 'auto', gap: 1, mx: 2 }}
        >
            <CreateThemeButton />
            {allThemes.map((theme) => (
                <ThemePreview
                    key={theme.id}
                    appTheme={theme}
                    onDelete={() => {
                        Notifications.info(t`Deleting theme "${theme.getName()}"…`);
                        updateCustomThemes(
                            'customThemes',
                            Object.fromEntries(Object.entries(customThemes).filter(([id]) => id !== theme.id)),
                        )
                            .then(() => Notifications.success(t`Deleted theme "${theme.getName()}"`))
                            .catch((e) =>
                                Notifications.error(t`Could not delete theme "${theme.getName()}"`, getErrorMessage(e)),
                            );
                    }}
                />
            ))}
        </Stack>
    );
};
