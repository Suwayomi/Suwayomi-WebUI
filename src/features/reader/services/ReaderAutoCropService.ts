/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { requestManager } from '@/lib/requests/RequestManager.ts';

const MAX_DETECTION_DIMENSION = 400;
const MAX_CROP_CACHE_SIZE = 150;

const cropCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();

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

const isBlankPixel = (r: number, g: number, b: number, a: number, bg: BackgroundColor): boolean => {
    if (a < 32) {
        return true;
    }

    if (bg.isLightBg) {
        if (r >= 235 && g >= 235 && b >= 235) {
            return true;
        }
        return Math.abs(r - bg.r) <= 22 && Math.abs(g - bg.g) <= 22 && Math.abs(b - bg.b) <= 22;
    }

    if (r <= 25 && g <= 25 && b <= 25) {
        return true;
    }
    return Math.abs(r - bg.r) <= 22 && Math.abs(g - bg.g) <= 22 && Math.abs(b - bg.b) <= 22;
};

const sampleCorner = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    startX: number,
    startY: number,
): { r: number; g: number; b: number; lum: number } => {
    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let count = 0;

    for (let y = startY; y < startY + 8 && y < height; y += 1) {
        for (let x = startX; x < startX + 8 && x < width; x += 1) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] >= 32) {
                totalR += data[idx];
                totalG += data[idx + 1];
                totalB += data[idx + 2];
                count += 1;
            }
        }
    }

    if (count === 0) {
        return { r: 255, g: 255, b: 255, lum: 255 };
    }
    const r = totalR / count;
    const g = totalG / count;
    const b = totalB / count;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return { r, g, b, lum };
};

export const detectBackgroundColor = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
): BackgroundColor | null => {
    const corners = [
        sampleCorner(data, width, height, 0, 0),
        sampleCorner(data, width, height, Math.max(0, width - 8), 0),
        sampleCorner(data, width, height, 0, Math.max(0, height - 8)),
        sampleCorner(data, width, height, Math.max(0, width - 8), Math.max(0, height - 8)),
    ];

    const lightCount = corners.filter((c) => c.lum >= 200).length;
    const darkCount = corners.filter((c) => c.lum <= 45).length;

    if (lightCount >= 3) {
        const lightCorners = corners.filter((c) => c.lum >= 200);
        return {
            isLightBg: true,
            r: lightCorners.reduce((acc, c) => acc + c.r, 0) / lightCorners.length,
            g: lightCorners.reduce((acc, c) => acc + c.g, 0) / lightCorners.length,
            b: lightCorners.reduce((acc, c) => acc + c.b, 0) / lightCorners.length,
        };
    }

    if (darkCount >= 3) {
        const darkCorners = corners.filter((c) => c.lum <= 45);
        return {
            isLightBg: false,
            r: darkCorners.reduce((acc, c) => acc + c.r, 0) / darkCorners.length,
            g: darkCorners.reduce((acc, c) => acc + c.g, 0) / darkCorners.length,
            b: darkCorners.reduce((acc, c) => acc + c.b, 0) / darkCorners.length,
        };
    }

    return null;
};

const scanTopBorder = (
    data: Uint8ClampedArray,
    width: number,
    maxScanY: number,
    threshold: number,
    bg: BackgroundColor,
): number => {
    for (let y = 0; y < maxScanY; y += 1) {
        let nonBlank = 0;
        const rowOffset = y * width * 4;
        for (let x = 0; x < width; x += 1) {
            const idx = rowOffset + x * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], bg)) {
                nonBlank += 1;
                if (nonBlank > threshold) {
                    return Math.max(0, y - 1);
                }
            }
        }
    }
    return 0;
};

const scanBottomBorder = (
    data: Uint8ClampedArray,
    width: number,
    height: number,
    maxScanY: number,
    threshold: number,
    bg: BackgroundColor,
): number => {
    for (let y = height - 1; y >= height - maxScanY; y -= 1) {
        let nonBlank = 0;
        const rowOffset = y * width * 4;
        for (let x = 0; x < width; x += 1) {
            const idx = rowOffset + x * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], bg)) {
                nonBlank += 1;
                if (nonBlank > threshold) {
                    return Math.min(height, y + 2);
                }
            }
        }
    }
    return height;
};

const scanLeftBorder = (
    data: Uint8ClampedArray,
    width: number,
    cropTop: number,
    cropBottom: number,
    maxScanX: number,
    threshold: number,
    bg: BackgroundColor,
): number => {
    for (let x = 0; x < maxScanX; x += 1) {
        let nonBlank = 0;
        for (let y = cropTop; y < cropBottom; y += 1) {
            const idx = (y * width + x) * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], bg)) {
                nonBlank += 1;
                if (nonBlank > threshold) {
                    return Math.max(0, x - 1);
                }
            }
        }
    }
    return 0;
};

const scanRightBorder = (
    data: Uint8ClampedArray,
    width: number,
    cropTop: number,
    cropBottom: number,
    maxScanX: number,
    threshold: number,
    bg: BackgroundColor,
): number => {
    for (let x = width - 1; x >= width - maxScanX; x -= 1) {
        let nonBlank = 0;
        for (let y = cropTop; y < cropBottom; y += 1) {
            const idx = (y * width + x) * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], bg)) {
                nonBlank += 1;
                if (nonBlank > threshold) {
                    return Math.min(width, x + 2);
                }
            }
        }
    }
    return width;
};

