/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const SECONDARY_MOUSE_BUTTON = 2;

const SAME_SPOT_TOLERANCE_PX = 8;
const APP_MENU_SELECTOR = '[role="menu"]';
const MENU_BACKDROP_CLASS = 'MuiBackdrop-root';

type Point = { x: number; y: number };

let disarmPrevious: (() => void) | null = null;

function isAppMenuOpen(): boolean {
    return document.querySelector(APP_MENU_SELECTOR) !== null;
}

function isMenuBackdrop(target: EventTarget | null): target is HTMLElement {
    return target instanceof HTMLElement && target.classList.contains(MENU_BACKDROP_CLASS);
}

function isSameSpot(a: Point, b: Point): boolean {
    return Math.hypot(a.x - b.x, a.y - b.y) <= SAME_SPOT_TOLERANCE_PX;
}

/**
 * The app menu replaces the native one on the first right click.
 * A second right click on the same spot, while the app menu is still open, has to show the native menu.
 *
 * The second right click lands on the backdrop of the app menu (not on the card), thus it has to be handled globally.
 * It stays armed until the next right click, a click/tap or the escape key.
 */
export const armNativeContextMenuOnSecondRightClick = (origin: Point): void => {
    disarmPrevious?.();

    const handleContextMenu = (event: MouseEvent): void => {
        disarm();

        if (!isAppMenuOpen() || !isMenuBackdrop(event.target)) {
            return;
        }

        // close the app menu the same way a regular click outside of it would
        event.target.click();

        // stop here to prevent the card from handling the event, as it would open the app menu again
        event.stopPropagation();

        if (!isSameSpot(origin, { x: event.clientX, y: event.clientY })) {
            event.preventDefault();
        }
    };

    const handlePointerDown = (event: PointerEvent): void => {
        if (event.button !== SECONDARY_MOUSE_BUTTON) {
            disarm();
        }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            disarm();
        }
    };

    function disarm(): void {
        document.removeEventListener('contextmenu', handleContextMenu, true);
        document.removeEventListener('pointerdown', handlePointerDown, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        disarmPrevious = null;
    }

    document.addEventListener('contextmenu', handleContextMenu, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown, true);
    disarmPrevious = disarm;
};
