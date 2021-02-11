/// <reference types="doubleclick-gpt" />
import React from 'react';
interface Props {
    adUnitPath: string;
    className?: string;
    size: googletag.GeneralSize;
    optDiv: string;
    sizeMapping?: [googletag.SingleSizeArray, googletag.GeneralSize][];
    targeting?: {
        [key: string]: googletag.NamedSize;
    };
}
export declare const AdManagerSlot: React.FC<Props>;
export {};
