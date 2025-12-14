import type { Story, Variant } from '@histoire/shared';
import type { JSX } from 'solid-js';
export interface SolidStorySetupApi {
    story?: Story | null;
    variant?: Variant | null;
}
export type SolidStorySetupHandler = (api: SolidStorySetupApi) => Promise<void> | void;
export declare function defineSetupSolid(handler: SolidStorySetupHandler): SolidStorySetupHandler;
export interface StoryProps {
    title?: string;
    id?: string;
    group?: string;
    icon?: string;
    iconColor?: string;
    docsOnly?: boolean;
    layout?: {
        type: 'single';
        iframe?: boolean;
    } | {
        type: 'grid';
        width?: number | string;
    };
    children?: JSX.Element;
}
export interface VariantProps {
    title?: string;
    id?: string;
    icon?: string;
    iconColor?: string;
    children?: JSX.Element;
}
