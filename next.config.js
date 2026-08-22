/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    // pdf-parse (via pdfjs) carrega um arquivo "worker" à parte em tempo de execução;
    // deixando o pacote fora do empacotamento do webpack, ele é lido direto do
    // node_modules (com o worker do lado), em vez de virar um chunk sem ele.
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
