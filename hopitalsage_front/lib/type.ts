// types.ts
export interface Eleve {
    id: number;
    nom_elev: string;
    postnom_elev: string;
    prenom_elev: string;
    option_elev: string;
    classe_elev: string;
    matricule_elev: string;
    adresses: string;
    sexe: string;
  }
  
  export interface Ecole {
    id: number;
    nom: string;
    adresse: string;
    telephone: string | null;
  }
  