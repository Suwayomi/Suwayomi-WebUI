/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { QueuePriority } from '@/lib/Queue.ts';
import { SourceAwareQueue } from '@/lib/SourceAwareQueue.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';
import { ImageCache } from '@/lib/service-worker/ImageCache.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import type { RestClient } from '@/lib/requests/client/RestClient.ts';
import { type AbortableRequest, createAbortController } from '@/lib/requests/AbortableRequest.ts';

export type ImageRequest = { response: Promise<string>; cleanup: () => void; fromCache: boolean } & AbortableRequest;
type ImageRequestOptions = {
    priority?: QueuePriority;
    shouldDecode?: boolean;
    disableCors?: boolean;
    ignoreQueue?: boolean;
};

export class ImageRequester {
    private readonly imageQueue: SourceAwareQueue;

    constructor(private readonly restClient: RestClient) {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const isHttp2 = isHttps && this.detectHttp2();

        this.imageQueue = new SourceAwareQueue(!isHttp2, 5);
    }

    private detectHttp2(): boolean {
        const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

        if (!entries.length) {
            return false;
        }

        return ['h2', 'h3'].includes(entries[0].nextHopProtocol);
    }

    public clear(): void {
        this.imageQueue.clear();
    }

    /**
     * Aborts pending image requests
     *
     * prevents aborting image requests that are already in progress
     * e.g. for source image requests, ongoing requests are already handled by the server and aborting them
     * will just cause new source image requests to be sent to the server, which then will cause the server
     * to become really slow for image requests to the same source
     */
    private abortImageRequest(key: string, sourceId: string | null, abort: () => void): void {
        if (this.imageQueue.isProcessing(sourceId, key)) {
            return;
        }

        abort();
    }

    private async optionallyDecodeImage(url: string, shouldDecode?: boolean, disableCors?: boolean): Promise<string> {
        if (!shouldDecode) {
            return url;
        }

        const decodePromise = new ControlledPromise();

        const img = new Image();

        if (!disableCors) {
            img.crossOrigin = 'anonymous';
        }
        img.src = url;

        img.onload = async () => {
            try {
                await img.decode();
            } catch (error) {
                decodePromise.reject(error);
            }

            decodePromise.resolve();
        };

        img.onerror = (error) => decodePromise.reject(error);
        img.onabort = (error) => decodePromise.reject(error);

        await decodePromise.promise;

        return url;
    }

    private getSourceIdFromUrl(url: string): string | null {
        try {
            return new URL(url).searchParams.get('sourceId');
        } catch {
            return null;
        }
    }

    private async maybeEnqueueImageRequest<T>(
        url: string,
        request: () => Promise<T>,
        priority?: QueuePriority,
        ignoreQueue?: boolean,
    ): Promise<ReturnType<typeof this.imageQueue.enqueue<T>> & { fromCache?: boolean }> {
        const sourceId = this.getSourceIdFromUrl(url);

        try {
            const isCached = await ImageCache.has(url);
            if (ignoreQueue || isCached) {
                return {
                    key: `image-cache-${url}`,
                    promise: request(),
                    fromCache: isCached,
                };
            }

            return this.imageQueue.enqueue(sourceId, url, request, priority);
        } catch {
            return this.imageQueue.enqueue(sourceId, url, request, priority);
        }
    }

    private async fetchImageViaTag(
        url: string,
        { priority, shouldDecode, disableCors, ignoreQueue }: ImageRequestOptions = {},
    ): Promise<ImageRequest> {
        const imgRequest = new ControlledPromise<string>();
        imgRequest.promise.catch(() => {});

        const img = new Image();
        const abortRequest = (reason?: any) => {
            img.src = '';
            img.onload = null;
            img.onerror = null;
            img.onabort = null;
            imgRequest.reject(reason);
        };

        const {
            key,
            promise: response,
            fromCache,
        } = await this.maybeEnqueueImageRequest(
            url,
            async () => {
                // throws error in case request was already aborted
                await Promise.race([imgRequest.promise, Promise.resolve()]);

                if (!disableCors) {
                    img.crossOrigin = 'anonymous';
                }
                img.src = url;

                img.onload = async () => {
                    try {
                        await this.optionallyDecodeImage(url, shouldDecode, disableCors);
                        imgRequest.resolve(url);
                    } catch (error) {
                        imgRequest.reject(error);
                    }
                };

                img.onerror = (error) => imgRequest.reject(error);
                img.onabort = (error) => imgRequest.reject(error);

                return imgRequest.promise;
            },
            priority,
            ignoreQueue,
        );

        return {
            response,
            abortRequest: (reason?: any) =>
                this.abortImageRequest(key, this.getSourceIdFromUrl(url), () => abortRequest(reason)),
            cleanup: () => {},
            fromCache: !!fromCache,
        };
    }

    /**
     * After the image has been handled, {@see URL#revokeObjectURL} has to be called.
     *
     * @example
     *
     * const imageRequest = requestManager.requestImage("someUrl");
     * const imageUrl = await imageRequest.response
     *
     * const img = new Image();
     * img.onLoad = () => imageRequest.cleanup();
     * img.src = imageUrl;
     *
     */
    private async fetchImageViaFetchApi(
        url: string,
        { priority, shouldDecode, disableCors, ignoreQueue }: ImageRequestOptions = {},
    ): Promise<ImageRequest> {
        let objectUrl: string = '';
        const { abortRequest, signal } = createAbortController();

        const {
            key,
            promise: response,
            fromCache,
        } = await this.maybeEnqueueImageRequest(
            url,
            () =>
                this.restClient
                    .fetcher(url, {
                        checkResponseIsJson: false,
                        config: {
                            signal,
                            priority: 'low',
                        },
                    })
                    .then((data) => data.blob())
                    .then((data) => URL.createObjectURL(data))
                    .then(async (imageUrl) => {
                        objectUrl = imageUrl;

                        await this.optionallyDecodeImage(imageUrl, shouldDecode, disableCors);

                        return imageUrl;
                    }),
            priority,
            ignoreQueue,
        );

        return {
            response,
            abortRequest: (reason?: any) =>
                this.abortImageRequest(key, this.getSourceIdFromUrl(url), () => abortRequest(reason)),
            cleanup: () => URL.revokeObjectURL(objectUrl),
            fromCache: !!fromCache,
        };
    }

    /**
     * Make sure to call "cleanup" once the image is not needed anymore (only required if fetched via "fetch api")
     *
     * options:
     * - shouldDecode: decodes the image in case the browser is Firefox to prevent a flickering/blinking when an image gets visible for the first time
     */
    public async requestImage(
        url: string,
        options: ImageRequestOptions & { useFetchApi?: boolean } = {},
    ): Promise<ImageRequest> {
        const finalOptions = {
            useFetchApi: AuthManager.isAuthRequired(),
            shouldDecode: false,
            disableCors: false,
            ignoreQueue: false,
            ...Object.fromEntries(Object.entries(options).filter(([, value]) => value !== undefined)),
        };

        // on firefox images are decoded async which causes a "flicker/blinking" when they're getting visible for the first time
        // this is an issue especially in the reader because pages that should not be shown are rendered but
        // not displayed, which then causes this issue once they get displayed
        const shouldDecode = finalOptions.shouldDecode && navigator.userAgent.toLowerCase().includes('firefox');

        if (finalOptions.useFetchApi) {
            return this.fetchImageViaFetchApi(url, { ...finalOptions, shouldDecode });
        }

        return this.fetchImageViaTag(url, { ...finalOptions, shouldDecode });
    }
}
