import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { randomUUID } from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  function uniqueEmail(): string {
    return `user-${randomUUID()}@fiscalflow.dev`;
  }

  it('registra um novo escritório + usuário ADMIN e retorna tokens', async () => {
    const email = uniqueEmail();

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: `Escritório ${randomUUID()}`,
        userName: 'Admin Teste',
        email,
        password: 'SenhaForte@123',
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.email).toBe(email);
    expect(response.body.user.role).toBe('ADMIN');
  });

  it('rejeita registro com e-mail já utilizado', async () => {
    const email = uniqueEmail();
    const payload = {
      officeName: `Escritório ${randomUUID()}`,
      userName: 'Admin Teste',
      email,
      password: 'SenhaForte@123',
    };

    await request(app.getHttpServer()).post('/api/auth/register').send(payload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...payload, officeName: `Outro Escritório ${randomUUID()}` })
      .expect(409);
  });

  it('faz login com credenciais válidas e acessa rota protegida', async () => {
    const email = uniqueEmail();
    const password = 'SenhaForte@123';

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ officeName: `Escritório ${randomUUID()}`, userName: 'Admin Teste', email, password })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(200);

    const { accessToken } = loginResponse.body as { accessToken: string };

    const meResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meResponse.body.email).toBe(email);
  });

  it('rejeita login com senha incorreta', async () => {
    const email = uniqueEmail();

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: `Escritório ${randomUUID()}`,
        userName: 'Admin Teste',
        email,
        password: 'SenhaForte@123',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password: 'SenhaErrada@123' })
      .expect(401);
  });

  it('nega acesso a rota protegida sem token', async () => {
    await request(app.getHttpServer()).get('/api/users/me').expect(401);
  });

  it('rotaciona o refresh token e invalida o token anterior', async () => {
    const email = uniqueEmail();
    const password = 'SenhaForte@123';

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ officeName: `Escritório ${randomUUID()}`, userName: 'Admin Teste', email, password })
      .expect(201);

    const oldRefreshToken = registerResponse.body.refreshToken as string;

    const refreshResponse = await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(200);

    expect(refreshResponse.body.refreshToken).not.toBe(oldRefreshToken);

    await request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({ refreshToken: oldRefreshToken })
      .expect(401);
  });

  it('invalida o refresh token após logout', async () => {
    const email = uniqueEmail();
    const password = 'SenhaForte@123';

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ officeName: `Escritório ${randomUUID()}`, userName: 'Admin Teste', email, password })
      .expect(201);

    const { refreshToken } = registerResponse.body as { refreshToken: string };

    await request(app.getHttpServer()).post('/api/auth/logout').send({ refreshToken }).expect(204);

    await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken }).expect(401);
  });

  it('registra um evento de auditoria para o registro do escritório', async () => {
    const email = uniqueEmail();

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        officeName: `Escritório ${randomUUID()}`,
        userName: 'Admin Teste',
        email,
        password: 'SenhaForte@123',
      })
      .expect(201);

    const officeId = response.body.user.officeId as string;

    await new Promise((resolve) => setTimeout(resolve, 50));

    const auditLogs = await prisma.auditLog.findMany({ where: { officeId, action: 'REGISTER' } });
    expect(auditLogs.length).toBeGreaterThan(0);
  });
});
