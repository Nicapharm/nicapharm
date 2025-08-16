'use client';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface RecuVentePDFProps {
  lignes: any[];
  selectedClient: any;
  totalVente: number;
  pharmacie: any;
  type?: 'recu' | 'proformat'; // ← ajouter type
}

const generateAndDownloadPDF = async ({
  lignes,
  selectedClient,
  totalVente,
  pharmacie,
  type = 'recu', // ← valeur par défaut : reçu
}: RecuVentePDFProps) => {
  const margeTop = 5;
  const margeBottom = 10;
  const headerHeight = 40;
  const footerHeight = 30;

  let contenuHauteur = 0;
  lignes.forEach((ligne) => {
    if (ligne.produit) {
      const produitNom = ligne.produit.nom_medicament;
      const docTest = new jsPDF({ unit: 'mm' });
      const split = docTest.splitTextToSize(produitNom, 32);
      const blocHeight = split.length * 4 + 2;
      contenuHauteur += blocHeight;
    }
  });

  const totalHeight = margeTop + headerHeight + contenuHauteur + footerHeight + 40;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, totalHeight] });

  let yPos = margeTop;

  // === En-tête pharmacie ===
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pharmacie?.nom_pharm || 'N/A'}`, 5, yPos);
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  doc.text(`RCCM: ${pharmacie?.rccm || 'N/A'}`, 5, yPos);
  yPos += 4;
  doc.text(`IDNAT: ${pharmacie?.idnat || 'N/A'}`, 5, yPos);
  yPos += 4;
  doc.text(`NI: ${pharmacie?.ni || 'N/A'}`, 5, yPos);
  yPos += 4;

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1)
    .toString().padStart(2, '0')}/${today.getFullYear()}`;

  doc.text(`${pharmacie?.telephone || 'N/A'}`, 5, yPos);
  doc.text(`Date: ${formattedDate}`, 75, yPos, { align: 'right' });

  yPos += 4;
  doc.setLineWidth(0.2);
  doc.line(5, yPos, 75, yPos);
  yPos += 3;

  // === Numéro aléatoire ===
  const randomId = Math.random().toString(36).substring(2, 7).toUpperCase(); // ex: 9OLMZ
  const numero = (type === 'recu' ? 'REC' : 'PRO') + '-' + randomId;

  // === Titre dynamique ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const titre = type === 'recu' ? 'Reçu de Paiement' : 'Facture Proformat';
  doc.text(`${titre} n° ${numero}`, 40, yPos, { align: 'center' });
  yPos += 6;

  // === Client ===
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Client: ${selectedClient?.nom_complet || 'Non spécifié'}`, 5, yPos);
  yPos += 4;
  doc.line(5, yPos, 75, yPos);
  yPos += 3;

  // === Tableau produits ===
  doc.setFont('helvetica', 'bold');
  doc.text('Produit', 5, yPos);
  doc.text('Qté', 43, yPos, { align: 'center' });
  doc.text('Montant', 75, yPos, { align: 'right' });
  yPos += 4;

  doc.setFont('helvetica', 'normal');
  lignes.forEach((ligne) => {
    if (ligne.produit) {
      const nomProduit = ligne.produit.nom_medicament;
      const produitSplit = doc.splitTextToSize(nomProduit, 32);
      const lineHeight = 4;
      const blocHeight = produitSplit.length * lineHeight;
      const centerOffset = (blocHeight / 2) - (lineHeight / 2);

      doc.text(produitSplit, 5, yPos);
      doc.text(`${ligne.quantite}`, 43, yPos + centerOffset, { align: 'center' });
      doc.text(`${ligne.prix_unitaire} Fc`, 75, yPos + centerOffset, { align: 'right' });

      yPos += blocHeight + 2;
    }
  });

  // === Total ===
  yPos += 2;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Montant Total: ${totalVente.toFixed(2)} Fc`, 5, yPos);

  const tauxDollar = 2900;
  const totalUSD = (totalVente / tauxDollar).toFixed(2);
  yPos += 5;
  doc.text(`Soit : $${totalUSD} USD`, 5, yPos);

  // === Remerciement ===
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci pour votre achat !', 40, yPos, { align: 'center' });

  // === QR Code ===
  yPos += 10;
  const qrData = `${titre} ${numero} | ${selectedClient?.nom_complet || 'Client'} | Total: ${totalVente} Fc`;
  const qrDataUrl = await QRCode.toDataURL(qrData);
  doc.addImage(qrDataUrl, 'PNG', 30, yPos, 20, 20);

  doc.output('dataurlnewwindow');
};

export default generateAndDownloadPDF;
