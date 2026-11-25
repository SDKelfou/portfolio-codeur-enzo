# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: owners of local businesses in France (restaurants, cafés, hair salons, craftspeople, small shops). They usually arrive on the site after Enzo contacts them directly (cold prospecting: visit, phone, email, DM). Their job on the site: check in under a minute that Enzo is serious and competent, understand what they would get and for how much, then reply or ask for a quote. Many browse on a phone, between two customers.

Secondary: visitors from neighbouring countries (site in FR, EN, ES, DE, IT, PT, NL).

## Product Purpose

Showcase and sales support for Enzo's freelance web development service. The site is a credibility tool that backs up prospecting, not the main source of leads (the market is saturated; clients come from outreach). Success = a prospect who received a message from Enzo opens the site, is convinced, and replies or sends a quote request.

## Positioning

Very fast, well-referenced websites for local businesses, by one person who handles everything (design, code, hosting, domain) and stays reachable. Proof of speed must be demonstrable (the site itself must score high on PageSpeed). Against "anyone can make a site with AI": real craft, measurable performance, and human follow-up.

## Operating Context

- Prospect gets a link from Enzo, opens it on mobile, often on 4G.
- Contact happens by email (form pre-writes an email; no backend).
- Payments via Stripe Payment Links (to be added), quotes by email.
- Hosting on Vercel; repo on GitHub, `main` deploys to production.

## Capabilities and Constraints

- Offers: Essentiel from 799 €, Direction artistique from 990 €, Création totale on quote (on-quote can be below or above Essentiel), Formule Sérénité 30 €/month (domain registered in the client's name, secure hosting, updates, backups, single contact).
- Stack: Vite + React 19 + Tailwind 4, wouter routing, GSAP available; 7 languages via `src/i18n`.
- No sound effects (explicitly removed by the owner).
- Cookie consent banner and legal pages (mentions légales, confidentialité, CGV) required.
- Undecided: SIRET (registration in progress), owner's full legal name, custom domain, Stripe links, mediator.

## Brand Commitments

- Name: enzo.dev. Owner: Enzo, independent developer, not an agency.
- Icons: Papicons (`@getpapillon/papicons`) only.
- Voice: direct, plain French, no jargon, honest; formal "vous".
- Favourite colour, binding: yellow #FFF010.
- Owner-pinned art direction brief "FRACTURE — A Living Interface": light theme Porcelain and dark theme Obsidian, theme switch that fractures the screen, discreet particles, giant editorial typography. The site stays silent (no sound).

## Evidence on Hand

- NEXUS: Windows optimisation software designed and built by Enzo (https://nexus-multitools.nexus-multitools.workers.dev/), screenshot `public/projets/nexus.webp`.
- Two fictional example sites, presented as examples: Café Mistral (`public/exemples/cafe-mistral/`) and Atelier Lune (`public/exemples/atelier-lune/`), screenshots in `public/projets/`.
- No paying clients, testimonials, reviews, client logos or case-study numbers yet. Never fabricate them.
- The site's own performance scores are legitimate, verifiable proof once measured.

## Product Principles

1. Prove, don't claim: every promise (speed, quality) should be verifiable on the page itself.
2. Readable in 30 seconds on a phone: offer, price, contact.
3. Honest by default: examples labelled as examples, no invented social proof.
4. Fast first: no feature or effect may cost the site its own performance.
5. One person, fully accountable: the human behind the work is visible.

## Accessibility & Inclusion

WCAG AA contrast minimum on all text (explicit feedback: previous version failed contrast). Respect `prefers-reduced-motion`. Keyboard and screen-reader usable forms.
