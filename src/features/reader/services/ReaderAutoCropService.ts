/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { usePrevious } from '@mantine/hooks';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ControlledPromise } from '@/lib/ControlledPromise.ts';

const MAX_DETECTION_DIMENSION = 400;
const MAX_CROP_CACHE_SIZE = 150;
const CORNER_SAMPLE_SIZE = 8;
const TRANSPARENT_ALPHA_THRESHOLD = 32;

const cropCache = new Map<string, string>();
const pendingPromises = new Map<string, ControlledPromise<string>>();

export interface CropBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

interface BackgroundColor {
    isLightBg: boolean;
    r: number;
    g: number;
    b: number;
}

interface LoadedImage {
    img: HTMLImageElement;
    cleanup: () => void;
}

interface ScanBorderOptions {
    isRowScan: boolean;
    start: number;
    end: number;
    step: 1 | -1;
    crossStart: number;
    crossEnd: number;
    threshold: number;
    defaultCoord: number;
}

const isBlankPixel = (r: number, g: number, b: number, a: number, bg: BackgroundColor): boolean => {
    const LIGHT_PIXEL_THRESHOLD = 235;
    const DARK_PIXEL_THRESHOLD = 25;
    const COLOR_SIMILARITY_TOLERANCE = 22;

    const isTransparent = a < TRANSPARENT_ALPHA_THRESHOLD;
    if (isTransparent) {
        return true;
    }

    const isSimilarToBg =
        Math.abs(r - bg.r) <= COLOR_SIMILARITY_TOLERANCE &&
        Math.abs(g - bg.g) <= COLOR_SIMILARITY_TOLERANCE &&
        Math.abs(b - bg.b) <= COLOR_SIMILARITY_TOLERANCE;

    if (bg.isLightBg) {
        const isPureLight = r >= LIGHT_PIXEL_THRESHOLD && g >= LIGHT_PIXEL_THRESHOLD && b >= LIGHT_PIXEL_THRESHOLD;
        return isPureLight || isSimilarToBg;
    }

    const isPureDark = r <= DARK_PIXEL_THRESHOLD && g <= DARK_PIXEL_THRESHOLD && b <= DARK_PIXEL_THRESHOLD;
    return isPureDark || isSimilarToBg;
};

const sampleCorner = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
): { r: number; g: number; b: number; lum: number } => {
    const RED_LUMINANCE_WEIGHT = 0.299;
    const GREEN_LUMINANCE_WEIGHT = 0.587;
    const BLUE_LUMINANCE_WEIGHT = 0.114;
    const DEFAULT_RGB = 255;
    const DEFAULT_LUMINANCE = 255;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let y = startY; y < startY + CORNER_SAMPLE_SIZE && y < height; y += 1) {
        for (let x = startX; x < startX + CORNER_SAMPLE_SIZE && x < width; x += 1) {
            const idx = (y * width + x) * 4;
            const isOpaque = data[idx + 3] >= TRANSPARENT_ALPHA_THRESHOLD;
            if (isOpaque) {
                totalR += data[idx];
                totalG += data[idx + 1];
                totalB += data[idx + 2];
                count += 1;
            }
        }
    }

    const isEmptyCorner = count === 0;
    if (isEmptyCorner) {
        return { r: DEFAULT_RGB, g: DEFAULT_RGB, b: DEFAULT_RGB, lum: DEFAULT_LUMINANCE };
    }

    const r = totalR / count;
    const g = totalG / count;
    const b = totalB / count;
    const lum = RED_LUMINANCE_WEIGHT * r + GREEN_LUMINANCE_WEIGHT * g + BLUE_LUMINANCE_WEIGHT * b;
    return { r, g, b, lum };
};

