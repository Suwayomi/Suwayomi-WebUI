/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ServerSettings } from '@/features/settings/Settings.types.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import {
    addStableIdToConversions,
    containsInvalidConversion,
    didUpdateConversions,
    isDuplicateConversion,
    maybeAddDefault,
    normalizeConversions,
    toValidServerConversions,
} from '@/features/settings/ImageProcessing.utils.ts';
import { Processing } from '@/features/settings/components/images/Processing.tsx';

export const ImageProcessingSetting = () => {
    const { t } = useTranslation();

    useAppTitle(t('download.settings.conversion.title'));

    const { data, loading, error, refetch } = requestManager.useGetServerSettings({
        notifyOnNetworkStatusChange: true,
    });
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('DownloadConversionSetting::refetch'))}
            />
        );
    }

    assertIsDefined(data?.settings?.downloadConversions);

    const conversions = data?.settings?.downloadConversions;

    const [tmpConversions, setTmpConversions] = useState(
        normalizeConversions(maybeAddDefault(addStableIdToConversions(conversions))),
    );

    const hasInvalidConversion = containsInvalidConversion(tmpConversions);
    const hasChanged = didUpdateConversions(
        normalizeConversions(maybeAddDefault(addStableIdToConversions(conversions))),
        tmpConversions,
    );

    const updateSetting = (value: ServerSettings['downloadConversions']): Promise<any> => {
        const mutation = mutateSettings({ variables: { input: { settings: { downloadConversions: value } } } });
        mutation.catch((e) => makeToast(t('global.error.label.failed_to_save_changes'), 'error', getErrorMessage(e)));

        return mutation;
    };

    const onSubmit = async () => {
        try {
            await updateSetting(toValidServerConversions(tmpConversions));
        } catch (e) {
            // ignore error
        }
    };

    return (
        <Stack sx={{ p: 2, gap: 3 }}>
            <Typography>{t('download.settings.conversion.description', { value: 'none' })}</Typography>
            <Stack sx={{ flexDirection: 'column', gap: 5 }}>
                {tmpConversions.map((conversion, index) => {
                    const { mimeType } = conversion;

                    const isDuplicate = isDuplicateConversion(mimeType, index, tmpConversions);

                    return (
                        <Processing
                            key={conversion.id}
                            conversion={conversion}
                            isDuplicate={isDuplicate}
                            onChange={(newConversion) => {
                                setTmpConversions((prev) =>
                                    maybeAddDefault(
                                        prev.toSpliced(index, 1, ...(newConversion ? [newConversion] : [])),
                                    ),
                                );
                            }}
                        />
                    );
                })}
            </Stack>
            <Stack
                direction="row"
                sx={{
                    gap: 1,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={() => {
                        setTmpConversions((prev) => [
                            ...prev,
                            ...addStableIdToConversions([
                                {
                                    mimeType: '',
                                    target: '',
                                    compressionLevel: null,
                                    headers: null,
                                    callTimeout: null,
                                    connectTimeout: null,
                                },
                            ]),
                        ]);
                    }}
                >
                    {t('global.button.add')}
                </Button>
                <Button variant="contained" disabled={hasInvalidConversion || !hasChanged} onClick={onSubmit}>
                    {t('global.button.save')}
                </Button>
            </Stack>
        </Stack>
    );
};
