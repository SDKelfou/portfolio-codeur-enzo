export interface Project {
  slug: string;
  name: string;
  href: string;
  external: boolean;
  example: boolean;
  inProgress?: boolean;
  mockup?: boolean;

  copy: number | "leos" | "pizza";
  image: string;

  mobile: string;

  tech: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "leos-export",
    name: "LEOS Export Consulting",
    href: "https://leos-export-consulting.vercel.app/",
    external: true,
    example: false,
    inProgress: true,
    copy: "leos",
    image: "/projets/leos-export.webp",
    mobile: "/projets/leos-export-m.webp",
    tech: [],
  },
  {
    slug: "pizzabelle",
    name: "Pizza'Belle",
    href: "https://pizzabelle-saint-paul.vercel.app/",
    external: true,
    example: false,
    mockup: true,
    copy: "pizza",
    image: "/projets/pizzabelle.webp",
    mobile: "/projets/pizzabelle-m.webp",
    tech: [],
  },
  {
    slug: "nexus",
    name: "NEXUS",
    href: "https://nexus-multitools.nexus-multitools.workers.dev/",
    external: true,
    example: false,
    copy: 0,
    image: "/projets/nexus.webp",
    mobile: "/projets/nexus-m.webp",
    tech: [],
  },
  {
    slug: "cafe-mistral",
    name: "Café Mistral",
    href: "/exemples/cafe-mistral/",
    external: false,
    example: true,
    copy: 1,
    image: "/projets/cafe-mistral.webp",
    mobile: "/projets/cafe-mistral-m.webp",
    tech: ["HTML", "CSS", "SVG"],
  },
  {
    slug: "atelier-lune",
    name: "Atelier Lune",
    href: "/exemples/atelier-lune/",
    external: false,
    example: true,
    copy: 2,
    image: "/projets/atelier-lune.webp",
    mobile: "/projets/atelier-lune-m.webp",
    tech: ["HTML", "CSS", "SVG"],
  },
];
