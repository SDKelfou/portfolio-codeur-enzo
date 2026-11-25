import { createContext, useContext, useEffect } from "react";

export interface HeadData {
  title: string;
  description: string;
  status?: number;
}

export const HeadCollector = createContext<HeadData | null>(null);

function setMeta(selector: string, value: string) {
  document.querySelector(selector)?.setAttribute("content", value);
}

export function usePageMeta(title: string, description: string, status?: number) {
  const collector = useContext(HeadCollector);
  if (collector) {
    collector.title = title;
    collector.description = description;
    if (status) collector.status = status;
  }

  useEffect(() => {
    document.title = title;
    setMeta('meta[name="description"]', description);
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description);
  }, [title, description]);
}
