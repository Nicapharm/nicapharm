'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'next/navigation'

interface Client {
  id: number
  nom_complet: string
  telephone: string
}

interface Exam {
  id: number
  tension_arterielle: string
  examen_malaria: string
  date_exam: string
  remarques: string
}

export default function ExamensClient() {
  const { clientId } = useParams()
  const [client, setClient] = useState<Client | null>(null)
  const [newExam, setNewExam] = useState({
    tension_arterielle: '',
    examen_malaria: '',
    remarques: ''
  })
  const [examens, setExamens] = useState<Exam[]>([])

  useEffect(() => {
    // Chargement des données client et examens
    axios.get(`https://pharmacie-hefk.onrender.com/api/clients/${clientId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
    .then(response => setClient(response.data))
    
    axios.get(`https://pharmacie-hefk.onrender.com/api/exams/?client=${clientId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
    })
    .then(response => setExamens(response.data))
  }, [clientId])

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await axios.post('https://pharmacie-hefk.onrender.com/api/exams/', {
        client: clientId,
        ...newExam
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      
      // Rechargement des examens
      const response = await axios.get(`https://pharmacie-hefk.onrender.com/api/exams/?client=${clientId}`)
      setExamens(response.data)
      setNewExam({ tension_arterielle: '', examen_malaria: '', remarques: '' })
      alert('Examen ajouté avec succès !')
    } catch (error: any) {
      console.error('Erreur:', error.response?.data)
      alert('Erreur lors de l\'ajout de l\'examen')
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Examens pour {client?.nom_complet}</h2>
      
      {/* Formulaire ajout examen */}
      <div className="mb-8">
        <h3 className="font-bold mb-4">Ajouter un examen</h3>
        <form onSubmit={handleAddExam}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>Tension artérielle</label>
              <input
                type="text"
                value={newExam.tension_arterielle}
                onChange={(e) => setNewExam({...newExam, tension_arterielle: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label>Examen Malaria</label>
              <input
                type="text"
                value={newExam.examen_malaria}
                onChange={(e) => setNewExam({...newExam, examen_malaria: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="col-span-full">
              <label>Remarques</label>
              <textarea
                value={newExam.remarques}
                onChange={(e) => setNewExam({...newExam, remarques: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Ajouter l'examen
          </button>
        </form>
      </div>

      {/* Liste des examens */}
      <div>
        <h3 className="font-bold mb-4">Historique des examens</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th>Date</th>
              <th>Tension</th>
              <th>Malaria</th>
              <th>Remarques</th>
            </tr>
          </thead>
          <tbody>
            {examens.map(exam => (
              <tr key={exam.id}>
                <td>{new Date(exam.date_exam).toLocaleDateString()}</td>
                <td>{exam.tension_arterielle}</td>
                <td>{exam.examen_malaria}</td>
                <td>{exam.remarques}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}