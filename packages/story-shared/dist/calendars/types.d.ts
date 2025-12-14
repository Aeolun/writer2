/**
 * Calendar System Types
 *
 * Defines the structure for flexible, hierarchical calendar systems.
 */
export type StoryTime = number;
/**
 * Hierarchical subdivision of a year
 * Examples:
 * - Year → Months → Weeks → Days
 * - Year → Quarters → Days
 * - Year → Seasons → Months → Days
 */
export interface CalendarSubdivision {
    id: string;
    name: string;
    pluralName: string;
    count: number;
    daysPerUnit?: number[];
    daysPerUnitFixed?: number;
    labels?: string[];
    labelFormat?: string;
    useCustomLabels?: boolean;
    subdivisions?: CalendarSubdivision[];
}
export interface CalendarConfig {
    id: string;
    name: string;
    description: string;
    minutesPerHour: number;
    hoursPerDay: number;
    minutesPerDay: number;
    daysPerYear: number;
    minutesPerYear: number;
    epochOffset?: number;
    subdivisions: CalendarSubdivision[];
    eras: {
        positive: string;
        negative: string;
        zeroLabel?: string | null;
    };
    display: {
        defaultFormat: string;
        shortFormat: string;
        includeTimeByDefault: boolean;
        hourFormat: '12' | '24';
    };
    specialDays?: {
        [subdivisionId: string]: {
            [dayNumber: number]: string;
        };
    };
}
export interface ParsedDate {
    year: number;
    era: 'positive' | 'negative';
    dayOfYear: number;
    hour: number;
    minute: number;
    subdivisions: Map<string, number>;
}
//# sourceMappingURL=types.d.ts.map