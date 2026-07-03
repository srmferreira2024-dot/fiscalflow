import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { ClientsService } from './clients.service';
import { ClientsRepository } from '../../infrastructure/clients.repository';
import { CompaniesService } from '../../../companies/application/services/companies.service';

describe('ClientsService', () => {
  function buildService() {
    const repository = {
      findAllByCompany: jest.fn(),
      findByIdAndCompany: jest.fn(),
      create: jest.fn(),
      updateByIdAndCompany: jest.fn(),
      deleteByIdAndCompany: jest.fn(),
    } as unknown as ClientsRepository;

    const companiesService = {
      getForOffice: jest.fn(),
    } as unknown as CompaniesService;

    return {
      service: new ClientsService(repository, companiesService),
      repository,
      companiesService,
    };
  }

  it('lança NotFoundException quando a empresa não pertence ao escritório atual', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockRejectedValue(
      new NotFoundException('Empresa não encontrada'),
    );

    await expect(service.listForCompany('company-de-outro-tenant', 'office-atual')).rejects.toThrow(
      NotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.findAllByCompany).not.toHaveBeenCalled();
  });

  it('rejeita criação com CPF inválido antes de tocar o repositório', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });

    await expect(
      service.create('company-1', 'office-1', {
        documentType: DocumentType.CPF,
        document: '12345678900',
        name: 'Cliente Teste',
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('cria cliente vinculado à empresa quando o documento é válido', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });
    (repository.create as jest.Mock).mockResolvedValue({ id: 'client-1', companyId: 'company-1' });

    const result = await service.create('company-1', 'office-1', {
      documentType: DocumentType.CPF,
      document: '111.444.777-35',
      name: 'Cliente Teste',
    });

    expect(result.id).toBe('client-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.create).toHaveBeenCalledWith(
      'company-1',
      'office-1',
      expect.objectContaining({ document: '111.444.777-35' }),
    );
  });

  it('lança NotFoundException ao buscar cliente inexistente na empresa', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });
    (repository.findByIdAndCompany as jest.Mock).mockResolvedValue(null);

    await expect(service.getForCompany('client-1', 'company-1', 'office-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
