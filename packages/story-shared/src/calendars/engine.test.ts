import { describe, it, expect } from 'vitest';
import { CalendarEngine } from './engine';
import type { CalendarConfig, ParsedDate, StoryTime } from './types';

// Test calendar: Coruscant Standard (Star Wars)
const coruscantConfig: CalendarConfig = {
  id: 'coruscant',
  name: 'Coruscant Standard Calendar',
  description: 'Galactic standard timekeeping (368 days, BBY/ABY)',
  minutesPerHour: 60,
  hoursPerDay: 24,
  minutesPerDay: 1440,
  daysPerYear: 368,
  minutesPerYear: 529920,
  subdivisions: [
    {
      id: 'quarter',
      name: 'Quarter',
      pluralName: 'Quarters',
      count: 4,
      daysPerUnitFixed: 92,
      labels: [
        'Conference Season',
        'Gala Season',
        'Recess Season',
        'Budget Season'
      ]
    }
  ],
  eras: {
    positive: 'ABY',
    negative: 'BBY'
  },
  display: {
    defaultFormat: '{dayLabel}, {quarter} (Q{quarterNumber}), {year} {era} at {hour}:{minute}',
    shortFormat: 'Q{quarterNumber} Day {dayOfQuarter}, {year} {era}',
    includeTimeByDefault: true,
    hourFormat: '24'
  },
  specialDays: {
    quarter: {
      92: 'Festival Day'
    }
  }
};

// Test calendar: Simple 365-day
const simple365Config: CalendarConfig = {
  id: 'simple365',
  name: 'Simple 365-Day Calendar',
  description: 'Basic 365-day year, no subdivisions',
  minutesPerHour: 60,
  hoursPerDay: 24,
  minutesPerDay: 1440,
  daysPerYear: 365,
  minutesPerYear: 525600,
  subdivisions: [],
  eras: {
    positive: 'AE',
    negative: 'BE'
  },
  display: {
    defaultFormat: 'Day {dayOfYear}, Year {year} {era} at {hour}:{minute}',
    shortFormat: 'Day {dayOfYear}, Year {year} {era}',
    includeTimeByDefault: true,
    hourFormat: '24'
  }
};

