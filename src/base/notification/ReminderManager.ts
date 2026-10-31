/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import dayjs from 'dayjs';
import { AppStorage } from '@/lib/storage/AppStorage.ts';

export interface Reminder {
    id: string;
    intervalMs: number;
    lastShownAt: Date | null;
    resolvedAt: Date | null;
    expiresAt?: Date;
}

export interface ReminderConfig {
    id: string;
    intervalMs: number;
    expiresAt?: Date;
    conditionMet: () => boolean | Promise<boolean>;
}

export class ReminderManager {
    private static readonly storageKey = 'reminders';
    private static reminders: Reminder[] = ReminderManager.load();
    private static timers = new Map<string, ReturnType<typeof setTimeout>>();

    static async start(config: ReminderConfig, show: () => void, resetIfMet: boolean = false): Promise<void> {
        const conditionMet = await (async () => {
            try {
                return await config.conditionMet();
            } catch {
                return false;
            }
        })();

        const existingReminder = this.getReminder(config.id);

        const reminder: Reminder = {
            ...config,
            lastShownAt: resetIfMet && conditionMet ? null : (existingReminder?.lastShownAt ?? null),
            resolvedAt: resetIfMet && conditionMet ? null : (existingReminder?.resolvedAt ?? null),
        };

        const isExpired = reminder.expiresAt && dayjs().isAfter(dayjs(reminder.expiresAt));
        const isInactive = reminder.resolvedAt || isExpired || !conditionMet;
        if (isInactive) {
            ReminderManager.clearTimer(reminder.id);
            return;
        }

        if (!ReminderManager.shouldShow(reminder)) {
            ReminderManager.scheduleNextCheck(reminder, config, show);
            return;
        }

        show();

        const updatedReminder: Reminder = {
            ...reminder,
            lastShownAt: new Date(),
        };

        ReminderManager.save(updatedReminder);
        ReminderManager.scheduleNextCheck(updatedReminder, config, show);
    }

    static resolve(config: Omit<ReminderConfig, 'conditionMet'>): void {
        const reminder = this.getReminder(config.id);

        const updatedReminder: Reminder = {
            id: config.id,
            intervalMs: config.intervalMs,
            lastShownAt: null,
            ...reminder,
            resolvedAt: new Date(),
        };

        ReminderManager.save(updatedReminder);
        ReminderManager.clearTimer(config.id);
    }

    private static shouldShow(reminder: Reminder): boolean {
        if (!reminder.lastShownAt) {
            return true;
        }

        return dayjs().isSameOrAfter(dayjs(reminder.lastShownAt).add(reminder.intervalMs, 'ms'));
    }

    private static scheduleNextCheck(reminder: Reminder, config: ReminderConfig, show: () => void): void {
        ReminderManager.clearTimer(reminder.id);

        if (!reminder.lastShownAt) {
            return;
        }

        const nextEligibleTime = dayjs(reminder.lastShownAt).add(reminder.intervalMs, 'ms');
        const delay = Math.max(0, nextEligibleTime.diff(dayjs()));

        ReminderManager.timers.set(
            reminder.id,
            setTimeout(() => {
                void ReminderManager.start(config, show);
            }, delay),
        );
    }

    private static clearTimer(id: string): void {
        const timer = ReminderManager.timers.get(id);

        if (timer) {
            clearTimeout(timer);
            ReminderManager.timers.delete(id);
        }
    }

    private static getReminder(id: string): Reminder | undefined {
        return ReminderManager.reminders.find((reminder) => reminder.id === id);
    }

    private static load(): Reminder[] {
        return AppStorage.local.getItemParsed<Reminder[]>(ReminderManager.storageKey, []);
    }

    private static save(reminder: Reminder): void {
        ReminderManager.reminders = [...ReminderManager.reminders.filter((item) => item.id !== reminder.id), reminder];

        AppStorage.local.setItem(ReminderManager.storageKey, ReminderManager.reminders);
    }
}
