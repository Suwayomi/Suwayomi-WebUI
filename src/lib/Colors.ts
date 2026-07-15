/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

type Rgb = {
    r: number;
    g: number;
    b: number;
};

export class Colors {
    static hexToRgb(hex: string): Rgb {
        let tmpHex = hex.replace(/^#/, '');

        const isShorthand = tmpHex.length === 3; // #abc
        if (isShorthand) {
            tmpHex = hex
                .split('')
                .map((c) => c + c)
                .join('');
        }

        return {
            r: parseInt(tmpHex.slice(0, 2), 16),
            g: parseInt(tmpHex.slice(2, 4), 16),
            b: parseInt(tmpHex.slice(4, 6), 16),
        };
    }

    static rgbToHex({ r, g, b }: Rgb): string {
        // oxlint-disable-next-line unicorn/consistent-function-scoping
        const toHex = (value: number) =>
            Math.round(Math.max(0, Math.min(255, value)))
                .toString(16)
                .padStart(2, '0');

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    static grayScaleRgb({ r, g, b }: Rgb): Rgb {
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        return {
            r: gray,
            g: gray,
            b: gray,
        };
    }

    static grayscaleHex(hex: string): string {
        return Colors.rgbToHex(Colors.grayScaleRgb(Colors.hexToRgb(hex)));
    }

    static sepiaRgb({ r, g, b }: Rgb, amount = 1): Rgb {
        const sepia = {
            r: r * 0.393 + g * 0.769 + b * 0.189,
            g: r * 0.349 + g * 0.686 + b * 0.168,
            b: r * 0.272 + g * 0.534 + b * 0.131,
        };

        return {
            r: Math.min(255, r + (sepia.r - r) * amount),
            g: Math.min(255, g + (sepia.g - g) * amount),
            b: Math.min(255, b + (sepia.b - b) * amount),
        };
    }

    static sepiaHex(hex: string): string {
        return Colors.rgbToHex(Colors.sepiaRgb(Colors.hexToRgb(hex)));
    }

    static invertColorHex(hex: string): string {
        const clean = hex.replace('#', '');
        const r = 255 - parseInt(clean.substring(0, 2), 16);
        const g = 255 - parseInt(clean.substring(2, 4), 16);
        const b = 255 - parseInt(clean.substring(4, 6), 16);

        return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
    }
}
