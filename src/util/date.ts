/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export const isWithinLastXMillis = (date: Date, timeMS: number) => {
    const timeDifference = Date.now() - date.getTime();
    return timeDifference <= timeMS;
};

export const getElapsedTimeSinceStartOfDay = (date: Date) => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return date.getTime() - startOfDay.getTime();
};

/**
 * Returns a string in localized format for the passed date.
 *
 * In case the date is from today or yesterday a special string will be returned including "Today"
 * or "Yesterday" with the localized time of the passed date.
 *
 * @example
 * const today = new Date();
 * const yesterday = new Date(today.getTime() - 1000 * 60 * 60 * 24);
 * const someDate = new Date(1337, 4, 20);
 *
 * const todayAsString = getDateString(today); // => "Today at 02:50 AM"
 * const yesterdayAsString = getDateString(yesterday) // => "Yesterday at 02:50 AM"
 * const someDate = getDateString(someDate) // => "04/20/1337"
 *
 *
 * @param date
 */
export const getUploadDateString = (date: Date | number) => {
    const uploadDate = date instanceof Date ? date : new Date(date);

    const today = new Date();
    const todayElapsedTime = getElapsedTimeSinceStartOfDay(today);
    const yesterday = new Date(today.getTime() - todayElapsedTime - 1000 * 60 * 60 * 24);
    const elapsedTimeSinceYesterday = today.getTime() - yesterday.getTime();

    const wasUploadedToday = isWithinLastXMillis(uploadDate, todayElapsedTime);
    const wasUploadedYesterday = isWithinLastXMillis(uploadDate, elapsedTimeSinceYesterday);

    const addTimeString = wasUploadedToday || wasUploadedYesterday;
    const timeString = addTimeString
        ? uploadDate.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
          })
        : '';

    if (wasUploadedToday) {
        return `Today at ${timeString}`;
    }

    if (wasUploadedYesterday) {
        return `Yesterday at ${timeString}`;
    }

    return uploadDate.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};
