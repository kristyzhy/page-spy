import { mockRequest } from './request';
type CBType = (event?: any) => any;

export class MockWX implements WXSystemAPI, WXNetworkAPI, WXStorageAPI {
  private store: Record<string, any> = {};
  private listeners = new Map<string, CBType[]>();
  constructor() {
    this.listeners.set('onError', []);
    this.listeners.set('onUnHandledRejection', []);
    this.listeners.set('onAppShow', []);
  }

  trigger(name: string, data?: any) {
    this.listeners.get(name)?.forEach((cb) => cb(data));
  }
  off(name: string, cb: CBType) {
    this.listeners
      .get(name)
      ?.splice(this.listeners.get(name)?.indexOf(cb) || 0, 1);
  }

  setStorage(params: { key: string; data: any } & AsyncCallback<any, any>) {
    this.store[params.key] = params.data;
    params.success && params.success();
  }
  getStorage(params: { key: string } & AsyncCallback<any, any>) {
    params.success && params.success(this.store[params.key]);
  }
  removeStorage(params: { key: string } & AsyncCallback<any, any>) {
    delete this.store[params.key];
    params.success && params.success();
  }

  clearStorage(params: {} & AsyncCallback<any, any>) {
    this.store = {};
    params.success?.();
  }

  // getStorageInfo(params: { } & AsyncCallback<any, any>) {
  //   params.success && params.success({
  //     keys: Object.keys(store),
  //     currentSize: 0,
  //     limitSize: 0,
  //   })
  // },
  getStorageSync(key: string) {
    return this.store[key];
  }
  clearStorageSync() {
    this.store = {};
  }
  setStorageSync(key: string, data: any) {
    this.store[key] = data;
  }

  getStorageInfoSync() {
    return {
      keys: Object.keys(this.store),
      currentSize: 0,
      limitSize: 0,
    };
  }
  removeStorageSync(key: string) {
    delete this.store[key];
  }
  // getStorageKeys(params: { } & AsyncCallback<any, any>) {
  //   params.success && params.success(Object.keys(store))
  // },
  // getStorageKeysSync() {
  //   return Object.keys(store)
  // },
  batchGetStorage(params: { keyList: string[] } & AsyncCallback<any, any>) {
    params.success &&
      params.success(params.keyList.map((key) => this.store[key]));
  }
  batchGetStorageSync(keyList: string[]) {
    return keyList.map((key) => this.store[key]);
  }
  batchSetStorage(params: { kvList: KVList } & AsyncCallback<any, any>) {
    params.kvList.forEach((kv) => {
      this.store[kv.key] = kv.value;
    });
    params.success && params.success();
  }
  batchSetStorageSync(kvList: KVList) {
    kvList.forEach((kv) => {
      this.store[kv.key] = kv.value;
    });
  }

  request = mockRequest;

  connectSocket(params: { url: string }) {
    let closeHandler: (res: any) => void;
    let openHandler: (res: any) => void;
    let messageHandler: (data: object) => void;
    let errorHandler: (msg: string) => void;
    return {
      send(data: object) {},
      onOpen(handler: (res: any) => void) {
        openHandler = handler;
      },
      onClose(handler: (res: any) => void) {
        closeHandler = handler;
      },
      onError(handler: (msg: string) => void) {
        errorHandler = handler;
      },
      close() {
        if (closeHandler) {
          closeHandler({});
        }
      },
      onMessage(handler: (data: object) => void) {
        messageHandler = handler;
      },
    } as MPWeixinSocket;
  }

  canIUse(api: string) {
    return true;
  }

  getSystemInfoSync() {
    return {
      platform: 'devtools',
      version: '1.0.0',
      system: 'iOS 14.0.1',
    } as ReturnType<WXSystemAPI['getSystemInfoSync']>;
  }

  onError(cb: CBType) {
    this.listeners.get('onError')?.push(cb);
  }
  onUnHandledRejection(cb: CBType) {
    this.listeners.get('onUnHandledRejection')?.push(cb);
  }
  onAppShow(cb: CBType) {
    this.listeners.get('onAppShow')?.push(cb);
  }
  offAppShow(listener: () => void): void {
    this.off('onAppShow', listener);
  }
  getAccountInfoSync(): {
    miniProgram: {
      appId: string;
      envVersion: 'develop' | 'trial' | 'release';
      version: string;
    };
  } {
    return {
      miniProgram: {
        appId: 'wx1234567890abcdef',
        envVersion: 'develop',
        version: '1.0.0',
      },
    };
  }
}
