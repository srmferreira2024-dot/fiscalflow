import { notFound } from 'next/navigation';
import { backendFetch } from '@/lib/backend-fetch';
import { CompanyDetailTabs } from '@/components/company-detail/company-detail-tabs';
import type { Company } from '@/types/auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompanyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const response = await backendFetch(`/companies/${id}`);

  if (!response.ok) {
    notFound();
  }

  const company = (await response.json()) as Company;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{company.nomeFantasia ?? company.razaoSocial}</h1>
        <p className="text-sm text-muted-foreground">{company.cnpj}</p>
      </div>
      <CompanyDetailTabs company={company} />
    </div>
  );
}
