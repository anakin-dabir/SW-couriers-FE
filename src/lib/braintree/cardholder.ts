export function splitCardholderName(fullName: string): { givenName: string; surname: string } {
  const t = fullName.trim();
  const space = t.indexOf(' ');
  if (space === -1) {
    return { givenName: t, surname: t };
  }
  return {
    givenName: t.slice(0, space),
    surname: t.slice(space + 1).trim() || t.slice(0, space),
  };
}
