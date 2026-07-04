# 🎨 FiscalFlow Design System

## Visão Geral

Design System premium para aplicação SaaS FiscalFlow.

**Filosofia:** Confiança + Limpeza + Premium

**Paleta:**
- Azul Marinho (#0B1F3A) - Primária
- Branco (#FFFFFF) - Secundária  
- Dourado (#C9A227) - Destaque
- Cinzas Neutros - Hierarquia

---

## 📁 Estrutura

```
design-system/
├── tokens/
│   ├── colors.ts        # Paleta completa (light + dark)
│   ├── typography.ts    # Escala de tipografia
│   ├── effects.ts       # Shadows, borders, spacing, transitions
│   └── index.ts         # Exporta todos os tokens
├── components/
│   ├── Button.tsx       # Botão reutilizável
│   ├── Input.tsx        # Campo de entrada
│   ├── Card.tsx         # Container elegante
│   ├── Badge.tsx        # Rótulos/tags
│   └── index.ts         # Exporta componentes
├── theme/
│   └── ThemeProvider.tsx # Light/Dark mode
└── README.md           # Este arquivo
```

---

## 🎯 Tokens

### Cores

```typescript
import { colors } from '@/design-system/tokens'

// Paleta completa (50-900)
colors.primary[500]     // #2472D7
colors.primary[900]     // #0B1F3A

// Ou use aliases
import { colorAliases } from '@/design-system/tokens'
colorAliases.light.bg       // Branco
colorAliases.dark.bg        // Escuro
colorAliases.dark.text      // Texto escuro
```

### Tipografia

```typescript
import { typography, fontWeights } from '@/design-system/tokens'

typography.headlines.h1    // 32px, bold
typography.body.base       // 14px, regular
typography.labels.base     // 13px, medium
typography.code.base       // Monospace
```

### Espaçamentos

```typescript
import { spacing } from '@/design-system/tokens'

spacing[0]   // 0px
spacing[4]   // 16px
spacing[8]   // 32px
spacing[16]  // 64px
```

### Sombras

```typescript
import { shadows } from '@/design-system/tokens'

shadows.xs     // Sutil
shadows.base   // Default
shadows.md     // Elevado
shadows.lg     // Alto
```

### Transições

```typescript
import { transitions } from '@/design-system/tokens'

transitions.fast.duration   // 150ms
transitions.base.duration   // 200ms
transitions.normal.duration // 300ms
transitions.base.timing     // cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🔘 Componentes

### Button

```typescript
import { Button } from '@/design-system'

// Variantes: solid, outline, ghost, danger, success, warning, accent
<Button variant="solid">Clique aqui</Button>
<Button variant="outline" size="lg">Secundário</Button>
<Button variant="ghost" disabled>Desabilitado</Button>

// Com ícone
<Button icon={<Plus size={18} />} iconPosition="left">
  Novo item
</Button>

// Loading
<Button isLoading>Processando...</Button>
```

### Input

```typescript
import { Input } from '@/design-system'

// Básico
<Input placeholder="seu@email.com" type="email" />

// Com label e descrição
<Input
  label="Senha"
  type="password"
  description="Mínimo 8 caracteres"
/>

// Com erro
<Input
  label="Email"
  type="email"
  error="Email inválido"
/>

// Com sucesso
<Input
  label="Email"
  type="email"
  success
/>

// Com ícone
<Input
  icon={<Search size={18} />}
  iconPosition="left"
  placeholder="Buscar..."
/>
```

### Card

```typescript
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/design-system'

// Simples
<Card>
  <p>Conteúdo</p>
</Card>

// Com subcomponentes
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descrição</CardDescription>
  </CardHeader>
  <CardBody>
    Conteúdo principal
  </CardBody>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>

// Variantes: elevated (padrão), outlined, filled
<Card variant="outlined">
  <p>Com borda apenas</p>
</Card>

// Interativo
<Card interactive onClick={() => console.log('clicked')}>
  Clique em mim
</Card>
```

### Badge

```typescript
import { Badge } from '@/design-system'

// Variantes: default, success, warning, error, info, neutral, accent
<Badge variant="success">Autorizada</Badge>
<Badge variant="warning" dot>Pendente</Badge>
<Badge variant="error" icon={<AlertCircle size={14} />}>Erro</Badge>

// Tamanhos: sm, base, lg
<Badge size="lg">Grande</Badge>

// Estilos: solid (padrão), outline
<Badge style="outline">Com borda</Badge>
```

---

## 🌓 Tema (Light/Dark Mode)

```typescript
// Em app/layout.tsx ou root layout
import { ThemeProvider } from '@/design-system'

export default function RootLayout({ children }) {
  return (
    <ThemeProvider defaultTheme="system">
      {children}
    </ThemeProvider>
  )
}
```

```typescript
// Em componentes
import { useTheme } from '@/design-system'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

---

## 📋 Princípios de Design

### Minimalismo
- Muito espaço em branco (50% da tela)
- Sem poluição visual
- Componentes enxutos

### Premium
- Cores sofisticadas
- Animações discretas
- Sombras elegantes
- Arredondamentos suaves

### Acessibilidade
- Contraste WCAG AA
- Navegação por teclado
- ARIA labels
- Focus visible

### Performance
- Sem animações bloqueantes
- Lazy loading de imagens
- Code splitting
- Otimizações CSS

---

## 🚀 Como Usar

### Import rápido

```typescript
// Tokens
import { colors, spacing, shadows } from '@/design-system/tokens'

// Componentes
import { Button, Input, Card, Badge } from '@/design-system/components'

// Tema
import { useTheme } from '@/design-system'
```

### Em Tailwind CSS

Tokens já funcionam com classes Tailwind:

```tsx
<div className={`bg-primary-500 text-white p-6 rounded-lg shadow-md`}>
  Conteúdo
</div>
```

---

## 📚 Próximos Componentes

- [ ] Sidebar
- [ ] Navbar
- [ ] Modal
- [ ] Drawer
- [ ] Dropdown
- [ ] Tabs
- [ ] DataTable
- [ ] Form validation
- [ ] Toast/Notifications
- [ ] Charts (Recharts integration)
- [ ] Loading states
- [ ] Empty states
- [ ] Error pages

---

## 🛠️ Desenvolvimento

Adicione novos componentes em `design-system/components/`:

```typescript
// NomeDoComponente.tsx
'use client'

import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const variants = cva(/* styles */)

interface Props extends React.HTMLAttributes<HTMLElement> {
  // suas props
}

export const Component = React.forwardRef<HTMLElement, Props>(
  ({ /* destructure props */, ...props }, ref) => (
    <element ref={ref} className={cn(variants(), className)} {...props} />
  )
)

Component.displayName = 'Component'
export { Component, variants }
```

1. Sempre use `React.forwardRef`
2. Use `cva` para variantes
3. Use `cn` para mergear classNames
4. Exporte interfaces e variants
5. Adicione `displayName`
6. Exporte em `components/index.ts`

---

**Versão:** 1.0.0  
**Última atualização:** 2026-07-04  
**Mantido por:** FiscalFlow Design Team
