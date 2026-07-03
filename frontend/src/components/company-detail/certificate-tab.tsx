'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadCertificateSchema, type UploadCertificateFormValues } from '@/schemas/company.schema';
import type { Company } from '@/types/auth';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',').pop() ?? '');
    };
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo'));
    reader.readAsDataURL(file);
  });
}

export function CertificateTab({ company }: { company: Company }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UploadCertificateFormValues>({ resolver: zodResolver(uploadCertificateSchema) });

  async function onSubmit(values: UploadCertificateFormValues) {
    setServerError(null);

    if (!file) {
      setServerError('Selecione o arquivo do certificado (.pfx/.p12)');
      return;
    }

    const fileBase64 = await readFileAsBase64(file);

    const response = await fetch(`/bff/companies/${company.id}/certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileBase64, password: values.password }),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      setServerError(body?.message ?? 'Não foi possível enviar o certificado');
      return;
    }

    setFile(null);
    reset();
    router.refresh();
  }

  async function handleRemove() {
    setIsRemoving(true);
    setServerError(null);

    const response = await fetch(`/bff/companies/${company.id}/certificate`, {
      method: 'DELETE',
    });

    setIsRemoving(false);

    if (!response.ok) {
      setServerError('Não foi possível remover o certificado');
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <div className="rounded-lg border px-3 py-3 text-sm">
        {company.certificate ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p>Certificado enviado</p>
              <p className="text-xs text-muted-foreground">
                Enviado em {new Date(company.certificate.uploadedAt).toLocaleString('pt-BR')}
                {company.certificate.validoAte &&
                  ` · válido até ${new Date(company.certificate.validoAte).toLocaleDateString('pt-BR')}`}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              {isRemoving ? 'Removendo...' : 'Remover'}
            </Button>
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum certificado A1 enviado ainda.</p>
        )}
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="certificateFile">Arquivo do certificado (.pfx/.p12)</Label>
          <Input
            id="certificateFile"
            type="file"
            accept=".pfx,.p12"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="certificatePassword">Senha do certificado</Label>
          <Input id="certificatePassword" type="password" {...register('password')} />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" disabled={isSubmitting} className="self-start">
          {isSubmitting ? 'Enviando...' : 'Enviar certificado'}
        </Button>
      </form>
    </div>
  );
}
