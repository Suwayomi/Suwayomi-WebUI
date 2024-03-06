/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState, CSSProperties, useEffect, forwardRef, ForwardedRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { Theme, SxProps, Stack, Button } from '@mui/material';

import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/util/defaultPromiseErrorHandler.ts';

interface IProps {
    src: string;
    alt: string;

    spinnerStyle?: SxProps<Theme> & { small?: boolean };
    imgStyle?: CSSProperties;

    onImageLoad?: () => void;
}

export const SpinnerImage = forwardRef((props: IProps, imgRef: ForwardedRef<HTMLImageElement | null>) => {
    const { src, alt, onImageLoad, spinnerStyle: { small, ...spinnerStyle } = {}, imgStyle } = props;

    const { t } = useTranslation();

    const [imageSourceUrl, setImageSourceUrl] = useState('');
    const [imgLoadRetryKey, setImgLoadRetryKey] = useState(0);
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);
    const [hasError, setHasError] = useState(false);

    const updateImageState = (loading: boolean, error: boolean = false) => {
        setIsLoading(loading);
        setHasError(error);

        if (!loading && !error) {
            onImageLoad?.();
        }
    };

    useEffect(() => {
        let tmpImageSourceUrl: string;
        const imageRequest = requestManager.requestImage(src);

        const fetchImage = async () => {
            try {
                const updateImage = async () => {
                    const image = await imageRequest.response;

                    updateImageState(false);
                    setImageSourceUrl(image);
                    tmpImageSourceUrl = image;
                };

                const checkCache = await Promise.race([imageRequest.response, Promise.resolve(false)]);
                const isImageCached = !!checkCache;

                if (isImageCached) {
                    await updateImage();
                    return;
                }

                updateImageState(true);
                await updateImage();
            } catch (e) {
                const wasAborted = e instanceof Error && e.name === 'AbortError';
                updateImageState(false, !wasAborted);
            }
        };

        fetchImage().catch(defaultPromiseErrorHandler);

        return () => {
            if (tmpImageSourceUrl) {
                URL.revokeObjectURL(tmpImageSourceUrl);
            }
            imageRequest.abortRequest(new Error('Component was unmounted'));
        };
    }, [imgLoadRetryKey]);

    return (
        <>
            {(isLoading || hasError) && (
                <Box sx={spinnerStyle}>
                    <Stack height="100%" alignItems="center" justifyContent="center">
                        {isLoading && <CircularProgress thickness={5} />}
                        {hasError && isLoading === false && (
                            <>
                                <BrokenImageIcon />
                                <Button
                                    startIcon={!small && <RefreshIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        setImgLoadRetryKey((prevState) => (prevState + 1) % 100);
                                    }}
                                    size={small ? 'small' : 'large'}
                                >
                                    {small ? <RefreshIcon /> : t('global.button.retry')}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>
            )}

            <img
                key={`${src}_${imgLoadRetryKey}`}
                style={{
                    ...imgStyle,
                    display: !imageSourceUrl || isLoading || hasError ? 'none' : imgStyle?.display,
                }}
                ref={imgRef}
                src={imageSourceUrl}
                alt={alt}
                draggable={false}
            />
        </>
    );
});
