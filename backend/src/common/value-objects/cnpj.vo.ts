function calculateCheckDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const digits = cnpj.split('').map(Number);
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 12), firstWeights);
  if (firstCheckDigit !== digits[12]) {
    return false;
  }

  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 13), secondWeights);
  return secondCheckDigit === digits[13];
}

export class Cnpj {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(rawValue: string): Cnpj {
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!isValidCnpj(digitsOnly)) {
      throw new Error(`CNPJ inválido: ${rawValue}`);
    }

    return new Cnpj(digitsOnly);
  }

  toString(): string {
    return this.value;
  }

  format(): string {
    return this.value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  equals(other: Cnpj): boolean {
    return this.value === other.value;
  }
}
