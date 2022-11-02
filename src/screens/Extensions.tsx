/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, {
    useContext, useEffect, useState, useMemo, useRef,
} from 'react';
import { fromEvent } from 'file-selector';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import ExtensionCard from 'components/ExtensionCard';
import NavbarContext from 'components/context/NavbarContext';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import LangSelect from 'components/navbar/action/LangSelect';
import { extensionDefaultLangs, langCodeToName, langSortCmp } from 'util/language';
import { makeToaster } from 'components/util/Toast';
import LoadingPlaceholder from 'components/util/LoadingPlaceholder';
import AppbarSearch from 'components/util/AppbarSearch';
import { useQueryParam, StringParam } from 'use-query-params';
import { Virtuoso } from 'react-virtuoso';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import useSWR from 'swr';

const LANGUAGE = 0;
const EXTENSIONS = 1;

const allLangs: string[] = [];

interface GroupedExtension {
    [key: string]: IExtension[]
}

function groupExtensions(extensions: IExtension[]) {
    allLangs.length = 0; // empty the array
    const sortedExtenions: GroupedExtension = { installed: [], 'updates pending': [], all: [] };
    extensions.forEach((extension) => {
        if (sortedExtenions[extension.lang] === undefined) {
            sortedExtenions[extension.lang] = [];
            if (extension.lang !== 'all') { allLangs.push(extension.lang); }
        }
        if (extension.installed) {
            if (extension.hasUpdate) {
                sortedExtenions['updates pending'].push(extension);
            } else {
                sortedExtenions.installed.push(extension);
            }
        } else {
            sortedExtenions[extension.lang].push(extension);
        }
    });

    allLangs.sort(langSortCmp);
    const result: [string, IExtension[]][] = [
        ['updates pending', sortedExtenions['updates pending']],
        ['installed', sortedExtenions.installed],
        ['all', sortedExtenions.all],
    ];

    const langExt: [string, IExtension[]][] = allLangs.map((lang) => [lang, sortedExtenions[lang]]);

    return result.concat(langExt);
}

export default function MangaExtensions() {
    const inputRef = useRef<HTMLInputElement>(null);
    const { setTitle, setAction } = useContext(NavbarContext);
    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownExtensionLangs', extensionDefaultLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [query] = useQueryParam('query', StringParam);

    useEffect(() => {
        setTitle('Extensions');
        setAction(
            <>
                <AppbarSearch />
                <IconButton
                    onClick={() => inputRef.current?.click()}
                    size="large"
                >
                    <AddIcon />
                </IconButton>
                <LangSelect
                    shownLangs={shownLangs}
                    setShownLangs={setShownLangs}
                    allLangs={allLangs}
                />
            </>,
        );
    }, [shownLangs]);

    const { data: allExtensions, mutate } = useSWR<IExtension[]>('/api/v1/extension/list');

    const filteredExtensions = useMemo(() => (allExtensions ?? []).filter((ext) => {
        const nsfwFilter = showNsfw || !ext.isNsfw;
        if (!query) return nsfwFilter;
        return nsfwFilter && ext.name.toLowerCase().includes(query.toLowerCase());
    }), [allExtensions, showNsfw, query]);

    const groupedExtensions = useMemo(() => groupExtensions(filteredExtensions)
        .filter((group) => group[EXTENSIONS].length > 0)
        .filter((group) => ['installed', 'updates pending', 'all', ...shownLangs].includes(group[LANGUAGE])), [shownLangs, filteredExtensions]);

    const flatRenderItems: (IExtension | string)[] = groupedExtensions.flat(2);

    const [toasts, makeToast] = makeToaster(useState<React.ReactElement[]>([]));

    const submitExternalExtension = (file: File) => {
        if (file.name.toLowerCase().endsWith('apk')) {
            const formData = new FormData();
            formData.append('file', file);

            if (inputRef.current) {
                inputRef.current.value = '';
            }

            makeToast('Installing Extension File....', 'info');
            client.post('/api/v1/extension/install',
                formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(() => {
                    makeToast('Installed extension successfully!', 'success');
                    mutate();
                })
                .catch(() => makeToast('Extension installion failed!', 'error'));
        } else {
            makeToast('invalid file type!', 'error');
        }
    };

    const dropHandler = async (e: Event) => {
        e.preventDefault();
        const files = await fromEvent(e);
        submitExternalExtension(files[0] as File);
    };

    const dragOverHandler = (e: Event) => {
        e.preventDefault();
    };

    useEffect(() => {
        document.addEventListener('drop', dropHandler);
        document.addEventListener('dragover', dragOverHandler);

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
        };
    }, []);

    if (!allExtensions) {
        return <LoadingPlaceholder />;
    }

    return (
        <>
            {toasts}
            <input
                type="file"
                style={{ display: 'none' }}
                ref={inputRef}
            />
            <Virtuoso
                style={{
                    height: isMobile ? 'calc(100vh - 64px - 64px)' : 'calc(100vh - 64px)',
                }}
                totalCount={flatRenderItems.length}
                itemContent={(index) => {
                    if (typeof (flatRenderItems[index]) === 'string') {
                        const item = flatRenderItems[index] as string;
                        return (
                            <Typography
                                key={item}
                                variant="h2"
                                style={{
                                    paddingLeft: 25,
                                    paddingBottom: '0.83em',
                                    paddingTop: '0.83em',
                                    backgroundColor: 'rgb(18, 18, 18)',
                                    fontSize: '2em',
                                    fontWeight: 'bold',
                                }}
                            >
                                {langCodeToName(item)}
                            </Typography>
                        );
                    }
                    const item = flatRenderItems[index] as IExtension;

                    return (
                        <ExtensionCard
                            key={item.apkName}
                            extension={item}
                            notifyInstall={() => {
                                mutate();
                            }}
                        />
                    );
                }}
            />
        </>
    );
}
