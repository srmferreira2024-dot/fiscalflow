'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Company, TaxRegime } from '@/types/auth';

const TAX_REGIME_LABEL: Record<TaxRegime, string> = {
  SIMPLES_NACIONAL: 'Simples Nacional',
  LUCRO_PRESUMIDO: 'Lucro Presumido',
  LUCRO_REAL: 'Lucro Real',
  MEI: 'MEI',
};

async function fetchCompanies(): Promise<Company[]> {
  const response = await fetch('/bff/companies');
  if (!response.ok) {
    throw new Error('Não foi possível carregar as empresas');
  }
  return response.json() as Promise<Company[]>;
}

export function CompaniesTable() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresas do escritório</CardTitle>
        <CardDescription>Empresas cadastradas para este tenant</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {isError && (
          <p className="text-sm text-destructive">Não foi possível carregar as empresas.</p>
        )}
        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
        )}
        {data && data.length > 0 && (
          <ul className="flex flex-col gap-2">
            {data.map((company) => (
              <Link
                key={company.id}
                href={`/dashboard/empresas/${company.id}`}
                className="flex flex-col gap-1 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col">
                  <span>{company.nomeFantasia ?? company.razaoSocial}</span>
                  {(company.municipio ?? company.uf) && (
                    <span className="text-xs text-muted-foreground">
                      {[company.municipio, company.uf].filter(Boolean).join(' / ')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start gap-0.5 sm:items-end">
                  <span className="text-muted-foreground">{company.cnpj}</span>
                  {company.regimeTributario && (
                    <span className="text-xs text-muted-foreground">
                      {TAX_REGIME_LABEL[company.regimeTributario]}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
