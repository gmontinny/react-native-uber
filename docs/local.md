# Desenvolvimento local

Para habilitar as integrações, siga o [guia de configuração de Clerk, Stripe, Neon e Geoapify](servicos-externos.md).

O aplicativo e as rotas da API são executados no computador, pelo Expo na porta 8081. Não é necessário publicar um site, configurar hospedagem ou abrir um túnel.
Clerk, Stripe, NeonDB (opcional), Google Maps e Geoapify continuam sendo serviços
externos, acessados pelas suas credenciais.

## Preparar o ambiente

Use Node.js 20.6 ou superior, compatível com o Expo SDK 51.
Instale as dependências com `npm install`. Copie `.env.example` para `.env` somente
se ainda não existir um arquivo com suas configurações:

```powershell
Copy-Item .env.example .env
```

Preencha o `.env` localmente. Chaves `EXPO_PUBLIC_` são utilizadas pelo aplicativo;
`STRIPE_SECRET_KEY`, `DATABASE_URL` e `DOCKER_DATABASE_URL` ficam no servidor.
Os arquivos `.env` e suas variantes estão ignorados pelo Git, exceto o modelo
`.env.example`, que não deve conter credenciais reais.

| Serviço           | Configuração                                                        |
| ----------------- | ------------------------------------------------------------------- |
| Clerk             | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` da instância de desenvolvimento |
| Stripe            | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` e `STRIPE_SECRET_KEY` de teste |
| Google Places     | `EXPO_PUBLIC_PLACES_API_KEY`                                        |
| Google Directions | `EXPO_PUBLIC_DIRECTIONS_API_KEY`                                    |
| Geoapify          | `EXPO_PUBLIC_GEOAPIFY_API_KEY`                                      |
| PostgreSQL local  | `DATABASE_DRIVER=postgres` e `DATABASE_URL` do modelo               |
| NeonDB            | `DATABASE_DRIVER=neon` e `DATABASE_URL` fornecida pelo Neon         |

Nenhuma chave secreta do Clerk é utilizada pelas integrações atuais. Para login
com Google, habilite a conexão Google na instância Clerk de desenvolvimento e
configure o retorno do aplicativo com o esquema `myapp`. A chave de uma instância
de produção não substitui essa configuração de desenvolvimento.

Para pagamentos locais, use o modo de teste do Stripe. O fluxo atual chama a API
do Stripe pelo servidor local e não depende de um webhook público.
Os mapas e pagamentos usam módulos nativos: o aplicativo completo precisa de uma
compilação de desenvolvimento com esses módulos instalados. Expo Go e a versão
web podem não oferecer suporte ao fluxo completo. Para gerar uma compilação
Android no computador, com Android SDK/JDK configurados, use `npx expo run:android`.
Uma compilação iOS local exige macOS e Xcode. Não é necessário usar compilação em nuvem.

Confira os campos preenchidos sem exibir seus valores:

```bash
npm run check:env
```

O comando verifica a presença das configurações, sem testar as credenciais nos provedores.

## Executar no computador

Com PostgreSQL local, inicie o Docker Desktop e execute:

```bash
docker compose up -d db
npm start
```

Com Neon, configure `DATABASE_DRIVER=neon` e `DATABASE_URL` no `.env` e execute
apenas `npm start`. Crie as tabelas no Neon usando o conteúdo de
`docker/postgres/init/01-schema.sql`, se o banco ainda estiver vazio.

`npm start` usa `localhost:8081`. O endereço da API no `.env` deve ser
`EXPO_PUBLIC_SERVER_URL=http://localhost:8081` para acesso no computador.
`npm run web` abre a versão web local, sujeita às limitações dos módulos nativos.

## Executar em celular ou emulador

Para um aparelho físico, use a mesma rede do computador e configure:

```env
EXPO_PUBLIC_SERVER_URL=http://SEU_IP_LOCAL:8081
REACT_NATIVE_PACKAGER_HOSTNAME=SEU_IP_LOCAL
```

Execute `npm run start:lan`. No emulador Android, você pode usar `10.0.2.2` como
host da API para acessar o computador. Mantenha a porta 8081 permitida pelo firewall
na rede de desenvolvimento. Isso disponibiliza o servidor na rede local, sem
publicação na internet.

## Executar a aplicação no Docker

Consulte o [guia Docker](docker.md). Por padrão, o Compose publica a porta 8081
somente em `127.0.0.1`. Para acesso pelo celular, configure também
`APP_BIND_HOST=0.0.0.0` no `.env`, além dos endereços de rede acima.

O Compose permite Neon com `DATABASE_DRIVER=neon` e `DOCKER_DATABASE_URL` contendo
a URL de conexão do Neon. Nesse caso, o banco PostgreSQL local ainda é iniciado
como dependência, mas as consultas da aplicação são enviadas ao Neon.

Após alterar variáveis de ambiente, reinicie o Expo com limpeza do cache
(`npm start -- --clear` ou `npm run start:lan -- --clear`). No Docker, recrie o serviço
com `docker compose up -d --force-recreate app`.
