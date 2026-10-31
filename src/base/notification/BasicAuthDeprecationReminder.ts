/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { ReminderManager } from '@/base/notification/ReminderManager.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AuthMode } from '@/lib/graphql/generated/graphql-base.types.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { t as translate } from '@lingui/core/macro';
import { d } from 'koration';

export class BasicAuthDeprecationReminder {
    private static readonly ID = 'basic-auth-deprecation-reminder';

    private static readonly REMINDER = {
        id: this.ID,
        intervalMs: d(7).days.inWholeMilliseconds,
        conditionMet: async () => {
            try {
                const settingsResponse = await requestManager.getServerSettings().response;

                return settingsResponse.data?.settings.authMode === AuthMode.BasicAuth;
            } catch {
                return false;
            }
        },
    };

    static start() {
        ReminderManager.start(
            this.REMINDER,
            () => {
                Confirmation.show({
                    title: translate`Basic Authentication deprecation`,
                    message: translate`The "Basic Authentication" mode is deprecated and will be removed in the future. Switch to another authentication mode`,
                    actions: {
                        confirm: {
                            title: translate`Change`,
                        },
                    },
                    requireExplicitAction: true,
                })
                    .then(() => ReactRouter.navigate(AppRoutes.settings.children.server.path))
                    .catch(defaultPromiseErrorHandler('deprecated-basic-auth-check'));
            },
            true,
        ).catch(defaultPromiseErrorHandler('deprecated-basic-auth-check'));
    }

    static resolve() {
        ReminderManager.resolve(this.REMINDER);
    }
}
