export function formatDateToDDMMYYYY(fechaISO: string): string {
  const [year, month, day] = fechaISO.split("-");
  return `${day}/${month}/${year}`;
}