export const detectBackgroundColor = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
): BackgroundColor | null => {
    const corners = [
        sampleCorner(data, width, height, 0, 0),
        sampleCorner(data, width, height, Math.max(0, width - CORNER_SAMPLE_SIZE), 0),
        sampleCorner(data, width, height, 0, Math.max(0, height - CORNER_SAMPLE_SIZE)),
        sampleCorner(
            data,
            width,
            height,
            Math.max(0, width - CORNER_SAMPLE_SIZE),
            Math.max(0, height - CORNER_SAMPLE_SIZE),
        ),
    ];

    const LIGHT_LUMINANCE_THRESHOLD = 200;
    const DARK_LUMINANCE_THRESHOLD = 45;
    const MIN_MATCHING_CORNERS = 3;

    const lightCorners = corners.filter((c) => c.lum >= LIGHT_LUMINANCE_THRESHOLD);
    const darkCorners = corners.filter((c) => c.lum <= DARK_LUMINANCE_THRESHOLD);

    const hasSufficientLightCorners = lightCorners.length >= MIN_MATCHING_CORNERS;
    if (hasSufficientLightCorners) {
        return {
            isLightBg: true,
            r: lightCorners.reduce((acc, c) => acc + c.r, 0) / lightCorners.length,
            g: lightCorners.reduce((acc, c) => acc + c.g, 0) / lightCorners.length,
            b: lightCorners.reduce((acc, c) => acc + c.b, 0) / lightCorners.length,
        };
    }

    const hasSufficientDarkCorners = darkCorners.length >= MIN_MATCHING_CORNERS;
    if (hasSufficientDarkCorners) {
        return {
            isLightBg: false,
            r: darkCorners.reduce((acc, c) => acc + c.r, 0) / darkCorners.length,
            g: darkCorners.reduce((acc, c) => acc + c.g, 0) / darkCorners.length,
            b: darkCorners.reduce((acc, c) => acc + c.b, 0) / darkCorners.length,
        };
    }

    return null;
};

const scanBorder = (
    data: Uint8ClampedArray,
    width: number,
    options: ScanBorderOptions,
    bg: BackgroundColor,
): number => {
    const BORDER_BUFFER_PIXELS = 1;
    const INCLUSIVE_TO_EXCLUSIVE_OFFSET = 1;
    const { isRowScan, start, end, step, crossStart, crossEnd, threshold, defaultCoord } = options;
    const isForward = step > 0;

    for (let pos = start; isForward ? pos < end : pos >= end; pos += step) {
        let nonBlank = 0;
        for (let cross = crossStart; cross < crossEnd; cross += 1) {
            const x = isRowScan ? cross : pos;
            const y = isRowScan ? pos : cross;
            const idx = (y * width + x) * 4;
            const isPixelBlank = isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], bg);
            if (!isPixelBlank) {
                nonBlank += 1;
                const exceedsThreshold = nonBlank > threshold;
                if (exceedsThreshold) {
                    return isForward
                        ? Math.max(0, pos - BORDER_BUFFER_PIXELS)
                        : Math.min(defaultCoord, pos + INCLUSIVE_TO_EXCLUSIVE_OFFSET + BORDER_BUFFER_PIXELS);
                }
            }
        }
    }

    return defaultCoord;
};

