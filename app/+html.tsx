import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

/**
 * Este arquivo é exclusivo da versão web e configura o HTML principal de cada página durante a renderização estática.
 * O conteúdo desta função é executado apenas no Node.js e não tem acesso ao DOM nem às APIs do navegador.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/*
          Desativa a rolagem do corpo da página na web para aproximar o comportamento do ScrollView ao das plataformas nativas.
          A rolagem do corpo da página pode ser útil na web móvel. Para ativá-la, remova esta linha.
        */}
        <ScrollViewStyleReset />

        {/* Usa CSS diretamente para evitar oscilações na cor de fundo no modo escuro. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Adicione aqui outros elementos de <head> que devem estar disponíveis em todas as páginas web. */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;
