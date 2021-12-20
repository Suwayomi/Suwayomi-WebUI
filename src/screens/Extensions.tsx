/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import React, { useContext, useEffect, useState } from 'react';
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
                    onClick={
                        () => document.getElementById('external-extension-file')?.click()
                    }
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

    const [extensionsRaw, setExtensionsRaw] = useState<IExtension[]>([]);

    const [updateTriggerHolder, setUpdateTriggerHolder] = useState(0); // just a hack
    const triggerUpdate = () => setUpdateTriggerHolder(updateTriggerHolder + 1); // just a hack

    useEffect(() => {
        client.get('/api/v1/extension/list')
            .then((response) => response.data)
            .then((data) => setExtensionsRaw(data));
    }, [updateTriggerHolder]);

    const [toasts, makeToast] = makeToaster(useState<React.ReactElement[]>([]));

    const submitExternalExtension = (file: File) => {
        if (file.name.toLowerCase().endsWith('apk')) {
            const formData = new FormData();
            formData.append('file', file);

            // empty the input
            // @ts-ignore
            document.getElementById('external-extension-file').value = null;

            makeToast('Installing Extension File....', 'info');
            client.post('/api/v1/extension/install',
                formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                .then(() => {
                    makeToast('Installed extension successfully!', 'success');
                    triggerUpdate();
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

        const changeHandler = async (evt: Event) => {
            const files = await fromEvent(evt);
            submitExternalExtension(files[0] as File);
        };
        const input = document.getElementById('external-extension-file');
        input?.addEventListener('change', changeHandler);

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
            input?.removeEventListener('change', changeHandler);
        };
    }, [extensionsRaw]); // useEffect only after <input> renders

    if (extensionsRaw.length === 0) {
        return <LoadingPlaceholder />;
    }

    const filtered = extensionsRaw.filter((ext) => {
        const nsfwFilter = showNsfw || !ext.isNsfw;
        if (!query) return nsfwFilter;
        return nsfwFilter && ext.name.toLowerCase().includes(query.toLowerCase());
    });

    const combinedShownLangs = ['installed', 'updates pending', 'all', ...shownLangs];

    const groupedExtensions: [string, IExtension[]][] = groupExtensions(filtered)
        .filter((group) => group[EXTENSIONS].length > 0)
        .filter((group) => combinedShownLangs.includes(group[LANGUAGE]));

    const flatRenderItems: (IExtension | string)[] = groupedExtensions.flat(2);

    return (
        <>
            {toasts}
            <input
                type="file"
                id="external-extension-file"
                style={{ display: 'none' }}
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
                                triggerUpdate();
                            }}
                        />
                    );
                }}
            />
        </>
    );
}
