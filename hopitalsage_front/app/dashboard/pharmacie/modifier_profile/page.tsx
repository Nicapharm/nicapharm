'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
//import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import Input from '@/components/Input';

export default function UpdateProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(''); // pas undefined

  const [user, setUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    profile_picture: null,
  });
  const [password, setPassword] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return router.push('/login');

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update-profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setUser({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          profile_picture: data.profile_picture,
        });
        setPreview(data.profile_picture);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture' && files?.[0]) {
      setUser(prev => ({ ...prev, profile_picture: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('first_name', user.first_name);
    formData.append('last_name', user.last_name);
    formData.append('email', user.email);
    if (password) formData.append('password', password);
    if (user.profile_picture instanceof File) {
      formData.append('profile_picture', user.profile_picture);
    }

    const token = localStorage.getItem('accessToken');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/update-profile/`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      toast.success('Profil mis à jour avec succès');
    } else {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) return <div className="text-center py-10">Chargement du profil...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700 dark:text-white">Modifier mon profil</h2>

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-28 h-28 rounded-full object-cover mb-4 border"
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Prénom"
          name="first_name"
          value={user.first_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Nom"
          name="last_name"
          value={user.last_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleChange}
        />
        <Input
          label="Mot de passe (laisser vide si inchangé)"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Photo de profil"
          name="profile_picture"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <Button type="submit" className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
          Mettre à jour
        </Button>
      </form>
    </div>
  );
} 