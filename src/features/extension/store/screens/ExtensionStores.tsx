/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { copyToClipboard, getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { useLingui } from '@lingui/react/macro';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import type { ExtensionStoreFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { VirtuosoPersisted } from '@/lib/virtuoso/Component/VirtuosoPersisted.tsx';
import Card from '@mui/material/Card';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import Stack from '@mui/material/Stack';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import IconButton from '@mui/material/IconButton';
import { plural } from '@lingui/core/macro';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconBrowser } from '@/assets/icons/IconBrowser.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { DiscordIcon } from '@/assets/icons/svg/DiscordIcon.tsx';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import Box from '@mui/material/Box';
import { ContentWarning } from '@/lib/graphql/generated/graphql-base.types.ts';
import { DEFAULT_FULL_FAB_HEIGHT, StyledFab } from '@/base/components/buttons/StyledFab.tsx';
import AddIcon from '@mui/icons-material/Add';
import { AwaitableComponent, type AwaitableComponentProps } from 'awaitable-component';
import { TextSettingDialog } from '@/base/components/settings/text/TextSettingDialog.tsx';
import { useMemo } from 'react';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { ClipBoardGuard } from '@/base/components/guard/ClipBoardGuard.tsx';

const ExtensionStoreCard = ({
    indexUrl,
    name,
    contactDiscord,
    contactWebsite,
    extensions: { totalCount: extensionCount },
}: ExtensionStoreFieldsFragment) => {
    const { t } = useLingui();

    const [removeExtensionStore, { loading }] = requestManager.useRemoveExtensionStore();
    const [fetchExtensions] = requestManager.useExtensionListFetch();

    const nsfwExtensionsData = requestManager.useGetExtensionList({
        variables: {
            condition: { storeIndexUrl: indexUrl },
            filter: { contentWarning: { greaterThanOrEqualTo: ContentWarning.Mixed } },
        },
    });
    const installedExtensionsData = requestManager.useGetExtensionList({
        variables: { condition: { storeIndexUrl: indexUrl, isInstalled: true } },
    });

    const isNSfw = nsfwExtensionsData.dataState === 'complete' && nsfwExtensionsData.data?.extensions.totalCount;
    const installedExtensionCount = installedExtensionsData.data?.extensions.totalCount;

    return (
        <Box sx={{ p: 1, pb: 0 }}>
            <Card>
                <ListCardContent sx={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Stack>
                        <TypographyMaxLines variant="h6" component="h3">
                            {name}
                        </TypographyMaxLines>
                        <TypographyMaxLines variant="caption" color="textSecondary">
                            {isNSfw ? (
                                <>
                                    <TypographyMaxLines sx={{ display: 'inline' }} variant="caption" color="error">
                                        {' '}
                                        +18
                                    </TypographyMaxLines>
                                    {extensionCount && ' - '}
                                </>
                            ) : null}
                            {!!extensionCount &&
                                plural(extensionCount, {
                                    one: '# extension',
                                    other: '# extensions',
                                })}
                            {installedExtensionCount
                                ? ` - ${plural(installedExtensionCount, {
                                      one: '# installed',
                                      other: '# installed',
                                  })}`
                                : null}
                        </TypographyMaxLines>
                    </Stack>
                    <Stack
                        sx={{
                            flexDirection: 'row',
                            justifyContent: 'end',
                            flexGrow: 1,
                        }}
                    >
                        {contactWebsite && (
                            <CustomTooltip title={t`Open website`} disabled={!contactWebsite}>
                                <IconButton
                                    disabled={!contactWebsite}
                                    href={contactWebsite ?? undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    color="inherit"
                                >
                                    <IconBrowser />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        {contactDiscord && (
                            <CustomTooltip title={t`Open discord`} disabled={!contactDiscord}>
                                <IconButton
                                    href={contactDiscord ?? undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    color="inherit"
                                >
                                    <DiscordIcon />
                                </IconButton>
                            </CustomTooltip>
                        )}
                        <ClipBoardGuard>
                            <CustomTooltip title={t`Copy index url`}>
                                <IconButton
                                    onClick={() => {
                                        copyToClipboard(indexUrl);
                                    }}
                                    color="inherit"
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </CustomTooltip>
                        </ClipBoardGuard>
                        <CustomTooltip disabled={loading} title={t`Delete`}>
                            <IconButton
                                disabled={loading}
                                onClick={async () => {
                                    try {
                                        await Confirmation.show({
                                            title: t`Are you sure?`,
                                            message: t`You are about to remove "${name}" from the extension stores`,
                                        });

                                        try {
                                            await removeExtensionStore({ variables: { input: { indexUrl } } });

                                            requestManager.clearExtensionCache();
                                            fetchExtensions().catch(
                                                defaultPromiseErrorHandler(
                                                    'ExtensionStoreCard::remove::fetchExtensions',
                                                ),
                                            );
                                        } catch (e) {
                                            makeToast(
                                                t`Could not remove extension store "${name}"`,
                                                'error',
                                                getErrorMessage(e),
                                            );
                                        }
                                    } catch (e) {
                                        // ignore
                                    }
                                }}
                                color="inherit"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </CustomTooltip>
                    </Stack>
                </ListCardContent>
            </Card>
        </Box>
    );
};

const AddExtensionStoreDialog = ({
    onExitComplete,
    onDismiss,
    isVisible,
    indexUrl,
    processing = false,
    startCreation,
}: AwaitableComponentProps<void> & {
    indexUrl?: string;
    processing?: boolean;
    startCreation: (indexUrl: string) => void;
}) => {
    const { t } = useLingui();

    return (
        <TextSettingDialog
            settingName={t`Add extension store`}
            handleChange={startCreation}
            isDialogOpen={isVisible}
            setIsDialogOpen={noOp}
            onDismiss={onDismiss}
            onExitComplete={onExitComplete}
            value={indexUrl}
            disabled={processing}
        />
    );
};

export const ExtensionStores = () => {
    const { t } = useLingui();

    useAppTitle(t`Extension stores`);

    const [addExtensionStore] = requestManager.useAddExtensionStore();
    const { data, loading, error, refetch, dataState } = requestManager.useGetExtensionStores();
    const [fetchExtensions] = requestManager.useExtensionListFetch();

    const extensionStores = useMemo(() => {
        if (!data?.extensionStores.nodes) {
            return STABLE_EMPTY_ARRAY;
        }

        return data.extensionStores.nodes.toSorted((a, b) => a.name.localeCompare(b.name));
    }, [data?.extensionStores.nodes]);

    if (loading && dataState !== 'complete') {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load extension stores`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    refetch().catch(defaultPromiseErrorHandler('ExtensionStores::refetchServerMetadataSettings'));
                }}
            />
        );
    }

    return (
        <Box sx={{ pb: DEFAULT_FULL_FAB_HEIGHT }}>
            <VirtuosoPersisted
                persistKey="extension-store-list"
                useWindowScroll
                overscan={window.innerHeight * 0.5}
                totalCount={extensionStores.length}
                computeItemKey={(index) => extensionStores[index].indexUrl}
                itemContent={(index) => <ExtensionStoreCard {...extensionStores[index]} />}
            />
            <StyledFab
                variant="extended"
                color="primary"
                sx={{ gap: 1 }}
                onClick={() => {
                    const addStoreDialog = AwaitableComponent.showControlled(AddExtensionStoreDialog, {
                        startCreation: async (indexUrl) => {
                            const request = addExtensionStore({ variables: { input: { indexUrl } } });

                            addStoreDialog.update({ indexUrl, processing: true });

                            try {
                                await request;

                                requestManager.clearExtensionCache();
                                fetchExtensions().catch(
                                    defaultPromiseErrorHandler('ExtensionStores::add:fetchExtensions'),
                                );

                                addStoreDialog.submit();
                            } catch (e) {
                                makeToast(t`Could not add extension store`, 'error', getErrorMessage(e));

                                addStoreDialog.update({ processing: false });
                            }
                        },
                    });
                }}
            >
                <AddIcon />
                {t`Add`}
            </StyledFab>
        </Box>
    );
};
