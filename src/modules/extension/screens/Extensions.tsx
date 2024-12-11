/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { fromEvent } from 'file-selector';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { StringParam, useQueryParam } from 'use-query-params';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { extensionDefaultLangs } from '@/modules/core/utils/Languages.ts';
import { useLocalStorage } from '@/modules/core/hooks/useStorage.tsx';
import { AppbarSearch } from '@/modules/core/components/AppbarSearch.tsx';
import { LoadingPlaceholder } from '@/modules/core/components/placeholder/LoadingPlaceholder.tsx';
import { makeToast } from '@/modules/core/utils/Toast.ts';
import { LangSelect } from '@/modules/core/components/inputs/LangSelect.tsx';
import { ExtensionCard } from '@/modules/extension/components/ExtensionCard.tsx';
import { NavBarContext } from '@/modules/navigation-bar/contexts/NavbarContext.tsx';
import { StyledGroupedVirtuoso } from '@/modules/core/components/virtuoso/StyledGroupedVirtuoso.tsx';
import { StyledGroupHeader } from '@/modules/core/components/virtuoso/StyledGroupHeader.tsx';
import { StyledGroupItemWrapper } from '@/modules/core/components/virtuoso/StyledGroupItemWrapper.tsx';
import { EmptyViewAbsoluteCentered } from '@/modules/core/components/placeholder/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { VirtuosoUtil } from '@/lib/virtuoso/Virtuoso.util.tsx';
import {
    getExtensionsInfo,
    isExtensionStateOrLanguage,
    translateExtensionLanguage,
} from '@/modules/extension/Extensions.utils.ts';
import { ExtensionAction, ExtensionGroupState, ExtensionState } from '@/modules/extension/Extensions.types.ts';
import { EXTENSION_ACTION_TO_FAILURE_TRANSLATION_KEY_MAP } from '@/modules/extension/Extensions.constants.ts';

const LANGUAGE = 0;
const EXTENSIONS = 1;

