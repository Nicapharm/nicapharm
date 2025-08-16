'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  userFullName: string;
  profilePictureUrl?: string;
  role: string;
}

const HeaderAdmin = ({ userFullName, profilePictureUrl, role }: HeaderProps) => {
  return (
    <header className="bg-white dark:bg-zinc-900 shadow-md py-4 px-6 flex items-center justify-between">
      {/* Titre du Dashboard */}
      <h1 className="text-2xl font-bold text-[#006B5D]">Tableau de Bord ({role})</h1>

      {/* Informations Utilisateur */}
      <div className="flex items-center space-x-4">
        {profilePictureUrl ? (
          <Image
            src={profilePictureUrl}
            alt={`${userFullName}'s Profile`}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-zinc-700 flex items-center justify-center">
            <span className="text-lg font-bold">{userFullName.charAt(0)}</span>
          </div>
        )}
        <span className="text-gray-600 dark:text-gray-300">{userFullName}</span>

        {/* Bouton DéconnexYion */}
        <Link
          href="/login"
          className="btn btn-danger py-2 px-4 rounded-md bg-red-500 text-white hover:bg-red-600"
        >
          Déconnexion
        </Link>
      </div>
    </header>
  );
};

export default HeaderAdmin;