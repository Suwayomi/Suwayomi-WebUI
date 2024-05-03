/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { t } from 'i18next';

export const timeFormatter = new Intl.DateTimeFormat(navigator.language, { hour: '2-digit', minute: '2-digit' });
export const dateFormatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});
export const dateTimeFormatter = new Intl.DateTimeFormat(navigator.language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
});

export const epochToDate = (epoch: number): Date => {
    const date = new Date(0); // The 0 there is the key, which sets the date to the epoch
    date.setUTCSeconds(epoch);
    return date;
};

export const isTheSameDay = (first: Date, second: Date): boolean =>
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear();

/**
 * Returns a string in localized format for the passed date.
 *
 * In case the date is from today or yesterday a special string will be returned including "Today"
 * or "Yesterday".
 * Optionally this special string can include the localized time of the passed date ("Today/Yesterday at HH:mm").
 *
 * @example
 * const today = new Date();
 * const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);
 * const someDate = new Date(1337, 4, 20);
 *
 * const todayAsString = getDateString(today); // => "Today"
 * const yesterdayAsString = getDateString(yesterday, true) // => "Yesterday at 02:50 AM"
 * const someDate = getDateString(someDate) // => "04/20/1337"
 *
 *
 * @param date
 * @param withTime
 */
export const getDateString = (date: Date | number, withTime: boolean = false) => {
    const actualDate = date instanceof Date ? date : new Date(date);

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const wasUploadedToday = isTheSameDay(today, actualDate);
    const wasUploadedYesterday = isTheSameDay(yesterday, actualDate);

    const addTimeString = wasUploadedToday || wasUploadedYesterday;
    const timeString = addTimeString ? timeFormatter.format(actualDate) : '';

    if (wasUploadedToday) {
        if (withTime) {
            return t('global.date.label.today_at', { timeString });
        }

        return t('global.date.label.today');
    }

    if (wasUploadedYesterday) {
        if (withTime) {
            return t('global.date.label.yesterday_at', { timeString });
        }

        return t('global.date.label.yesterday');
    }

    return dateFormatter.format(actualDate);
};
