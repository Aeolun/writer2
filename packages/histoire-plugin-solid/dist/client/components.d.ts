import type { Story, Variant } from '@histoire/shared';
import { type ParentComponent } from 'solid-js';
interface HstContextValue {
    story: Story;
    variant?: Variant;
    slotName?: string;
}
export declare const HstContext: import("solid-js").Context<HstContextValue | undefined>;
interface MountContextValue {
    story: Story;
    variantIndex: () => number;
    incrementVariantIndex: () => void;
}
export declare const MountContext: import("solid-js").Context<MountContextValue | undefined>;
export declare const MountStory: ParentComponent<{
    title?: string;
}>;
export declare const MountStoryWithContext: ParentComponent<{
    story: Story;
}>;
export declare const MountVariant: ParentComponent<{
    title?: string;
    id?: string;
}>;
export declare const RenderStory: ParentComponent<{
    title?: string;
}>;
export declare const RenderVariant: ParentComponent<{
    title?: string;
    id?: string;
}>;
export {};
