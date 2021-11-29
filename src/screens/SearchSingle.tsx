/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useParams } from 'react-router-dom';
import MangaGrid from 'components/MangaGrid';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import { Box } from '@mui/system';

export default function SearchSingle() {
    const { setTitle, setAction } = useContext(NavbarContext);
    useEffect(() => { setTitle('Search'); setAction(<></>); }, []);

    const { sourceId } = useParams<{ sourceId: string }>();
    const [error, setError] = useState<boolean>(false);
    const [mangas, setMangas] = useState<IMangaCard[]>([]);
    const [message, setMessage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [lastPageNum, setLastPageNum] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const textInput = React.createRef<HTMLInputElement>();

    useEffect(() => {
        client.get(`/api/v1/source/${sourceId}`)
            .then((response) => response.data)
            .then((data: { name: string }) => setTitle(`Search: ${data.name}`));
    }, []);

    function resetSearch() {
        setIsLoading(true);
        setMangas([]);
        setLastPageNum(1);
    }

    function processInput() {
        if (textInput.current) {
            const { value } = textInput.current;
            if (value === '') {
                setError(true);
            } else {
                setError(false);
                setSearchTerm(value);
                resetSearch();
            }
        }
    }

    useEffect(() => {
        if (searchTerm.length > 0) {
            client.get(`/api/v1/source/${sourceId}/search`, { params: { searchTerm, pageNum: lastPageNum } })
                .then((response) => response.data)
                .then((data: { mangaList: IManga[], hasNextPage: boolean }) => {
                    if (data.mangaList.length > 0) {
                        setMangas([
                            ...mangas,
                            ...data.mangaList.map((it) => ({
                                title: it.title, thumbnailUrl: it.thumbnailUrl, id: it.id,
                            }))]);
                        setHasNextPage(data.hasNextPage);
                    } else {
                        setMessage('Search query returned nothing.');
                    }

                    setIsLoading(false);
                });
        }
    }, [searchTerm, lastPageNum]);

    return (
        <>
            <Box sx={{
                margin: '20px 10px',
                display: 'flex',
                width: '400px',
                maxWidth: 'calc(100% - 20px)',
            }}
            >
                <TextField
                    inputRef={textInput}
                    error={error}
                    sx={{
                        mx: 1,
                        flexGrow: 1,
                    }}
                    id="filled-basic"
                    variant="filled"
                    size="small"
                    label="Search text.."
                    onKeyDown={(e) => e.key === 'Enter' && processInput()}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => processInput()}
                >
                    Search
                </Button>
            </Box>
            {searchTerm.length > 0
        && (
            <MangaGrid
                mangas={mangas}
                message={message}
                hasNextPage={hasNextPage}
                lastPageNum={lastPageNum}
                setLastPageNum={setLastPageNum}
                isLoading={isLoading}
            />
        )}
        </>
    );
}
