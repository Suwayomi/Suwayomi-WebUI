/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

interface SuwayomiConfig {
    webUISubpath?: string;
}

declare global {
    interface Window {
        __SUWAYOMI_CONFIG__?: SuwayomiConfig;
    }
}

/**
 * Utility for handling dynamic subpath configuration for the WebUI
 * Server-side configuration only - WebUI automatically detects server subpath
 */
export class SubpathConfig {
    private static cachedSubpath: string | null = null;

    /**
     * Get the current subpath from server config, environment variables, or fallback
     */
    public static getSubpath(): string {
        // Return cached result if available
        if (this.cachedSubpath !== null) {
            return this.cachedSubpath;
        }

        // Priority 1: Development environment variable (VITE_SUBPATH)
        const envSubpath = import.meta.env.VITE_SUBPATH;
        if (envSubpath && envSubpath !== '/') {
            this.cachedSubpath = envSubpath;
            return this.cachedSubpath;
        }

        // Priority 2: Server-side configuration (injected by server)
        const serverSubpath = this.getServerSubpath();
        if (serverSubpath && serverSubpath !== '/') {
            this.cachedSubpath = serverSubpath;
            return this.cachedSubpath;
        }

        // Priority 3: No subpath found
        this.cachedSubpath = '';
        return this.cachedSubpath;
    }

    /**
     * Get server-configured subpath from `window.__SUWAYOMI_CONFIG__`
     */
    private static getServerSubpath(): string | null {
        if (typeof window === 'undefined') {
            return null;
        }

        // eslint-disable-next-line no-underscore-dangle
        return window.__SUWAYOMI_CONFIG__?.webUISubpath || null;
    }

    /**
     * Get subpath for React Router basename prop
     * @returns Subpath string or undefined (React Router expects undefined when no basename)
     */
    public static getRouterBasename(): string | undefined {
        const subpath = this.getSubpath();
        return subpath || undefined;
    }

    /**
     * Get the API base URL with subpath consideration
     * This ensures API calls work correctly when the app is served under a subpath
     */
    public static getApiBaseUrl(serverUrl: string): string {
        const baseUrl = serverUrl;
        const subpath = this.getSubpath();

        if (!subpath) {
            return baseUrl;
        }

        return `${baseUrl}${subpath}`;
    }
}