describe('CalendarEngine', () => {
  describe('Basic Time Conversion', () => {
    it('should convert epoch 0 to year 0, day 1, 00:00', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const date = calendar.storyTimeToDate(0);

      expect(date.year).toBe(0);
      expect(date.era).toBe('positive');
      expect(date.dayOfYear).toBe(1);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });

    it('should convert positive years correctly (ABY)', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // 1 year = 529920 minutes
      const oneYearLater = 529920;
      const date = calendar.storyTimeToDate(oneYearLater);

      expect(date.year).toBe(1);
      expect(date.era).toBe('positive');
      expect(date.dayOfYear).toBe(1);
    });

    it('should convert negative years correctly (BBY)', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // -1 minute = 1 minute before epoch
      const oneMinuteBefore = -1;
      const date = calendar.storyTimeToDate(oneMinuteBefore);

      expect(date.year).toBe(-1);
      expect(date.era).toBe('negative');
      // Should be last day of year -1, last minute
      expect(date.dayOfYear).toBe(368);
      expect(date.hour).toBe(23);
      expect(date.minute).toBe(59);
    });

    it('should handle 22 BBY correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // -22 years = -22 * 529920 = -11658240 minutes
      const date = calendar.storyTimeToDate(-11658240);

      expect(date.year).toBe(-22);
      expect(date.era).toBe('negative');
      expect(date.dayOfYear).toBe(1);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });
  });

  describe('Round-Trip Conversion', () => {
    it('should convert storyTime to date and back to same storyTime', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const testTimes: StoryTime[] = [
        0,           // Epoch
        1440,        // 1 day
        529920,      // 1 year
        -1440,       // -1 day
        -529920,     // -1 year
        12345678,    // Random positive
        -9876543     // Random negative
      ];

      for (const time of testTimes) {
        const date = calendar.storyTimeToDate(time);
        const backToTime = calendar.dateToStoryTime(date);
        expect(backToTime).toBe(time);
      }
    });
  });

  describe('Subdivision Calculation', () => {
    it('should calculate quarters correctly for Coruscant calendar', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // Day 1 = Quarter 1
      const q1Day1 = calendar.storyTimeToDate(0);
      expect(q1Day1.subdivisions.get('quarter')).toBe(1);

      // Day 92 = Still Quarter 1 (last day)
      const q1Day92 = calendar.storyTimeToDate(91 * 1440);
      expect(q1Day92.subdivisions.get('quarter')).toBe(1);

      // Day 93 = Quarter 2 (first day)
      const q2Day1 = calendar.storyTimeToDate(92 * 1440);
      expect(q2Day1.subdivisions.get('quarter')).toBe(2);

      // Day 184 = Quarter 2 (last day)
      const q2Day92 = calendar.storyTimeToDate(183 * 1440);
      expect(q2Day92.subdivisions.get('quarter')).toBe(2);

      // Day 185 = Quarter 3
      const q3Day1 = calendar.storyTimeToDate(184 * 1440);
      expect(q3Day1.subdivisions.get('quarter')).toBe(3);

      // Day 277 = Quarter 4
      const q4Day1 = calendar.storyTimeToDate(276 * 1440);
      expect(q4Day1.subdivisions.get('quarter')).toBe(4);
    });

    it('should handle calendars with no subdivisions', () => {
      const calendar = new CalendarEngine(simple365Config);
      const date = calendar.storyTimeToDate(0);

      expect(date.subdivisions.size).toBe(0);
    });
  });

  describe('Hour and Minute Calculation', () => {
    it('should calculate hours and minutes correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // 14:30 on day 1
      const time = (14 * 60) + 30; // 870 minutes
      const date = calendar.storyTimeToDate(time);

      expect(date.dayOfYear).toBe(1);
      expect(date.hour).toBe(14);
      expect(date.minute).toBe(30);
    });

    it('should handle end of day correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // 23:59 on day 1
      const time = (23 * 60) + 59; // 1439 minutes
      const date = calendar.storyTimeToDate(time);

      expect(date.dayOfYear).toBe(1);
      expect(date.hour).toBe(23);
      expect(date.minute).toBe(59);
    });

    it('should roll over to next day at midnight', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // 00:00 on day 2
      const time = 1440; // Exactly 1 day
      const date = calendar.storyTimeToDate(time);

      expect(date.dayOfYear).toBe(2);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });
  });

  describe('Format Date', () => {
    it('should format basic date without subdivisions', () => {
      const calendar = new CalendarEngine(simple365Config);
      // 1234 days = year 3, day 140 (1234 / 365 = 3 years + 139 days)
      const date = calendar.storyTimeToDate(1234 * 1440);

      const formatted = calendar.formatDate(date, true);
      expect(formatted).toContain('Day 140'); // Day of year
      expect(formatted).toContain('Year 3');
      expect(formatted).toContain('AE');
    });

    it('should format Coruscant date with quarter labels', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // Day 45 of year 0 (Q1)
      const date = calendar.storyTimeToDate(44 * 1440);

      const formatted = calendar.formatDate(date, true);
      expect(formatted).toContain('Conference Season');
      expect(formatted).toContain('Q1');
    });

    it('should format special days correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // Day 92 = Festival Day (last day of Q1)
      const date = calendar.storyTimeToDate(91 * 1440);

      const formatted = calendar.formatDate(date, true);
      expect(formatted).toContain('Festival Day');
    });

    it('should format negative years with correct era', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const date = calendar.storyTimeToDate(-11658240); // -22 years

      const formatted = calendar.formatDate(date, true);
      expect(formatted).toContain('22 BBY');
    });

    it('should format hours and minutes with leading zeros', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      // 05:03 on day 1
      const time = (5 * 60) + 3;
      const date = calendar.storyTimeToDate(time);

      const formatted = calendar.formatDate(date, true);
      expect(formatted).toContain('05:03');
    });
  });

  describe('Format Story Time', () => {
    it('should format storyTime directly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const formatted = calendar.formatStoryTime(0, true);

      expect(formatted).toContain('0 ABY');
    });
  });

  describe('Arithmetic Operations', () => {
    it('should add minutes correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const result = calendar.addMinutes(100, 50);
      expect(result).toBe(150);
    });

    it('should add hours correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const result = calendar.addHours(0, 5);
      expect(result).toBe(300); // 5 * 60
    });

    it('should add days correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const result = calendar.addDays(0, 1);
      expect(result).toBe(1440); // 24 * 60
    });

    it('should handle negative additions', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const result = calendar.addDays(1440, -1);
      expect(result).toBe(0);
    });
  });

  describe('Rounding Operations', () => {
    it('should round to nearest hour (down)', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const time = (5 * 60) + 20; // 5:20
      const rounded = calendar.roundToHour(time);

      const date = calendar.storyTimeToDate(rounded);
      expect(date.hour).toBe(5);
      expect(date.minute).toBe(0);
    });

    it('should round to nearest hour (up)', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const time = (5 * 60) + 40; // 5:40
      const rounded = calendar.roundToHour(time);

      const date = calendar.storyTimeToDate(rounded);
      expect(date.hour).toBe(6);
      expect(date.minute).toBe(0);
    });

    it('should get start of day', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const time = (5 * 1440) + (14 * 60) + 30; // Day 6, 14:30
      const startOfDay = calendar.startOfDay(time);

      const date = calendar.storyTimeToDate(startOfDay);
      expect(date.dayOfYear).toBe(6);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });

    it('should get start of year', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const time = (200 * 1440) + (14 * 60) + 30; // Day 201, 14:30, year 0
      const startOfYear = calendar.startOfYear(time);

      const date = calendar.storyTimeToDate(startOfYear);
      expect(date.year).toBe(0);
      expect(date.dayOfYear).toBe(1);
      expect(date.hour).toBe(0);
      expect(date.minute).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle year boundary correctly (last day to first day)', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // Last minute of year 0
      const lastMinute = 529920 - 1;
      const lastDate = calendar.storyTimeToDate(lastMinute);
      expect(lastDate.year).toBe(0);
      expect(lastDate.dayOfYear).toBe(368);
      expect(lastDate.hour).toBe(23);
      expect(lastDate.minute).toBe(59);

      // First minute of year 1
      const firstMinute = 529920;
      const firstDate = calendar.storyTimeToDate(firstMinute);
      expect(firstDate.year).toBe(1);
      expect(firstDate.dayOfYear).toBe(1);
      expect(firstDate.hour).toBe(0);
      expect(firstDate.minute).toBe(0);
    });

    it('should handle negative year boundary correctly', () => {
      const calendar = new CalendarEngine(coruscantConfig);

      // First minute of year 0
      const firstMinute = 0;
      const firstDate = calendar.storyTimeToDate(firstMinute);
      expect(firstDate.year).toBe(0);
      expect(firstDate.dayOfYear).toBe(1);

      // Last minute of year -1
      const lastMinute = -1;
      const lastDate = calendar.storyTimeToDate(lastMinute);
      expect(lastDate.year).toBe(-1);
      expect(lastDate.dayOfYear).toBe(368);
      expect(lastDate.hour).toBe(23);
      expect(lastDate.minute).toBe(59);
    });

    it('should handle very large positive years', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const largeYear = 1000;
      const time = largeYear * 529920;
      const date = calendar.storyTimeToDate(time);

      expect(date.year).toBe(largeYear);
      expect(date.dayOfYear).toBe(1);
    });

    it('should handle very large negative years', () => {
      const calendar = new CalendarEngine(coruscantConfig);
      const largeYear = -1000;
      const time = largeYear * 529920;
      const date = calendar.storyTimeToDate(time);

      expect(date.year).toBe(largeYear);
      expect(date.dayOfYear).toBe(1);
    });
  });

  describe('Epoch Offset', () => {
    it('should handle positive epoch offset', () => {
      // Calendar where year 0 is 100 years after the universal epoch
      const config = {
        ...coruscantConfig,
        epochOffset: 100,
      };
      const calendar = new CalendarEngine(config);

      // At StoryTime 0, this calendar should show year -100
      const dateAtZero = calendar.storyTimeToDate(0);
      expect(dateAtZero.year).toBe(-100);
      expect(dateAtZero.era).toBe('negative');
      expect(dateAtZero.dayOfYear).toBe(1);

      // Round-trip conversion
      const backToTime = calendar.dateToStoryTime(dateAtZero);
      expect(backToTime).toBe(0);
    });

    it('should handle negative epoch offset', () => {
      // Calendar where year 0 is 100 years before the universal epoch
      const config = {
        ...coruscantConfig,
        epochOffset: -100,
      };
      const calendar = new CalendarEngine(config);

      // At StoryTime 0, this calendar should show year 100
      const dateAtZero = calendar.storyTimeToDate(0);
      expect(dateAtZero.year).toBe(100);
      expect(dateAtZero.era).toBe('positive');
      expect(dateAtZero.dayOfYear).toBe(1);

      // Round-trip conversion
      const backToTime = calendar.dateToStoryTime(dateAtZero);
      expect(backToTime).toBe(0);
    });

    it('should maintain round-trip accuracy with epoch offset', () => {
      const config = {
        ...coruscantConfig,
        epochOffset: -500,
      };
      const calendar = new CalendarEngine(config);

      // Test various story times
      const testTimes = [0, 1000000, -1000000, 529920, -529920];

      for (const time of testTimes) {
        const date = calendar.storyTimeToDate(time);
        const backToTime = calendar.dateToStoryTime(date);
        expect(backToTime).toBe(time);
      }
    });

    it('should handle epoch offset across era boundaries', () => {
      const config = {
        ...coruscantConfig,
        epochOffset: -10,
      };
      const calendar = new CalendarEngine(config);

      // When StoryTime represents year -5 in the base calendar,
      // this calendar (with offset -10) should show year 5
      const timeForYearNeg5 = -5 * 529920;
      const date = calendar.storyTimeToDate(timeForYearNeg5);
      expect(date.year).toBe(5);
      expect(date.era).toBe('positive');

      // Convert back
      const backToTime = calendar.dateToStoryTime(date);
      expect(backToTime).toBe(timeForYearNeg5);
    });

    it('should handle zero epoch offset (default behavior)', () => {
      const configWithoutOffset = { ...coruscantConfig };
      const configWithZeroOffset = { ...coruscantConfig, epochOffset: 0 };

      const cal1 = new CalendarEngine(configWithoutOffset);
      const cal2 = new CalendarEngine(configWithZeroOffset);

      const time = 123456;
      const date1 = cal1.storyTimeToDate(time);
      const date2 = cal2.storyTimeToDate(time);

      expect(date1.year).toBe(date2.year);
      expect(date1.dayOfYear).toBe(date2.dayOfYear);
      expect(date1.hour).toBe(date2.hour);
      expect(date1.minute).toBe(date2.minute);
    });
  });

  describe('Different Calendar Systems', () => {
    it('should work correctly with Simple 365-day calendar', () => {
      const calendar = new CalendarEngine(simple365Config);

      // 1 year later
      const date = calendar.storyTimeToDate(525600);
      expect(date.year).toBe(1);
      expect(date.era).toBe('positive');
      expect(date.dayOfYear).toBe(1);
    });

    it('should have different year lengths for different calendars', () => {
      const coruscant = new CalendarEngine(coruscantConfig);
      const simple = new CalendarEngine(simple365Config);

      expect(coruscant.config.minutesPerYear).toBe(529920); // 368 days
      expect(simple.config.minutesPerYear).toBe(525600);    // 365 days
    });
  });
});
