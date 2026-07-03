import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Isolamento entre tenants (e2e)', () => {
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

  async function registerOffice(): Promise<{ accessToken: string; officeId: string }> {
    const email = `user-${randomUUID()}@fiscalflow.dev`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: `Escritório ${randomUUID()}`,
        userName: 'Admin Teste',
        email,
        password: 'SenhaForte@123',
      })
      .expect(201);

    return {
      accessToken: response.body.accessToken as string,
      officeId: response.body.user.officeId as string,
    };
  }

  it('nunca permite que um escritório acesse Company de outro escritório', async () => {
    const officeA = await registerOffice();
    const officeB = await registerOffice();

    const createResponse = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ cnpj: '11222333000181', razaoSocial: 'Empresa do Escritório A' })
      .expect(201);

    const companyId = createResponse.body.id as string;
    expect(createResponse.body.officeId).toBe(officeA.officeId);

    await request(app.getHttpServer())
      .get(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ razaoSocial: 'Tentativa de alteração indevida' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    const listResponseB = await request(app.getHttpServer())
      .get('/api/companies')
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(200);

    expect(listResponseB.body).toHaveLength(0);

    const listResponseA = await request(app.getHttpServer())
      .get('/api/companies')
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .expect(200);

    expect(listResponseA.body.some((company: { id: string }) => company.id === companyId)).toBe(
      true,
    );
  });

  it('permite que o próprio escritório acesse e gerencie sua Company', async () => {
    const office = await registerOffice();

    const createResponse = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ cnpj: '11444777000161', razaoSocial: 'Empresa Original' })
      .expect(201);

    const companyId = createResponse.body.id as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .send({ razaoSocial: 'Empresa Atualizada' })
      .expect(200);

    expect(updateResponse.body.razaoSocial).toBe('Empresa Atualizada');

    await request(app.getHttpServer())
      .delete(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${office.accessToken}`)
      .expect(204);
  });

  it('criptografa o certificado A1, nunca vaza os bytes e isola por tenant', async () => {
    const officeA = await registerOffice();
    const officeB = await registerOffice();

    const createResponse = await request(app.getHttpServer())
      .post('/api/companies')
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ cnpj: '11444777000161', razaoSocial: 'Empresa com Certificado' })
      .expect(201);

    const companyId = createResponse.body.id as string;
    const fileBase64 = Buffer.from('conteudo-fake-do-pfx').toString('base64');

    const uploadResponse = await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/certificate`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .send({ fileBase64, password: 'SenhaCertificado@123' })
      .expect(201);

    expect(uploadResponse.body.certificate).toEqual(
      expect.objectContaining({ uploadedAt: expect.any(String) }),
    );
    expect(JSON.stringify(uploadResponse.body)).not.toContain(fileBase64);
    expect(uploadResponse.body).not.toHaveProperty('encryptedData');

    const getResponse = await request(app.getHttpServer())
      .get(`/api/companies/${companyId}`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .expect(200);

    expect(getResponse.body.certificate).not.toBeNull();
    expect(JSON.stringify(getResponse.body)).not.toContain(fileBase64);

    await request(app.getHttpServer())
      .post(`/api/companies/${companyId}/certificate`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .send({ fileBase64, password: 'SenhaCertificado@123' })
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${companyId}/certificate`)
      .set('Authorization', `Bearer ${officeB.accessToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/api/companies/${companyId}/certificate`)
      .set('Authorization', `Bearer ${officeA.accessToken}`)
      .expect(204);
  });
});
