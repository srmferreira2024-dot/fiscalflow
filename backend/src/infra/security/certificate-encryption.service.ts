import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { AppConfig } from '../../config/configuration';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH_BYTES = 12;

export interface EncryptedPayload {
  data: Buffer;
  iv: Buffer;
  authTag: Buffer;
}

/**
 * Criptografa/descriptografa dados sensíveis (Certificado A1 e sua senha) com
 * AES-256-GCM. A chave mestra nunca fica no banco — vem de CERTIFICATE_ENCRYPTION_KEY.
 */
@Injectable()
export class CertificateEncryptionService {
  private readonly key: Buffer;

  constructor(configService: ConfigService<AppConfig, true>) {
    const encodedKey: string = configService.get('certificateEncryptionKey', { infer: true });
    this.key = Buffer.from(encodedKey, 'base64');
  }

  encrypt(plaintext: Buffer): EncryptedPayload {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const data = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return { data, iv, authTag };
  }

  decrypt(payload: EncryptedPayload): Buffer {
    const decipher = createDecipheriv(ALGORITHM, this.key, payload.iv);
    decipher.setAuthTag(payload.authTag);
    return Buffer.concat([decipher.update(payload.data), decipher.final()]);
  }
}
