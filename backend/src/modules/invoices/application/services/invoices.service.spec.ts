import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { InvoicesRepository } from '../../infrastructure/invoices.repository';
import { CompaniesService } from '../../../companies/application/services/companies.service';
import { ClientsService } from '../../../clients/application/services/clients.service';
import { ProductsService } from '../../../products/application/services/products.service';
import { ServiceItemsService } from '../../../service-items/application/services/service-items.service';
import { InvoiceProvider } from '../../domain/ports/invoice-provider.port';

describe('InvoicesService', () => {
  function buildService() {
    const invoicesRepository = {
      findAllByCompany: jest.fn(),
      findByIdAndCompany: jest.fn(),
      create: jest.fn(),
      updateStatusByIdAndCompany: jest.fn(),
    } as unknown as InvoicesRepository;

    const companiesService = {
      getForOffice: jest.fn().mockResolvedValue({ id: 'company-1' }),
    } as unknown as CompaniesService;

    const clientsService = {
      getForCompany: jest.fn().mockResolvedValue({
        id: 'client-1',
        document: '11144477735',
        name: 'Cliente Teste',
      }),
    } as unknown as ClientsService;

    const productsService = {
      getForCompany: jest.fn().mockResolvedValue({ id: 'product-1', name: 'Produto Teste' }),
    } as unknown as ProductsService;

    const serviceItemsService = {
      getForCompany: jest.fn().mockResolvedValue({ id: 'service-1', description: 'Serviço Teste' }),
    } as unknown as ServiceItemsService;

    const invoiceProvider = {
      emitirNota: jest.fn().mockResolvedValue({
        notaId: 'invoice-1',
        numero: 'MOCK-1',
        status: 'AUTORIZADA',
        protocolo: 'proto-1',
      }),
      cancelarNota: jest.fn().mockResolvedValue({ notaId: 'invoice-1', status: 'CANCELADA' }),
      consultarNota: jest.fn(),
      baixarXML: jest.fn(),
      baixarPDF: jest.fn(),
      listarMunicipios: jest.fn(),
      validarCertificado: jest.fn(),
    } as unknown as InvoiceProvider;

    const invoiceEmissionQueue = {
      addEmissionJob: jest.fn(),
    } as any;

    const service = new InvoicesService(
      invoicesRepository,
      companiesService,
      clientsService,
      productsService,
      serviceItemsService,
      invoiceProvider,
      invoiceEmissionQueue,
    );

    return {
      service,
      invoicesRepository,
      companiesService,
      clientsService,
      productsService,
      serviceItemsService,
      invoiceProvider,
      invoiceEmissionQueue,
    };
  }

  const validDto = {
    clientId: 'client-1',
    items: [{ productId: 'product-1', quantidade: 2, valorUnitario: 50 }],
  };

  it('emite nota com sucesso: cria a Invoice com status PENDENTE_FILA e adiciona job à fila', async () => {
    const { service, invoicesRepository, invoiceEmissionQueue } = buildService();
    (invoicesRepository.create as jest.Mock).mockResolvedValue({
      id: 'invoice-1',
      clientId: 'client-1',
      valorTotal: 100,
      status: InvoiceStatus.PENDENTE_FILA,
    });

    const result = await service.emitirNota('company-1', 'office-1', validDto);

    expect(result.status).toBe(InvoiceStatus.PENDENTE_FILA);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoicesRepository.create).toHaveBeenCalledWith(
      'company-1',
      'office-1',
      expect.objectContaining({
        valorTotal: 100,
        status: InvoiceStatus.PENDENTE_FILA,
      }),
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoiceEmissionQueue.addEmissionJob).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'invoice-1',
        companyId: 'company-1',
        officeId: 'office-1',
        clientId: 'client-1',
        attemptNumber: 1,
      }),
    );
  });

  it('rejeita emissão quando a empresa não pertence ao escritório atual', async () => {
    const { service, companiesService, invoicesRepository } = buildService();
    (companiesService.getForOffice as jest.Mock).mockRejectedValue(
      new NotFoundException('Empresa não encontrada'),
    );

    await expect(service.emitirNota('company-outro-tenant', 'office-1', validDto)).rejects.toThrow(
      NotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoicesRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita emissão quando o cliente não pertence à empresa', async () => {
    const { service, clientsService, invoicesRepository } = buildService();
    (clientsService.getForCompany as jest.Mock).mockRejectedValue(
      new NotFoundException('Cliente não encontrado'),
    );

    await expect(service.emitirNota('company-1', 'office-1', validDto)).rejects.toThrow(
      NotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoicesRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita emissão quando o produto do item não pertence à empresa', async () => {
    const { service, productsService, invoicesRepository } = buildService();
    (productsService.getForCompany as jest.Mock).mockRejectedValue(
      new NotFoundException('Produto não encontrado'),
    );

    await expect(service.emitirNota('company-1', 'office-1', validDto)).rejects.toThrow(
      NotFoundException,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoicesRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita item com productId e serviceItemId setados ao mesmo tempo', async () => {
    const { service, invoicesRepository } = buildService();

    await expect(
      service.emitirNota('company-1', 'office-1', {
        clientId: 'client-1',
        items: [
          { productId: 'product-1', serviceItemId: 'service-1', quantidade: 1, valorUnitario: 10 },
        ],
      }),
    ).rejects.toThrow(BadRequestException);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoicesRepository.create).not.toHaveBeenCalled();
  });

  it('rejeita item sem productId nem serviceItemId', async () => {
    const { service } = buildService();

    await expect(
      service.emitirNota('company-1', 'office-1', {
        clientId: 'client-1',
        items: [{ quantidade: 1, valorUnitario: 10 }],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('cancela nota chamando o InvoiceProvider e atualizando o status', async () => {
    const { service, invoicesRepository, invoiceProvider } = buildService();
    (invoicesRepository.findByIdAndCompany as jest.Mock).mockResolvedValue({ id: 'invoice-1' });
    (invoicesRepository.updateStatusByIdAndCompany as jest.Mock).mockResolvedValue({
      id: 'invoice-1',
      status: InvoiceStatus.CANCELADA,
    });

    const result = await service.cancelarNota('invoice-1', 'company-1', 'office-1', {
      motivo: 'Erro de digitação',
    });

    expect(result.status).toBe(InvoiceStatus.CANCELADA);
    // eslint-disable-next-line @typescript-eslint/unbound-method -- jest.fn() mock, seguro referenciar
    expect(invoiceProvider.cancelarNota).toHaveBeenCalledWith({
      companyId: 'company-1',
      notaId: 'invoice-1',
      motivo: 'Erro de digitação',
    });
  });

  it('lança NotFoundException ao cancelar nota que não existe na empresa', async () => {
    const { service, invoicesRepository } = buildService();
    (invoicesRepository.findByIdAndCompany as jest.Mock).mockResolvedValue(null);

    await expect(
      service.cancelarNota('invoice-inexistente', 'company-1', 'office-1', {
        motivo: 'Erro de digitação',
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
