import {
  formatCPF,
  removeCPFMask,
  isValidCPF,
  isValidEmail,
  isCPFOrEmail,
} from '@/utils/masks'

describe('formatCPF', () => {
  it('formata um CPF completo', () => {
    expect(formatCPF('12345678909')).toBe('123.456.789-09')
  })

  it('remove caracteres que não são números antes de formatar', () => {
    expect(formatCPF('123.456.789-09')).toBe('123.456.789-09')
  })

  it('retorna somente os números quando a entrada tem até três dígitos', () => {
    expect(formatCPF('123')).toBe('123')
  })
})

describe('removeCPFMask', () => {
  it('remove pontos e traço do CPF', () => {
    expect(removeCPFMask('123.456.789-09')).toBe('12345678909')
  })
})

describe('isValidCPF', () => {
  it('aceita um CPF válido', () => {
    expect(isValidCPF('529.982.247-25')).toBe(true)
  })

  it('rejeita um CPF com dígitos verificadores incorretos', () => {
    expect(isValidCPF('123.456.789-00')).toBe(false)
  })

  it('rejeita um CPF com todos os dígitos iguais', () => {
    expect(isValidCPF('111.111.111-11')).toBe(false)
  })

  it('rejeita um CPF com quantidade incorreta de dígitos', () => {
    expect(isValidCPF('123456')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('aceita um e-mail válido', () => {
    expect(isValidEmail('teste@example.com')).toBe(true)
  })

  it('rejeita um e-mail sem arroba', () => {
    expect(isValidEmail('testeexample.com')).toBe(false)
  })

  it('rejeita um e-mail sem domínio completo', () => {
    expect(isValidEmail('teste@')).toBe(false)
  })
})

describe('isCPFOrEmail', () => {
  it('identifica um e-mail válido', () => {
    expect(isCPFOrEmail('teste@example.com')).toBe('email')
  })

  it('identifica um CPF com máscara', () => {
    expect(isCPFOrEmail('529.982.247-25')).toBe('cpf')
  })

  it('ignora espaços nas extremidades', () => {
    expect(isCPFOrEmail('  teste@example.com  ')).toBe('email')
  })

  it('rejeita um valor inválido', () => {
    expect(isCPFOrEmail('valor-invalido')).toBe('invalid')
  })
})