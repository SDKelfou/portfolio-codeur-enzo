export interface Project {
  slug: string;
  name: string;
  href: string;
  external: boolean;
  example: boolean;
  inProgress?: boolean;
  /** which translated copy to use: work.items[n] or work.leos */
  copy: number | "leos";
  image: string;
  /** only what is actually known about how it was built */
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
    tech: ["HTML", "CSS", "SVG"],
  },
];
