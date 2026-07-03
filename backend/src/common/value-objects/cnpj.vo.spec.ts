import { Cnpj } from './cnpj.vo';

describe('Cnpj', () => {
  it('aceita um CNPJ válido e normaliza para apenas dígitos', () => {
    const cnpj = Cnpj.create('11.222.333/0001-81');
    expect(cnpj.toString()).toBe('11222333000181');
  });

  it('formata o CNPJ com máscara', () => {
    const cnpj = Cnpj.create('11222333000181');
    expect(cnpj.format()).toBe('11.222.333/0001-81');
  });

  it('rejeita CNPJ com dígito verificador inválido', () => {
    expect(() => Cnpj.create('11222333000180')).toThrow('CNPJ inválido');
  });

  it('rejeita CNPJ com todos os dígitos iguais', () => {
    expect(() => Cnpj.create('11111111111111')).toThrow('CNPJ inválido');
  });

  it('rejeita CNPJ com tamanho incorreto', () => {
    expect(() => Cnpj.create('123')).toThrow('CNPJ inválido');
  });

  it('considera dois CNPJs iguais quando o valor normalizado é o mesmo', () => {
    const a = Cnpj.create('11.222.333/0001-81');
    const b = Cnpj.create('11222333000181');
    expect(a.equals(b)).toBe(true);
  });
});
