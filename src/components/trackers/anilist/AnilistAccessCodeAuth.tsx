/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLocalStorage } from '@/util/useLocalStorage';

export const AnilistAccessCodeAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(false);

    const code = new URLSearchParams(location.search).get('code');
    const [serverAddress] = useLocalStorage<string>('serverBaseURL', '');

    useEffect(() => {
        const controller = new AbortController();
        if (code) {
            axios
                .post(`${serverAddress}/api/v1/anilist/${code}`, {}, { signal: new AbortController().signal })
                .then((response) => {
                    if (response.status === 201) {
                        navigate('/library');
                    } else {
                        setError(true);
                    }
                })
                .catch(() => setError(true));
        }
        return () => controller.abort();
    }, [code, navigate]);

    return <div>{error && <h1>Failed to login with access code: {code}</h1>}</div>;
};
