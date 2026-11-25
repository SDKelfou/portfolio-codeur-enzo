export const SITE_URL = "https://portfolio-codeur-enzo.vercel.app";
export const CONTACT_EMAIL = "enzo.entreprise@hotmail.com";
export const OWNER_NAME = "Enzo";
export const SIRET = "";

export const STRIPE_LINKS: Record<"essentiel", string> = {
  essentiel: "",
};

export function mailto(subject: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