export const detectCropBounds = (imageData: ImageData, width: number, height: number): CropBounds | null => {
    const bg = detectBackgroundColor(imageData.data, width, height);
    if (!bg) {
        return null;
    }

    const MAX_SCAN_RATIO = 0.25;
    const NOISE_RATIO = 0.005;
    const MIN_NOISE_THRESHOLD = 2;
    const MIN_EDGE_CROP_DELTA = 1;
    const MIN_CONTENT_RATIO = 0.25;

    const maxScanY = Math.floor(height * MAX_SCAN_RATIO);
    const maxScanX = Math.floor(width * MAX_SCAN_RATIO);
    const rowNoiseThreshold = Math.max(MIN_NOISE_THRESHOLD, Math.floor(width * NOISE_RATIO));

    const cropTop = scanBorder(
        imageData.data,
        width,
        {
            isRowScan: true,
            start: 0,
            end: maxScanY,
            step: 1,
            crossStart: 0,
            crossEnd: width,
            threshold: rowNoiseThreshold,
            defaultCoord: 0,
        },
        bg,
    );
    const cropBottom = scanBorder(
        imageData.data,
        width,
        {
            isRowScan: true,
            start: height - 1,
            end: height - maxScanY,
            step: -1,
            crossStart: 0,
            crossEnd: width,
            threshold: rowNoiseThreshold,
            defaultCoord: height,
        },
        bg,
    );

    const colNoiseThreshold = Math.max(MIN_NOISE_THRESHOLD, Math.floor((cropBottom - cropTop) * NOISE_RATIO));
    const cropLeft = scanBorder(
        imageData.data,
        width,
        {
            isRowScan: false,
            start: 0,
            end: maxScanX,
            step: 1,
            crossStart: cropTop,
            crossEnd: cropBottom,
            threshold: colNoiseThreshold,
            defaultCoord: 0,
        },
        bg,
    );
    const cropRight = scanBorder(
        imageData.data,
        width,
        {
            isRowScan: false,
            start: width - 1,
            end: width - maxScanX,
            step: -1,
            crossStart: cropTop,
            crossEnd: cropBottom,
            threshold: colNoiseThreshold,
            defaultCoord: width,
        },
        bg,
    );

    const isCropMinimal =
        cropTop <= MIN_EDGE_CROP_DELTA &&
        cropLeft <= MIN_EDGE_CROP_DELTA &&
        width - cropRight <= MIN_EDGE_CROP_DELTA &&
        height - cropBottom <= MIN_EDGE_CROP_DELTA;

    if (isCropMinimal) {
        return null;
    }

    const cropWidth = cropRight - cropLeft;
    const cropHeight = cropBottom - cropTop;

    const isContentTooSmall = cropWidth < width * MIN_CONTENT_RATIO || cropHeight < height * MIN_CONTENT_RATIO;

    if (isContentTooSmall) {
        return null;
    }

    return {
        left: cropLeft,
        top: cropTop,
        width: cropWidth,
        height: cropHeight,
    };
};

export const scaleBoundsToOriginal = (
    bounds: CropBounds,
    detectWidth: number,
    detectHeight: number,
    origWidth: number,
    origHeight: number,
): CropBounds | null => {
    const MIN_EDGE_CROP_DELTA = 4;
    const MIN_CONTENT_RATIO = 0.25;

    const relativeLeft = bounds.left / detectWidth;
    const relativeTop = bounds.top / detectHeight;
    const relativeRight = (bounds.left + bounds.width) / detectWidth;
    const relativeBottom = (bounds.top + bounds.height) / detectHeight;

    const left = Math.floor(relativeLeft * origWidth);
    const top = Math.floor(relativeTop * origHeight);
    const right = Math.min(origWidth, Math.ceil(relativeRight * origWidth));
    const bottom = Math.min(origHeight, Math.ceil(relativeBottom * origHeight));

    const width = right - left;
    const height = bottom - top;

    const isCropMinimal =
        top <= MIN_EDGE_CROP_DELTA &&
        left <= MIN_EDGE_CROP_DELTA &&
        origWidth - right <= MIN_EDGE_CROP_DELTA &&
        origHeight - bottom <= MIN_EDGE_CROP_DELTA;

    if (isCropMinimal) {
        return null;
    }

    const isContentTooSmall = width < origWidth * MIN_CONTENT_RATIO || height < origHeight * MIN_CONTENT_RATIO;

    if (isContentTooSmall) {
        return null;
    }

    return { left, top, width, height };
};

export const getDetectionDimensions = (width: number, height: number): { width: number; height: number } => {
    const MIN_DETECTION_DIMENSION = 64;
    const maxDim = Math.max(width, height);
    if (maxDim <= MAX_DETECTION_DIMENSION) {
        return { width, height };
    }
    const scale = MAX_DETECTION_DIMENSION / maxDim;
    let targetWidth = Math.round(width * scale);
    let targetHeight = Math.round(height * scale);

    const isWidthBelowMin = targetWidth < MIN_DETECTION_DIMENSION && width >= MIN_DETECTION_DIMENSION;
    if (isWidthBelowMin) {
        targetWidth = MIN_DETECTION_DIMENSION;
    }
    const isHeightBelowMin = targetHeight < MIN_DETECTION_DIMENSION && height >= MIN_DETECTION_DIMENSION;
    if (isHeightBelowMin) {
        targetHeight = MIN_DETECTION_DIMENSION;
    }

    return {
        width: Math.max(1, targetWidth),
        height: Math.max(1, targetHeight),
    };
};

