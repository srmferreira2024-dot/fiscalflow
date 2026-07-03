import { Cpf } from './cpf.vo';

describe('Cpf', () => {
  it('aceita um CPF válido e normaliza para apenas dígitos', () => {
    const cpf = Cpf.create('111.444.777-35');
    expect(cpf.toString()).toBe('11144477735');
  });

  it('formata o CPF com máscara', () => {
    const cpf = Cpf.create('11144477735');
    expect(cpf.format()).toBe('111.444.777-35');
  });

  it('rejeita CPF com dígito verificador inválido', () => {
    expect(() => Cpf.create('11144477736')).toThrow('CPF inválido');
  });

  it('rejeita CPF com todos os dígitos iguais', () => {
    expect(() => Cpf.create('11111111111')).toThrow('CPF inválido');
  });

  it('rejeita CPF com tamanho incorreto', () => {
    expect(() => Cpf.create('123')).toThrow('CPF inválido');
  });

  it('considera dois CPFs iguais quando o valor normalizado é o mesmo', () => {
    const a = Cpf.create('111.444.777-35');
    const b = Cpf.create('11144477735');
    expect(a.equals(b)).toBe(true);
  });
});
