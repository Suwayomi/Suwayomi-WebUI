/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export interface BaseReaderOverlayProps {
    isVisible: boolean;
}

export interface MobileHeaderProps extends BaseReaderOverlayProps {}

export interface ReaderBottomBarMobileProps extends BaseReaderOverlayProps {
    openSettings: () => void;
}
