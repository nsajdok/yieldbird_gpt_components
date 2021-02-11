/// <reference types="doubleclick-gpt" />
export declare class AdManager {
    private adsToRefresh;
    private interval;
    private timeout;
    constructor(timeout?: number);
    static defineSlot(adUnitPath: string, size: googletag.GeneralSize, optDiv: string, shouldRefreshAds: boolean, sizeMapping?: [googletag.SingleSizeArray, googletag.GeneralSize][], targeting?: {
        [key: string]: googletag.NamedSize;
    }): Promise<googletag.Slot>;
    static destroySlot(optDiv: string): void;
    refreshSlot(slot: googletag.Slot, optDiv: string): void;
    private static createSlot;
    private static setTargeting;
    private static setSizeMapping;
}
