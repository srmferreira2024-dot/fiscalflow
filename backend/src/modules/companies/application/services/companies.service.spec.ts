import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesRepository } from '../../infrastructure/companies.repository';
import { CertificateEncryptionService } from '../../../../infra/security/certificate-encryption.service';

describe('CompaniesService', () => {
  function buildService() {
    const repository = {
      findAllByOffice: jest.fn(),
      findByIdAndOffice: jest.fn(),
      create: jest.fn(),
      updateByIdAndOffice: jest.fn(),
      deleteByIdAndOffice: jest.fn(),
      getCertificate: jest.fn().mockResolvedValue(null),
      upsertCertificate: jest.fn(),
      deleteCertificate: jest.fn(),
    } as unknown as CompaniesRepository;

    const certificateEncryption = {
      encrypt: jest.fn().mockReturnValue({
        data: Buffer.from('cipher'),
        iv: Buffer.from('iv'),
        authTag: Buffer.from('tag'),
      }),
      decrypt: jest.fn(),
    } as unknown as CertificateEncryptionService;

    return {
      service: new CompaniesService(repository, certificateEncryption),
      repository,
      certificateEncryption,
    };
  }

  it('rejeita criação com CNPJ inválido antes de tocar o repositório', async () => {
    const { service, repository } = buildService();

    await expect(
      service.create('office-1', { cnpj: '123', razaoSocial: 'Empresa X' }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('cria a empresa vinculada ao officeId do tenant atual', async () => {
    const { service, repository } = buildService();
    (repository.create as jest.Mock).mockResolvedValue({ id: 'company-1', officeId: 'office-1' });

    const result = await service.create('office-1', {
      cnpj: '11222333000181',
      razaoSocial: 'Empresa Exemplo',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.create).toHaveBeenCalledWith(
      'office-1',
      expect.objectContaining({
        cnpj: '11222333000181',
      }),
    );
    expect(result.officeId).toBe('office-1');
  });

  it('lança NotFoundException ao buscar empresa de outro tenant', async () => {
    const { service, repository } = buildService();
    (repository.findByIdAndOffice as jest.Mock).mockResolvedValue(null);

    await expect(service.getForOffice('company-1', 'office-2')).rejects.toThrow(NotFoundException);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.findByIdAndOffice).toHaveBeenCalledWith('company-1', 'office-2');
  });

  it('nunca inclui os campos criptografados na resposta de getForOffice', async () => {
    const { service, repository } = buildService();
    (repository.findByIdAndOffice as jest.Mock).mockResolvedValue({
      id: 'company-1',
      officeId: 'office-1',
    });
    (repository.getCertificate as jest.Mock).mockResolvedValue({
      uploadedAt: new Date('2026-01-01'),
      validoAte: null,
      encryptedData: Buffer.from('segredo'),
      encryptedPassword: Buffer.from('segredo'),
    });

    const result = await service.getForOffice('company-1', 'office-1');

    expect(result.certificate).toEqual({ uploadedAt: new Date('2026-01-01'), validoAte: null });
    expect(result).not.toHaveProperty('encryptedData');
    expect(JSON.stringify(result)).not.toContain('segredo');
  });

  it('criptografa arquivo e senha do certificado antes de persistir', async () => {
    const { service, repository, certificateEncryption } = buildService();
    (repository.upsertCertificate as jest.Mock).mockResolvedValue({ id: 'cert-1' });
    (repository.findByIdAndOffice as jest.Mock).mockResolvedValue({
      id: 'company-1',
      officeId: 'office-1',
    });

    await service.uploadCertificate('company-1', 'office-1', {
      fileBase64: Buffer.from('conteudo-pfx').toString('base64'),
      password: 'senha-certificado',
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(certificateEncryption.encrypt).toHaveBeenCalledTimes(2);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.upsertCertificate).toHaveBeenCalledWith(
      'company-1',
      'office-1',
      expect.objectContaining({
        encryptedData: expect.any(Buffer),
        encryptedPassword: expect.any(Buffer),
      }),
    );
  });

  it('lança NotFoundException ao remover certificado de empresa inexistente no tenant', async () => {
    const { service, repository } = buildService();
    (repository.deleteCertificate as jest.Mock).mockResolvedValue(false);

    await expect(service.removeCertificate('company-1', 'office-2')).rejects.toThrow(
      NotFoundException,
    );
  });
});
