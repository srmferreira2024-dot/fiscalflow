import { Module } from '@nestjs/common';
import { CertificateEncryptionService } from './certificate-encryption.service';

@Module({
  providers: [CertificateEncryptionService],
  exports: [CertificateEncryptionService],
})
export class SecurityModule {}
