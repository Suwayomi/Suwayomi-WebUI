/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';

const cropCache = new Map<string, string>();
const pendingPromises = new Map<string, Promise<string>>();

interface CropBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

const isBlankPixel = (
    r: number,
    g: number,
    b: number,
    a: number,
    isLightBg: boolean,
    bgR: number,
    bgG: number,
    bgB: number,
): boolean => {
    if (a < 32) {
        return true;
    }

    if (isLightBg) {
        if (r >= 235 && g >= 235 && b >= 235) {
            return true;
        }
        return Math.abs(r - bgR) <= 22 && Math.abs(g - bgG) <= 22 && Math.abs(b - bgB) <= 22;
    }

    if (r <= 25 && g <= 25 && b <= 25) {
        return true;
    }
    return Math.abs(r - bgR) <= 22 && Math.abs(g - bgG) <= 22 && Math.abs(b - bgB) <= 22;
};

const detectCropBounds = (imageData: ImageData, width: number, height: number): CropBounds | null => {
    const { data } = imageData;

    // Sample corner blocks (8x8) to determine background color
    const sampleCorner = (startX: number, startY: number) => {
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

    const corners = [
        sampleCorner(0, 0),
        sampleCorner(Math.max(0, width - 8), 0),
        sampleCorner(0, Math.max(0, height - 8)),
        sampleCorner(Math.max(0, width - 8), Math.max(0, height - 8)),
    ];

    const lightCount = corners.filter((c) => c.lum >= 200).length;
    const darkCount = corners.filter((c) => c.lum <= 45).length;

    let isLightBg = false;
    let avgR = 255;
    let avgG = 255;
    let avgB = 255;

    if (lightCount >= 3) {
        isLightBg = true;
        const lightCorners = corners.filter((c) => c.lum >= 200);
        avgR = lightCorners.reduce((acc, c) => acc + c.r, 0) / lightCorners.length;
        avgG = lightCorners.reduce((acc, c) => acc + c.g, 0) / lightCorners.length;
        avgB = lightCorners.reduce((acc, c) => acc + c.b, 0) / lightCorners.length;
    } else if (darkCount >= 3) {
        isLightBg = false;
        const darkCorners = corners.filter((c) => c.lum <= 45);
        avgR = darkCorners.reduce((acc, c) => acc + c.r, 0) / darkCorners.length;
        avgG = darkCorners.reduce((acc, c) => acc + c.g, 0) / darkCorners.length;
        avgB = darkCorners.reduce((acc, c) => acc + c.b, 0) / darkCorners.length;
    } else {
        // Neither predominantly light nor dark - likely full-bleed artwork
        return null;
    }

    const maxScanY = Math.floor(height * 0.25);
    const maxScanX = Math.floor(width * 0.25);
    const rowNoiseThreshold = Math.max(2, Math.floor(width * 0.005));

    // Top scan
    let cropTop = 0;
    for (let y = 0; y < maxScanY; y += 1) {
        let nonBlank = 0;
        const rowOffset = y * width * 4;
        for (let x = 0; x < width; x += 1) {
            const idx = rowOffset + x * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], isLightBg, avgR, avgG, avgB)) {
                nonBlank += 1;
                if (nonBlank > rowNoiseThreshold) {
                    break;
                }
            }
        }
        if (nonBlank > rowNoiseThreshold) {
            cropTop = Math.max(0, y - 2);
            break;
        }
    }

    // Bottom scan
    let cropBottom = height;
    for (let y = height - 1; y >= height - 1 - maxScanY; y -= 1) {
        let nonBlank = 0;
        const rowOffset = y * width * 4;
        for (let x = 0; x < width; x += 1) {
            const idx = rowOffset + x * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], isLightBg, avgR, avgG, avgB)) {
                nonBlank += 1;
                if (nonBlank > rowNoiseThreshold) {
                    break;
                }
            }
        }
        if (nonBlank > rowNoiseThreshold) {
            cropBottom = Math.min(height, y + 3);
            break;
        }
    }

    const colNoiseThreshold = Math.max(2, Math.floor((cropBottom - cropTop) * 0.005));

    // Left scan
    let cropLeft = 0;
    for (let x = 0; x < maxScanX; x += 1) {
        let nonBlank = 0;
        for (let y = cropTop; y < cropBottom; y += 1) {
            const idx = (y * width + x) * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], isLightBg, avgR, avgG, avgB)) {
                nonBlank += 1;
                if (nonBlank > colNoiseThreshold) {
                    break;
                }
            }
        }
        if (nonBlank > colNoiseThreshold) {
            cropLeft = Math.max(0, x - 2);
            break;
        }
    }

    // Right scan
    let cropRight = width;
    for (let x = width - 1; x >= width - 1 - maxScanX; x -= 1) {
        let nonBlank = 0;
        for (let y = cropTop; y < cropBottom; y += 1) {
            const idx = (y * width + x) * 4;
            if (!isBlankPixel(data[idx], data[idx + 1], data[idx + 2], data[idx + 3], isLightBg, avgR, avgG, avgB)) {
                nonBlank += 1;
                if (nonBlank > colNoiseThreshold) {
                    break;
                }
            }
        }
        if (nonBlank > colNoiseThreshold) {
            cropRight = Math.min(width, x + 3);
            break;
        }
    }

    // Check if minimal crop occurred
    if (cropTop <= 2 && cropLeft <= 2 && width - cropRight <= 2 && height - cropBottom <= 2) {
        return null;
    }

    const cropWidth = cropRight - cropLeft;
    const cropHeight = cropBottom - cropTop;

    // Safety check: Don't crop if remaining area is unreasonably small
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

