/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { useState, useCallback, useEffect } from 'react';
import client from 'util/client';

/**
 * It fetches the chapters of a manga from the server and updates the chapters state
 * @param {string} id - string
 * @returns The chapters array, a function to trigger the chapters update, and a boolean to indicate if
 * there are no chapters found.
 */
export default function useChaptersFetch(id: string): [IChapter[], () => void, boolean] {
    const [chapters, setChapters] = useState<IChapter[]>([]);
    const [noChaptersFound, setNoChaptersFound] = useState(false);
    const [chapterUpdateTriggerer, setChapterUpdateTriggerer] = useState(0);
    const [fetchedOnline, setFetchedOnline] = useState(false);
    const [fetchedOffline, setFetchedOffline] = useState(false);

    const triggerChaptersUpdate = useCallback(() => setChapterUpdateTriggerer((prev) => prev + 1),
        []);

    useEffect(() => {
        const shouldFetchOnline = fetchedOffline && !fetchedOnline;

        client.get(`/api/v1/manga/${id}/chapters?onlineFetch=${shouldFetchOnline}`)
            .then((response) => response.data)
            .then((data) => {
                if (data.length === 0 && fetchedOffline) {
                    setNoChaptersFound(true);
                }
                setChapters(data);
            })
            .then(() => {
                if (shouldFetchOnline) {
                    setFetchedOnline(true);
                } else setFetchedOffline(true);
            });
    }, [fetchedOnline, fetchedOffline, chapterUpdateTriggerer]);

    return [chapters, triggerChaptersUpdate, noChaptersFound];
}
