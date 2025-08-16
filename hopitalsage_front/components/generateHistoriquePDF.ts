// @/components/generateHistoriquePDF.ts
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface VenteLigne {
  produit: string;
  quantite: number;
  prix_unitaire: string;
  total: string;
  stock_restant: number;
}

interface Vente {
  id: number;
  date_vente: string;
  utilisateur: string | null;
  client: string | null;
  montant_total: string;
  lignes: VenteLigne[];
}

interface Depense {
  id: number;
  date_depense: string;
  utilisateur: string | null;
  montant: string;
  description: string;
  categorie: string;
}

interface PharmacieData {
  nom_pharm: string;
  ville_pharm: string;
  commune_pharm: string;
  adresse_pharm: string;
  logo_pharm: string | null;
}

interface HistoriquePDFData {
  ventes: Vente[];
  depenses: Depense[];
  pharmacie: PharmacieData;
  dateDebut?: string;
  dateFin?: string;
  totalVentes: number;
  totalDepenses: number;
  solde: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR');
};

export default function generateHistoriquePDF(data: HistoriquePDFData) {
  const doc = new jsPDF();

  const {
    ventes,
    depenses,
    pharmacie,
    dateDebut,
    dateFin,
    totalVentes,
    totalDepenses,
    solde,
  } = data;

  let y = 20;

  // --- En-tête ---
  if (pharmacie.logo_pharm) {
    const img = new Image();
    img.src = pharmacie.logo_pharm;
    img.onload = () => {
      doc.addImage(img, 'PNG', 14, 10, 30, 30);
      y = 45;
      addContent();
    };
  } else {
    y = 45;
    addContent();
  }

  function addContent() {
    // Titre
    doc.setFontSize(18);
    doc.text(`Historique des Ventes et Dépenses`, 105, y, { align: 'center' });
    y += 10;

    // Informations pharmacie
    doc.setFontSize(11);
    doc.text(`${pharmacie.nom_pharm}`, 14, y);
    y += 6;
    doc.text(`📍 ${pharmacie.adresse_pharm}, ${pharmacie.commune_pharm}, ${pharmacie.ville_pharm}`, 14, y);
    y += 10;

    // Période
    if (dateDebut || dateFin) {
      const periode = `Période : ${dateDebut ? formatDate(dateDebut) : 'Début'} → ${dateFin ? formatDate(dateFin) : 'Aujourd’hui'}`;
      doc.setFontSize(12);
      doc.text(periode, 14, y);
      y += 10;
    }

    // Totaux
    doc.setFontSize(12);
    doc.text(`Total des Ventes : ${totalVentes.toLocaleString('fr-FR')} Fc`, 14, y);
    y += 6;
    doc.text(`Total des Dépenses : ${totalDepenses.toLocaleString('fr-FR')} Fc`, 14, y);
    y += 6;
    doc.text(`Solde : ${solde.toLocaleString('fr-FR')} Fc`, 14, y);
    y += 10;

    // --- Ventes ---
    if (ventes.length > 0) {
      (doc as any).autoTable({
        startY: y,
        head: [['Date', 'Client', 'Utilisateur', 'Montant Total']],
        body: ventes.map((v) => [
          formatDateTime(v.date_vente),
          v.client || 'N/A',
          v.utilisateur || 'Inconnu',
          `${parseFloat(v.montant_total).toLocaleString('fr-FR')} Fc`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        margin: { left: 14, right: 14 },
      });

      y = (doc as any).lastAutoTable.finalY + 10;

      // Détail des lignes de vente
      ventes.forEach((vente) => {
        doc.setFontSize(10);
        doc.text(`Vente du ${formatDateTime(vente.date_vente)} - Client: ${vente.client || 'N/A'}`, 14, y);
        y += 5;

        (doc as any).autoTable({
          startY: y,
          head: [['Produit', 'Qté', 'P.U', 'Total', 'Stock restant']],
          body: vente.lignes.map((ligne) => [
            ligne.produit,
            ligne.quantite.toString(),
            `${ligne.prix_unitaire} Fc`,
            `${ligne.total} Fc`,
            ligne.stock_restant.toString(),
          ]),
          theme: 'grid',
          headStyles: { fillColor: [52, 73, 94] },
          margin: { left: 20, right: 14 },
          fontSize: 9,
        });

        y = (doc as any).lastAutoTable.finalY + 5;
      });
    }

    // --- Dépenses ---
    if (depenses.length > 0) {
      doc.addPage();
      y = 20;

      doc.setFontSize(16);
      doc.text('Dépenses', 14, y);
      y += 10;

      (doc as any).autoTable({
        startY: y,
        head: [['Date', 'Utilisateur', 'Catégorie', 'Description', 'Montant']],
        body: depenses.map((d) => [
          formatDateTime(d.date_depense),
          d.utilisateur || 'Inconnu',
          d.categorie,
          d.description || '–',
          `${d.montant} Fc`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [192, 57, 43] },
        margin: { left: 14, right: 14 },
      });
    }

    // --- Génération ---
    doc.save(`historique-${dateDebut || 'debut'}-${dateFin || 'fin'}.pdf`);
  }

  if (!pharmacie.logo_pharm) {
    addContent();
  }
}