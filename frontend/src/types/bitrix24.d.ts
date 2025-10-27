// frontend/src/types/bitrix24.d.ts

declare global {
  interface Window {
    BX24: BX24;
  }
}

interface BX24 {
  init(callback: () => void): void;
  install(callback: () => void): void;
  installFinish(): void;
  getAuth(): BX24Auth;
  refreshAuth(callback: (auth: BX24Auth) => void): void;
  callMethod(
    method: string,
    params?: any,
    callback?: (result: any) => void
  ): void;
  callBatch(calls: any, callback?: (result: any) => void): void;
  selectUser(callback: (user: any) => void): void;
  selectCRM(params: any, callback: (result: any) => void): void;
  placement: {
    info(): BX24PlacementInfo;
  };
  appOption: {
    get(name: string): void;
    set(name: string, value: any, callback?: (result: any) => void): void;
  };
  resizeWindow(width: number, height: number): void;
  fitWindow(): void;
  scrollParentWindow(scroll: number): void;
  reloadWindow(): void;
  setTitle(title: string): void;
  ready(): void;
  isAdmin(): boolean;
  getLang(): string;
  getDomain(): string;
}

interface BX24Auth {
  domain: string;
  member_id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface BX24PlacementInfo {
  placement: string;
  options: any;
}

export type { BX24, BX24Auth, BX24PlacementInfo };
