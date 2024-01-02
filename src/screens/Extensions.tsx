/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fromEvent } from 'file-selector';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import { StringParam, useQueryParam } from 'use-query-params';
import { Virtuoso } from 'react-virtuoso';
import { Box, Tooltip, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { extensionDefaultLangs, DefaultLanguage, langSortCmp } from '@/util/language';
import { useLocalStorage } from '@/util/useLocalStorage';
import {
    ExtensionState,
    GroupedExtensions,
    GroupedExtensionsResult,
    isExtensionStateOrLanguage,
    translateExtensionLanguage,
} from '@/screens/util/Extensions';
import { AppbarSearch } from '@/components/util/AppbarSearch';
import { LoadingPlaceholder } from '@/components/util/LoadingPlaceholder';
import { makeToaster } from '@/components/util/Toast';
import { LangSelect } from '@/components/navbar/action/LangSelect';
import { ExtensionCard } from '@/components/ExtensionCard';
import { PartialExtension } from '@/typings.ts';
import { NavBarContext } from '@/components/context/NavbarContext.tsx';

const LANGUAGE = 0;
const EXTENSIONS = 1;

function getExtensionsInfo(extensions: PartialExtension[]): {
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
        if (extension.isInstalled) {
            if (extension.hasUpdate) {
                sortedExtensions[ExtensionState.UPDATE_PENDING].push(extension);
                return;
            }
            if (extension.isObsolete) {
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

export function Extensions() {
    const { t } = useTranslation();

    const inputRef = useRef<HTMLInputElement>(null);
    const { setTitle, setAction } = useContext(NavBarContext);
    const [shownLangs, setShownLangs] = useLocalStorage<string[]>('shownExtensionLangs', extensionDefaultLangs());
    const [showNsfw] = useLocalStorage<boolean>('showNsfw', true);
    const [query] = useQueryParam('query', StringParam);

    const [refetchExtensions, setRefetchExtensions] = useState({});
    const [fetchExtensions, { data, loading: isLoading, called }] = requestManager.useExtensionListFetch();
    const allExtensions = data?.fetchExtensions.extensions;

    const handleExtensionUpdate = useCallback(() => setRefetchExtensions({}), []);

    useEffect(() => {
        fetchExtensions();
    }, [refetchExtensions]);

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

    const flatRenderItems: (PartialExtension | string)[] = filteredGroupedExtensions.flat(2);

    const [toasts, makeToast] = makeToaster(useState<React.ReactElement[]>([]));

    const submitExternalExtension = (file: File) => {
        if (file.name.toLowerCase().endsWith('apk')) {
            if (inputRef.current) {
                inputRef.current.value = '';
            }

            makeToast(t('extension.label.installing_file'), 'info');
            requestManager
                .installExternalExtension(file)
                .response.then(() => {
                    makeToast(t('extension.label.installed_successfully'), 'success');
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
                <Tooltip title={t('extension.action.label.install_external')}>
                    <IconButton onClick={() => inputRef.current?.click()} size="large">
                        <AddIcon />
                    </IconButton>
                </Tooltip>

                <LangSelect shownLangs={shownLangs} setShownLangs={setShownLangs} allLangs={allLangs} />
            </>,
        );
    }, [t, shownLangs, allLangs]);

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

    if (!allExtensions && (isLoading || !called)) {
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
                useWindowScroll
                overscan={window.innerHeight * 0.5}
                totalCount={flatRenderItems.length}
                itemContent={(index) => {
                    if (typeof flatRenderItems[index] === 'string') {
                        const item = flatRenderItems[index] as string;
                        return (
                            <Typography
                                key={item}
                                variant="h4"
                                style={{
                                    paddingLeft: '24px',
                                    paddingTop: '6px',
                                    paddingBottom: '16px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {translateExtensionLanguage(item)}
                            </Typography>
                        );
                    }
                    const item = flatRenderItems[index] as PartialExtension;

                    return (
                        <Box sx={{ padding: '10px', paddingTop: 0 }}>
                            <ExtensionCard key={item.apkName} extension={item} handleUpdate={handleExtensionUpdate} />
                        </Box>
                    );
                }}
            />
        </>
    );
}