export const detectCropBounds = (imageData: ImageData, width: number, height: number): CropBounds | null => {
    const bg = detectBackgroundColor(imageData.data, width, height);
    if (!bg) {
        return null;
    }

    const maxScanY = Math.floor(height * 0.25);
    const maxScanX = Math.floor(width * 0.25);
    const rowNoiseThreshold = Math.max(2, Math.floor(width * 0.005));

    const cropTop = scanTopBorder(imageData.data, width, maxScanY, rowNoiseThreshold, bg);
    const cropBottom = scanBottomBorder(imageData.data, width, height, maxScanY, rowNoiseThreshold, bg);

    const colNoiseThreshold = Math.max(2, Math.floor((cropBottom - cropTop) * 0.005));
    const cropLeft = scanLeftBorder(imageData.data, width, cropTop, cropBottom, maxScanX, colNoiseThreshold, bg);
    const cropRight = scanRightBorder(imageData.data, width, cropTop, cropBottom, maxScanX, colNoiseThreshold, bg);

    if (cropTop <= 1 && cropLeft <= 1 && width - cropRight <= 1 && height - cropBottom <= 1) {
        return null;
    }

    const cropWidth = cropRight - cropLeft;
    const cropHeight = cropBottom - cropTop;

    if (cropWidth < width * 0.25 || cropHeight < height * 0.25) {
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

    if (top <= 4 && left <= 4 && origWidth - right <= 4 && origHeight - bottom <= 4) {
        return null;
    }

    if (width < origWidth * 0.25 || height < origHeight * 0.25) {
        return null;
    }

    return { left, top, width, height };
};

export const getDetectionDimensions = (width: number, height: number): { width: number; height: number } => {
    const maxDim = Math.max(width, height);
    if (maxDim <= MAX_DETECTION_DIMENSION) {
        return { width, height };
    }
    const scale = MAX_DETECTION_DIMENSION / maxDim;
    let targetWidth = Math.round(width * scale);
    let targetHeight = Math.round(height * scale);

    const minDim = 64;
    if (targetWidth < minDim && width >= minDim) {
        targetWidth = minDim;
    }
    if (targetHeight < minDim && height >= minDim) {
        targetHeight = minDim;
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
            return await (cropCanvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality: 0.95 });
        }
        if ('toBlob' in cropCanvas && typeof (cropCanvas as HTMLCanvasElement).toBlob === 'function') {
            return await new Promise<Blob | null>((resolve) => {
                (cropCanvas as HTMLCanvasElement).toBlob(resolve, 'image/webp', 0.95);
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
        if (oldUrl && oldUrl !== src && oldUrl !== resultUrl && oldUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldUrl);
        }
        cropCache.delete(src);
    } else if (cropCache.size >= MAX_CROP_CACHE_SIZE) {
        const oldestKey = cropCache.keys().next().value;
        if (oldestKey) {
            const oldestUrl = cropCache.get(oldestKey);
            if (oldestUrl && oldestUrl !== oldestKey && oldestUrl.startsWith('blob:')) {
                URL.revokeObjectURL(oldestUrl);
            }
            cropCache.delete(oldestKey);
        }
    }
    cropCache.set(src, resultUrl);
};

export const clearReaderAutoCropCache = (): void => {
    cropCache.forEach((url, src) => {
        if (url !== src && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
    });
    cropCache.clear();
    pendingPromises.clear();
};

export const cropPageBorders = async (imageSrc: string): Promise<string> => {
    if (cropCache.has(imageSrc)) {
        return cropCache.get(imageSrc)!;
    }

    if (pendingPromises.has(imageSrc)) {
        return pendingPromises.get(imageSrc)!;
    }

    const promise = (async () => {
        let loadedImage: LoadedImage | null = null;

        try {
            loadedImage = await loadImage(imageSrc);
            const { img } = loadedImage;
            const { naturalWidth: origWidth, naturalHeight: origHeight } = img;

            if (!origWidth || !origHeight || origWidth < 50 || origHeight < 50) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            const { width: detectWidth, height: detectHeight } = getDetectionDimensions(origWidth, origHeight);
            const imageData = createDownscaledImageData(img, detectWidth, detectHeight);

            if (!imageData) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            const bounds = detectCropBounds(imageData, detectWidth, detectHeight);
            if (!bounds) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            const scaledBounds = scaleBoundsToOriginal(bounds, detectWidth, detectHeight, origWidth, origHeight);
            if (!scaledBounds) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            const blob = await generateCroppedBlob(img, scaledBounds);
            if (!blob) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            const croppedUrl = URL.createObjectURL(blob);
            setCropCache(imageSrc, croppedUrl);
            return croppedUrl;
        } catch {
            return imageSrc;
        } finally {
            loadedImage?.cleanup();
            pendingPromises.delete(imageSrc);
        }
    })();

    pendingPromises.set(imageSrc, promise);
    return promise;
};

export const useReaderAutoCrop = (src: string | undefined, enabled: boolean): string | undefined => {
    const cachedUrl = src && enabled ? cropCache.get(src) : undefined;
    const [croppedSrc, setCroppedSrc] = useState<string | undefined>(cachedUrl);
    const [prevSrc, setPrevSrc] = useState<string | undefined>(src);

    if (src !== prevSrc) {
        setPrevSrc(src);
        setCroppedSrc(cachedUrl);
    }

    useEffect(() => {
        if (!src || !enabled) {
            return;
        }

        const cached = cropCache.get(src);
        if (cached) {
            setCroppedSrc(cached);
            return;
        }

        let isSubscribed = true;
        cropPageBorders(src).then((croppedUrl) => {
            if (isSubscribed) {
                setCroppedSrc(croppedUrl);
            }
        });

        return () => {
            isSubscribed = false;
        };
    }, [src, enabled]);

    if (!src || !enabled) {
        return src;
    }

    return croppedSrc ?? cachedUrl ?? src;
};
