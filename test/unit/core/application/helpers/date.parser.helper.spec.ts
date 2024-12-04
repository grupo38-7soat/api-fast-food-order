import {
  formatDateWithTimezone,
  getMinutesInterval,
  increaseTimeToDate,
  decreaseTimeToDate,
} from '@core/application/helpers'

describe('dateUtils', () => {
  describe('formatDateWithTimezone', () => {
    it('should format a date with default timezone offset', () => {
      const date = new Date('2024-12-01T12:00:00Z')
      const formattedDate = formatDateWithTimezone(date)
      expect(formattedDate).toBe('2024-12-01T09:00:00.000-03:00') // Default offset is -3
    })

    it('should format a date with a positive timezone offset', () => {
      const date = new Date('2024-12-01T12:00:00Z')
      const formattedDate = formatDateWithTimezone(date, 5)
      expect(formattedDate).toBe('2024-12-01T17:00:00.000+05:00')
    })

    it('should format a date with a negative timezone offset', () => {
      const date = new Date('2024-12-01T12:00:00Z')
      const formattedDate = formatDateWithTimezone(date, -8)
      expect(formattedDate).toBe('2024-12-01T04:00:00.000-08:00')
    })
  })

  describe('getMinutesInterval', () => {
    it('should return the difference in minutes between two dates', () => {
      const firstDate = new Date('2024-12-01T12:00:00Z')
      const secondDate = new Date('2024-12-01T12:30:00Z')
      const interval = getMinutesInterval(firstDate, secondDate)
      expect(interval).toBe(30)
    })

    it('should return 0 if the dates are the same', () => {
      const date = new Date('2024-12-01T12:00:00Z')
      const interval = getMinutesInterval(date, date)
      expect(interval).toBe(0)
    })

    it('should return the absolute difference in minutes', () => {
      const firstDate = new Date('2024-12-01T12:30:00Z')
      const secondDate = new Date('2024-12-01T12:00:00Z')
      const interval = getMinutesInterval(firstDate, secondDate)
      expect(interval).toBe(30)
    })
  })

  describe('increaseTimeToDate', () => {
    it('should increase the current date by the given minutes', () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2024-12-01T12:00:00.000-03:00'))
      const result = increaseTimeToDate(30)
      expect(result).toBe('2024-12-01T12:30:00.000-03:00') // Assuming default offset -3
      jest.useRealTimers()
    })
  })

  describe('decreaseTimeToDate', () => {
    it('should decrease the current date by the given minutes', () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2024-12-01T12:00:00.000-03:00'))
      const result = decreaseTimeToDate(30)
      expect(result).toBe('2024-12-01T11:30:00.000-03:00') // Assuming default offset -3
      jest.useRealTimers()
    })
  })
})
