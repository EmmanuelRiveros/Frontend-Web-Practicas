export function secretoJwt(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32 || secreto.startsWith('EJEMPLO_')) {
    throw new Error('Configura JWT_SECRET con un valor aleatorio de al menos 32 caracteres.');
  }
  return secreto;
}
