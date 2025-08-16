// lib/api.ts

/**
 * Récupère les données exportées depuis l'API Django
 */
export async function fetchExportedData(): Promise<any> {
  const response = await fetch('/api/export-pharma', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Échec de la récupération des données');
  }

  return await response.json();
}