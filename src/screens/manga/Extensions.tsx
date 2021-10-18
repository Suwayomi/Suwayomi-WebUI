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
import ExtensionCard from 'components/manga/ExtensionCard';
import NavbarContext from 'context/NavbarContext';
import client from 'util/client';
import useLocalStorage from 'util/useLocalStorage';
import LangSelect from 'components/manga/LangSelect';
import { extensionDefaultLangs, langCodeToName, langSortCmp } from 'util/language';
import { makeToaster } from 'components/Toast';

const allLangs: string[] = [];

function groupExtensions(extensions: IExtension[]) {
    allLangs.length = 0; // empty the array
    const result = { installed: [], 'updates pending': [] } as any;
    extensions.sort((a, b) => ((a.apkName > b.apkName) ? 1 : -1));

    extensions.forEach((extension) => {
        if (result[extension.lang] === undefined) {
            result[extension.lang] = [];
            if (extension.lang !== 'all') { allLangs.push(extension.lang); }
        }
        if (extension.installed) {
            if (extension.hasUpdate) {
                result['updates pending'].push(extension);
            } else {
                result.installed.push(extension);
            }
        } else {
            result[extension.lang].push(extension);
        }
    });

    // put english first for convience
    allLangs.sort(langSortCmp);

    return result;
}

export default function MangaExtensions() {
    const { setTitle, setAction } = useContext(NavbarContext);
    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownExtensionLangs', extensionDefaultLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);

    useEffect(() => {
        setTitle('Extensions');
        setAction(
            <>
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
    const [extensions, setExtensions] = useState<any>({});

    const [updateTriggerHolder, setUpdateTriggerHolder] = useState(0); // just a hack
    const triggerUpdate = () => setUpdateTriggerHolder(updateTriggerHolder + 1); // just a hack

    useEffect(() => {
        client.get('/api/v1/extension/list')
            .then((response) => response.data)
            .then((data) => setExtensionsRaw(data));
    }, [updateTriggerHolder]);

    useEffect(() => {
        if (extensionsRaw.length > 0) {
            const groupedExtension = groupExtensions(extensionsRaw);
            setExtensions(groupedExtension);
        }
    }, [extensionsRaw]);

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
    }, [extensions]); // useEffect only after <input> renders

    if (Object.entries(extensions).length === 0) {
        return <h3>loading...</h3>;
    }
    const groupsToShow = ['updates pending', 'installed', ...shownLangs];
    return (
        <>
            {toasts}
            <input
                type="file"
                id="external-extension-file"
                style={{ display: 'none' }}
            />
            {
                Object.entries(extensions).map(([lang, list]) => (
                    ((groupsToShow.indexOf(lang) !== -1 && (list as []).length > 0)
                        && (
                            <React.Fragment key={lang}>
                                <h1 key={lang} style={{ marginLeft: 25 }}>
                                    {langCodeToName(lang)}
                                </h1>
                                {(list as IExtension[])
                                    .filter((extension) => showNsfw || !extension.isNsfw)
                                    .map((it) => (
                                        <ExtensionCard
                                            key={it.apkName}
                                            extension={it}
                                            notifyInstall={() => {
                                                triggerUpdate();
                                            }}
                                        />
                                    ))}
                            </React.Fragment>
                        ))
                ))
            }
        </>
    );
}
