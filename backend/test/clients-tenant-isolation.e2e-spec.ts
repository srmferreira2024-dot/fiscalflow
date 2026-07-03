import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Isolamento entre tenants — Clientes (e2e)', () => {
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
    officeId: string;
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
    const officeId = registerResponse.body.user.officeId as string;

    const companyResponse = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ cnpj: '11444777000161', razaoSocial: `Empresa ${randomUUID()}` })
      .expect(201);

    return { accessToken, officeId, companyId: companyResponse.body.id as string };
  }

  it('nunca permite que um escritório acesse Cliente de Empresa de outro escritório', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/clients`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ documentType: 'CPF', document: '11144477735', name: 'Cliente do Escritório A' })
      .expect(201);

    const clientId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/companies/${officeA.companyId}/clients/${clientId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/companies/${officeA.companyId}/clients/${clientId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ name: 'Tentativa indevida' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${officeA.companyId}/clients/${clientId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);
  });

  it('nunca permite criar Cliente numa Company que não pertence ao tenant atual', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/clients`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ documentType: 'CPF', document: '11144477735', name: 'Cliente Indevido' })
      .expect(404);
  });

  it('permite que o próprio escritório gerencie o ciclo de vida do Cliente', async () => {
    const office = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/clients`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ documentType: 'CNPJ', document: '11222333000181', name: 'Cliente PJ' })
      .expect(201);

    const clientId = createResponse.body.id as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/companies/${office.companyId}/clients/${clientId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ name: 'Cliente PJ Atualizado' })
      .expect(200);

    expect(updateResponse.body.name).toBe('Cliente PJ Atualizado');

    const listResponse = await request(app.getHttpServer())
      .get(`/api/companies/${office.companyId}/clients`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(200);

    expect(listResponse.body.some((c: { id: string }) => c.id === clientId)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/companies/${office.companyId}/clients/${clientId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(204);
  });

  it('rejeita CPF inválido na criação de Cliente', async () => {
    const office = await registerOfficeWithCompany();

    await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/clients`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ documentType: 'CPF', document: '12345678900', name: 'Cliente Inválido' })
      .expect(400);
  });
});
