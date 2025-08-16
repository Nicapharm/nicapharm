import { jsPDF } from 'jspdf';

export interface PDFData {
  lignes: {
    produit: {
      nom_medicament: string;
      prix_vente: number;
    } | null;
    quantite: number;
    prix_unitaire: number;
    total: number;
  }[];
  client: {
    nom_complet: string;
    telephone: string;
  } | null;
  total: number;
  pharmacieInfo: {
    nom: string;
    adresse: string;
    telephone: string;
  };
}

export const generateRecuPDF = (data: PDFData) => {
  const doc = new jsPDF();
  
  // En-tête avec style
  doc.setFillColor(40, 102, 191);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(data.pharmacieInfo.nom, 105, 15, { align: 'center' });
  
  // Informations pharmacie
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(data.pharmacieInfo.adresse, 15, 40);
  doc.text(`Tél: ${data.pharmacieInfo.telephone}`, 15, 45);
  
  // Informations client
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('RECU DE VENTE', 105, 35, { align: 'center' });
  doc.setFont(undefined, 'normal');
  
  doc.text(`Client: ${data.client?.nom_complet || 'Non spécifié'}`, 15, 55);
  doc.text(`Téléphone: ${data.client?.telephone || 'N/A'}`, 15, 60);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 65);
  
  // Tableau des produits
  const startY = 75;
  let yPos = startY;
  
  // En-tête du tableau
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos, 180, 10, 'F');
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Produit', 20, yPos + 7);
  doc.text('Qté', 120, yPos + 7);
  doc.text('Prix Unitaire', 140, yPos + 7);
  doc.text('Total', 170, yPos + 7);
  
  yPos += 12;
  
  // Lignes des produits
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  
  data.lignes.forEach((ligne) => {
    if (ligne.produit) {
      // Ligne produit
      doc.text(ligne.produit.nom_medicament, 20, yPos + 7);
      doc.text(ligne.quantite.toString(), 120, yPos + 7);
      doc.text(`${ligne.prix_unitaire.toFixed(2)} €`, 140, yPos + 7);
      doc.text(`${ligne.total.toFixed(2)} €`, 170, yPos + 7);
      
      // Ligne séparatrice
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos + 10, 195, yPos + 10);
      yPos += 12;
    }
  });
  
  // Total
  yPos += 10;
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', 150, yPos + 7);
  doc.text(`${data.total.toFixed(2)} €`, 170, yPos + 7);
  
  // Pied de page
  yPos += 20;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Merci pour votre confiance !', 105, yPos, { align: 'center' });
  doc.text('Les médicaments doivent être tenus hors de portée des enfants', 105, yPos + 5, { align: 'center' });
  
  // Ouvrir le PDF dans un nouvel onglet
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
  
  // Nettoyer l'URL après 1 minute
  setTimeout(() => URL.revokeObjectURL(pdfUrl), 60000);
};