export const createDownscaledImageData = (img: CanvasImageSource, width: number, height: number): ImageData | null => {
    let canvas: HTMLCanvasElement | OffscreenCanvas | null =
        typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(width, height) : document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    try {
        const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
            | CanvasRenderingContext2D
            | OffscreenCanvasRenderingContext2D
            | null;

        if (!ctx) {
            return null;
        }

        ctx.drawImage(img, 0, 0, width, height);
        return ctx.getImageData(0, 0, width, height);
    } finally {
        canvas.width = 0;
        canvas.height = 0;
        canvas = null;
    }
};

export const generateCroppedBlob = async (img: CanvasImageSource, bounds: CropBounds): Promise<Blob | null> => {
    const IMAGE_MIME_TYPE = 'image/webp';
    const IMAGE_QUALITY = 0.95;

    let cropCanvas: HTMLCanvasElement | OffscreenCanvas | null =
        typeof OffscreenCanvas !== 'undefined'
            ? new OffscreenCanvas(bounds.width, bounds.height)
            : document.createElement('canvas');
    cropCanvas.width = bounds.width;
    cropCanvas.height = bounds.height;

    try {
        const cropCtx = cropCanvas.getContext('2d') as
            | CanvasRenderingContext2D
            | OffscreenCanvasRenderingContext2D
            | null;

        if (!cropCtx) {
            return null;
        }

        cropCtx.drawImage(img, bounds.left, bounds.top, bounds.width, bounds.height, 0, 0, bounds.width, bounds.height);

        if ('convertToBlob' in cropCanvas && typeof (cropCanvas as OffscreenCanvas).convertToBlob === 'function') {
            return await (cropCanvas as OffscreenCanvas).convertToBlob({
                type: IMAGE_MIME_TYPE,
                quality: IMAGE_QUALITY,
            });
        }
        if ('toBlob' in cropCanvas && typeof (cropCanvas as HTMLCanvasElement).toBlob === 'function') {
            return await new Promise<Blob | null>((resolve) => {
                (cropCanvas as HTMLCanvasElement).toBlob(resolve, IMAGE_MIME_TYPE, IMAGE_QUALITY);
            });
        }
        return null;
    } finally {
        cropCanvas.width = 0;
        cropCanvas.height = 0;
        cropCanvas = null;
    }
};

const loadImage = async (imageSrc: string): Promise<LoadedImage> => {
    const imageRequest = await requestManager.requestImage(imageSrc);

    let resolvedUrl: string;
    try {
        resolvedUrl = await imageRequest.response;
    } catch (error) {
        imageRequest.cleanup();
        throw error;
    }

    const img = new Image();
    if (!resolvedUrl.startsWith('blob:') && !resolvedUrl.startsWith('data:')) {
        img.crossOrigin = 'anonymous';
    }

    try {
        await new Promise<void>((resolve, reject) => {
            if (img.complete && img.naturalWidth > 0) {
                resolve();
                return;
            }
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image for cropping'));
            img.src = resolvedUrl;
            if (img.complete && img.naturalWidth > 0) {
                resolve();
            }
        });
    } catch (error) {
        imageRequest.cleanup();
        throw error;
    }

    return {
        img,
        cleanup: () => {
            imageRequest.cleanup();
            img.src = '';
        },
    };
};

const setCropCache = (src: string, resultUrl: string): void => {
    if (cropCache.has(src)) {
        const oldUrl = cropCache.get(src);
        const shouldRevokeOldUrl = oldUrl && oldUrl !== src && oldUrl !== resultUrl && oldUrl.startsWith('blob:');
        if (shouldRevokeOldUrl) {
            URL.revokeObjectURL(oldUrl);
        }
        cropCache.delete(src);
    } else if (cropCache.size >= MAX_CROP_CACHE_SIZE) {
        const oldestKey = cropCache.keys().next().value;
        if (oldestKey) {
            const oldestUrl = cropCache.get(oldestKey);
            const shouldRevokeOldestUrl = oldestUrl && oldestUrl !== oldestKey && oldestUrl.startsWith('blob:');
            if (shouldRevokeOldestUrl) {
                URL.revokeObjectURL(oldestUrl);
            }
            cropCache.delete(oldestKey);
        }
    }
    cropCache.set(src, resultUrl);
};

