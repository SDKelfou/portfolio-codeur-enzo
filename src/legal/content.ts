import { CONTACT_EMAIL, OWNER_NAME, SIRET, SITE_URL } from "../lib/site";

export interface LegalSection {
  id?: string;
  h: string;
  p: string[];
}
export interface LegalDoc {
  title: string;
  sections: LegalSection[];
}
export type LegalPageKey = "notice" | "privacy" | "terms";

const HOST_FR = "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com";
const HOST_EN = "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, United States — vercel.com";

const fr: Record<LegalPageKey, LegalDoc> = {
  notice: {
    title: "Mentions légales",
    sections: [
      {
        h: "Éditeur du site",
        p: [
          `Le site ${SITE_URL} est édité par ${OWNER_NAME}, développeur web indépendant.`,
          SIRET ? `SIRET : ${SIRET}` : "Activité en cours d'immatriculation : le numéro SIRET sera publié ici dès son obtention.",
          `Contact : ${CONTACT_EMAIL}`,
          `Directeur de la publication : ${OWNER_NAME}.`,
        ],
      },
      { h: "Hébergement", p: [`Le site est hébergé par ${HOST_FR}.`] },
      {
        h: "Propriété intellectuelle",
        p: [
          "L'ensemble des contenus de ce site (textes, design, code, animations, logos) est protégé par le droit d'auteur. Toute reproduction, même partielle, sans autorisation écrite préalable est interdite.",
          "Les projets « Café Mistral » et « Atelier Lune » sont des exemples fictifs réalisés pour illustrer mon savoir-faire : toute ressemblance avec des établissements existants serait fortuite.",
        ],
      },
      {
        h: "Responsabilité",
        p: [
          "Les informations de ce site sont fournies à titre indicatif et peuvent évoluer. Les prix affichés sont des prix de départ ; seul le devis accepté fait foi.",
        ],
      },
    ],
  },
  privacy: {
    title: "Politique de confidentialité et cookies",
    sections: [
      {
        h: "Responsable du traitement",
        p: [`${OWNER_NAME} — ${CONTACT_EMAIL}. Je collecte le minimum de données nécessaires et je ne les revends jamais.`],
      },
      {
        h: "Données que je traite",
        p: [
          "Demandes de contact et de devis : lorsque vous m'écrivez par e-mail, je reçois votre adresse e-mail, votre nom et le contenu de votre message. Base légale : mesures précontractuelles prises à votre demande. Durée de conservation : 3 ans après notre dernier échange, ou la durée légale de conservation des documents comptables si nous travaillons ensemble.",
          "Paiement en ligne : les paiements sont traités par Stripe. Je ne reçois ni ne stocke vos données bancaires. Voir stripe.com/fr/privacy.",
          "Hébergement : Vercel enregistre des journaux techniques (adresse IP, navigateur) nécessaires à la sécurité et au bon fonctionnement du site.",
          "Mesure d'audience (uniquement si vous l'acceptez) : Vercel Web Analytics produit des statistiques de visite agrégées et anonymes, sans cookie publicitaire et sans suivi d'un site à l'autre.",
        ],
      },
      {
        id: "cookies",
        h: "Cookies et stockage local",
        p: [
          "Essentiels (toujours actifs, sans consentement requis) : mémorisation de votre langue, de votre thème clair/sombre, de votre couleur et de vos choix de cookies, dans le stockage local de votre navigateur.",
          "Mesure d'audience (optionnelle) : chargée uniquement après votre accord. Votre choix est conservé 6 mois, puis vous sera redemandé.",
          "Vous pouvez modifier votre choix à tout moment via le lien « Gérer les cookies » en bas de chaque page.",
        ],
      },
      {
        h: "Transferts hors de l'Union européenne",
        p: [
          "Vercel et Stripe sont des sociétés américaines. Les transferts de données sont encadrés par le EU-U.S. Data Privacy Framework et/ou les clauses contractuelles types de la Commission européenne.",
        ],
      },
      {
        h: "Vos droits",
        p: [
          `Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité de vos données. Écrivez-moi à ${CONTACT_EMAIL} : je réponds sous un mois maximum.`,
          "Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).",
        ],
      },
    ],
  },
  terms: {
    title: "Conditions générales de vente",
    sections: [
      {
        h: "1. Objet",
        p: [
          `Les présentes conditions encadrent les prestations de création de sites web et de développement proposées par ${OWNER_NAME} (« le Prestataire ») à ses clients professionnels ou particuliers (« le Client »).`,
        ],
      },
      {
        h: "2. Devis et commande",
        p: [
          "Chaque prestation fait l'objet d'un devis gratuit et détaillé, valable 30 jours. La commande est ferme dès l'acceptation écrite du devis (par e-mail) et/ou le paiement de l'acompte.",
        ],
      },
      {
        h: "3. Prix",
        p: [
          "Les prix sont exprimés en euros. L'offre Essentiel démarre à 799 € et l'offre Direction artistique à 990 € ; la Création totale est sur devis. Tout devis, dont le montant peut être inférieur ou supérieur selon le projet. Le régime de TVA applicable est précisé sur le devis.",
        ],
      },
      {
        h: "4. Paiement",
        p: [
          "Un acompte, dont le montant est indiqué sur le devis, est demandé au lancement du projet ; le solde est dû à la livraison. Le paiement s'effectue par carte bancaire via Stripe (paiement sécurisé) ou par virement.",
          "Pour les clients professionnels, tout retard de paiement entraîne des pénalités au taux légal en vigueur et une indemnité forfaitaire de 40 € pour frais de recouvrement.",
        ],
      },
      {
        h: "4 bis. Formule Sérénité (hébergement et nom de domaine)",
        p: [
          "En option, pour 30 € par mois, le Prestataire prend en charge l'hébergement sécurisé du site (HTTPS), le renouvellement du nom de domaine, les mises à jour de sécurité et la sauvegarde du site.",
          "Le nom de domaine est enregistré au nom du Client, qui en est le titulaire légal. Le Prestataire en assure uniquement la gestion technique. Les modalités de durée et de résiliation sont précisées sur le devis.",
        ],
      },
      {
        h: "5. Délais et réalisation",
        p: [
          "Les délais sont indicatifs et dépendent de la remise par le Client des contenus nécessaires (textes, images, accès). Les retouches prévues au devis sont incluses ; les demandes supplémentaires font l'objet d'un devis complémentaire.",
        ],
      },
      {
        h: "6. Droit de rétractation (particuliers)",
        p: [
          "Le Client consommateur dispose d'un délai de 14 jours à compter de l'acceptation du devis pour se rétracter, sans justification, par simple e-mail. S'il demande expressément le démarrage de la prestation avant la fin de ce délai, il reste redevable du travail déjà réalisé. Ce droit ne s'applique pas aux clients professionnels.",
        ],
      },
      {
        h: "7. Propriété du site",
        p: [
          "Les droits d'exploitation du site livré sont cédés au Client après paiement intégral. Le Prestataire peut mentionner la réalisation dans son portfolio, sauf refus écrit du Client.",
        ],
      },
      {
        h: "8. Responsabilité",
        p: [
          "Le Client est responsable des contenus qu'il fournit (textes, images, marques) et garantit disposer des droits nécessaires à leur utilisation.",
        ],
      },
      {
        h: "9. Litiges",
        p: [
          "Les présentes conditions sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. Le Client consommateur peut recourir gratuitement à un médiateur de la consommation, dont les coordonnées seront précisées ici dès l'immatriculation de l'activité.",
        ],
      },
    ],
  },
};

