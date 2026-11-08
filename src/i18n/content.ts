/**
 * Conteúdo do site no idioma da página: textos de site.ts, serviços,
 * projetos, processo e perguntas frequentes. Os componentes usam estes
 * hooks em vez de importar os dados diretamente.
 */
import { useMemo } from 'react';
import { site } from '@/config/site';
import { siteEn } from '@/config/site.en';
import { faqs, processSteps } from '@/data/content';
import { faqsEn, processStepsEn } from '@/data/content.en';
import { getLocalizedProject, getProjects } from '@/data/projects';
import { getServiceCategories, getServices } from '@/data/services';
import type { Locale } from './locale';
import { useLocale } from './useLocale';

export function siteText(locale: Locale) {
  if (locale === 'pt') {
    return {
      ownerRole: site.ownerRole as string,
      headline: site.headline as string,
      description: site.description as string,
      hero: site.hero,
      whatsappGreeting: site.contact.whatsappGreeting as string,
      about: site.about,
      tools: site.tools as readonly string[],
    };
  }
  return siteEn;
}

export function useSiteText() {
  const { locale } = useLocale();
  return siteText(locale);
}

export function useProjects() {
  const { locale } = useLocale();
  return useMemo(() => getProjects(locale), [locale]);
}

export function useProject(slug: string | undefined) {
  const { locale } = useLocale();
  return useMemo(() => getLocalizedProject(slug, locale), [slug, locale]);
}

export function useServices() {
  const { locale } = useLocale();
  return useMemo(() => ({ services: getServices(locale), categories: getServiceCategories(locale) }), [locale]);
}

export function useFaqs() {
  const { locale } = useLocale();
  return locale === 'pt' ? faqs : faqsEn;
}

export function useProcessSteps() {
  const { locale } = useLocale();
  return locale === 'pt' ? processSteps : processStepsEn;
}