export const clearReaderAutoCropCache = (): void => {
    cropCache.forEach((url, src) => {
        const isBlobUrl = url !== src && url.startsWith('blob:');
        if (isBlobUrl) {
            URL.revokeObjectURL(url);
        }
    });
    cropCache.clear();

    pendingPromises.forEach((controlled) => {
        controlled.reject(new Error('Reader auto crop cache cleared'));
    });
    pendingPromises.clear();
};

export const cropPageBorders = async (imageSrc: string): Promise<string> => {
    if (cropCache.has(imageSrc)) {
        return cropCache.get(imageSrc)!;
    }

    if (pendingPromises.has(imageSrc)) {
        return pendingPromises.get(imageSrc)!.promise;
    }

    const controlled = new ControlledPromise<string>();
    pendingPromises.set(imageSrc, controlled);

    (async () => {
        let loadedImage: LoadedImage | null = null;
        const isStillActive = () => pendingPromises.get(imageSrc) === controlled;
        const resolveWithFallback = () => {
            if (isStillActive()) {
                setCropCache(imageSrc, imageSrc);
                controlled.resolve(imageSrc);
            }
        };

        try {
            loadedImage = await loadImage(imageSrc);
            const { img } = loadedImage;
            const { naturalWidth: origWidth, naturalHeight: origHeight } = img;

            const MIN_IMAGE_DIMENSION = 50;
            const isImageTooSmall =
                !origWidth || !origHeight || origWidth < MIN_IMAGE_DIMENSION || origHeight < MIN_IMAGE_DIMENSION;
            if (isImageTooSmall) {
                resolveWithFallback();
                return;
            }

            const { width: detectWidth, height: detectHeight } = getDetectionDimensions(origWidth, origHeight);
            const imageData = createDownscaledImageData(img, detectWidth, detectHeight);

            if (!imageData) {
                resolveWithFallback();
                return;
            }

            const bounds = detectCropBounds(imageData, detectWidth, detectHeight);
            if (!bounds) {
                resolveWithFallback();
                return;
            }

            const scaledBounds = scaleBoundsToOriginal(bounds, detectWidth, detectHeight, origWidth, origHeight);
            if (!scaledBounds) {
                resolveWithFallback();
                return;
            }

            const blob = await generateCroppedBlob(img, scaledBounds);
            if (!blob) {
                resolveWithFallback();
                return;
            }

            if (!isStillActive()) {
                return;
            }

            const croppedUrl = URL.createObjectURL(blob);
            setCropCache(imageSrc, croppedUrl);
            controlled.resolve(croppedUrl);
        } catch {
            resolveWithFallback();
        } finally {
            loadedImage?.cleanup();
            if (isStillActive()) {
                pendingPromises.delete(imageSrc);
            }
        }
    })();

    return controlled.promise;
};

export const useReaderAutoCrop = (src: string | undefined, enabled: boolean): string | undefined => {
    const prevSrc = usePrevious(src);
    const cachedUrl = src && enabled ? cropCache.get(src) : undefined;
    const [croppedSrc, setCroppedSrc] = useState<string | undefined>(cachedUrl);

    useEffect(() => {
        if (!src || !enabled) {
            setCroppedSrc(undefined);
            return;
        }

        const cached = cropCache.get(src);
        if (cached) {
            setCroppedSrc(cached);
            return;
        }

        let isSubscribed = true;
        cropPageBorders(src)
            .then((croppedUrl) => {
                if (isSubscribed) {
                    setCroppedSrc(croppedUrl);
                }
            })
            .catch(() => {
                // Ignore cancellations or failures
            });

        return () => {
            isSubscribed = false;
        };
    }, [src, enabled]);

    if (!src || !enabled) {
        return src;
    }

    const isCurrentCrop = prevSrc === undefined || prevSrc === src;
    return (isCurrentCrop ? croppedSrc : cachedUrl) ?? src;
};
