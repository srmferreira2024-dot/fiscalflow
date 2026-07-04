import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import configuration from './config/configuration';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './infra/prisma/prisma.module';
import { RedisModule } from './infra/redis/redis.module';
import { RedisService } from './infra/redis/redis.service';
import { BullConfigModule } from './infra/bull/bull.module';
import { AuthModule } from './modules/auth/infrastructure/auth.module';
import { UsersModule } from './modules/users/infrastructure/users.module';
import { AuditModule } from './modules/audit/infrastructure/audit.module';
import { OfficesModule } from './modules/offices/infrastructure/offices.module';
import { CompaniesModule } from './modules/companies/infrastructure/companies.module';
import { ClientsModule } from './modules/clients/infrastructure/clients.module';
import { ProductsModule } from './modules/products/infrastructure/products.module';
import { ServiceItemsModule } from './modules/service-items/infrastructure/service-items.module';
import { InvoicesModule } from './modules/invoices/infrastructure/invoices.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),
    // RedisModule, // TODO: Fix Vercel serverless Redis connections
    // BullConfigModule, // TODO: Re-enable after fixing Vercel serverless Redis connections
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 60 }],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AuditModule,
    OfficesModule,
    CompaniesModule,
    ClientsModule,
    ProductsModule,
    ServiceItemsModule,
    InvoicesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor },
  ],
})
export class AppModule {}
