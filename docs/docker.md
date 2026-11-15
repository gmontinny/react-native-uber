# Ambiente local com Docker

Para habilitar as integrações, siga o [guia de configuração de Clerk, Stripe, Neon e Geoapify](servicos-externos.md).

Projeto desenvolvido por [Giovanny Montinny](https://github.com/gmontinny).

Instale e inicie o Docker Desktop com suporte a contêineres Linux e Docker Compose v2.
O ambiente é voltado ao desenvolvimento: o Dockerfile executa o servidor Expo/Metro,
e o código local é montado no contêiner para permitir recarregamento durante a edição.

1. Copie `.env.example` para `.env`, caso ainda não tenha esse arquivo:

   ```powershell
   Copy-Item .env.example .env
   ```

   No Linux/macOS, use `cp .env.example .env`. Preserve seu `.env` caso já contenha chaves.

2. Preencha as chaves do Clerk, Stripe, Google Maps/Places/Directions e Geoapify.
   Esses serviços continuam externos e não são substituídos por contêineres.
   Use as chaves de teste do Stripe para o desenvolvimento.

3. Inicie o ambiente:

   ```bash
   docker compose up --build
   ```

| Serviço            | Endereço e finalidade                                  |
| ------------------ | ------------------------------------------------------ |
| Expo/Metro         | Porta 8081: servidor de desenvolvimento e rotas da API |
| PostgreSQL 16      | `localhost:5432`: banco persistido em volume           |
| Adminer (opcional) | `http://localhost:8080`: painel do banco               |

Para abrir o Adminer, execute `docker compose --profile tools up -d adminer`.
Selecione PostgreSQL, servidor `db` e utilize o banco, usuário e senha configurados
em `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD`. Os valores iniciais são
`uber`, `uber` e `uber_local`. Use uma senha local própria compatível com URLs.
As portas do PostgreSQL e do Adminer ficam acessíveis apenas pelo computador local.
As portas publicadas podem ser alteradas com `POSTGRES_PORT` e `ADMINER_PORT`.

## Banco de dados

O banco cria automaticamente as tabelas `users`, `drivers` e `rides` na primeira
inicialização de um volume vazio, usando `docker/postgres/init/01-schema.sql`.
Não há motoristas cadastrados inicialmente; use os exemplos SQL do README para
cadastrar dados de desenvolvimento. Alterar o script de inicialização não modifica
um banco já existente. Nesse caso, aplique as mudanças por SQL.

Por padrão, dentro do Compose, a aplicação usa `DATABASE_DRIVER=postgres` e acessa o host `db`.
Para executar Expo no computador com apenas o banco no Docker, use:

```bash
docker compose up -d db
npm install
npm start
```

O `.env.example` inclui a conexão via `localhost` para essa modalidade.
Para usar o Neon fora do Docker, defina `DATABASE_DRIVER=neon` e configure
`DATABASE_URL`. Dentro do Docker, defina `DATABASE_DRIVER=neon` e preencha
`DOCKER_DATABASE_URL` com a URL do Neon. O PostgreSQL local ainda será iniciado
como dependência, mas a aplicação consultará o Neon. As rotas da API utilizam
`lib/database.ts` para selecionar o driver, mantendo as consultas parametrizadas.

## Acesso pelo celular

Por padrão, a porta do aplicativo é vinculada a `127.0.0.1`.
Para testar em um celular na mesma rede, defina `APP_BIND_HOST=0.0.0.0` e altere `REACT_NATIVE_PACKAGER_HOSTNAME`
para o IP local do computador e `EXPO_PUBLIC_SERVER_URL` para
`http://SEU_IP_LOCAL:8081`. Recrie o serviço:

```bash
docker compose up -d --force-recreate app
```

Permita a porta 8081 no firewall para essa rede. No emulador Android, o endereço
`10.0.2.2` permite acessar o computador hospedeiro; use esse host na URL da API
quando necessário. Em um aparelho físico, utilize o IP da rede local.

O contêiner não executa emuladores nem compila os aplicativos nativos.
Este projeto usa mapas e pagamentos nativos; para testar o aplicativo completo,
use um dispositivo ou emulador com uma compilação de desenvolvimento que contenha
esses módulos. A versão web pode ter limitações nesses componentes.

## Operação do ambiente

Para acompanhar os registros, use `docker compose logs -f app`. Para parar,
use `docker compose down`; os dados do PostgreSQL são preservados.
As chaves do `.env` não são copiadas para a imagem; o Compose fornece os valores
na execução. Valores com prefixo `EXPO_PUBLIC_` são públicos no aplicativo.

Após alterar dependências, reconstrua a imagem e atualize o volume de módulos:

```bash
docker compose build app
docker compose run --rm --no-deps app npm ci
docker compose up -d app
```

Para validar a configuração sem iniciar os serviços, execute `docker compose config --quiet`.