const en: Record<LegalPageKey, LegalDoc> = {
  notice: {
    title: "Legal notice",
    sections: [
      {
        h: "Publisher",
        p: [
          `${SITE_URL} is published by ${OWNER_NAME}, independent web developer.`,
          SIRET ? `SIRET: ${SIRET}` : "Business registration in progress: the SIRET number will be published here once issued.",
          `Contact: ${CONTACT_EMAIL}`,
          `Publication director: ${OWNER_NAME}.`,
        ],
      },
      { h: "Hosting", p: [`This site is hosted by ${HOST_EN}.`] },
      {
        h: "Intellectual property",
        p: [
          "All content on this site (text, design, code, animations, logos) is protected by copyright. Any reproduction, even partial, without prior written consent is prohibited.",
          "“Café Mistral” and “Atelier Lune” are fictional examples created to showcase my work; any resemblance to existing businesses is coincidental.",
        ],
      },
      {
        h: "Liability",
        p: ["Information on this site is provided for guidance and may change. Prices shown are starting prices; only the accepted quote is binding."],
      },
    ],
  },
  privacy: {
    title: "Privacy and cookie policy",
    sections: [
      {
        h: "Data controller",
        p: [`${OWNER_NAME} — ${CONTACT_EMAIL}. I collect as little data as possible and never sell it.`],
      },
      {
        h: "Data I process",
        p: [
          "Contact and quote requests: when you email me, I receive your email address, your name and your message. Legal basis: pre-contractual steps taken at your request. Retention: 3 years after our last exchange, or the legal retention period for accounting records if we work together.",
          "Online payments are processed by Stripe. I never receive or store your card details. See stripe.com/privacy.",
          "Hosting: Vercel keeps technical logs (IP address, browser) required for security and operation of the site.",
          "Audience measurement (only if you accept): Vercel Web Analytics produces aggregated, anonymous visit statistics, with no advertising cookies and no cross-site tracking.",
        ],
      },
      {
        id: "cookies",
        h: "Cookies and local storage",
        p: [
          "Essential (always on, no consent required): your language, light/dark theme, accent colour and cookie choices are remembered in your browser's local storage.",
          "Audience measurement (optional): loaded only after your consent. Your choice is kept for 6 months, then asked again.",
          "You can change your choice at any time with the “Manage cookies” link at the bottom of every page.",
        ],
      },
      {
        h: "Transfers outside the EU",
        p: [
          "Vercel and Stripe are US companies. Transfers are covered by the EU-U.S. Data Privacy Framework and/or the European Commission's standard contractual clauses.",
        ],
      },
      {
        h: "Your rights",
        p: [
          `Under the GDPR you have the right to access, rectify, erase, object to, restrict and port your data. Email ${CONTACT_EMAIL}; I reply within one month.`,
          "You may also lodge a complaint with your data protection authority (in France: CNIL, cnil.fr).",
        ],
      },
    ],
  },
  terms: {
    title: "Terms and conditions of sale",
    sections: [
      {
        h: "1. Scope",
        p: [`These terms govern the website design and development services provided by ${OWNER_NAME} (“the Provider”) to business or private clients (“the Client”).`],
      },
      {
        h: "2. Quotes and orders",
        p: ["Every service is subject to a free, detailed quote valid for 30 days. The order is confirmed once the quote is accepted in writing (email) and/or the deposit is paid."],
      },
      {
        h: "3. Prices",
        p: ["Prices are in euros. The Essential offer starts at €799 and the Art Direction offer at €990; Full Creation is quoted individually. Any quote may cost less or more depending on the project. Applicable VAT is stated on the quote."],
      },
      {
        h: "4. Payment",
        p: [
          "A deposit, stated on the quote, is due when the project starts; the balance is due on delivery. Payment by card via Stripe (secure) or by bank transfer.",
          "For business clients, late payment incurs penalties at the statutory rate plus a €40 fixed recovery fee.",
        ],
      },
      {
        h: "4a. Peace of Mind plan (hosting and domain name)",
        p: [
          "As an option, for €30 per month, the Provider handles secure hosting (HTTPS), domain name renewal, security updates and website backups.",
          "The domain name is registered in the Client's name; the Client is its legal holder. The Provider only manages it technically. Duration and cancellation terms are set out in the quote.",
        ],
      },
      {
        h: "5. Timing and delivery",
        p: ["Timelines are indicative and depend on the Client providing the required content (text, images, access). Revisions included in the quote are free; additional requests are quoted separately."],
      },
      {
        h: "6. Right of withdrawal (consumers)",
        p: [
          "Consumer clients have 14 days from accepting the quote to withdraw, without giving a reason, by simple email. If they expressly ask for work to start before this period ends, they remain liable for work already done. This right does not apply to business clients.",
        ],
      },
      {
        h: "7. Ownership",
        p: ["Usage rights to the delivered website are transferred to the Client upon full payment. The Provider may feature the project in their portfolio unless the Client objects in writing."],
      },
      {
        h: "8. Liability",
        p: ["The Client is responsible for the content they supply (text, images, trademarks) and warrants that they hold the rights to use it."],
      },
      {
        h: "9. Disputes",
        p: [
          "These terms are governed by French law. An amicable solution will be sought first. Consumer clients may use a consumer mediation service free of charge; its details will be published here once the business is registered.",
        ],
      },
    ],
  },
};

export function getLegal(lang: string, page: LegalPageKey): LegalDoc {
  return (lang === "fr" ? fr : en)[page];
}
