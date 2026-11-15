# Configuração de Clerk, Stripe, Neon, Geoapify e Google Maps

Projeto desenvolvido por [Giovanny Montinny](https://github.com/gmontinny).

Este guia configura as integrações externas para executar o aplicativo e sua API
localmente. Não é necessário publicar o projeto nem contratar hospedagem.
Os nomes dos menus dos provedores podem mudar; os links oficiais estão em cada seção.
Consulte os planos e as cotas atuais nos painéis antes de habilitar serviços pagos.

## 1. Preparar o arquivo de configuração

Na raiz do projeto, instale as dependências:

```bash
npm install
```

Se ainda não existir um `.env`, copie o modelo no PowerShell:

```powershell
Copy-Item .env.example .env
```

No Linux/macOS, use `cp .env.example .env`. Se o arquivo já existir, apenas edite
os campos necessários para preservar as configurações anteriores.

| Serviço        | Variáveis usadas pelo projeto        | Onde são utilizadas                     |
| -------------- | ------------------------------------ | --------------------------------------- |
| Clerk          | `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`  | Aplicativo: autenticação                |
| Stripe         | `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Aplicativo: interface de pagamento      |
| Stripe         | `STRIPE_SECRET_KEY`                  | API local: operações de pagamento       |
| Neon           | `DATABASE_DRIVER`, `DATABASE_URL`    | API local: acesso ao banco              |
| Neon no Docker | `DOCKER_DATABASE_URL`                | Conexão do contêiner com o Neon         |
| Geoapify       | `EXPO_PUBLIC_GEOAPIFY_API_KEY`       | Aplicativo: imagens estáticas dos mapas |

As variáveis `EXPO_PUBLIC_` são incorporadas ao aplicativo e podem ser vistas pelo
usuário. Nunca coloque uma chave secreta ou uma senha nessas variáveis.
Mantenha os valores reais somente no `.env`, que está ignorado pelo Git, e não
copie suas credenciais para o README ou para o `.env.example`.

## 2. Clerk: cadastro e autenticação

Painel: [dashboard.clerk.com](https://dashboard.clerk.com/).
Documentação: [Clerk com Expo](https://clerk.com/docs/quickstarts/expo).

### Criar a aplicação

1. Crie uma conta no Clerk e abra o painel.
2. Crie uma aplicação para este projeto, por exemplo, `react-native-uber`.
3. Selecione a instância de **desenvolvimento**.
4. Nas opções de autenticação, habilite cadastro e acesso por **e-mail e senha**.
5. Habilite a verificação de e-mail com **código**, usada pela tela de cadastro.
6. Para começar com o fluxo implementado, não exija campos adicionais como nome
   de usuário, telefone ou uma segunda etapa de autenticação. O cadastro atual
   envia e-mail e senha ao Clerk; o nome é salvo no banco da aplicação.
7. Na área de chaves da API, copie a **Publishable key** da instância de desenvolvimento.

Preencha no `.env`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_SUBSTITUA_PELA_CHAVE_DO_CLERK
```

Essa chave é do Clerk. Não a confunda com a chave pública do Stripe, que também
pode começar com `pk_test_`. O projeto atual não utiliza `CLERK_SECRET_KEY` nem
webhooks do Clerk; não é necessário configurar esses recursos para este fluxo.

### Habilitar o acesso com Google

1. Na mesma aplicação Clerk, abra a área de conexões sociais ou conexões SSO.
2. Adicione e habilite **Google** para cadastro e acesso.
3. Se a instância de desenvolvimento oferecer credenciais compartilhadas do
   provedor, utilize essa opção para os testes iniciais.
4. Se optar por credenciais próprias, siga as instruções exibidas pelo Clerk:
   crie um cliente OAuth no Google Cloud, configure a tela de consentimento e
   copie o Client ID e o Client Secret para a conexão no **painel do Clerk**.
5. No Google Cloud, cadastre o URI de redirecionamento fornecido pelo Clerk,
   exatamente como aparece no painel. Ele é diferente do retorno ao aplicativo.
6. Se o aplicativo OAuth estiver em modo de teste, inclua sua conta Google entre
   os usuários de teste quando essa opção for exigida pelo Google.

O projeto declara o esquema nativo `myapp` em `app.json`. Em `lib/auth.ts`,
o retorno ao aplicativo é calculado por
`Linking.createURL("/(root)/(tabs)/home")`. Se o painel solicitar uma lista de
redirecionamentos permitidos para o aplicativo, utilize a URL efetivamente gerada
na compilação que você estiver testando; não use um domínio de publicação.
A URL pode variar entre uma compilação nativa e o Expo Go. Para o fluxo nativo,
prefira uma compilação de desenvolvimento com o esquema `myapp` registrado.

Os segredos OAuth do Google ficam no Clerk. Eles não devem ser adicionados como
variáveis `EXPO_PUBLIC_`. As chaves de Maps/Places/Directions são outra configuração.

### Verificar o Clerk

1. Reinicie o Expo após configurar a chave.
2. Abra a tela de cadastro e use um e-mail ao qual você tenha acesso.
3. Informe o código de verificação recebido.
4. Confirme se o usuário aparece no painel Clerk.
5. Confirme se o registro também aparece na tabela `users` do banco selecionado.
6. Saia e entre novamente com e-mail e senha; depois teste a opção Google.

O banco precisa estar configurado para concluir o fluxo de cadastro da aplicação.
Se o usuário existir no Clerk, mas o aplicativo falhar ao concluir o cadastro,
confira a conexão da API com o banco e seus registros antes de repetir o cadastro.

## 3. Stripe: pagamentos em ambiente de teste

Painel: [dashboard.stripe.com](https://dashboard.stripe.com/).
Documentação: [pagamentos com React Native](https://docs.stripe.com/payments/accept-a-payment?platform=react-native&ui=payment-sheet).

### Obter as chaves de teste

1. Crie uma conta no Stripe e abra o painel.
2. Selecione um **ambiente de teste**, que pode aparecer como modo de teste ou Sandbox.
3. Abra a área de desenvolvedores/chaves da API desse ambiente.
4. Copie a chave pública (**Publishable key**) e a chave secreta (**Secret key**).
5. Confira se ambas pertencem à mesma conta e ao mesmo ambiente de teste.

Preencha no `.env`:

```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_SUBSTITUA_PELA_CHAVE_DO_STRIPE
STRIPE_SECRET_KEY=sk_test_SUBSTITUA_PELA_CHAVE_DO_STRIPE
```

A chave secreta é usada apenas pelas rotas locais em `app/(api)/(stripe)`.
Não coloque `sk_test_` na variável pública e não use chaves `pk_live_` ou `sk_live_`
para os testes deste guia. Não é necessário configurar webhook, Stripe CLI ou
um endereço público para o fluxo atual.

### Testar um pagamento

1. Use uma compilação de desenvolvimento que contenha o módulo nativo do Stripe.
2. Configure também Clerk, banco, mapas e pelo menos um motorista de exemplo.
3. Solicite uma corrida no aplicativo e avance até a confirmação do pagamento.
4. No ambiente de teste, use os dados de cartão de teste do Stripe:

   | Campo              | Valor                                 |
   | ------------------ | ------------------------------------- |
   | Número             | `4242 4242 4242 4242`                 |
   | Validade           | Uma data futura                       |
   | CVC                | Três dígitos, por exemplo, `123`      |
   | CEP, se solicitado | Um valor válido no formato solicitado |

5. Confira a operação na lista de pagamentos do mesmo ambiente de teste no painel.
6. Confira a corrida registrada na tabela `rides` do banco selecionado.

O projeto usa **USD** nas configurações de pagamento atuais, mesmo com a interface
em português. Configurar a conta não altera automaticamente a moeda para BRL.
Outros cartões e cenários estão na [documentação de testes do Stripe](https://docs.stripe.com/testing).

Se a API responder com status `503` pedindo `STRIPE_SECRET_KEY`, configure o campo
e reinicie o servidor local. A presença das chaves não garante que todo o fluxo
funcione: confirme os resultados no aplicativo, no painel Stripe e no banco.

## 4. Neon: PostgreSQL externo opcional

Painel: [console.neon.tech](https://console.neon.tech/).
Documentação: [conectar uma aplicação ao Neon](https://neon.tech/docs/connect/connect-from-any-app).

Você pode usar PostgreSQL no Docker ou Neon. Não é necessário usar os dois bancos
para os dados da aplicação. Escolha um deles e confira o driver no `.env`.

### Criar o projeto e copiar a conexão

1. Crie uma conta no Neon.
2. Crie um projeto e selecione uma região adequada à sua localização.
3. Selecione a branch de desenvolvimento, o banco de dados e a role de acesso.
4. Abra **Connect** ou a opção equivalente para obter a conexão.
5. Copie a URL PostgreSQL completa, incluindo usuário, senha, host, banco e os
   parâmetros fornecidos pelo Neon, como `sslmode=require`.

Não é necessário criar uma chave da API administrativa do Neon: este aplicativo
utiliza a **URL de conexão PostgreSQL**, com suas credenciais de banco.

Para executar Expo no computador:

```env
DATABASE_DRIVER=neon
DATABASE_URL=postgresql://USUARIO:SENHA@HOST_DO_NEON/NOME_DO_BANCO?sslmode=require
```

O valor acima é somente um exemplo. Use a URL real gerada pelo Neon sem substituir
o host por `localhost`. Preserve os parâmetros adicionais que vierem na conexão.

Para executar a aplicação no Docker, preencha também:

```env
DATABASE_DRIVER=neon
DOCKER_DATABASE_URL=postgresql://USUARIO:SENHA@HOST_DO_NEON/NOME_DO_BANCO?sslmode=require
```

Mantenha `DATABASE_URL` preenchida com a conexão do Neon para execução fora do Docker.
O Compose usa `DOCKER_DATABASE_URL` dentro do contêiner. Se esse campo estiver vazio,
o Compose utiliza a conexão do PostgreSQL local, que não funciona com o driver HTTP
selecionado por `DATABASE_DRIVER=neon`.

### Criar as tabelas

1. No Neon, abra o editor SQL.
2. Confira se selecionou a mesma branch e o mesmo banco da URL de conexão.
3. Abra o arquivo [01-schema.sql](../docker/postgres/init/01-schema.sql) deste projeto.
4. Copie o conteúdo completo para o editor SQL do Neon.
5. Execute uma vez em um banco vazio.
6. Confirme a criação das tabelas `users`, `drivers` e `rides`.

O arquivo contém instruções `CREATE TABLE`, sem `IF NOT EXISTS`. Se as tabelas já
existirem, examine a estrutura atual antes de executar novamente; não é necessário
excluir dados para configurar a conexão.

As tabelas começam vazias. Para testar a seleção de motoristas, use a consulta
`INSERT INTO drivers` dos exemplos do [README](../README.md). Os endereços de
imagens desses exemplos são externos e exigem conexão à internet.

Você pode conferir a estrutura sem consultar dados pessoais:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'drivers', 'rides')
ORDER BY table_name;
```

### Executar e verificar

Com Expo fora do Docker, execute `npm start`. Para rodar a aplicação no contêiner:

```bash
docker compose up --build
```

Na configuração atual, o Compose ainda inicia o PostgreSQL local como dependência,
mesmo quando a aplicação consulta o Neon. Os dados usados são os do banco apontado
por `DOCKER_DATABASE_URL`; o banco local não é sincronizado com o Neon.

Cadastre um usuário no aplicativo e verifique seu registro em `users` no Neon.
Se houver erro de conexão, confira a senha, o host, o banco, o driver e se a URL
foi copiada integralmente. Um banco suspenso por inatividade pode precisar de um
momento para responder à primeira conexão, conforme o plano e a configuração.

### Continuar somente com o banco local

Para dispensar o Neon durante o desenvolvimento, use:

```env
DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://uber:uber_local@localhost:5432/uber
DOCKER_DATABASE_URL=
```

Esses valores correspondem às credenciais locais do modelo. Se você as alterou,
use os valores escolhidos. Inicie o banco com `docker compose up -d db` e execute
`npm start`, ou use `docker compose up --build` para executar o conjunto no Docker.

## 5. Geoapify: imagens estáticas de mapas

Painel: [myprojects.geoapify.com](https://myprojects.geoapify.com/).
Documentação: [Static Maps API](https://apidocs.geoapify.com/docs/maps/static/).

### Criar o projeto e obter a chave

1. Crie uma conta no Geoapify.
2. No painel, crie um projeto para o aplicativo.
3. Abra a área de chaves da API e copie uma chave do projeto.
4. Confira no painel se a Static Maps API está disponível e se há créditos na cota.
5. Preencha o `.env`:

```env
EXPO_PUBLIC_GEOAPIFY_API_KEY=SUBSTITUA_PELA_CHAVE_DO_GEOAPIFY
```

A chave é usada em `components/RideCard.tsx` para obter uma imagem estática do mapa
no histórico de corridas. Não substitui Google Maps, Google Places ou Google Directions.

### Restrições e uso no desenvolvimento

Se configurar restrições de chave no painel, considere a plataforma de teste:
requisições de imagens de um aplicativo nativo podem não enviar o cabeçalho HTTP
`Referer` usado por restrições de sites. Uma restrição exclusiva a um domínio de
produção pode bloquear os testes locais. Use uma chave de desenvolvimento separada
e configure apenas restrições compatíveis com o aplicativo e a rede utilizados.

Consulte as exigências de atribuição e as condições do plano contratado na
[documentação do Geoapify](https://www.geoapify.com/). Configure a apresentação
adequada dos créditos antes de distribuir o aplicativo.

### Verificar o Geoapify

1. Reinicie o Expo para carregar a chave.
2. Abra o histórico de uma corrida que tenha latitude e longitude de destino.
3. Confira se a miniatura do mapa é exibida.
4. Se não houver corridas, a tela vazia não solicita essas miniaturas. Finalize
   uma corrida de teste ou cadastre dados de desenvolvimento coerentes no banco.
5. No painel do Geoapify, confira o consumo e eventuais erros da chave.

Se necessário, teste a Static Maps API pelo explorador da documentação oficial,
com coordenadas conhecidas e sua chave. Respostas `401` ou `403` normalmente
indicam problemas de autenticação ou restrições; `429` indica limitação de requisições.

## 6. Google Places e Directions: criar e configurar as chaves

Painel: [Google Cloud Console](https://console.cloud.google.com/).
Biblioteca de APIs: [APIs e serviços → Biblioteca](https://console.cloud.google.com/apis/library).
Credenciais: [APIs e serviços → Credenciais](https://console.cloud.google.com/apis/credentials).

### Etapa 1: criar ou selecionar um projeto

1. Entre no Google Cloud Console com sua conta Google.
2. No seletor de projetos, na parte superior, clique em **Novo projeto**.
3. Informe um nome, por exemplo, `react-native-uber`, e conclua a criação.
4. Selecione esse projeto antes de continuar. As APIs, as chaves e o faturamento
   das etapas seguintes precisam pertencer a ele.

Se já tiver um projeto apropriado, você pode selecioná-lo em vez de criar outro.
Não é necessário publicar o aplicativo nem informar um domínio público para usar
as APIs durante o desenvolvimento local.

### Etapa 2: vincular uma conta de faturamento

1. No menu do Console, abra **Faturamento**.
2. Crie ou selecione uma conta de faturamento e vincule-a ao projeto.
3. Preencha os dados solicitados pelo Google, incluindo a forma de pagamento
   quando exigida.
4. Confirme se o faturamento está ativo para o projeto selecionado.

As APIs do Google Maps Platform normalmente exigem faturamento habilitado, mesmo
quando o uso está dentro de uma franquia gratuita. Os limites e preços variam por
API. Consulte a [página de preços do Google Maps Platform](https://developers.google.com/maps/billing-and-pricing/pricing).
Se não quiser habilitar faturamento neste momento, deixe essas chaves pendentes;
a busca de endereços e o cálculo de rotas ainda não poderão ser testados.

### Etapa 3: conferir a compatibilidade das APIs

O código atual utiliza a biblioteca `react-native-google-places-autocomplete`
para Places e o endpoint `/maps/api/directions/json` para Directions. A exibição
da rota também utiliza `react-native-maps-directions`. Essas integrações usam
serviços legados, que podem não estar disponíveis para novos clientes.

Antes de criar as chaves, pesquise na Biblioteca por:

| Serviço usado pelo código atual            | Nome a procurar                                                |
| ------------------------------------------ | -------------------------------------------------------------- |
| Sugestões de endereços e detalhes do local | **Places API**, que pode aparecer como **Places API (Legacy)** |
| Rotas e duração das corridas               | **Directions API**, que pode aparecer como serviço legado      |

Se o seu projeto tiver acesso a esses serviços, habilite-os na próxima etapa.
Se apenas **Places API (New)** e **Routes API** estiverem disponíveis, pare a
configuração das integrações legadas: será necessário adaptar o código para
essas APIs. Habilitar as APIs novas com as mesmas chaves não torna os endpoints
atuais compatíveis automaticamente.

Consulte a [documentação de produtos legados do Google Maps](https://developers.google.com/maps/legacy)
para confirmar a disponibilidade na sua conta. Se o painel indicar acesso negado
ou indisponibilidade para novos clientes, registre a mensagem sem incluir chaves.

### Etapa 4: habilitar Places e Directions

No projeto que tenha acesso às APIs utilizadas pelo código:

1. Abra **APIs e serviços → Biblioteca**.
2. Pesquise **Places API** e abra a página correspondente ao serviço legado.
3. Clique em **Ativar**. Se já estiver ativa, o painel exibirá opções de gerenciamento.
4. Volte à Biblioteca, pesquise **Directions API** e clique em **Ativar**.
5. Abra **APIs e serviços → APIs e serviços ativados** e confirme os dois serviços.

Ativar somente **Maps SDK for Android**, **Maps SDK for iOS** ou **Maps JavaScript API**
não habilita a busca Places nem as requisições Directions feitas pelo projeto.
A configuração desses SDKs de exibição de mapas é separada e depende da plataforma.

### Etapa 5: criar a chave do Places

1. Abra **APIs e serviços → Credenciais**.
2. Clique em **Criar credenciais → Chave de API**.
3. Abra a chave criada para editar suas configurações.
4. Renomeie-a para algo como `uber-places-desenvolvimento`.
5. Em **Restrições de API**, escolha **Restringir chave**.
6. Selecione **Places API**, correspondente ao serviço ativado na etapa anterior.
7. Salve e copie a chave para `EXPO_PUBLIC_PLACES_API_KEY` no `.env`.

### Etapa 6: criar a chave do Directions

1. Ainda em **Credenciais**, crie outra **Chave de API**.
2. Renomeie-a para `uber-directions-desenvolvimento`.
3. Em **Restrições de API**, escolha **Restringir chave**.
4. Selecione **Directions API** e salve.
5. Copie a chave para `EXPO_PUBLIC_DIRECTIONS_API_KEY` no `.env`.

É possível usar uma única chave permitindo as duas APIs, mas chaves separadas
facilitam a configuração e a rotação de cada integração.
Não é necessário criar uma conta de serviço nem baixar um arquivo JSON para essas
chamadas. As credenciais OAuth do login Google no Clerk são outra configuração.

### Etapa 7: escolher restrições de aplicação compatíveis

O campo **Restrições de aplicação** é diferente de **Restrições de API**.
O projeto atual faz chamadas HTTP aos serviços Places e Directions diretamente
pelo aplicativo. Isso limita os tipos de restrição compatíveis com essas chamadas.

- Restrições de **sites/referenciadores HTTP** não correspondem automaticamente
  às chamadas de um aplicativo nativo.
- Restrições de **aplicativos Android ou iOS** exigem mecanismos de identificação
  compatíveis com a API e a biblioteca utilizadas; não basta selecionar esse tipo
  de restrição para proteger qualquer chamada HTTP.
- Restrições por **endereço IP** se aplicam a um IP de saída estável, normalmente
  de um servidor. O IP privado `192.168.x.x` do celular ou do computador não é
  o endereço público visto pelo Google.

Para um teste local inicial com as chamadas atuais, pode ser necessário selecionar
**Nenhuma** em restrições de aplicação, mantendo a chave restrita às APIs necessárias.
Essa chave continua exposta no aplicativo por usar `EXPO_PUBLIC_`; combine esse teste
com cotas baixas e acompanhe o consumo. Não trate essa configuração como proteção
adequada para distribuir o aplicativo. Antes de distribuição, revise a integração
para usar os SDKs apropriados ou chamadas intermediadas pelo servidor, com as
restrições recomendadas para cada serviço.

As orientações oficiais estão em [segurança de chaves do Google Maps Platform](https://developers.google.com/maps/api-security-best-practices).

### Etapa 8: preencher o arquivo local

Edite somente os dois campos abaixo no `.env`, preservando as outras credenciais:

```env
EXPO_PUBLIC_PLACES_API_KEY=SUBSTITUA_PELA_CHAVE_DO_PLACES
EXPO_PUBLIC_DIRECTIONS_API_KEY=SUBSTITUA_PELA_CHAVE_DO_DIRECTIONS
```

Não coloque os valores reais no `.env.example` ou na documentação.
As alterações de chave e restrições no painel podem levar alguns minutos para
entrar em vigor. Reinicie o Expo para carregar o arquivo atualizado:

```bash
npm run check:env
npm start -- --clear
```

Para acesso por celular na rede local, use `npm run start:lan -- --clear`.
Se a aplicação estiver no Docker, recrie o serviço com
`docker compose up -d --force-recreate app`.

### Etapa 9: configurar cotas e orçamento

1. Abra a página de cada API ativada e procure **Cotas** ou **Cotas e limites do sistema**.
2. Defina limites de requisições adequados para o desenvolvimento, nos campos que
   permitirem edição.
3. Em **Faturamento → Orçamentos e alertas**, crie um orçamento e informe os
   destinatários das notificações.
4. Acompanhe uso e cobrança durante os testes.

Alertas de orçamento enviam notificações; eles não interrompem as cobranças
automaticamente. Cotas podem limitar requisições, mas não substituem o acompanhamento
de faturamento nem garantem um limite financeiro exato.

### Etapa 10: testar no aplicativo

1. Abra o aplicativo em uma compilação com os módulos nativos necessários.
2. Permita o acesso à localização.
3. No campo de destino, digite um endereço e confira se aparecem sugestões.
4. Selecione uma sugestão e confira se o destino foi preenchido.
5. Com pelo menos um motorista cadastrado no banco, avance para a escolha da
   corrida e confira a duração estimada e a rota.
6. No Google Cloud, acompanhe as métricas das APIs para confirmar o recebimento
   das requisições. As métricas podem demorar a aparecer.

A busca testa Places; as estimativas e a rota testam Directions. Um mapa visível
na tela, sozinho, não confirma que essas duas APIs estão funcionando.

| Erro ou comportamento                           | O que conferir                                                                                          |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `REQUEST_DENIED`                                | Faturamento, API correta habilitada, chave do projeto correto, restrições e acesso aos serviços legados |
| `API_KEY_INVALID` ou mensagem de chave inválida | Valor copiado, espaços extras e reinicialização do Expo                                                 |
| `OVER_QUERY_LIMIT` ou `RESOURCE_EXHAUSTED`      | Cotas, consumo e situação do faturamento                                                                |
| Sem sugestões de endereço                       | Places habilitada, conexão à internet, restrições e compatibilidade da biblioteca                       |
| `ZERO_RESULTS`                                  | Origem/destino válidos e existência de uma rota para o modo de transporte utilizado                     |
| Somente APIs novas disponíveis no Console       | Necessidade de migrar o código para Places API (New) e Routes API                                       |
| Places funciona, mas não há estimativas         | Directions habilitada, localização disponível e motoristas cadastrados                                  |

## 7. Conferir e iniciar o ambiente

Após preencher as variáveis reais no `.env`, execute:

```bash
npm run check:env
```

O comando confere a presença das variáveis e o formato do endereço da API. Ele não
faz chamadas aos provedores nem garante que as credenciais estejam válidas.
O verificador também solicita `EXPO_PUBLIC_PLACES_API_KEY` e
`EXPO_PUBLIC_DIRECTIONS_API_KEY`, pois o aplicativo usa Google para busca e rotas.
Siga a seção 6 deste guia para habilitar as APIs compatíveis no Google Cloud e criar as chaves.

Para executar no computador, mantenha:

```env
EXPO_PUBLIC_SERVER_URL=http://localhost:8081
REACT_NATIVE_PACKAGER_HOSTNAME=localhost
APP_BIND_HOST=127.0.0.1
```

Reinicie o Expo com cache limpo:

```bash
npm start -- --clear
```

Para celular na mesma rede, configure o IP local do computador e use
`npm run start:lan -- --clear`, conforme o [guia de desenvolvimento local](local.md).
Se estiver executando o Expo no Docker, recrie o serviço após mudar o `.env`:

```bash
docker compose up -d --force-recreate app
```

Para instruções de acesso ao banco e ao Adminer, consulte o [guia Docker](docker.md).

## 8. Problemas comuns

| Sintoma                                              | O que conferir                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Clerk informa chave inválida                         | Chave do Clerk, instância de desenvolvimento e reinicialização do Expo    |
| Cadastro exige informações que a tela não solicita   | Campos obrigatórios e métodos de autenticação habilitados no Clerk        |
| Google não retorna ao aplicativo                     | Conexão Google no Clerk, credenciais OAuth e URI de retorno da compilação |
| Usuário aparece no Clerk, mas o cadastro não termina | Servidor local, `DATABASE_DRIVER`, URL do banco e tabela `users`          |
| Stripe pede a chave secreta                          | `STRIPE_SECRET_KEY` no servidor e recriação do serviço Docker             |
| Stripe não reconhece o pagamento ou o cliente        | Chaves da mesma conta e do mesmo ambiente de teste                        |
| Módulo nativo de mapas ou pagamentos indisponível    | Compilação de desenvolvimento com os módulos instalados                   |
| Neon retorna erro de tabela inexistente              | Execução do schema na branch e no banco corretos                          |
| Neon funciona no computador, mas falha no Docker     | `DATABASE_DRIVER=neon` e `DOCKER_DATABASE_URL` preenchida                 |
| Histórico não mostra a imagem do mapa                | Chave Geoapify, cota, restrições e coordenadas do destino                 |
| Celular não alcança a API                            | IP local, mesma rede, porta 8081, firewall e `APP_BIND_HOST` no Docker    |
