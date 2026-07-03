function calculateCheckDigit(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function isValidCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split('').map(Number);
  const firstWeights = [10, 9, 8, 7, 6, 5, 4, 3, 2];
  const secondWeights = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

  const firstCheckDigit = calculateCheckDigit(digits.slice(0, 9), firstWeights);
  if (firstCheckDigit !== digits[9]) {
    return false;
  }

  const secondCheckDigit = calculateCheckDigit(digits.slice(0, 10), secondWeights);
  return secondCheckDigit === digits[10];
}

export class Cpf {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(rawValue: string): Cpf {
    const digitsOnly = rawValue.replace(/\D/g, '');

    if (!isValidCpf(digitsOnly)) {
      throw new Error(`CPF inválido: ${rawValue}`);
    }

    return new Cpf(digitsOnly);
  }

  toString(): string {
    return this.value;
  }

  format(): string {
    return this.value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }

  equals(other: Cpf): boolean {
    return this.value === other.value;
  }
}
