import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from '../../infrastructure/products.repository';
import { CompaniesService } from '../../../companies/application/services/companies.service';

describe('ProductsService', () => {
  function buildService() {
    const repository = {
      findAllByCompany: jest.fn(),
      findByIdAndCompany: jest.fn(),
      create: jest.fn(),
      updateByIdAndCompany: jest.fn(),
      deleteByIdAndCompany: jest.fn(),
    } as unknown as ProductsRepository;

    const companiesService = {
      getForOffice: jest.fn(),
    } as unknown as CompaniesService;

    return {
      service: new ProductsService(repository, companiesService),
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

  it('cria produto vinculado à empresa quando ela pertence ao tenant', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });
    (repository.create as jest.Mock).mockResolvedValue({
      id: 'product-1',
      companyId: 'company-1',
    });

    const result = await service.create('company-1', 'office-1', {
      code: 'PROD-001',
      name: 'Produto Teste',
      price: 10,
    });

    expect(result.id).toBe('product-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(repository.create).toHaveBeenCalledWith(
      'company-1',
      'office-1',
      expect.objectContaining({ code: 'PROD-001' }),
    );
  });

  it('lança NotFoundException ao buscar produto inexistente na empresa', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });
    (repository.findByIdAndCompany as jest.Mock).mockResolvedValue(null);

    await expect(service.getForCompany('product-1', 'company-1', 'office-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('lança NotFoundException ao remover produto que não existe na empresa', async () => {
    const { service, companiesService, repository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockResolvedValue({ id: 'company-1' });
    (repository.deleteByIdAndCompany as jest.Mock).mockResolvedValue(false);

    await expect(service.remove('product-1', 'company-1', 'office-1')).rejects.toThrow(
      NotFoundException,
    );
  });
});
