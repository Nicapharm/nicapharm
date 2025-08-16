'use client';

import React, { useEffect, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Image,
} from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

interface ApercuBonCommandeProps {
  fabricant: any;
  lignes: any[];
}

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  logoBlock: {
    marginRight: 15,
    alignItems: 'flex-start',
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 3,
  },
  generatedBy: {
    fontSize: 8,
    color: '#555',
  },
  phoneNumber: {
    fontSize: 8,
    color: '#555',
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    textTransform: 'uppercase',
  },
  infoSection: {
    marginTop: 5,
    marginBottom: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  pharmacyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  table: { width: '100%' },
  row: { flexDirection: 'row' },
  cell: {
    padding: 5,
    fontSize: 10,
    borderBottom: '1px solid #000',
    width: '25%',
  },
  total: { marginTop: 20, textAlign: 'right', fontSize: 12 },
});

const BonCommandePDF = ({
  fabricant,
  lignes,
  date,
  nomPharmacie,
}: {
  fabricant: any;
  lignes: any[];
  date: string;
  nomPharmacie: string;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header (Logo + Généré par) */}
      <View style={styles.header}>
        <View style={styles.logoBlock}>
          <Image src="/nicapharm.png" style={styles.logo} />
          <Text style={styles.generatedBy}>Généré par NICAPHARM_soft</Text>
          <Text style={styles.phoneNumber}>+243 856 693 433</Text>
        </View>
      </View>

      {/* Titre */}
      <Text style={styles.title}>Bon de COMMANDE</Text>

      {/* Infos pharmacie + fabricant + date */}
      <View style={styles.infoSection}>
        <Text style={styles.pharmacyName}>PHARMACIE : {nomPharmacie}</Text>
        <Text>Firme pharmaceutique : {fabricant.nom}</Text>
        <Text>Téléphone  : {fabricant.pays_origine}</Text>
        <Text>Date : {date}</Text>
      </View>

      {/* Tableau produits */}
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cell}>Produit</Text>
          <Text style={styles.cell}>Prix unitaire</Text>
          <Text style={styles.cell}>Quantité</Text>
          <Text style={styles.cell}>Montant</Text>
        </View>
        {lignes.map((ligne, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.cell}>{ligne.nom}</Text>
            <Text style={styles.cell}>{Number(ligne.prix_achat).toFixed(2)} Fc</Text>
            <Text style={styles.cell}>{ligne.quantite}</Text>
            <Text style={styles.cell}>
              {(ligne.quantite * ligne.prix_achat).toFixed(2)} Fc
            </Text>
          </View>
        ))}
      </View>

      {/* Total */}
      <Text style={styles.total}>
        Total : {lignes.reduce((acc, l) => acc + l.quantite * l.prix_achat, 0).toFixed(2)} Fc
      </Text>
    </Page>
  </Document>
);

// Composant principal
export default function ApercuBonCommande({ fabricant, lignes }: ApercuBonCommandeProps) {
  const [nomPharmacie, setNomPharmacie] = useState<string>('Chargement...');
  const date = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('Token d\'authentification introuvable');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

        const data = await response.json();
        setNomPharmacie(data.pharmacie?.nom_pharm || 'Nom pharmacie indisponible');
      } catch (error) {
        console.error('Erreur utilisateur :', error);
        setNomPharmacie('Pharmacie inconnue');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (nomPharmacie === 'Chargement...') return;

    const generateAndDownloadPDF = async () => {
      const doc = (
        <BonCommandePDF
          fabricant={fabricant}
          lignes={lignes}
          date={date}
          nomPharmacie={nomPharmacie}
        />
      );

      const blob = await pdf(doc).toBlob();
      saveAs(blob, `Bon_Commande_${fabricant.nom}_${date}.pdf`);
    };

    generateAndDownloadPDF();
  }, [fabricant, lignes, nomPharmacie, date]);

  return (
    <div className="text-green-600 font-semibold p-4">
      ✅ Bon de commande généré et téléchargé automatiquement.
    </div>
  );
}
