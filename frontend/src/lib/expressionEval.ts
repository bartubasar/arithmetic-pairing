const MAX_RESULT = 99;

/** Backend ile uyumlu: yalnızca +, -, * ve tam sayılar (sonuç ≤ 99). */
export function evaluateExpression(expression: string): number {
  const normalized = expression.trim().replace(/\s/g, "");
  if (!normalized) {
    throw new Error("İfade boş olamaz.");
  }
  if (!/^[0-9+\-*/]+$/.test(normalized)) {
    throw new Error("Geçersiz karakter.");
  }

  let result: number;
  if (/^\d+$/.test(normalized)) {
    result = Number(normalized);
  } else {
    const match = normalized.match(/^(\d+)([\+\-\*])(\d+)$/);
    if (!match) {
      throw new Error("Geçersiz ifade.");
    }
    const left = Number(match[1]);
    const op = match[2];
    const right = Number(match[3]);
    switch (op) {
      case "+":
        result = left + right;
        break;
      case "-":
        result = left - right;
        break;
      case "*":
        result = left * right;
        break;
      default:
        throw new Error("Geçersiz operatör.");
    }
  }

  if (result < 0 || result > MAX_RESULT) {
    throw new Error(`Sonuç 0–${MAX_RESULT} aralığında olmalı.`);
  }
  return result;
}

export function expressionsMatch(a: string, b: string): boolean {
  return evaluateExpression(a) === evaluateExpression(b);
}