const MAX_CROP_CACHE_SIZE = 150;

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
        let canvas: HTMLCanvasElement | OffscreenCanvas | null = null;
        let cropCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;

        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image for cropping'));
                img.src = imageSrc;
            });

            const { naturalWidth: width, naturalHeight: height } = img;
            if (!width || !height || width < 50 || height < 50) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            canvas =
                typeof OffscreenCanvas !== 'undefined'
                    ? new OffscreenCanvas(width, height)
                    : document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
                | CanvasRenderingContext2D
                | OffscreenCanvasRenderingContext2D
                | null;

            if (!ctx) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, width, height);

            const bounds = detectCropBounds(imageData, width, height);
            if (!bounds) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            cropCanvas =
                typeof OffscreenCanvas !== 'undefined'
                    ? new OffscreenCanvas(bounds.width, bounds.height)
                    : document.createElement('canvas');
            cropCanvas.width = bounds.width;
            cropCanvas.height = bounds.height;

            const cropCtx = cropCanvas.getContext('2d') as
                | CanvasRenderingContext2D
                | OffscreenCanvasRenderingContext2D
                | null;

            if (!cropCtx) {
                setCropCache(imageSrc, imageSrc);
                return imageSrc;
            }

            cropCtx.drawImage(
                img,
                bounds.left,
                bounds.top,
                bounds.width,
                bounds.height,
                0,
                0,
                bounds.width,
                bounds.height,
            );

            let blob: Blob | null = null;
            if ('convertToBlob' in cropCanvas && typeof (cropCanvas as OffscreenCanvas).convertToBlob === 'function') {
                blob = await (cropCanvas as OffscreenCanvas).convertToBlob({ type: 'image/webp', quality: 0.95 });
            } else if ('toBlob' in cropCanvas && typeof (cropCanvas as HTMLCanvasElement).toBlob === 'function') {
                blob = await new Promise<Blob | null>((resolve) => {
                    (cropCanvas as HTMLCanvasElement).toBlob(resolve, 'image/webp', 0.95);
                });
            }

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
            if (canvas) {
                canvas.width = 0;
                canvas.height = 0;
            }
            if (cropCanvas) {
                cropCanvas.width = 0;
                cropCanvas.height = 0;
            }
            pendingPromises.delete(imageSrc);
        }
    })();

    pendingPromises.set(imageSrc, promise);
    return promise;
};

export const useReaderAutoCrop = (src: string | undefined, enabled: boolean): string | undefined => {
    const [finalSrc, setFinalSrc] = useState<string | undefined>(() => {
        if (!src || !enabled) {
            return src;
        }
        return cropCache.get(src) ?? src;
    });

    useEffect(() => {
        if (!src || !enabled) {
            setFinalSrc(src);
            return;
        }

        const cached = cropCache.get(src);
        if (cached) {
            setFinalSrc(cached);
            return;
        }

        let isSubscribed = true;
        cropPageBorders(src).then((croppedUrl) => {
            if (isSubscribed) {
                setFinalSrc(croppedUrl);
            }
        });

        return () => {
            isSubscribed = false;
        };
    }, [src, enabled]);

    return finalSrc;
};
