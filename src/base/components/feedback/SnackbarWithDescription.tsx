/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { closeSnackbar, CustomContentProps, SnackbarContent, VariantType } from 'notistack';
import { ForwardedRef, Fragment, memo } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { extractGraphqlExceptionInfo } from '@/lib/HelperFunctions.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';

const MAX_DESCRIPTION_LENGTH = 200;

const SNACKBAR_VARIANT_TO_TRANSLATION: Record<VariantType, MessageDescriptor> = {
    default: msg`Information`,
    info: msg`Information`,
    success: msg`Success`,
    warning: msg`Warning`,
    error: msg`Error`,
};

export const SnackbarWithDescription = memo(
    ({
        id,
        message,
        description,
        variant,
        action,
        ref,
    }: CustomContentProps & {
        description?: string;
        ref?: ForwardedRef<HTMLDivElement>;
    }) => {
        const { t } = useLingui();
        const theme = useTheme();

        const severity = variant === 'default' ? 'info' : variant;
        const finalAction = typeof action === 'function' ? action(id) : action;

        const { isGraphqlException, graphqlError, graphqlStackTrace } = extractGraphqlExceptionInfo(description);

        const finalDescription = isGraphqlException ? graphqlError : description;
        const isDescriptionTooLong = (finalDescription?.length ?? 0) > MAX_DESCRIPTION_LENGTH;
        const actualDescription = isDescriptionTooLong
            ? finalDescription?.slice(0, MAX_DESCRIPTION_LENGTH)
            : finalDescription;

        const TitleComponent = actualDescription?.length ? AlertTitle : Fragment;

        return (
            <SnackbarContent ref={ref}>
                <Alert
                    elevation={1}
                    severity={severity}
                    action={finalAction}
                    sx={{
                        wordBreak: 'break-word',
                        minWidth: '300px',
                        [theme.breakpoints.down(MediaQuery.MOBILE_WIDTH)]: {
                            maxWidth: '100vw',
                        },
                        [theme.breakpoints.between(MediaQuery.MOBILE_WIDTH, MediaQuery.TABLET_WIDTH)]: {
                            maxWidth: '75vw',
                        },
                        [theme.breakpoints.up(MediaQuery.TABLET_WIDTH)]: {
                            maxWidth: '50vw',
                        },
                    }}
                    onClose={() => closeSnackbar(id)}
                >
                    <TitleComponent>{message}</TitleComponent>
                    {actualDescription}
                    {isDescriptionTooLong || (isGraphqlException && graphqlStackTrace) ? (
                        <Button
                            onClick={() => {
                                Confirmation.show({
                                    title:
                                        typeof message === 'string'
                                            ? message
                                            : t(SNACKBAR_VARIANT_TO_TRANSLATION[variant]),
                                    message: description ?? '',
                                    actions: {
                                        cancel: { show: false },
                                        confirm: {
                                            title: t`Close`,
                                        },
                                    },
                                }).catch(
                                    defaultPromiseErrorHandler(
                                        `SnackbarWithDescription: ${id} - ${message} - ${description}`,
                                    ),
                                );
                            }}
                            size="small"
                        >
                            {t`Show more`}
                        </Button>
                    ) : (
                        ''
                    )}
                </Alert>
            </SnackbarContent>
        );
    },
);
