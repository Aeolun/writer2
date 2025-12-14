/**
 * Calendar Presets
 *
 * Built-in calendar configurations that users can choose from.
 */
import type { CalendarConfig } from './types';
/**
 * Coruscant Standard Calendar (Star Wars)
 *
 * The galactic standard calendar used throughout the Star Wars universe.
 * - 368 days per year (4 quarters of 92 days each)
 * - Each quarter has 91 regular days + 1 festival day
 * - 24-hour days, 60-minute hours
 * - Epoch: 0 BBY (Battle of Yavin)
 */
export declare const CORUSCANT_CALENDAR: CalendarConfig;
/**
 * Simple 365-Day Calendar
 *
 * A straightforward calendar for stories that don't need complex subdivisions.
 * - 365 days per year
 * - No subdivisions (just day of year)
 * - 24-hour days, 60-minute hours
 * - Generic era system (BE/AE)
 */
export declare const SIMPLE_365_CALENDAR: CalendarConfig;
/**
 * All available calendar presets
 */
export declare const CALENDAR_PRESETS: Record<string, CalendarConfig>;
/**
 * Get a calendar preset by ID
 * @param id - Calendar preset ID
 * @returns Calendar config, or undefined if not found
 */
export declare function getCalendarPreset(id: string): CalendarConfig | undefined;
/**
 * Get all available calendar presets
 * @returns Array of calendar configs
 */
export declare function listCalendarPresets(): CalendarConfig[];
/**
 * Get default calendar preset (Simple365)
 * @returns Simple 365-day calendar config
 */
export declare function getDefaultCalendarPreset(): CalendarConfig;
//# sourceMappingURL=presets.d.ts.map