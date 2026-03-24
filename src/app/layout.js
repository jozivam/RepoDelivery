export const metadata = {
  title: "Repo Delivery API",
  description: "API v1 para matriz, filiais, pedidos, estoque e entregas."
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: "sans-serif", margin: 0, background: "#f4f4ef", color: "#1f1f1a" }}>
        {children}
      </body>
    </html>
  );
}
