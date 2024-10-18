/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import i18next, { t as translate } from 'i18next';
import { CSSProperties } from 'react';
import {
    ReaderTapZoneRect,
    TapZoneInvertMode,
    TapZoneLayouts,
    TapZoneRegion,
    TapZoneRegionType,
} from '@/modules/reader/types/TapZoneLayout.types.ts';
import {
    READER_TAP_ZONE_LAYOUTS,
    TAP_ZONE_REGION_TYPE_DATA,
} from '@/modules/reader/constants/ReaderTapZone.constants.ts';

export class ReaderTapZoneService {
    private static layout: TapZoneLayouts | null = null;

    private static canvas: HTMLCanvasElement | null = null;

    private static width: number | null = null;

    private static height: number | null = null;

    private static language: string | null = null;

    private static invertMode: TapZoneInvertMode | null = null;

    private static regions: TapZoneRegion[] | null = null;

    private static fontStyle: CSSProperties | null = null;

    private static invertRect(rect: ReaderTapZoneRect, { vertical, horizontal }: TapZoneInvertMode): ReaderTapZoneRect {
        const [x, y, width, height] = rect;

        if (vertical && horizontal) {
            return [100 - (x + width), 100 - (y + height), width, height];
        }

        if (vertical) {
            return [x, 100 - (y + height), width, height];
        }

        if (horizontal) {
            return [100 - (x + width), y, width, height];
        }

        return rect;
    }

    private static getRegions(layout: TapZoneLayouts, invertMode: TapZoneInvertMode): TapZoneRegion[] {
        const regions = READER_TAP_ZONE_LAYOUTS[layout];

        return regions.map(({ type, rect }) => ({ type, rect: this.invertRect(rect, invertMode) }));
    }

    static getOrCreateCanvas(
        layout: TapZoneLayouts,
        canvasWidth: number,
        canvasHeight: number,
        fontStyle: CSSProperties,
        invertMode: TapZoneInvertMode,
    ): HTMLCanvasElement {
        const isSameLayout = this.layout === layout;
        const isSameWidth = this.width === canvasWidth;
        const isSameHeight = this.height === canvasHeight;
        const doesCanvasExist = !!this.canvas;
        const isSameLanguage = this.language === i18next.language;
        const isSameInvertMode =
            this.invertMode?.vertical === invertMode.vertical && this.invertMode.horizontal === invertMode.horizontal;
        const isSameFontStyle = this.fontStyle === fontStyle;

        const canReuseCanvas =
            doesCanvasExist &&
            isSameWidth &&
            isSameHeight &&
            isSameLayout &&
            isSameLanguage &&
            isSameInvertMode &&
            isSameFontStyle;
        if (canReuseCanvas) {
            return this.canvas!;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;

        context.canvas.width = canvasWidth;
        context.canvas.height = canvasHeight;

        const regions = this.getRegions(layout, invertMode);
        regions.forEach(({ type, rect: [rectX, rectY, rectWidth, rectHeight] }) => {
            const { text: translationKey, color } = TAP_ZONE_REGION_TYPE_DATA[type];
            const text = translate(translationKey);

            const calcActualValue = (value: number, size: number) => (value / 100) * size;
            const x = calcActualValue(rectX, canvasWidth);
            const y = calcActualValue(rectY, canvasHeight);
            const width = calcActualValue(rectWidth, canvasWidth);
            const height = calcActualValue(rectHeight, canvasHeight);

            const calcRectCenter = (pos1: number, pos2: number) => (pos1 + pos2) * 0.5 + pos1 * 0.5;
            const rectCenterX = calcRectCenter(x, width);
            const rectCenterY = calcRectCenter(y, height);

            context.beginPath();

            context.rect(x, y, width, height);
            context.fillStyle = color;
            context.strokeStyle = 'black';

            context.stroke();
            context.fill();

            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.font = `${fontStyle.fontSize} ${fontStyle.fontFamily}`;

            context.strokeStyle = 'black';
            context.lineWidth = 5;
            context.strokeText(text, rectCenterX, rectCenterY);

            context.lineWidth = 1;
            context.fillStyle = 'white';
            context.fillText(text, rectCenterX, rectCenterY);
        });

        this.layout = layout;
        this.canvas = canvas;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.language = i18next.language;
        this.invertMode = invertMode;
        this.regions = regions;
        this.fontStyle = fontStyle;

        return canvas;
    }

    private static doesRegionContainPos(region: TapZoneRegion, x: number, y: number): boolean {
        const [rectX, rectY, width, height] = region.rect;

        return x >= rectX && x <= rectX + width && y >= rectY && y <= rectY + height;
    }

    static getAction(x: number, y: number): TapZoneRegionType {
        const xPercentage = (x / this.width!) * 100;
        const yPercentage = (y / this.height!) * 100;
        const region = this.regions?.find((regionToCheck) =>
            this.doesRegionContainPos(regionToCheck, xPercentage, yPercentage),
        );

        if (region) {
            return region.type;
        }

        return TapZoneRegionType.MENU;
    }
}
