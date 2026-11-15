import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { getAuthErrorMessage } from "@/lib/errors";
import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} foi utilizada 🔐 \n`);
      } else {
        console.log("Nenhum valor armazenado para a chave: " + key);
      }
      return item;
    } catch (error) {
      console.error("Erro ao obter um item do SecureStore: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        if (signUp.createdUserId) {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "Você entrou com o Google com sucesso.",
        };
      }
    }

    return {
      success: false,
      message: "Ocorreu um erro ao entrar com o Google.",
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      code: err.code,
      message: getAuthErrorMessage(err),
    };
  }
};
