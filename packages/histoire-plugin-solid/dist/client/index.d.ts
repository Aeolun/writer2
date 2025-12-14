export declare const MountStory: import("@histoire/vendors/vue").DefineComponent<{
    story: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Story>;
        required: true;
    };
}, {
    el: import("@vue/reactivity").Ref<HTMLDivElement | undefined>;
}, unknown, {}, {}, import("@histoire/vendors/vue").ComponentOptionsMixin, import("@histoire/vendors/vue").ComponentOptionsMixin, {}, string, import("@histoire/vendors/vue").VNodeProps & import("@histoire/vendors/vue").AllowedComponentProps & import("@histoire/vendors/vue").ComponentCustomProps, Readonly<import("@histoire/vendors/vue").ExtractPropTypes<{
    story: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Story>;
        required: true;
    };
}>>, {}, {}>;
export declare const RenderStory: import("@histoire/vendors/vue").DefineComponent<{
    variant: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Variant>;
        required: true;
    };
    story: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Story>;
        required: true;
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
}, {
    el: import("@vue/reactivity").Ref<HTMLDivElement | undefined>;
}, unknown, {}, {}, import("@histoire/vendors/vue").ComponentOptionsMixin, import("@histoire/vendors/vue").ComponentOptionsMixin, {
    ready: () => true;
}, string, import("@histoire/vendors/vue").VNodeProps & import("@histoire/vendors/vue").AllowedComponentProps & import("@histoire/vendors/vue").ComponentCustomProps, Readonly<import("@histoire/vendors/vue").ExtractPropTypes<{
    variant: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Variant>;
        required: true;
    };
    story: {
        type: import("@histoire/vendors/vue").PropType<import("histoire").Story>;
        required: true;
    };
    slotName: {
        type: StringConstructor;
        default: string;
    };
}>> & {
    onReady?: (() => any) | undefined;
}, {
    slotName: string;
}, {}>;
export declare function generateSourceCode(variant: {
    source?: string;
}): string;
