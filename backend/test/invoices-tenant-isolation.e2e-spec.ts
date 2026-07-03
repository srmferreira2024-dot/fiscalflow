import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Isolamento entre tenants — Notas (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerOfficeWithCompanyClientAndProduct(): Promise<{
    accessToken: string;
    companyId: string;
    clientId: string;
    productId: string;
  }> {
    const email = `user-${randomUUID()}@fiscalflow.dev`;
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: `Escritório ${randomUUID()}`,
        userName: 'Admin Teste',
        email,
        password: 'SenhaForte@123',
      })
      .expect(201);

    const accessToken = registerResponse.body.accessToken as string;

    const companyResponse = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ cnpj: '11444777000161', razaoSocial: `Empresa ${randomUUID()}` })
      .expect(201);
    const companyId = companyResponse.body.id as string;

    const clientResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/clients`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ documentType: 'CPF', document: '11144477735', name: 'Cliente Teste' })
      .expect(201);
    const clientId = clientResponse.body.id as string;

    const productResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/products`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: 'PROD-001', name: 'Produto Teste', price: 50 })
      .expect(201);
    const productId = productResponse.body.id as string;

    return { accessToken, companyId, clientId, productId };
  }

  it('emite, consulta e cancela uma nota com sucesso', async () => {
    const office = await registerOfficeWithCompanyClientAndProduct();

    const emitResponse = await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/invoices`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({
        clientId: office.clientId,
        items: [{ productId: office.productId, quantidade: 2, valorUnitario: 50 }],
      })
      .expect(201);

    expect(emitResponse.body.status).toBe('AUTORIZADA');
    expect(emitResponse.body.numero).toBeDefined();
    expect(emitResponse.body.protocolo).toBeDefined();
    expect(Number(emitResponse.body.valorTotal)).toBe(100);

    const invoiceId = emitResponse.body.id as string;

    const getResponse = await request(app.getHttpServer())
      .get(`/api/companies/${office.companyId}/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(200);
    expect(getResponse.body.items).toHaveLength(1);

    const cancelResponse = await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/invoices/${invoiceId}/cancelar`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ motivo: 'Erro de digitação' })
      .expect(200);
    expect(cancelResponse.body.status).toBe('CANCELADA');
  });

  it('rejeita item com productId e serviceItemId ao mesmo tempo (400)', async () => {
    const office = await registerOfficeWithCompanyClientAndProduct();

    await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/invoices`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({
        clientId: office.clientId,
        items: [
          {
            productId: office.productId,
            serviceItemId: office.productId,
            quantidade: 1,
            valorUnitario: 10,
          },
        ],
      })
      .expect(400);
  });

  it('nunca permite que um escritório acesse Nota de Empresa de outro escritório', async () => {
    const officeA = await registerOfficeWithCompanyClientAndProduct();
    const officeB = await registerOfficeWithCompanyClientAndProduct();

    const emitResponse = await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/invoices`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({
        clientId: officeA.clientId,
        items: [{ productId: officeA.productId, quantidade: 1, valorUnitario: 10 }],
      })
      .expect(201);

    const invoiceId = emitResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/companies/${officeA.companyId}/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/invoices/${invoiceId}/cancelar`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ motivo: 'Tentativa indevida' })
      .expect(404);
  });

  it('nunca permite emitir nota usando clientId ou productId de outra empresa', async () => {
    const officeA = await registerOfficeWithCompanyClientAndProduct();
    const officeB = await registerOfficeWithCompanyClientAndProduct();

    await request(app.getHttpServer())
      .post(`/api/companies/${officeB.companyId}/invoices`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({
        clientId: officeA.clientId,
        items: [{ productId: officeB.productId, quantidade: 1, valorUnitario: 10 }],
      })
      .expect(404);

    await request(app.getHttpServer())
      .post(`/api/companies/${officeB.companyId}/invoices`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({
        clientId: officeB.clientId,
        items: [{ productId: officeA.productId, quantidade: 1, valorUnitario: 10 }],
      })
      .expect(404);
  });
});
