/**
 * CalendarEngine - Core calendar conversion and formatting engine
 *
 * Handles conversion between universal StoryTime (minutes from epoch 0)
 * and human-readable calendar dates with hierarchical subdivisions.
 */
import type { CalendarConfig, ParsedDate, StoryTime } from './types';
export declare class CalendarEngine {
    readonly config: CalendarConfig;
    constructor(config: CalendarConfig);
    /**
     * Convert story time (minutes from epoch) to a parsed date
     */
    storyTimeToDate(time: StoryTime): ParsedDate;
    /**
     * Convert a parsed date back to story time
     */
    dateToStoryTime(date: ParsedDate): StoryTime;
    /**
     * Calculate which subdivision units a given day falls into
     * E.g., day 100 might be Quarter 2, Week 6, etc.
     */
    private calculateSubdivisions;
    /**
     * Recursively process a subdivision and its nested subdivisions
     */
    private processSubdivision;
    /**
     * Process nested subdivision independently (for deeply nested structures)
     */
    private processSubdivisionNested;
    /**
     * Format a parsed date according to config template
     */
    formatDate(date: ParsedDate, includeTime?: boolean): string;
    /**
     * Format story time directly (convenience method)
     */
    formatStoryTime(time: StoryTime, includeTime?: boolean): string;
    /**
     * Get the day number within a specific subdivision
     * E.g., day 95 of year might be day 3 of quarter 2
     */
    private getDayOfSubdivision;
    /**
     * Find a subdivision by ID in the hierarchy
     */
    private findSubdivision;
    /**
     * Capitalize first letter of a string
     */
    private capitalize;
    /**
     * Add minutes to a story time
     */
    addMinutes(time: StoryTime, minutes: number): StoryTime;
    /**
     * Add hours to a story time
     */
    addHours(time: StoryTime, hours: number): StoryTime;
    /**
     * Add days to a story time
     */
    addDays(time: StoryTime, days: number): StoryTime;
    /**
     * Round a story time to the nearest hour
     */
    roundToHour(time: StoryTime): StoryTime;
    /**
     * Get the start of the day for a given story time
     */
    startOfDay(time: StoryTime): StoryTime;
    /**
     * Get the start of the year for a given story time
     */
    startOfYear(time: StoryTime): StoryTime;
    /**
     * Calculate age in years from birthdate to current story time
     * Uses this calendar's year length for the calculation
     * @param birthdate Story time of birth (minutes from epoch)
     * @param currentTime Current story time (minutes from epoch)
     * @returns Age in years (fractional)
     */
    calculateAge(birthdate: StoryTime, currentTime: StoryTime): number;
    /**
     * Format age as a readable string (e.g., "32 years old", "5.5 years old")
     * @param birthdate Story time of birth
     * @param currentTime Current story time
     * @returns Formatted age string
     */
    formatAge(birthdate: StoryTime, currentTime: StoryTime): string;
}
//# sourceMappingURL=engine.d.ts.map