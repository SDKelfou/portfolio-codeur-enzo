import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import crypto from "node:crypto";

const SITE = "https://portfolio-codeur-enzo.vercel.app";
const DIST = path.resolve("dist");
const ROUTES = ["/", "/projets", "/contact", "/mentions-legales", "/confidentialite", "/cgv"];
const EMAIL = "enzo.entreprise@hotmail.com";

const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const inline = template.match(/<script>([\s\S]*?)<\/script>/);
const hash = inline ? `'sha256-${crypto.createHash("sha256").update(inline[1]).digest("base64")}'` : "";
if (inline && !fs.readFileSync("vercel.json", "utf8").includes(hash)) {
  throw new Error(`vercel.json CSP must allow the inline theme script: ${hash}`);
}
const mod = await import(pathToFileURL(path.resolve("dist-ssr/entry-server.js")).href);
const { render, DICTS, LANGS, localizedPath } = mod;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const abs = (p) => `${SITE}${p === "/" ? "" : p}` || SITE;

function fileFor(url) {
  if (url === "/") return path.join(DIST, "index.html");
  return path.join(DIST, `${url.slice(1)}.html`);
}

function jsonLd(lang, route, t) {
  const blocks = [];
  if (route === "/") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: "enzo.dev",
      founder: { "@type": "Person", name: "Enzo", jobTitle: t.hero.role },
      description: t.meta.description,
      url: abs(localizedPath(lang, "/")),
      email: EMAIL,
      image: `${SITE}/og.png`,
      areaServed: ["FR", "BE", "CH", "LU", "ES", "DE", "IT", "PT", "NL"],
      availableLanguage: LANGS.map((l) => l.code),
      makesOffer: [
        ...t.offers.items.map((o) => ({
          "@type": "Offer",
          name: o.name,
          description: o.text,
          ...(o.price ? { price: o.price.replace(/[^\d]/g, ""), priceCurrency: "EUR" } : {}),
        })),
        { "@type": "Offer", name: t.care.name, description: t.care.text, price: "30", priceCurrency: "EUR" },
      ],
    });
  }
  if (route === "/" || route === "/contact") {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faq.items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n    ");
}

function page(lang, route, { html, head }, { noindex = false } = {}) {
  const t = DICTS[lang];
  const url = localizedPath(lang, route);
  const alternates = noindex
    ? ""
    : [
        ...LANGS.map((l) => `<link rel="alternate" hreflang="${l.code}" href="${abs(localizedPath(l.code, route))}" />`),
        `<link rel="alternate" hreflang="x-default" href="${abs(localizedPath("fr", route))}" />`,
      ].join("\n    ");
  const extra = [
    noindex ? `<meta name="robots" content="noindex" />` : `<link rel="canonical" href="${abs(url)}" />`,
    alternates,
    `<meta property="og:url" content="${abs(url)}" />`,
    `<meta property="og:locale" content="${t.meta.locale}" />`,
    noindex ? "" : jsonLd(lang, route, t),
  ]
    .filter(Boolean)
    .join("\n    ");

  return template
    .replace('<html lang="fr"', `<html lang="${lang}"`)
    .replace(/<title>.*?<\/title>/, `<title>${esc(head.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(head.description)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(head.title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(head.description)}"`)
    .replace("<!--head-extra-->", extra)
    .replace("<!--app-->", html);
}

let count = 0;
const sitemap = [];
for (const { code } of LANGS) {
  for (const route of ROUTES) {
    const url = localizedPath(code, route);
    const out = fileFor(url);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, page(code, route, render(url)));
    count++;
    const links = LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l.code}" href="${abs(localizedPath(l.code, route))}"/>`).join("");
    sitemap.push(`<url><loc>${abs(url)}</loc>${links}</url>`);
  }
}

fs.writeFileSync(path.join(DIST, "404.html"), page("fr", "/404", render("/__introuvable"), { noindex: true }));

const examples = ["/exemples/cafe-mistral/", "/exemples/atelier-lune/"].map((p) => `<url><loc>${SITE}${p}</loc></url>`);
fs.writeFileSync(
  path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${[...sitemap, ...examples].join("\n")}\n</urlset>\n`
);

const fr = DICTS.fr;
const en = DICTS.en;
const offersLine = (t) => t.offers.items.map((o) => `- ${o.name}: ${o.price ? `${t.offers.from} ${o.price}` : t.offers.onQuote}. ${o.text}`).join("\n");
fs.writeFileSync(
  path.join(DIST, "llms.txt"),
  `# enzo.dev — Enzo, ${fr.hero.role}

> ${fr.meta.description}

${fr.hero.lead}

## Offres / Offers
${offersLine(fr)}
- ${fr.care.name}: ${fr.care.price} ${fr.care.period}. ${fr.care.text}

${fr.offers.note}

## Réalisations / Work
- LEOS Export Consulting (${fr.work.inProgress}) — ${fr.work.leos.text} (https://leos-export-consulting.vercel.app/)
- Pizza'Belle (${fr.work.mockup}) — ${fr.work.pizza.text} (https://pizzabelle-saint-paul.vercel.app/)
- NEXUS — ${fr.work.items[0].text} (https://nexus-multitools.nexus-multitools.workers.dev/)
- Café Mistral — ${fr.work.items[1].text} (${SITE}/exemples/cafe-mistral/)
- Atelier Lune — ${fr.work.items[2].text} (${SITE}/exemples/atelier-lune/)

## Contact
- E-mail: ${EMAIL}
- ${fr.hero.reply}. ${fr.hero.based}.
- Devis / quote: ${SITE}/contact

## Pages
${ROUTES.map((r) => `- ${SITE}${r === "/" ? "" : r}`).join("\n")}
- English: ${SITE}/en — Español: ${SITE}/es — Deutsch: ${SITE}/de — Italiano: ${SITE}/it — Português: ${SITE}/pt — Nederlands: ${SITE}/nl

## English summary
${en.meta.description}
${offersLine(en)}
`
);

console.log(`prerendered ${count} pages + 404, sitemap.xml, llms.txt`);
