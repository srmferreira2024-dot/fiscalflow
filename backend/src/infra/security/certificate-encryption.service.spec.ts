import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { CertificateEncryptionService } from './certificate-encryption.service';
import { AppConfig } from '../../config/configuration';

describe('CertificateEncryptionService', () => {
  function buildService(): CertificateEncryptionService {
    const configService = {
      get: () => randomBytes(32).toString('base64'),
    } as unknown as ConfigService<AppConfig, true>;

    return new CertificateEncryptionService(configService);
  }

  it('faz o round-trip encrypt/decrypt preservando o conteúdo original', () => {
    const service = buildService();
    const plaintext = Buffer.from('conteúdo sensível do certificado A1');

    const encrypted = service.encrypt(plaintext);
    const decrypted = service.decrypt(encrypted);

    expect(decrypted.toString()).toBe(plaintext.toString());
  });

  it('gera IVs diferentes a cada chamada', () => {
    const service = buildService();
    const plaintext = Buffer.from('mesmo conteúdo');

    const first = service.encrypt(plaintext);
    const second = service.encrypt(plaintext);

    expect(first.iv.equals(second.iv)).toBe(false);
    expect(first.data.equals(second.data)).toBe(false);
  });

  it('falha ao descriptografar com authTag incorreta (dado adulterado)', () => {
    const service = buildService();
    const encrypted = service.encrypt(Buffer.from('dado original'));
    const tampered = { ...encrypted, authTag: randomBytes(16) };

    expect(() => service.decrypt(tampered)).toThrow();
  });
});
