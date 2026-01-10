/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import dayjs, { Dayjs } from 'dayjs';
import { t } from '@lingui/core/macro';

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

export const epochToDate = (epoch: number): Dayjs => dayjs.unix(epoch);

export const isSameDay = (first: Dayjs, second: Dayjs): boolean => first.isSame(second, 'day');

/**
 * Returns a string in localized format for the passed date.
 *
 * In case the date is from today or yesterday a special string will be returned including "Today"
 * or "Yesterday".
 * Optionally this special string can include the localized time of the passed date ("Today/Yesterday at HH:mm").
 *
 * @example
 * const today = dayjs();
 * const yesterday = today.subtract(1, 'day');
 * const someDate = dayjs('1377-04-20');
 *
 * const todayAsString = getDateString(today); // => "Today"
 * const yesterdayAsString = getDateString(yesterday, true) // => "Yesterday at 02:50 AM"
 * const someDate = getDateString(someDate) // => "04/20/1337"
 *
 *
 * @param date
 * @param withTime
 */
export const getDateString = (date: Dayjs | number, withTime: boolean = false) => {
    const actualDate = date instanceof dayjs ? date : dayjs(date);
    const timeString = timeFormatter.format(actualDate.toDate());

    if (actualDate.isToday()) {
        if (withTime) {
            return t`Today at ${timeString}`;
        }

        return t`Today`;
    }

    if (actualDate.isYesterday()) {
        if (withTime) {
            return t`Yesterday at ${timeString}`;
        }

        return t`Yesterday`;
    }

    return dateFormatter.format(actualDate.toDate());
};
