/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { CombinedGraphQLErrors } from '@apollo/client';
import type { ReactNode } from 'react';
import { makeToast } from '@/base/utils/Toast.ts';
import { t } from '@lingui/core/macro';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

export const jsonSaveParse = <T = any>(...args: Parameters<typeof JSON.parse>): T | null => {
    try {
        return JSON.parse(...args);
    } catch (e) {
        return null;
    }
};

export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error || CombinedGraphQLErrors.is(error)) {
        return error.message;
    }

    if (error == null) {
        return '';
    }

    return `${error}`;
};

export const getValueFromObject = <T>(obj: Record<string, any>, key: string): T => {
    const keys = key.split('.');

    return keys.reduce((acc, curr) => acc?.[curr], obj) as T;
};

export const coerceIn = (value: number, min: number, max: number = value): number =>
    Math.max(Math.min(value, max), min);

export const noOp = () => {};

const GRAPHQL_EXCEPTION_MESSAGE_REGEX = /(.*Exception while fetching data \(.*\) : .*?)(?:\r?\n\r?\n|\n\n)(.*)/s;
const STACK_TRACE_FALLBACK_REGEX = /(.*?)(?:\r?\n)+(?=(?:\s*at\s+[\w$./]+|\s*Caused by:))/s;

const cleanGraphqlErrorMessage = (raw: string): string => {
    let msg = raw.replace(/^.*Exception while fetching data \(.*?\) :\s*/s, '');
    msg = msg.replace(/^(?:[\w.$]+Exception:\s*)+/, '').trim() || msg;

    if (/cloudflare bypass/i.test(msg)) {
        return 'Cloudflare protection detected (bypass disabled)';
    }
    if (/timed?\s*out|timeout/i.test(msg)) {
        return 'Connection timed out';
    }

    return msg;
};

export const extractGraphqlExceptionInfo = (
    error: ReactNode | string,
): {
    isGraphqlException: boolean;
    graphqlError?: string;
    graphqlStackTrace?: string;
} => {
    if (typeof error !== 'string') {
        return { isGraphqlException: false };
    }

    let message: string | undefined;
    let stackTrace: string | undefined;

    const regexMatch = error.match(GRAPHQL_EXCEPTION_MESSAGE_REGEX);
    if (regexMatch) {
        [, message, stackTrace] = regexMatch;
    } else {
        const fallbackMatch = error.match(STACK_TRACE_FALLBACK_REGEX);
        if (fallbackMatch) {
            [, message] = fallbackMatch;
            stackTrace = error.slice(fallbackMatch[0].length);
        }
    }

    if (!message) {
        return { isGraphqlException: false };
    }

    return {
        isGraphqlException: true,
        graphqlError: cleanGraphqlErrorMessage(message),
        graphqlStackTrace: stackTrace,
    };
};

export const getNextRotationValue = <Value>(
    indexOfValue: number,
    values: Value[],
    isDefaultable?: boolean,
): Value | undefined => {
    const nextValueIndex = (indexOfValue + 1) % values.length;
    const wasLastValue = nextValueIndex === 0;

    const isDefaultNextValue = !!isDefaultable && wasLastValue;
    if (isDefaultNextValue) {
        return undefined;
    }

    return values[(indexOfValue + 1) % values.length];
};

export const maybeExecuteWithDelay = (
    action: () => void,
    delay: number,
    condition: boolean,
): NodeJS.Timeout | undefined => {
    if (condition) {
        return setTimeout(() => action(), delay);
    }

    action();
    return undefined;
};

export const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        makeToast(t`Copied to clipboard`, 'info');
    } catch (e) {
        makeToast(t`Could not copy to clipboard`, 'error', getErrorMessage(e));
    }
};

export const getRenderedText = (el: HTMLElement, cssText: string) => {
    const clone = el.cloneNode(true) as HTMLElement;

    const rect = el.getBoundingClientRect();

    clone.style.cssText = `
    position: absolute;
    left: -99999px;
    top: 0;
    visibility: visible;
    display: block;
    height: auto;
    max-height: none;
    overflow: visible;
    width: ${rect.width}px;
    ${cssText}
  `;

    document.body.appendChild(clone);
    const text = clone.innerText;
    clone.remove();

    return text;
};

export const markdownToSafeHtml = (markdown: string): string => {
    const html = marked.parse(markdown, {
        async: false,
        breaks: true,
    });

    return DOMPurify.sanitize(html, {
        USE_PROFILES: {
            html: true,
        },
    });
};
