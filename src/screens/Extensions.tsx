/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fromEvent } from 'file-selector';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { StringParam, useQueryParam } from 'use-query-params';
import { Virtuoso } from 'react-virtuoso';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { IExtension } from '@/typings';
import requestManager from '@/lib/RequestManager';
import { extensionDefaultLangs, DefaultLanguage, langSortCmp } from '@/util/language';
import useLocalStorage from '@/util/useLocalStorage';
import {
    ExtensionState,
    GroupedExtensions,
    GroupedExtensionsResult,
    isExtensionStateOrLanguage,
    translateExtensionLanguage,
} from '@/screens/util/Extensions';
import AppbarSearch from '@/components/util/AppbarSearch';
import LoadingPlaceholder from '@/components/util/LoadingPlaceholder';
import { makeToaster } from '@/components/util/Toast';
import LangSelect from '@/components/navbar/action/LangSelect';
import NavbarContext from '@/components/context/NavbarContext';
import ExtensionCard from '@/components/ExtensionCard';

const LANGUAGE = 0;
const EXTENSIONS = 1;

function getExtensionsInfo(extensions: IExtension[]): {
    allLangs: string[];
    groupedExtensions: GroupedExtensionsResult;
} {
    const allLangs: string[] = [];
    const sortedExtensions: GroupedExtensions = {
        [ExtensionState.OBSOLETE]: [],
        [ExtensionState.INSTALLED]: [],
        [ExtensionState.UPDATE_PENDING]: [],
        [DefaultLanguage.ALL]: [],
        [DefaultLanguage.OTHER]: [],
        [DefaultLanguage.LOCAL_SOURCE]: [],
    };
    extensions.forEach((extension) => {
        if (sortedExtensions[extension.lang] === undefined) {
            sortedExtensions[extension.lang] = [];
            if (extension.lang !== 'all') {
                allLangs.push(extension.lang);
            }
        }
        if (extension.installed) {
            if (extension.hasUpdate) {
                sortedExtensions[ExtensionState.UPDATE_PENDING].push(extension);
                return;
            }
            if (extension.obsolete) {
                sortedExtensions[ExtensionState.OBSOLETE].push(extension);
                return;
            }

            sortedExtensions[ExtensionState.INSTALLED].push(extension);
        } else {
            sortedExtensions[extension.lang].push(extension);
        }
    });

    allLangs.sort(langSortCmp);
    const result: GroupedExtensionsResult<ExtensionState | DefaultLanguage | string> = [
        [ExtensionState.OBSOLETE, sortedExtensions[ExtensionState.OBSOLETE]],
        [ExtensionState.UPDATE_PENDING, sortedExtensions[ExtensionState.UPDATE_PENDING]],
        [ExtensionState.INSTALLED, sortedExtensions[ExtensionState.INSTALLED]],
        [DefaultLanguage.ALL, sortedExtensions[DefaultLanguage.ALL]],
        [DefaultLanguage.OTHER, sortedExtensions[DefaultLanguage.OTHER]],
        [DefaultLanguage.LOCAL_SOURCE, sortedExtensions[DefaultLanguage.LOCAL_SOURCE]],
    ];

    const langExt: GroupedExtensionsResult = allLangs.map((lang) => [lang, sortedExtensions[lang]]);

    return {
        allLangs,
        groupedExtensions: (result as GroupedExtensionsResult).concat(langExt),
    };
}

export default function MangaExtensions() {
    const { t } = useTranslation();

    const inputRef = useRef<HTMLInputElement>(null);
    const { setTitle, setAction } = useContext(NavbarContext);
    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownExtensionLangs', extensionDefaultLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [query] = useQueryParam('query', StringParam);

    const { data: allExtensions, mutate, isLoading } = requestManager.useGetExtensionList();

    const filteredExtensions = useMemo(
        () =>
            (allExtensions ?? []).filter((ext) => {
                const nsfwFilter = showNsfw || !ext.isNsfw;
                if (!query) return nsfwFilter;
                return nsfwFilter && ext.name.toLowerCase().includes(query.toLowerCase());
            }),
        [allExtensions, showNsfw, query],
    );

    const { allLangs, groupedExtensions } = useMemo(() => getExtensionsInfo(filteredExtensions), [filteredExtensions]);

    const filteredGroupedExtensions = useMemo(
        () =>
            groupedExtensions
                .filter((group) => group[EXTENSIONS].length > 0)
                .filter((group) => isExtensionStateOrLanguage(group[LANGUAGE]) || shownLangs.includes(group[LANGUAGE])),
        [shownLangs, groupedExtensions],
    );

    const flatRenderItems: (IExtension | string)[] = filteredGroupedExtensions.flat(2);

    const [toasts, makeToast] = makeToaster(useState<React.ReactElement[]>([]));

    const submitExternalExtension = (file: File) => {
        if (file.name.toLowerCase().endsWith('apk')) {
            if (inputRef.current) {
                inputRef.current.value = '';
            }

            makeToast(t('extension.label.installing_file'), 'info');
            requestManager
                .installExtension(file)
                .response.then(() => {
                    makeToast(t('extension.label.installed_successfully'), 'success');
                    mutate();
                })
                .catch(() => makeToast(t('extension.label.installation_failed'), 'error'));
        } else {
            makeToast(t('global.error.label.invalid_file_type'), 'error');
        }
    };

    useEffect(() => {
        setTitle(t('extension.title'));
        setAction(
            <>
                <AppbarSearch />
                <IconButton onClick={() => inputRef.current?.click()} size="large">
                    <AddIcon />
                </IconButton>
                <LangSelect shownLangs={shownLangs} setShownLangs={setShownLangs} allLangs={allLangs} />
            </>,
        );
    }, [t, shownLangs]);

    useEffect(() => {
        const dropHandler = async (e: Event) => {
            e.preventDefault();
            const files = await fromEvent(e);
            submitExternalExtension(files[0] as File);
        };

        const dragOverHandler = (e: Event) => {
            e.preventDefault();
        };

        document.addEventListener('drop', dropHandler);
        document.addEventListener('dragover', dragOverHandler);

        return () => {
            document.removeEventListener('drop', dropHandler);
            document.removeEventListener('dragover', dragOverHandler);
        };
    }, []);

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    return (
        <>
            {toasts}
            <input
                type="file"
                style={{ display: 'none' }}
                ref={inputRef}
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        submitExternalExtension(file);
                    }
                }}
            />
            <Virtuoso
                style={{
                    height: isMobile ? 'calc(100vh - 64px - 64px)' : 'calc(100vh - 64px)',
                }}
                totalCount={flatRenderItems.length}
                itemContent={(index) => {
                    if (typeof flatRenderItems[index] === 'string') {
                        const item = flatRenderItems[index] as string;
                        return (
                            <Typography
                                key={item}
                                variant="h2"
                                style={{
                                    paddingLeft: 25,
                                    paddingBottom: '0.83em',
                                    paddingTop: '0.83em',
                                    fontSize: '2em',
                                    fontWeight: 'bold',
                                }}
                            >
                                {translateExtensionLanguage(item)}
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
