/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import { useMemo } from 'react';
import { appThemes } from '@/lib/ui/AppThemes.ts';
import {
    createUpdateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/lib/metadata/metadataServerSettings.ts';
import { MetadataThemeSettings } from '@/typings.ts';
import { makeToast } from '@/components/util/Toast.tsx';
import { EmptyView } from '@/components/util/EmptyView.tsx';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder.tsx';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';
import { CreateThemeButton } from '@/screens/settings/appearance/theme/CreateThemeButton.tsx';
import { ThemePreview } from '@/screens/settings/appearance/theme/ThemePreview.tsx';

export const ThemeList = () => {
    const { t } = useTranslation();

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
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => refetch().catch(defaultPromiseErrorHandler('ThemeList::refetch'))}
            />
        );
    }

    return (
        <Stack sx={{ flexDirection: 'row', flexWrap: 'no-wrap', overflowX: 'auto', gap: 1, mx: 2 }}>
            <CreateThemeButton />
            {allThemes.map((theme) => (
                <ThemePreview
                    key={theme.id}
                    theme={theme}
                    onDelete={() => {
                        makeToast(t('settings.appearance.theme.delete.action', { theme: theme.getName() }), 'info');
                        updateCustomThemes(
                            'customThemes',
                            Object.fromEntries(Object.entries(customThemes).filter(([id]) => id !== theme.id)),
                        )
                            .then(() =>
                                makeToast(
                                    t('settings.appearance.theme.delete.success', { theme: theme.getName() }),
                                    'success',
                                ),
                            )
                            .catch(() =>
                                makeToast(
                                    t('settings.appearance.theme.delete.failure', { theme: theme.getName() }),
                                    'error',
                                ),
                            );
                    }}
                />
            ))}
        </Stack>
    );
};
