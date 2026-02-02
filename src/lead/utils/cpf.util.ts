export function isValidCPF(cpf: string): boolean {
  if (!cpf) return false;

  // Mantém só dígitos
  const digits = cpf.replace(/\D/g, '');

  // Tamanho precisa ser 11
  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas (11111111111, 00000000000, etc.)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcCheckDigit = (base: string, factor: number): number => {
    let total = 0;
    for (let i = 0; i < base.length; i += 1) {
      total += parseInt(base[i], 10) * factor;
      factor -= 1;
    }
    const rest = total % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const baseNine = digits.substring(0, 9);
  const firstCheck = calcCheckDigit(baseNine, 10);
  const baseTen = baseNine + firstCheck.toString();
  const secondCheck = calcCheckDigit(baseTen, 11);

  const expected = baseTen + secondCheck.toString();
  return digits === expected;
}
