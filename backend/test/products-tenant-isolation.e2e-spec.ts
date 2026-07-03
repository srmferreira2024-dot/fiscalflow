import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Isolamento entre tenants — Produtos (e2e)', () => {
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

  async function registerOfficeWithCompany(): Promise<{
    accessToken: string;
    companyId: string;
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

    return { accessToken, companyId: companyResponse.body.id as string };
  }

  it('nunca permite que um escritório acesse Produto de Empresa de outro escritório', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/products`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ code: 'PROD-A', name: 'Produto do Escritório A', price: 10 })
      .expect(201);

    const productId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/companies/${officeA.companyId}/products/${productId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/companies/${officeA.companyId}/products/${productId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ name: 'Tentativa indevida' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${officeA.companyId}/products/${productId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);
  });

  it('nunca permite criar Produto numa Company que não pertence ao tenant atual', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/products`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ code: 'PROD-INDEVIDO', name: 'Produto Indevido', price: 10 })
      .expect(404);
  });

  it('permite que o próprio escritório gerencie o ciclo de vida do Produto', async () => {
    const office = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/products`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({
        code: 'PROD-001',
        name: 'Produto Original',
        ncm: '61091000',
        cfop: '5102',
        price: 49.9,
        aliquotas: { icms: 18 },
      })
      .expect(201);

    const productId = createResponse.body.id as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/companies/${office.companyId}/products/${productId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ name: 'Produto Atualizado' })
      .expect(200);

    expect(updateResponse.body.name).toBe('Produto Atualizado');

    const listResponse = await request(app.getHttpServer())
      .get(`/api/companies/${office.companyId}/products`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(200);

    expect(listResponse.body.some((p: { id: string }) => p.id === productId)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/companies/${office.companyId}/products/${productId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(204);
  });
});
