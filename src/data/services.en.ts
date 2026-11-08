/** SERVIÇOS — textos em inglês, por id (os ids e categorias ficam em services.ts). */
import type { CategoryId, ServiceText } from './services';

export const serviceCategoriesEn: Record<CategoryId, string> = {
  presenca: 'Online presence',
  gestao: 'Management and data',
  processos: 'Processes',
};

export const servicesEn: Record<string, ServiceText> = {
  sites: {
    name: 'Websites and landing pages',
    benefit: 'Websites that present your business clearly, showcase your services and make it easy for new customers to get in touch.',
    description: 'Designed mobile-first, with information in the right order and contact by WhatsApp or form. Catalogs and online stores too.',
    applications: ['Company and professional websites', 'Landing pages for a service or campaign', 'Product or property catalogs', 'Pages with a WhatsApp button and quote form'],
    cta: 'Request a website quote',
  },
  sistemas: {
    name: 'Web systems',
    benefit: 'Organize records, orders and controls in a system built around how your business works.',
    description: 'Runs in the browser, on a computer or phone, with the scope defined together with you.',
    applications: ['Admin panels', 'Digital catalogs with search and filters', 'Customer, order and service records', 'Internal control tools'],
    cta: 'Request a system quote',
  },
  dashboards: {
    name: 'Dashboards and data analysis',
    benefit: 'Track revenue, expenses and results in dashboards with indicators and charts that are easy to read.',
    description: 'Data can come from the spreadsheets or records you already use, with period filters and export to Excel.',
    applications: ['Revenue, expense and result indicators', 'Charts by period and category', 'Filterable, exportable reports', 'Analysis of existing spreadsheet data'],
    cta: 'Request a dashboard quote',
  },
  planilhas: {
    name: 'Smart spreadsheets',
    benefit: 'Simplify your controls with organized spreadsheets, automatic calculations and information always at hand.',
    description: 'In Excel or Google Sheets, with drop-down lists to prevent typing errors and summaries that update with every entry.',
    applications: ['Cash flow tracking', 'Inventory and sales tracking', 'Monthly indicators and reports', 'Management dashboards in Excel or Google Sheets'],
    cta: 'Request a spreadsheet quote',
  },
  automacoes: {
    name: 'Process automation',
    benefit: 'Cut repetitive tasks and organize the flow of information with automation.',
    description: 'Work starts by mapping your current routine, so only what makes sense for your case gets automated.',
    applications: ['Forms that fill spreadsheets automatically', 'Standardized reports and documents', 'Simple integrations between tools', 'Process review and simplification'],
    cta: 'Request an automation quote',
  },
  ferramentas: {
    name: 'Business tools and calculators',
    benefit: 'Calculate prices, standardize quotes and prepare proposals faster and more consistently.',
    description: 'Your pricing rules live in the tool: every quote shows the math and produces a document ready to send.',
    applications: ['Quote calculator with pricing variables', 'Proposal generator to print or save as PDF', 'Price and turnaround simulators', 'Price lists with discount rules'],
    cta: 'Request a tool quote',
  },
};
