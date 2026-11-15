import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { getAuthErrorMessage } from "@/lib/errors";
import { fetchAPI } from "@/lib/fetch";

export const tokenCache =
  Platform.OS === "web"
    ? {
        async getToken(key: string) {
          return localStorage.getItem(key);
        },
        async saveToken(key: string, value: string) {
          localStorage.setItem(key, value);
        },
      }
    : {
        async getToken(key: string) {
          try {
            return await SecureStore.getItemAsync(key);
          } catch (error) {
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
