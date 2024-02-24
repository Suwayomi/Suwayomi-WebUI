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

export const AnilistAccessCodeAuth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState(false);

    const code = new URLSearchParams(location.search).get('code');

    useEffect(() => {
        const controller = new AbortController();
        if (code) {
            axios
                .post(`http://localhost:4567/api/v1/anilist/${code}`, {}, { signal: new AbortController().signal })
                .then((response) => {
                    console.log(response.status);
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

    return (
        <div>
            {error && (
                <h1 onClick={() => navigate('/settings/librarySettings')}>Failed to send the access code: {code}</h1>
            )}
        </div>
    );
};
