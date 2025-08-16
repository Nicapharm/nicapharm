import 'leaflet/dist/leaflet.css';  // <-- ajouter cette ligne en premier
import '../styles/globals.css';    // ton CSS global

export const metadata = {
  title: 'HopitalSage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
