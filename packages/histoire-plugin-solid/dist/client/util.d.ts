/**
 * Synchronize state between Histoire's state object and Solid's reactive state
 */
export declare function syncState(histoireState: any, onUpdate: (value: any) => void): {
    stop: () => void;
};
