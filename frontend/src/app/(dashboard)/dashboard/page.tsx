import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { CompaniesTable } from '@/components/companies-table';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bem-vindo ao FiscalFlow</h1>
          <p className="text-sm text-muted-foreground">
            Empresas, Clientes, Produtos e Serviços do seu escritório.
          </p>
        </div>
        <Link href="/dashboard/empresas/nova" className={buttonVariants()}>
          Nova Empresa
        </Link>
      </div>
      <CompaniesTable />
    </div>
  );
}
