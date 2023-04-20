export const isValidTotp = (totp: string): boolean => {
  return /^[A-F0-9]{0,2}[0-9]{6}$/.test(totp);
};

export const isRecoveryTotp = (totp: string) => {
  return /^[A-F0-9]{2}[0-9]{6}$/.test(totp);
};

export const isRegularTotp = (totp: string) => {
  return /^[0-9]{6}$/.test(totp);
};

export const stripInvalidTotpChars = (totp: string): string => {
  return totp.replaceAll(/[^A-F0-9]/g, "").substr(0, 8);
};
