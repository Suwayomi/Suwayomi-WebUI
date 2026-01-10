/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
    ExtensionAction,
    ExtensionGroupState,
    ExtensionState,
    InstalledState,
    InstalledStates,
} from '@/features/extension/Extensions.types.ts';
import { DefaultLanguage } from '@/base/utils/Languages.ts';

export const EXTENSION_ACTION_TO_STATE_MAP: { [action in ExtensionAction]: ExtensionState } = {
    [ExtensionAction.UPDATE]: ExtensionState.UPDATING,
    [ExtensionAction.UNINSTALL]: ExtensionState.UNINSTALLING,
    [ExtensionAction.INSTALL]: ExtensionState.INSTALLING,
} as const;

export const EXTENSION_ACTION_TO_NEXT_ACTION_MAP: { [action in ExtensionAction]: ExtensionAction } = {
    [ExtensionAction.UPDATE]: ExtensionAction.UNINSTALL,
    [ExtensionAction.UNINSTALL]: ExtensionAction.INSTALL,
    [ExtensionAction.INSTALL]: ExtensionAction.UNINSTALL,
} as const;

export const INSTALLED_STATE_TO_TRANSLATION_MAP: { [installedState in InstalledStates]: MessageDescriptor } = {
    [InstalledState.UNINSTALL]: msg`Uninstall`,
    [InstalledState.INSTALL]: msg`Install`,
    [InstalledState.UPDATE]: msg`Update`,
    [InstalledState.OBSOLETE]: msg`Obsolete`,
    [InstalledState.UPDATING]: msg`Updating`,
    [InstalledState.UNINSTALLING]: msg`Uninstalling`,
    [InstalledState.INSTALLING]: msg`Installing`,
} as const;

export const EXTENSION_ACTION_TO_FAILURE_TRANSLATION_MAP: {
    [action in ExtensionAction]: MessageDescriptor;
} = {
    [ExtensionAction.UPDATE]: msg`{count, plural, one {Could not update the extension} other {Could not update the extensions}}`,
    [ExtensionAction.INSTALL]: msg`{count, plural, one {Could not install the extension} other {Could not install the extensions}}`,
    [ExtensionAction.UNINSTALL]: msg`{count, plural, one {Could not uninstall the extension} other {Could not uninstall the extensions}}`,
};

export const extensionLanguageToTranslation: {
    [state in ExtensionGroupState | DefaultLanguage]: MessageDescriptor;
} = {
    [ExtensionGroupState.INSTALLED]: msg`Installed`,
    [ExtensionGroupState.UPDATE_PENDING]: msg`Update pending`,
    [ExtensionGroupState.OBSOLETE]: msg`Obsolete`,
    [DefaultLanguage.ALL]: msg`All`,
    [DefaultLanguage.OTHER]: msg`Other`,
    [DefaultLanguage.LOCAL_SOURCE]: msg`Other`,
    [DefaultLanguage.PINNED]: msg`Pinned`,
    [DefaultLanguage.LAST_USED_SOURCE]: msg`Last used`,
};
