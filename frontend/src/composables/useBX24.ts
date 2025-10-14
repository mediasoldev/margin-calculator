// frontend/src/composables/useBX24.ts

import { ref, onMounted } from "vue";
import type { BX24, BX24Auth } from "@/types/bitrix24";

const isReady = ref(false);
const auth = ref<BX24Auth | null>(null);
const isAdmin = ref(false);
const currentLang = ref("en");

export function useBX24() {
  const init = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.BX24) {
        window.BX24.init(() => {
          isReady.value = true;
          auth.value = window.BX24.getAuth();
          isAdmin.value = window.BX24.isAdmin();
          currentLang.value = window.BX24.getLang();
          resolve();
        });
      } else {
        // Fallback для локальної розробки
        console.warn("BX24 not available, using mock mode");
        isReady.value = true;
        currentLang.value = "en";
        resolve();
      }
    });
  };

  const callMethod = (method: string, params = {}): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (window.BX24) {
        window.BX24.callMethod(method, params, (result: any) => {
          if (result.error()) {
            reject(result.error());
          } else {
            resolve(result.data());
          }
        });
      } else {
        console.log("Mock call:", method, params);
        resolve({ mock: true });
      }
    });
  };

  const fitWindow = () => {
    if (window.BX24) {
      window.BX24.fitWindow();
    }
  };

  const getLang = (): string => {
    if (window.BX24) {
      return window.BX24.getLang();
    }
    return currentLang.value || "en";
  };

  const getDomain = (): string | null => {
    if (window.BX24) {
      return window.BX24.getDomain();
    }
    return null;
  };

  onMounted(() => {
    init();
  });

  return {
    isReady,
    auth,
    isAdmin,
    currentLang,
    init,
    callMethod,
    fitWindow,
    getLang,
    getDomain,
  };
}
