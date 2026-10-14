import {
  formatDate,
  formatDateTime,
  formatTime,
  formatTimeAgo,
} from '@/utils/dateFormatter'

describe('formatDate', () => {
  it('formata uma data no padrão brasileiro', () => {
    expect(formatDate(new Date(2024, 2, 15, 12, 0))).toBe('15/03/2024')
  })

  it('aceita uma string de data', () => {
    expect(formatDate('2024-03-15T12:00:00')).toBe('15/03/2024')
  })
})

describe('formatDateTime', () => {
  it('formata data e hora', () => {
    expect(formatDateTime(new Date(2024, 2, 15, 14, 30))).toBe(
      '15/03/2024 14:30',
    )
  })
})

describe('formatTime', () => {
  it('retorna somente a hora e os minutos', () => {
    expect(formatTime(new Date(2024, 2, 15, 9, 5))).toBe('09:05')
  })
})

describe('formatTimeAgo', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('informa o tempo decorrido em relação à data atual', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date(2024, 2, 15, 12, 0))

    expect(formatTimeAgo(new Date(2024, 2, 15, 11, 0))).toBe(
      'há cerca de 1 hora',
    )
  })
})