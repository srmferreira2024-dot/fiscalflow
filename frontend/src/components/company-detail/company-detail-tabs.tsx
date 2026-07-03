'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FiscalDataTab } from './fiscal-data-tab';
import { CertificateTab } from './certificate-tab';
import { ClientsTab } from './clients-tab';
import { ProductsTab } from './products-tab';
import { ServicesTab } from './services-tab';
import type { Company } from '@/types/auth';

export function CompanyDetailTabs({ company }: { company: Company }) {
  return (
    <Tabs defaultValue="fiscal">
      <TabsList>
        <TabsTrigger value="fiscal">Dados fiscais</TabsTrigger>
        <TabsTrigger value="certificate">Certificado</TabsTrigger>
        <TabsTrigger value="clients">Clientes</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
        <TabsTrigger value="services">Serviços</TabsTrigger>
      </TabsList>

      <TabsContent value="fiscal" className="pt-4">
        <FiscalDataTab company={company} />
      </TabsContent>
      <TabsContent value="certificate" className="pt-4">
        <CertificateTab company={company} />
      </TabsContent>
      <TabsContent value="clients" className="pt-4">
        <ClientsTab companyId={company.id} />
      </TabsContent>
      <TabsContent value="products" className="pt-4">
        <ProductsTab companyId={company.id} />
      </TabsContent>
      <TabsContent value="services" className="pt-4">
        <ServicesTab companyId={company.id} />
      </TabsContent>
    </Tabs>
  );
}
