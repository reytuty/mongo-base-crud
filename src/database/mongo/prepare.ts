export function removerAcentos(str: string): string {
  return str
    .normalize("NFD") // Normaliza para decompor os caracteres acentuados em seus equivalentes não acentuados
    .replace(/[\u0300-\u036f]/g, ""); // Remove os caracteres diacríticos resultantes da normalização
}
export function stringToRegex(value: string | RegExp): string | RegExp {
  if (value instanceof RegExp) {
    return value;
  }
  value = removerAcentos(value).toLocaleLowerCase();
  const escapeRegExp = (str: string) =>
    str
      .replace(/[*+?^${}()|[\]\\]/g, "\\$&")
      .replace(".", ".?")
      .replace("-", "");

  const replaceLetters = (str: string) =>
    str
      .replace(/a/gi, "[aáãâàä]+")
      .replace(/e/gi, "[eéêèë]+")
      .replace(/i/gi, "[iíîìï]+")
      .replace(/o/gi, "[oóôõòö]+")
      .replace(/u/gi, "[uúûùü]+")
      .replace(/ +/, ".+?");

  // Função para substituir letras específicas por classes de caracteres
  const replaceSpecificLetters = (str: string) =>
    str
      .replace(/ç/gi, "[cçs]+")
      .replace(/ck/gi, "[ck]+")
      .replace(/f/gi, "(f|ph)+")
      .replace(/cs/gi, "(x|cs)+");

  // Função para substituir números escritos por expressões regulares equivalentes
  const replaceNumbers = (str: string) =>
    str
      .replace(/zero/gi, "(zero|0)")
      .replace(/um/gi, "(um|1)")
      .replace(/dois/gi, "(dois|2)")
      .replace(/três/gi, "(três|3)")
      .replace(/quatro/gi, "(quatro|4)")
      .replace(/cinco/gi, "(cinco|5)")
      .replace(/seis/gi, "(seis|6)")
      .replace(/sete/gi, "(sete|7)")
      .replace(/oito/gi, "(oito|8)")
      .replace(/nove/gi, "(nove|9)");

  // Transforma a string de entrada em uma expressão regular
  const regexStr = `.*${replaceNumbers(
    replaceSpecificLetters(replaceLetters(escapeRegExp(value)))
  )}.*`;
  return new RegExp(regexStr, "i");
}
