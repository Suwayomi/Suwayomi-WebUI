/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { useLingui } from '@lingui/react/macro';
import { useAppTitle } from '@/controllers/navigation-bar/hooks/useAppTitle.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/views/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { LoadingPlaceholder } from '@/views/base/components/feedback/LoadingPlaceholder.tsx';
import { languageSortComparator } from '@/utils/base/Languages.ts';
import { assertIsDefined } from '@/utils/base/Asserts.ts';
import { Sources } from '@/controllers/source/services/Sources.ts';
import { Header } from '@/views/extension/components/info/Header.tsx';
import { Meta } from '@/views/extension/components/info/Meta.tsx';
import { ActionButton } from '@/views/extension/components/info/ActionButton.tsx';
import { SourceCard } from '@/views/extension/components/info/SourceCard.tsx';
import { STABLE_EMPTY_OBJECT } from '@/models/base/Base.constants.ts';

export const ExtensionInfo = () => {
    const { t } = useLingui();
    const { pkgName } = useParams<{ pkgName: string }>();

    useAppTitle(t`Extension info`);

    const extensionResponse = requestManager.useGetExtension(pkgName);
    const sourcesResponse = requestManager.useGetSourceList();

    const { extension } = extensionResponse.data ?? STABLE_EMPTY_OBJECT;
    const sources = useMemo(() => {
        if (!sourcesResponse.data?.sources) {
            return [];
        }

        return sourcesResponse.data.sources.nodes
            .filter((source) => source.extension.pkgName === extension?.pkgName)
            .sort((a, b) => languageSortComparator(Sources.getLanguage(a), Sources.getLanguage(b)));
    }, [extension?.pkgName, sourcesResponse.data]);

    const isLoading = extensionResponse.loading || sourcesResponse.loading;
    const error = extensionResponse.error || sourcesResponse.error;

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(extensionResponse.error)}
                retry={() => {
                    if (extensionResponse.error) {
                        extensionResponse
                            .refetch()
                            .catch(defaultPromiseErrorHandler('ExtensionInfo::extension::refetch'));
                    }

                    if (sourcesResponse.error) {
                        sourcesResponse.refetch().catch(defaultPromiseErrorHandler('ExtensionInfo::sources::refetch'));
                    }
                }}
            />
        );
    }

    assertIsDefined(extension);

    return (
        <Stack sx={{ gap: 2 }}>
            <Header {...extension} />
            <Meta {...extension} />
            <Stack sx={{ flexDirection: 'row' }}>
                <ActionButton {...{ ...extension, isInstalled: true, hasUpdate: false }} />
                {extension.hasUpdate && !extension.isObsolete && <ActionButton {...extension} />}
            </Stack>
            <Box sx={{ px: 1 }}>
                {sources.map((source) => (
                    <SourceCard key={source.id} {...source} />
                ))}
            </Box>
        </Stack>
    );
};
