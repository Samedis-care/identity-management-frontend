const getEmailDomain = (email: string): string => {
  return email.split("@")[1].toLowerCase();
};

export default getEmailDomain;
