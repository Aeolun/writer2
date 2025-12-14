import type { Story, Variant } from '@histoire/shared';
import type { PropType as _PropType } from '@histoire/vendors/vue';
declare const _default: import("@histoire/vendors/vue").DefineComponent<{
    variant: {
        type: _PropType<Variant>;
        required: true;
    };
    story: {
        type: _PropType<Story>;
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
        type: _PropType<Variant>;
        required: true;
    };
    story: {
        type: _PropType<Story>;
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
export default _default;
