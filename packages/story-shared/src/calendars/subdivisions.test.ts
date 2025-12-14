import { describe, it, expect } from 'vitest';
import { CalendarEngine } from './engine';
import type { CalendarConfig } from './types';

// Calendar with nested subdivisions: Quarters → Weeks
const nestedConfig: CalendarConfig = {
  id: 'nested',
  name: 'Nested Subdivision Calendar',
  description: 'Calendar with quarters containing weeks',
  minutesPerHour: 60,
  hoursPerDay: 24,
  minutesPerDay: 1440,
  daysPerYear: 364, // 4 quarters * 91 days = 364 days
  minutesPerYear: 524160,
  subdivisions: [
    {
      id: 'quarter',
      name: 'Quarter',
      pluralName: 'Quarters',
      count: 4,
      daysPerUnitFixed: 91, // 13 weeks * 7 days
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      subdivisions: [
        {
          id: 'week',
          name: 'Week',
          pluralName: 'Weeks',
          count: 13,
          daysPerUnitFixed: 7,
          labelFormat: 'Week {n}'
        }
      ]
    }
  ],
  eras: {
    positive: 'AE',
    negative: 'BE'
  },
  display: {
    defaultFormat: '{quarter} {week}, Day {dayOfWeek}, Year {year} {era}',
    shortFormat: '{quarter} {week}, Year {year}',
    includeTimeByDefault: false,
    hourFormat: '24'
  }
};

