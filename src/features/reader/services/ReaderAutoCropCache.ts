/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// maps page urls to their cropped blob urls, or to themselves in case there was nothing to crop
export class ReaderAutoCropCache {
    private readonly cache = new Map<string, string>();

    private readonly usersBySrc = new Map<string, number>();

    constructor(private readonly maxSize: number) {}

    get(src: string): string | undefined {
        return this.cache.get(src);
    }

    set(src: string, resultUrl: string): void {
        if (this.cache.has(src)) {
            this.delete(src, resultUrl);
        } else {
            this.evictUnused();
        }

        this.cache.set(src, resultUrl);
    }

    // crops in use are not evicted, since revoking their url would break the displayed image
    retain(src: string): () => void {
        this.usersBySrc.set(src, (this.usersBySrc.get(src) ?? 0) + 1);

        let isReleased = false;
        return () => {
            if (isReleased) {
                return;
            }
            isReleased = true;

            const users = (this.usersBySrc.get(src) ?? 0) - 1;
            if (users > 0) {
                this.usersBySrc.set(src, users);
            } else {
                this.usersBySrc.delete(src);
            }
        };
    }

    clear(): void {
        [...this.cache.keys()].forEach((src) => this.delete(src));
        this.usersBySrc.clear();
    }

    private evictUnused(): void {
        for (const src of this.cache.keys()) {
            if (this.cache.size < this.maxSize) {
                return;
            }

            if (!this.usersBySrc.has(src)) {
                this.delete(src);
            }
        }
    }

    private delete(src: string, replacementUrl?: string): void {
        const url = this.cache.get(src);
        if (url && url !== src && url !== replacementUrl && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }

        this.cache.delete(src);
    }
}