export function Extensions({ tabsMenuHeight }: { tabsMenuHeight: number }) {
    const { t } = useTranslation();
    const { setAction } = useContext(NavBarContext);

    const {
        data: serverSettingsData,
        loading: areServerSettingsLoading,
        error: serverSettingsError,
        refetch: refetchServerSettings,
    } = requestManager.useGetServerSettings({ notifyOnNetworkStatusChange: true });
    const areReposDefined = !!serverSettingsData?.settings.extensionRepos.length;
    const areMultipleReposInUse = (serverSettingsData?.settings.extensionRepos.length ?? 0) > 1;

    const inputRef = useRef<HTMLInputElement>(null);
    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownExtensionLangs', extensionDefaultLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const [query] = useQueryParam('query', StringParam);

    const [refetchExtensions, setRefetchExtensions] = useState({});
    const [fetchExtensions, { data, loading: areExtensionsLoading, error: extensionsError }] =
        requestManager.useExtensionListFetch();
    const allExtensions = data?.fetchExtensions?.extensions;

    const [updatingExtensionIds, setUpdatingExtensionIds] = useState<string[]>([]);

    const handleExtensionUpdate = useCallback(() => setRefetchExtensions({}), []);

    useEffect(() => {
        fetchExtensions();
    }, [refetchExtensions]);

    const filteredExtensions = useMemo(
        () =>
            (allExtensions ?? []).filter((ext) => {
                const nsfwFilter = showNsfw || !ext.isNsfw;
                if (!query) return nsfwFilter;
                return nsfwFilter && ext.name.toLowerCase().includes(query.toLowerCase());
            }),
        [allExtensions, showNsfw, query],
    );

    const { allLangs, groupedExtensions } = useMemo(() => getExtensionsInfo(filteredExtensions), [filteredExtensions]);

    const filteredGroupedExtensions = useMemo(
        () =>
            groupedExtensions
                .filter((group) => group[EXTENSIONS].length > 0)
                .filter((group) => isExtensionStateOrLanguage(group[LANGUAGE]) || shownLangs.includes(group[LANGUAGE])),
        [shownLangs, groupedExtensions],
    );

    const groupCounts = useMemo(
        () => filteredGroupedExtensions.map((extensionGroup) => extensionGroup[EXTENSIONS].length),
        [filteredGroupedExtensions],
    );
    const visibleExtensions = useMemo(
        () => filteredGroupedExtensions.map(([, extensions]) => extensions).flat(1),
        [filteredGroupedExtensions],
    );

    const computeItemKey = VirtuosoUtil.useCreateGroupedComputeItemKey(
        groupCounts,
        useCallback((index) => filteredGroupedExtensions[index][0], [filteredGroupedExtensions]),
        useCallback((index) => visibleExtensions[index].pkgName, [visibleExtensions]),
    );

    const submitExternalExtension = (file: File) => {
        if (file.name.toLowerCase().endsWith('apk')) {
            if (inputRef.current) {
                inputRef.current.value = '';
            }

            makeToast(t('extension.label.installing_file'), 'info');
            requestManager
                .installExternalExtension(file)
                .response.then(() => {
                    handleExtensionUpdate();
                    makeToast(t('extension.label.installed_successfully'), 'success');
                })
                .catch(() => makeToast(t('extension.label.installation_failed'), 'error'));
        } else {
            makeToast(t('global.error.label.invalid_file_type'), 'error');
        }
    };

    useLayoutEffect(() => {
        setAction(
            <>
                <AppbarSearch />
                <Tooltip title={t('extension.action.label.install_external')}>
                    <IconButton onClick={() => inputRef.current?.click()} size="large" color="inherit">
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <LangSelect shownLangs={shownLangs} setShownLangs={setShownLangs} allLangs={allLangs} />
            </>,
        );

        return () => {
            setAction(null);
        };
    }, [t, shownLangs, allLangs]);

    useEffect(() => {
        const dropHandler = async (e: Event) => {
            e.preventDefault();
            const files = await fromEvent(e);
            submitExternalExtension(files[0] as File);
        };

        const dragOverHandler = (e: Event) => {
            e.preventDefault();
        };

        document.addEventListener('drop', dropHandler);
        document.addEventListener('dragover', dragOverHandler);

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
        };
    }, []);

    const FileInputComponent = useMemo(
        () => (
            <input
                type="file"
                style={{ display: 'none' }}
                ref={inputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        submitExternalExtension(file);
                    }
                }}
            />
        ),
        [],
    );

    const isLoading = areServerSettingsLoading || areExtensionsLoading;
    const error = serverSettingsError ?? extensionsError;

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t('global.error.label.failed_to_load_data')}
                messageExtra={error.message}
                retry={() => {
                    if (serverSettingsError) {
                        refetchServerSettings().catch(defaultPromiseErrorHandler('Extensions::refetchServerSettings'));
                    }

                    if (extensionsError) {
                        fetchExtensions().catch(defaultPromiseErrorHandler('Extensions::refetchExtensions'));
                    }
                }}
            />
        );
    }

    const showAddRepoInfo = !allExtensions?.length && !areReposDefined;
    if (showAddRepoInfo) {
        return (
            <>
                {FileInputComponent}
                <Stack
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        rowGap: '10px',
                        paddingTop: '20px',
                    }}
                >
                    <Typography>{t('extension.label.add_repository_info')}</Typography>
                    <Button component={Link} variant="contained" to="/settings/browse">
                        {t('settings.title')}
                    </Button>
                </Stack>
            </>
        );
    }

    return (
        <>
            {FileInputComponent}
            <StyledGroupedVirtuoso
                heightToSubtract={tabsMenuHeight}
                overscan={window.innerHeight * 0.5}
                groupCounts={groupCounts}
                groupContent={(index) => {
                    const [groupName, groupExtensions] = filteredGroupedExtensions[index];
                    const isUpdateGroup = groupName === ExtensionGroupState.UPDATE_PENDING;

                    return (
                        <StyledGroupHeader
                            key={groupName}
                            isFirstItem={index === 0}
                            sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', pr: 1 }}
                        >
                            <Typography variant="h5" component="h2">
                                {translateExtensionLanguage(groupName)}
                            </Typography>
                            {isUpdateGroup && (
                                <Button
                                    disabled={!!updatingExtensionIds.length}
                                    variant="contained"
                                    onClick={() => {
                                        const extensionIds = groupExtensions.map((extension) => extension.pkgName);
                                        setUpdatingExtensionIds(extensionIds);

                                        requestManager
                                            .updateExtensions(extensionIds, { update: true })
                                            .response.then(() => handleExtensionUpdate())
                                            .catch(() =>
                                                makeToast(
                                                    t(
                                                        EXTENSION_ACTION_TO_FAILURE_TRANSLATION_KEY_MAP[
                                                            ExtensionAction.UPDATE
                                                        ],
                                                        { count: groupedExtensions.length },
                                                    ),
                                                ),
                                            )
                                            .finally(() => setUpdatingExtensionIds([]));
                                    }}
                                >
                                    {t('extension.action.label.update_all')}
                                </Button>
                            )}
                        </StyledGroupHeader>
                    );
                }}
                computeItemKey={computeItemKey}
                itemContent={(index) => {
                    const item = visibleExtensions[index];

                    return (
                        <StyledGroupItemWrapper>
                            <ExtensionCard
                                extension={item}
                                handleUpdate={handleExtensionUpdate}
                                showSourceRepo={areMultipleReposInUse}
                                forcedState={
                                    updatingExtensionIds.includes(item.pkgName) ? ExtensionState.UPDATING : undefined
                                }
                            />
                        </StyledGroupItemWrapper>
                    );
                }}
            />
        </>
    );
}
