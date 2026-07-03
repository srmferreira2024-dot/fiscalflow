import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Isolamento entre tenants — Serviços (e2e)', () => {
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

  it('nunca permite que um escritório acesse Serviço de Empresa de outro escritório', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/services`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ code: '1.04', description: 'Serviço do Escritório A' })
      .expect(201);

    const serviceId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/api/companies/${officeA.companyId}/services/${serviceId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/companies/${officeA.companyId}/services/${serviceId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ description: 'Tentativa indevida' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${officeA.companyId}/services/${serviceId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);
  });

  it('nunca permite criar Serviço numa Company que não pertence ao tenant atual', async () => {
    const officeA = await registerOfficeWithCompany();
    const officeB = await registerOfficeWithCompany();

    await request(app.getHttpServer())
      .post(`/api/companies/${officeA.companyId}/services`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ code: '1.05', description: 'Serviço Indevido' })
      .expect(404);
  });

  it('permite que o próprio escritório gerencie o ciclo de vida do Serviço', async () => {
    const office = await registerOfficeWithCompany();

    const createResponse = await request(app.getHttpServer())
      .post(`/api/companies/${office.companyId}/services`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({
        code: '1.04',
        description: 'Elaboração de programas de computador',
        issAliquota: 5,
        municipio: 'São Paulo',
      })
      .expect(201);

    const serviceId = createResponse.body.id as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/companies/${office.companyId}/services/${serviceId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ description: 'Descrição atualizada' })
      .expect(200);

    expect(updateResponse.body.description).toBe('Descrição atualizada');

    const listResponse = await request(app.getHttpServer())
      .get(`/api/companies/${office.companyId}/services`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(200);

    expect(listResponse.body.some((s: { id: string }) => s.id === serviceId)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/api/companies/${office.companyId}/services/${serviceId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(204);
  });
});
