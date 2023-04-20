import Cookies from "js-cookie";

class CookieStorageBase implements Storage {
  get length() {
    return Object.keys(Cookies.get()).length;
  }

  clear(): void {
    document.cookie = "";
  }

  getItem(key: string): string | null {
    return Cookies.get(key) ?? null;
  }

  key(index: number): string | null {
    return Object.keys(Cookies.get())[index] ?? null;
  }

  removeItem(key: string): void {
    Cookies.remove(key);
  }

  setItem(key: string, value: string): void {
    Cookies.set(key, value);
  }
}

const cookieStorage = new Proxy(new CookieStorageBase(), {
  get(target, name, receiver) {
    if (Reflect.has(target, name)) {
      return Reflect.get(target, name, receiver);
    }
    return target.getItem(name.toString());
  },
});

export default cookieStorage;
