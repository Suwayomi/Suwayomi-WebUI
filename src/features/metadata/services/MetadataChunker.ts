/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { GqlMetaHolder, Metadata, MetadataHolderType } from '@/features/metadata/Metadata.types.ts';
import { convertFromGqlMeta } from '@/features/metadata/services/MetadataConverter.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { GET_GLOBAL_METADATAS } from '@/lib/graphql/metadata/GlobalMetadataQuery.ts';
import type {
    GetGlobalMetadatasQuery,
    GetGlobalMetadatasQueryVariables,
    MetaInput,
} from '@/lib/graphql/generated/graphql.ts';
import { doesMetadataKeyExistIn } from '@/features/metadata/Metadata.utils.ts';

export class MetadataChunker {
    static readonly MAX_METADATA_VALUE_LENGTH = 4000;

    static getChunkLengthKey(fullKey: string): string {
        return `${fullKey}_length`;
    }

    static getChunkIndexKey(fullKey: string, index: number): string {
        return `${fullKey}_${index}`;
    }

    static isChunkedInMetadata(metadata: Metadata | undefined, fullKey: string): boolean {
        if (!metadata) {
            return false;
        }

        return doesMetadataKeyExistIn(metadata, this.getChunkLengthKey(fullKey));
    }

    static getExistingChunkCount(metadata: Metadata | undefined, fullKey: string): number {
        if (!metadata) {
            return 0;
        }

        const lengthKey = this.getChunkLengthKey(fullKey);
        if (!doesMetadataKeyExistIn(metadata, lengthKey)) {
            return 0;
        }

        const count = Number(metadata[lengthKey]);

        return Number.isNaN(count) ? 0 : count;
    }

    static getStaleChunkKeyCount(metadata: Metadata | undefined, fullKey: string): number {
        if (!metadata) {
            return 0;
        }

        const scanFrom = (index: number): number =>
            doesMetadataKeyExistIn(metadata, this.getChunkIndexKey(fullKey, index)) ? scanFrom(index + 1) : index;

        return scanFrom(this.getExistingChunkCount(metadata, fullKey));
    }

    static reassembleChunkedValue(metadata: Metadata, fullKey: string): string | undefined {
        const chunkCount = this.getExistingChunkCount(metadata, fullKey);

        if (chunkCount <= 0) {
            return undefined;
        }

        return Array(chunkCount)
            .fill(1)
            .reduce((acc, _, index) => {
                if (acc === undefined) {
                    return undefined;
                }

                const chunkKey = this.getChunkIndexKey(fullKey, index);

                if (!doesMetadataKeyExistIn(metadata, chunkKey)) {
                    return undefined;
                }

                return `${acc}${metadata[chunkKey]}`;
            }, '');
    }

    static reassembleAllChunkedValues(metadata: Metadata | undefined): Metadata | undefined {
        if (metadata === undefined) {
            return undefined;
        }

        const chunkedKeys = new Set<string>();

        const reassembledEntries = Object.entries(metadata)
            .map(([key]) => {
                if (!key.endsWith('_length')) {
                    return null;
                }

                const baseKey = key.slice(0, -'_length'.length);
                const count = Number(metadata[key]);

                if (Number.isNaN(count) || count <= 0) {
                    return null;
                }

                const reassembledValue = this.reassembleChunkedValue(metadata, baseKey);

                if (reassembledValue === undefined) {
                    return null;
                }

                chunkedKeys.add(key);
                for (let i = 0; i < count; i++) {
                    chunkedKeys.add(this.getChunkIndexKey(baseKey, i));
                }

                return [baseKey, reassembledValue];
            })
            .filter((entry): entry is [string, string] => entry !== null);

        const nonChunkedEntries = Object.entries(metadata)
            .map(([key, value]) => {
                if (chunkedKeys.has(key)) {
                    return null;
                }

                return [key, value];
            })
            .filter((entry): entry is [string, string] => entry !== null);

        const reassembledMetadata = Object.fromEntries([...nonChunkedEntries, ...reassembledEntries]);

        return reassembledMetadata;
    }

    static chunkValue(fullKey: string, value: string): MetaInput[] {
        if (value.length <= this.MAX_METADATA_VALUE_LENGTH) {
            return [{ key: fullKey, value }];
        }

        const entries: MetaInput[] = [];
        let offset = 0;
        let index = 0;

        while (offset < value.length) {
            const chunk = value.substring(offset, offset + this.MAX_METADATA_VALUE_LENGTH);

            entries.push({ key: this.getChunkIndexKey(fullKey, index), value: chunk });

            offset += this.MAX_METADATA_VALUE_LENGTH;
            index += 1;
        }

        entries.push({ key: this.getChunkLengthKey(fullKey), value: `${index}` });

        return entries;
    }

    static computeChunkDeletions(
        existingMetadata: Metadata | undefined,
        fullKey: string,
        newChunkCount: number,
    ): string[] {
        if (!existingMetadata) {
            return [];
        }

        const isNowChunked = newChunkCount > 0;
        const hasDirectKey = doesMetadataKeyExistIn(existingMetadata, fullKey);
        const hasLengthKey = doesMetadataKeyExistIn(existingMetadata, this.getChunkLengthKey(fullKey));
        const staleChunkKeyCount = this.getStaleChunkKeyCount(existingMetadata, fullKey);

        const keysToDelete: string[] = [];

        const changedToChunkedFromUnchunked = hasDirectKey && isNowChunked;
        if (changedToChunkedFromUnchunked) {
            keysToDelete.push(fullKey);
        }

        const changedToUnchunkedFromChunked = hasLengthKey && !isNowChunked;
        if (changedToUnchunkedFromChunked) {
            keysToDelete.push(this.getChunkLengthKey(fullKey));
        }

        // Delete stale chunk index keys
        const startIndex = isNowChunked ? newChunkCount : 0;
        for (let i = startIndex; i < staleChunkKeyCount; i++) {
            keysToDelete.push(this.getChunkIndexKey(fullKey, i));
        }

        return keysToDelete;
    }

    static getExistingMetadata(metadataHolder: GqlMetaHolder, holderType: MetadataHolderType): Metadata | undefined {
        if (holderType === 'global' && metadataHolder.meta === undefined) {
            const cached = requestManager.graphQLClient.client.readQuery<
                GetGlobalMetadatasQuery,
                GetGlobalMetadatasQueryVariables
            >({
                query: GET_GLOBAL_METADATAS,
            });

            if (!cached) {
                return undefined;
            }

            return convertFromGqlMeta(cached.metas.nodes);
        }

        return convertFromGqlMeta(metadataHolder.meta);
    }
}
