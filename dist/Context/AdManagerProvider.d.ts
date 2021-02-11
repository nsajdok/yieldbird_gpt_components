/// <reference types="doubleclick-gpt" />
import React from 'react';
interface Props {
    uuid: string;
    refreshDelay?: number;
}
export declare const AdManagerContext: React.Context<{
    shouldRefresh: (_optDiv: string) => boolean;
    refreshAd: (_slot: googletag.Slot, _optDiv: string) => void;
    registerSlot: (_slot: googletag.Slot) => void;
}>;
export declare const AdManagerProvider: React.FC<Props>;
export {};
