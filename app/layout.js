import "./globals.css";

export const metadata = {
  title: "Serviciul Online | Platforme digitale UPB",
  description: "Lista platformelor digitale administrate de biroul Serviciul Online din cadrul UPB."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
