export const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
  const response = await fetch(imageUrl, { mode: 'cors' });

  if (!response.ok) {
    throw new Error(`Erreur de téléchargement de l’image: ${response.status}`);
  }

  const blob = await response.blob();

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
