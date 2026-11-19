import "../globals.css";

export default function GoogleDriveCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col font-accent text-foreground bg-[#f4f3ef]">
        {children}
      </body>
    </html>
  );
}
