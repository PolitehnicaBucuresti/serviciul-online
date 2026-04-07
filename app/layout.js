import "./globals.css";

export const metadata = {
  title: "Serviciul Online | Platforme digitale UNSTPB",
  description: "Lista platformelor digitale administrate de biroul Serviciul Online din cadrul UNSTPB.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true
    }
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
