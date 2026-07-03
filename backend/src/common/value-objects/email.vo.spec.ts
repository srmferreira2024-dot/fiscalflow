import { Email } from './email.vo';

describe('Email', () => {
  it('normaliza para minúsculas e remove espaços', () => {
    const email = Email.create('  Admin@Escritorio.COM.br  ');
    expect(email.toString()).toBe('admin@escritorio.com.br');
  });

  it('rejeita e-mail sem formato válido', () => {
    expect(() => Email.create('nao-e-email')).toThrow('E-mail inválido');
  });

  it('considera dois e-mails equivalentes após normalização', () => {
    const a = Email.create('User@Domain.com');
    const b = Email.create('user@domain.com');
    expect(a.equals(b)).toBe(true);
  });
});