// Calendar with variable-length subdivisions (like months)
const monthConfig: CalendarConfig = {
  id: 'months',
  name: 'Month-Based Calendar',
  description: 'Calendar with 12 variable-length months',
  minutesPerHour: 60,
  hoursPerDay: 24,
  minutesPerDay: 1440,
  daysPerYear: 360, // Simplified: 12 months * 30 days
  minutesPerYear: 518400,
  subdivisions: [
    {
      id: 'month',
      name: 'Month',
      pluralName: 'Months',
      count: 12,
      daysPerUnit: [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
      labels: [
        'First Month',
        'Second Month',
        'Third Month',
        'Fourth Month',
        'Fifth Month',
        'Sixth Month',
        'Seventh Month',
        'Eighth Month',
        'Ninth Month',
        'Tenth Month',
        'Eleventh Month',
        'Twelfth Month'
      ]
    }
  ],
  eras: {
    positive: 'AE',
    negative: 'BE'
  },
  display: {
    defaultFormat: '{month} {dayOfMonth}, Year {year} {era}',
    shortFormat: '{month} {dayOfMonth}, {year}',
    includeTimeByDefault: false,
    hourFormat: '24'
  }
};

describe('Nested Subdivisions', () => {
  describe('Quarter and Week Nesting', () => {
    it('should calculate quarter correctly for first day', () => {
      const calendar = new CalendarEngine(nestedConfig);
      const date = calendar.storyTimeToDate(0);

      expect(date.subdivisions.get('quarter')).toBe(1);
    });

    it('should calculate week within quarter for first day', () => {
      const calendar = new CalendarEngine(nestedConfig);
      const date = calendar.storyTimeToDate(0);

      expect(date.subdivisions.get('week')).toBe(1);
    });

    it('should calculate week 2 of quarter 1', () => {
      const calendar = new CalendarEngine(nestedConfig);
      // Day 8 (start of week 2)
      const date = calendar.storyTimeToDate(7 * 1440);

      expect(date.subdivisions.get('quarter')).toBe(1);
      expect(date.subdivisions.get('week')).toBe(2);
    });

    it('should calculate last week of quarter 1', () => {
      const calendar = new CalendarEngine(nestedConfig);
      // Day 85 (week 13 of Q1)
      const date = calendar.storyTimeToDate(84 * 1440);

      expect(date.subdivisions.get('quarter')).toBe(1);
      expect(date.subdivisions.get('week')).toBe(13);
    });

    it('should roll over to quarter 2, week 1', () => {
      const calendar = new CalendarEngine(nestedConfig);
      // Day 92 (first day of Q2)
      const date = calendar.storyTimeToDate(91 * 1440);

      expect(date.subdivisions.get('quarter')).toBe(2);
      expect(date.subdivisions.get('week')).toBe(1);
    });

    it('should handle middle of quarter 3', () => {
      const calendar = new CalendarEngine(nestedConfig);
      // Day 190 (Q3, week 7, day 1)
      // Q1: days 1-91, Q2: days 92-182, Q3 starts at day 183
      // Day 190 = 183 + 7 = Q3, week 2
      const date = calendar.storyTimeToDate(189 * 1440);

      expect(date.subdivisions.get('quarter')).toBe(3);
      expect(date.subdivisions.get('week')).toBe(2);
    });

    it('should handle last day of year', () => {
      const calendar = new CalendarEngine(nestedConfig);
      // Day 364 (last day of Q4, week 13)
      const date = calendar.storyTimeToDate(363 * 1440);

      expect(date.subdivisions.get('quarter')).toBe(4);
      expect(date.subdivisions.get('week')).toBe(13);
      expect(date.dayOfYear).toBe(364);
    });
  });

  describe('Variable-Length Month Subdivisions', () => {
    it('should calculate month 1 correctly', () => {
      const calendar = new CalendarEngine(monthConfig);
      const date = calendar.storyTimeToDate(0);

      expect(date.subdivisions.get('month')).toBe(1);
    });

    it('should calculate last day of month 1', () => {
      const calendar = new CalendarEngine(monthConfig);
      // Day 30
      const date = calendar.storyTimeToDate(29 * 1440);

      expect(date.subdivisions.get('month')).toBe(1);
      expect(date.dayOfYear).toBe(30);
    });

    it('should roll over to month 2', () => {
      const calendar = new CalendarEngine(monthConfig);
      // Day 31 (first day of month 2)
      const date = calendar.storyTimeToDate(30 * 1440);

      expect(date.subdivisions.get('month')).toBe(2);
      expect(date.dayOfYear).toBe(31);
    });

    it('should calculate month 6 correctly', () => {
      const calendar = new CalendarEngine(monthConfig);
      // Day 151 (first day of month 6)
      // Months 1-5 = 150 days
      const date = calendar.storyTimeToDate(150 * 1440);

      expect(date.subdivisions.get('month')).toBe(6);
    });

    it('should calculate month 12 correctly', () => {
      const calendar = new CalendarEngine(monthConfig);
      // Day 331 (first day of month 12)
      const date = calendar.storyTimeToDate(330 * 1440);

      expect(date.subdivisions.get('month')).toBe(12);
    });

    it('should handle last day of year in month 12', () => {
      const calendar = new CalendarEngine(monthConfig);
      // Day 360
      const date = calendar.storyTimeToDate(359 * 1440);

      expect(date.subdivisions.get('month')).toBe(12);
      expect(date.dayOfYear).toBe(360);
    });
  });

  describe('Subdivision-Based Formatting', () => {
    it('should format with nested subdivision labels', () => {
      const calendar = new CalendarEngine(nestedConfig);
      const date = calendar.storyTimeToDate(7 * 1440); // Q1, Week 2

      const formatted = calendar.formatDate(date, false);
      expect(formatted).toContain('Q1');
      expect(formatted).toContain('Week 2');
    });

    it('should format with month labels', () => {
      const calendar = new CalendarEngine(monthConfig);
      const date = calendar.storyTimeToDate(150 * 1440); // Month 6

      const formatted = calendar.formatDate(date, false);
      expect(formatted).toContain('Sixth Month');
    });

    it('should use labelFormat for generated labels', () => {
      const calendar = new CalendarEngine(nestedConfig);
      const date = calendar.storyTimeToDate(0);

      const formatted = calendar.formatDate(date, false);
      expect(formatted).toContain('Week 1');
    });
  });
});

describe('Deep Nesting (Three Levels)', () => {
  // Calendar with Year → Months → Weeks → Days of Week
  const deepNestedConfig: CalendarConfig = {
    id: 'deep',
    name: 'Deeply Nested Calendar',
    description: 'Year → Months → Weeks → Days',
    minutesPerHour: 60,
    hoursPerDay: 24,
    minutesPerDay: 1440,
    daysPerYear: 336, // 12 months * 28 days (4 weeks each)
    minutesPerYear: 483840,
    subdivisions: [
      {
        id: 'month',
        name: 'Month',
        pluralName: 'Months',
        count: 12,
        daysPerUnitFixed: 28, // 4 weeks
        labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6',
                 'Month 7', 'Month 8', 'Month 9', 'Month 10', 'Month 11', 'Month 12'],
        subdivisions: [
          {
            id: 'week',
            name: 'Week',
            pluralName: 'Weeks',
            count: 4,
            daysPerUnitFixed: 7,
            labelFormat: 'Week {n}',
            subdivisions: [
              {
                id: 'dayOfWeek',
                name: 'Day of Week',
                pluralName: 'Days of Week',
                count: 7,
                daysPerUnitFixed: 1,
                labels: ['Firstday', 'Secondday', 'Thirdday', 'Fourthday',
                         'Fifthday', 'Sixthday', 'Seventhday']
              }
            ]
          }
        ]
      }
    ],
    eras: {
      positive: 'AE',
      negative: 'BE'
    },
    display: {
      defaultFormat: '{dayOfWeek}, {week} of {month}, Year {year} {era}',
      shortFormat: '{month} {week}, {year}',
      includeTimeByDefault: false,
      hourFormat: '24'
    }
  };

  it('should calculate all three levels correctly for day 1', () => {
    const calendar = new CalendarEngine(deepNestedConfig);
    const date = calendar.storyTimeToDate(0);

    expect(date.subdivisions.get('month')).toBe(1);
    expect(date.subdivisions.get('week')).toBe(1);
    expect(date.subdivisions.get('dayOfWeek')).toBe(1);
  });

  it('should calculate day 8 (second week of month 1)', () => {
    const calendar = new CalendarEngine(deepNestedConfig);
    const date = calendar.storyTimeToDate(7 * 1440);

    expect(date.subdivisions.get('month')).toBe(1);
    expect(date.subdivisions.get('week')).toBe(2);
    expect(date.subdivisions.get('dayOfWeek')).toBe(1);
  });

  it('should calculate day 29 (first day of month 2)', () => {
    const calendar = new CalendarEngine(deepNestedConfig);
    const date = calendar.storyTimeToDate(28 * 1440);

    expect(date.subdivisions.get('month')).toBe(2);
    expect(date.subdivisions.get('week')).toBe(1);
    expect(date.subdivisions.get('dayOfWeek')).toBe(1);
  });

  it('should format with all three levels', () => {
    const calendar = new CalendarEngine(deepNestedConfig);
    const date = calendar.storyTimeToDate(7 * 1440); // Month 1, Week 2, Firstday

    const formatted = calendar.formatDate(date, true); // Use default format which includes all levels
    expect(formatted).toContain('Firstday');
    expect(formatted).toContain('Week 2');
    expect(formatted).toContain('Month 1');
  });
});
