'use client';

import React from 'react';
import { Sidebar } from '@/design-system/components/Sidebar';
import { Navbar } from '@/design-system/components/Navbar';
import { KPICard } from '@/design-system/components/KPICard';
import { Timeline } from '@/design-system/components/Timeline';
import { Card, CardHeader, CardTitle, CardBody } from '@/design-system/components/Card';
import { FileText, Users, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * DASHBOARD PAGE - Executivo Premium
 *
 * Layout:
 * - Sidebar (navegação)
 * - Navbar (topo)
 * - Main content (KPIs + Gráficos + Timeline)
 */

// Mock data
const mockKPIs = [
  {
    title: 'Notas Emitidas',
    value: '1.234',
    unit: 'notas',
    variant: 'primary' as const,
    icon: <FileText size={20} />,
    trend: { value: 12, direction: 'up' as const, period: 'vs mês' },
    subtext: 'Últimos 30 dias',
  },
  {
    title: 'Receita Total',
    value: 'R$ 45.680',
    variant: 'success' as const,
    icon: <TrendingUp size={20} />,
    trend: { value: 8, direction: 'up' as const, period: 'vs mês' },
    subtext: 'Faturado',
  },
  {
    title: 'Clientes Ativos',
    value: '342',
    unit: 'clientes',
    variant: 'info' as const,
    icon: <Users size={20} />,
    trend: { value: 5, direction: 'up' as const, period: 'vs mês' },
    subtext: 'Crescimento',
  },
  {
    title: 'Alertas',
    value: '5',
    unit: 'pendentes',
    variant: 'warning' as const,
    icon: <AlertCircle size={20} />,
    trend: { value: 2, direction: 'down' as const, period: 'vs semana' },
    subtext: 'Rejeições',
  },
];

const mockTimeline = [
  {
    id: '1',
    title: 'Nota NF 001234 autorizada',
    description: 'Empresa ABC Ltda',
    timestamp: new Date(Date.now() - 10 * 60000),
    color: 'success' as const,
  },
  {
    id: '2',
    title: 'Nova empresa cadastrada',
    description: 'Contabilidade XYZ',
    timestamp: new Date(Date.now() - 2 * 3600000),
    color: 'primary' as const,
  },
  {
    id: '3',
    title: 'Nota NF 001233 rejeitada',
    description: 'Dados fiscais inválidos',
    timestamp: new Date(Date.now() - 5 * 3600000),
    color: 'error' as const,
  },
  {
    id: '4',
    title: 'Novo usuário convidado',
    description: 'contador@empresa.com',
    timestamp: new Date(Date.now() - 1 * 86400000),
    color: 'info' as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          title="Dashboard"
          subtitle="Bem-vindo ao seu painel executivo"
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 space-y-8">
            {/* KPI Section */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockKPIs.map((kpi, i) => (
                  <KPICard key={i} {...kpi} />
                ))}
              </div>
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Emissões por dia */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Emissões por Dia</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-neutral-400">
                    📊 Gráfico (Recharts - próxima fase)
                  </div>
                </CardBody>
              </Card>

              {/* Status distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Status das Notas</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="h-64 flex items-center justify-center text-neutral-400">
                    🥧 Gráfico (Recharts - próxima fase)
                  </div>
                </CardBody>
              </Card>
            </section>

            {/* Timeline Section */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardBody>
                  <Timeline items={mockTimeline} />
                </CardBody>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
