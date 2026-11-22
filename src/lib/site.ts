/**
 * Infos du site, centralisées ici pour être modifiées en un seul endroit.
 * ⚠ À compléter dès que possible (obligatoire pour les mentions légales) :
 *   - OWNER_NAME : nom et prénom complets
 *   - SIRET : à ajouter dès l'immatriculation (laisser "" en attendant)
 */
export const SITE_URL = "https://portfolio-codeur-enzo.vercel.app";
export const CONTACT_EMAIL = "enzo.entreprise@hotmail.com";
export const OWNER_NAME = "Enzo";
export const SIRET = "";

/**
 * Liens de paiement Stripe (Payment Links). Laisser "" pour masquer le bouton.
 * Créez le lien sur dashboard.stripe.com → Payment Links, puis collez l'URL ici.
 * Exemple : essentiel: "https://buy.stripe.com/xxxxxxxx"
 */
export const STRIPE_LINKS: Record<"essentiel", string> = {
  essentiel: "",
};

export function mailto(subject: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
