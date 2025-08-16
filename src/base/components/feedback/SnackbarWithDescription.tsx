/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { closeSnackbar, CustomContentProps, SnackbarContent, VariantType } from 'notistack';
import { ForwardedRef, forwardRef, Fragment, memo } from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import { awaitConfirmation } from '@/base/utils/AwaitableDialog.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { extractGraphqlExceptionInfo } from '@/lib/HelperFunctions.ts';
import { TranslationKey } from '@/base/Base.types.ts';

const MAX_DESCRIPTION_LENGTH = 200;

const SNACKBAR_VARIANT_TO_TRANSLATION_KEY: Record<VariantType, TranslationKey> = {
    default: 'global.label.info',
    info: 'global.label.info',
    success: 'global.label.success',
    warning: 'global.label.warning',
    error: 'global.label.error',
};

export const SnackbarWithDescription = memo(
    forwardRef(
        (
            {
                id,
                message,
                description,
                variant,
                action,
            }: CustomContentProps & {
                // eslint-disable-next-line react/no-unused-prop-types
                description?: string;
            },
            ref: ForwardedRef<HTMLDivElement>,
        ) => {
            const { t } = useTranslation();
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
                                    awaitConfirmation({
                                        title:
                                            typeof message === 'string'
                                                ? message
                                                : t(SNACKBAR_VARIANT_TO_TRANSLATION_KEY[variant]),
                                        message: description ?? '',
                                        actions: {
                                            cancel: { show: false },
                                            confirm: { title: t('global.label.close') },
                                        },
                                    }).catch(
                                        defaultPromiseErrorHandler(
                                            `SnackbarWithDescription: ${id} - ${message} - ${description}`,
                                        ),
                                    );
                                }}
                                size="small"
                            >
                                {t('global.button.show_more')}
                            </Button>
                        ) : (
                            ''
                        )}
                    </Alert>
                </SnackbarContent>
            );
        },
    ),
);
