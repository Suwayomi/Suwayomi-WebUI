/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { HotkeyScope } from '@/modules/hotkeys/Hotkeys.types.ts';

export const HOTKEY_SCOPES = Object.fromEntries(
    Object.values(HotkeyScope).map((scope) => [scope, { scopes: scope }]),
) as Record<HotkeyScope, { scopes: string }>;
