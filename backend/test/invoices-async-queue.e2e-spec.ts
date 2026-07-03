import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Queue } from 'bull';
import { getQueueToken } from '@nestjs/bull';

describe('Emissão Assíncrona de Notas (e2e)', () => {
  let app: INestApplication;
  let invoiceEmissionQueue: Queue;
  let accessToken: string;
  let companyId: string;
  let clientId: string;
  let productId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    invoiceEmissionQueue = moduleRef.get(getQueueToken('invoice-emission'));

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: 'Teste E2E Async Queue',
        userName: 'Admin',
        email: `admin-${Date.now()}@test.com`,
        password: 'P@ssw0rd123!',
      });

    accessToken = registerResponse.body.accessToken;
    companyId = registerResponse.body.company.id;

    const clientResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/clients`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        documentType: 'CPF',
        document: '11144477735',
        name: 'Cliente Teste',
      });
    clientId = clientResponse.body.id;

    const productResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/products`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Produto Teste',
        ncm: '1234567890',
        cfop: '5102',
        cst: '00',
        price: 100,
      });
    productId = productResponse.body.id;
  });

  afterAll(async () => {
    await invoiceEmissionQueue.close();
    await app.close();
  });

  it('emite nota com status PENDENTE_FILA e processa via BullMQ', async () => {
    const emitResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/invoices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        clientId,
        items: [
          {
            productId,
            quantidade: 1,
            valorUnitario: 100,
          },
        ],
      })
      .expect(201);

    expect(emitResponse.body.status).toBe('PENDENTE_FILA');
    const invoiceId = emitResponse.body.id;

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const getResponse = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(getResponse.body.status).toBe('AUTORIZADA');
    expect(getResponse.body.numero).toBeDefined();
    expect(getResponse.body.protocolo).toBeDefined();
  });

  it('lista invoices com status PENDENTE_FILA e AUTORIZADA', async () => {
    const listResponse = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/invoices`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBeGreaterThanOrEqual(1);

    const statuses = listResponse.body.map((inv: any) => inv.status);
    expect(statuses).toContain('AUTORIZADA');
  });

  it('retorna 404 quando tenta acessar invoices de empresa de outro tenant', async () => {
    const otherOfficeResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: 'Outro Escritório',
        userName: 'Admin2',
        email: `admin2-${Date.now()}@test.com`,
        password: 'P@ssw0rd123!',
      });

    const otherAccessToken = otherOfficeResponse.body.accessToken;

    await request(app.getHttpServer())
      .get(`/api/companies/${companyId}/invoices`)
      .set('Authorization', `Bearer ${otherAccessToken}`)
      .expect(404);
  });
});
