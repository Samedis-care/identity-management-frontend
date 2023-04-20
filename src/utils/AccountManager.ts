import CookieStorage from "./CookieStorage";
import { AuthFactorType } from "../pages/Auth/components/AuthPageLayout";
import { OauthTokenResponse } from "../api/ident-services/Auth";

export interface Account {
  id: string | null;
  email: string;
  name: string | null;
  avatar: string | null;
  session: {
    token: string;
    refresh: string | null;
    until: Date;
  } | null;
}

export interface PersistedAccount extends Omit<Account, "session"> {
  session:
    | (Omit<NonNullable<Account["session"]>, "until"> & {
        until: string;
      })
    | null;
}

class AccountManager {
  private static STORAGE: Storage = localStorage ?? CookieStorage;
  private static ACCOUNT_STORAGE_KEY: string = "accounts";

  public static isEmpty(): boolean {
    return this.getAccounts().length === 0;
  }

  public static addAccount(newAccount: Account): Account {
    const allAccounts = this.getAccounts();
    const alreadyAccount = allAccounts.find(
      (entry) =>
        entry.id === newAccount.id ||
        entry.email.toLowerCase() === newAccount.email.toLowerCase()
    );
    if (alreadyAccount) return alreadyAccount;
    this.setAccounts([...allAccounts, newAccount]);
    return newAccount;
  }

  public static updateAccount(updateParams: Partial<Account>): Account {
    const allAccounts = this.getAccounts();
    const currentAccount = allAccounts.find(
      (entry: Account): boolean =>
        entry.id === updateParams.id ||
        entry.email.toLowerCase() === updateParams.email?.toLowerCase()
    );
    if (!currentAccount) throw new Error("Account not found in database");
    const updatedAccount = { ...currentAccount, ...updateParams };
    this.setAccounts(
      allAccounts.map((entry) =>
        entry === currentAccount ? updatedAccount : entry
      )
    );
    return updatedAccount;
  }

  public static find(id: string): Account | undefined {
    return this.getAccounts().find(
      (entry: Account) => id === entry.id || id === entry.email
    );
  }

  public static forgetAccount(id: string): void {
    this.setAccounts(
      this.getAccounts().filter(
        (entry) => id !== entry.id && id !== entry.email
      )
    );
  }

  public static forceFind(id: string): Account {
    const result = this.find(id);
    if (!result) throw new Error("Account not found");
    return result;
  }

  public static getAuthFactors(resp: OauthTokenResponse): AuthFactorType[] {
    return [
      resp.data.attributes.otp_enabled &&
        !resp.data.attributes.otp_provided &&
        AuthFactorType.TOPT,
    ].filter((e): e is AuthFactorType => !!e);
  }

  public static getAccounts(): Account[] {
    try {
      const rawData = this.STORAGE.getItem(this.ACCOUNT_STORAGE_KEY);
      if (!rawData) return [];
      const parsed = JSON.parse(rawData);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(this.loadAccount);
    } catch (e) {
      console.error("Failed AccountManager.getAccounts", e);
      return [];
    }
  }

  private static setAccounts(accounts: Account[]) {
    try {
      const accountJson = JSON.stringify(accounts.map(this.persistAccount));
      this.STORAGE.setItem(this.ACCOUNT_STORAGE_KEY, accountJson);
    } catch (e) {
      console.error("Failed AccountManager.setAccounts", e);
    }
  }

  private static loadAccount(record: PersistedAccount): Account {
    return {
      ...record,
      session: record.session
        ? {
            ...record.session,
            until: new Date(record.session.until),
          }
        : null,
    };
  }

  private static persistAccount(record: Account): PersistedAccount {
    return {
      ...record,
      session: record.session
        ? {
            ...record.session,
            until: record.session.until.toISOString(),
          }
        : null,
    };
  }
}

export default AccountManager;
