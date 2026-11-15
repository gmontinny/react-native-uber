#!/usr/bin/env node

/**
 * Este script restaura o projeto para um estado inicial vazio.
 * Move o diretório /app para /app-example e cria um novo diretório /app com os arquivos index.tsx e _layout.tsx.
 * Após a execução, você pode remover o script `reset-project` de package.json e excluir este arquivo.
 */

const fs = require("fs");
const path = require("path");

const root = process.cwd();
const oldDirPath = path.join(root, "app");
const newDirPath = path.join(root, "app-example");
const newAppDirPath = path.join(root, "app");

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edite app/index.tsx para alterar esta tela.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}
`;

fs.rename(oldDirPath, newDirPath, (error) => {
  if (error) {
    return console.error(`Erro ao renomear o diretório: ${error}`);
  }
  console.log("/app movido para /app-example.");

  fs.mkdir(newAppDirPath, { recursive: true }, (error) => {
    if (error) {
      return console.error(`Erro ao criar o novo diretório app: ${error}`);
    }
    console.log("Novo diretório /app criado.");

    const indexPath = path.join(newAppDirPath, "index.tsx");
    fs.writeFile(indexPath, indexContent, (error) => {
      if (error) {
        return console.error(`Erro ao criar index.tsx: ${error}`);
      }
      console.log("app/index.tsx criado.");

      const layoutPath = path.join(newAppDirPath, "_layout.tsx");
      fs.writeFile(layoutPath, layoutContent, (error) => {
        if (error) {
          return console.error(`Erro ao criar _layout.tsx: ${error}`);
        }
        console.log("app/_layout.tsx criado.");
      });
    });
  });
});
