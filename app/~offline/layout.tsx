import "../globals.css";



export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" >
      <body className="antialiased min-h-screen flex flex-col font-accent text-foreground">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
