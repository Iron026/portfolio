/**
 * PROJETOS — textos em inglês.
 * Mesma estrutura dos textos em português de src/data/projects.ts.
 * Nomes de projetos, slugs, capturas e regras ficam no arquivo principal.
 */
import type { ProjectText } from './projects';

export const projectsEn: Record<string, ProjectText> = {
  'prime-imoveis': {
    category: 'Real estate portal',
    teaser: 'Property catalog with search, combined filters and a page for each listing with a gallery and a ready-made inquiry.',
    summary:
      'Website for real estate agencies and brokers: a property catalog with search, combined filters and a page for every listing, with an illustrative gallery and a ready-to-send inquiry message.',
    problem:
      'Listings scattered across messages and social media are hard to compare. A catalog brings everything to one address, with filters and a direct inquiry on every listing.',
    features: [
      'Catalog of 12 fictional properties',
      'Filters for purpose, neighborhood, type, price range and bedrooms',
      'Search by name, neighborhood or feature',
      'Listing page with an illustrative image gallery',
      'Bedrooms, bathrooms, parking and area at a glance',
      'Ready-to-copy inquiry message on every listing',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'React Router'],
    quoteCta: 'I want a property catalog like this',
    goal: 'Bring every property into a single catalog that is easy to filter on a phone, where each listing leads the visitor to an inquiry with the right details.',
    decisions: [
      { title: 'Filters kept in the address', text: 'Purpose, neighborhood, type, price range and bedrooms live in the URL. A search can be shared, and the browser back button works the way visitors expect.' },
      { title: 'Light, honest images', text: 'The gallery uses SVG illustrations generated in code and labeled as illustrative, instead of stock photos that could be mistaken for real properties.' },
      { title: 'Accessible gallery', text: 'Images change by tap, click or arrow keys, and screen readers announce which image is shown.' },
      { title: 'Inquiry without a server', text: 'Each listing builds an inquiry with its code, price and address, ready to copy: nothing is sent without the visitor taking action.' },
    ],
    needs: [
      { who: 'People looking for a home', text: 'Filter by purpose, neighborhood, type, price and bedrooms on a phone, and share the search with the same results.' },
      { who: 'Brokers and agencies', text: 'Keep every listing at one address and receive inquiries that already mention the code, price and address.' },
    ],
    tryIt: [
      'Open the catalog and choose between Buy and Rent.',
      'Combine neighborhood, type and bedrooms, or search for a feature such as "furnished".',
      'Open a listing and browse the images by tap, click or arrow keys.',
      'Copy the ready-made inquiry message.',
    ],
    adaptations: [
      'Your real listings, photos and neighborhoods',
      'Inquiries sent straight to your WhatsApp or email',
      'Listings managed from a spreadsheet or a simple admin panel, without touching code',
      'Your own domain, such as youragency.com',
    ],
    screens: [
      { alt: 'Prime Imóveis catalog with search, filters and property cards', caption: 'Catalog with keyword search and combined filters' },
      { alt: 'Listing page with illustrative gallery, price and inquiry button', caption: 'Listing page: gallery, prices and inquiry' },
      { alt: 'Prime Imóveis catalog on a phone', caption: 'The same catalog on a phone' },
    ],
    videoShows: 'Keyword search plus purpose, neighborhood and type filters updating the property list.',
  },
  gestao360: {
    category: 'Financial and sales dashboard',
    teaser: 'Financial dashboard with revenue, expenses and net result, charts that follow the filters and export to Excel.',
    summary:
      'Management dashboard that calculates revenue, expenses, net result and number of transactions, with charts that follow the filters and a CSV export for Excel.',
    problem:
      'Many businesses record sales and expenses but cannot see the result for the period at a glance. The dashboard turns a list of transactions into indicators and charts that change with the period and filters.',
    features: [
      'Indicators calculated from the filtered transactions',
      'Revenue and expenses by week (30 and 90 days) or by month (12 months)',
      'Expenses by category',
      'Filters for period (30 days, 90 days and 12 months), type and category',
      'Transaction search and paginated table',
      'CSV export of the current filter, ready for Excel',
    ],
    technologies: ['React', 'TypeScript', 'React Router', 'SVG charts', 'CSV export'],
    quoteCta: 'I want a dashboard like this',
    goal: 'Turn a list of transactions into quick answers: how much came in, how much went out, what the result was and where the money went in the chosen period.',
    decisions: [
      { title: 'One filter for everything', text: 'Indicators, charts, table and export share the same slice of data, so the numbers on screen always match the exported file.' },
      { title: 'A timeline without gaps', text: 'Charts group by week (30 and 90 days) or by month (12 months), show periods with no activity and flag when the first or last week is incomplete.' },
      { title: 'Custom, accessible charts', text: 'The charts are drawn in code, without a charting library: the page stays lighter, and every point can be reached by keyboard, with descriptions for screen readers.' },
      { title: 'CSV that opens correctly', text: 'The export follows the page language: English uses commas, decimal points and ISO dates; Portuguese follows Brazilian Excel, with semicolons, decimal commas and dd/mm/yyyy dates.' },
    ],
    needs: [
      { who: 'Business owners', text: 'See how much came in, how much went out and the result for the period without doing the math by hand.' },
      { who: 'Whoever handles the finances', text: 'Filter by period, type and category, find transactions with search and take the same slice to Excel.' },
    ],
    tryIt: [
      'Switch the period between 30 days, 90 days and 12 months and watch indicators and charts recalculate.',
      'Filter only expenses, or a single category, to see where the money went.',
      'Find a transaction with the table search.',
      'Export the current filter as CSV and open it in Excel.',
    ],
    adaptations: [
      'Your own data, imported from the spreadsheets or system you already use',
      'Categories, indicators and periods that fit your business',
      'Login access for your team',
      'An Excel or Google Sheets version when a web dashboard is not needed',
    ],
    screens: [
      { alt: 'Gestão360 dashboard with filters and revenue, expense, result and transaction indicators', caption: 'Dashboard with filters and calculated indicators' },
      { alt: 'Gestão360 chart and transaction table filtered to 30 days', caption: '30-day view: weekly chart and transaction table' },
      { alt: 'Gestão360 dashboard on a phone', caption: 'The dashboard on a phone' },
    ],
    videoShows: 'Period, type and search filters applied: indicators and charts recalculate instantly.',
  },
  'nova-servicos': {
    category: 'Service landing page',
    teaser: 'Service page that guides visitors to a complete quote request, with a validated form.',
    summary:
      'Landing page for a home services company, organized to guide the visitor to a quote request with a validated form.',
    problem:
      'People looking for a service provider give up when they cannot quickly find what is offered and how to ask for a quote. The page presents information in the order customers decide and keeps the request one tap away.',
    features: [
      'Structure designed for conversion',
      'Services, benefits and how-it-works sections',
      'Frequently asked questions',
      'Quote form with validation',
      'Request message ready to copy, without a server',
      'Layout designed mobile-first',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    quoteCta: 'I want a landing page like this',
    goal: 'Take the visitor, in the order they decide, from "what do you do?" to a complete quote request, without creating an account.',
    decisions: [
      { title: 'Anchor-guided page', text: 'The menu and buttons lead to each section with scrolling offset by the fixed header, including in the mobile menu.' },
      { title: 'Service shortcuts', text: 'Choosing a service at the top or in the cards opens the form with that service already selected.' },
      { title: 'Validation in field order', text: 'Errors appear next to each field, and focus moves to the first field with a problem, following the order on screen.' },
      { title: 'No fake submission', text: 'Without a real recipient, the page does not pretend to send anything: it builds the request message for the visitor to copy.' },
    ],
    needs: [
      { who: 'Customers looking for a service', text: 'Quickly understand what is offered and how the service works, and ask for a quote without creating an account.' },
      { who: 'Service providers', text: 'Receive more complete requests, with the service, contact details and description in a single message.' },
    ],
    tryIt: [
      'Pick a service from the shortcuts at the top or from the service cards.',
      'See the form open with that service already selected.',
      'Try to submit with an empty field to see validation and focus on the first error.',
      'Fill in everything and copy the ready-made request message.',
    ],
    adaptations: [
      'Your services, service area, photos and copy',
      'Requests sent straight to your WhatsApp or email',
      'An always-visible WhatsApp button and links to maps and social media',
      'Your own domain and basic search engine setup (SEO)',
    ],
    screens: [
      { alt: 'Top of the Nova Serviços landing page with the main headline and service shortcuts', caption: 'First screen with a clear offer and service shortcuts' },
      { alt: 'Nova Serviços quote form being filled in', caption: 'Quote form with validation' },
      { alt: 'Nova Serviços landing page on a phone', caption: 'Layout designed mobile-first' },
    ],
    videoShows: 'A service shortcut leading to the form, filling it in and the request ready to send.',
  },
  'arena-store': {
    category: 'Demo online store',
    teaser: 'Online store with search, sizes and stock, a cart saved in the browser and a simulated checkout.',
    summary:
      'Sporting goods store with search, filters, size and quantity selection, a cart saved in the browser and a simulated checkout, with no charge.',
    problem:
      'In an online store, customers need to know exactly what they are buying, in which size and for how much. The demo covers the full path from product to cart, with the total calculated.',
    features: [
      'Catalog of 8 fictional products with illustrative stock',
      'Search, category filters and sorting by price',
      'Size and quantity selection limited by stock',
      'Cart with editing, removal, subtotal, fictional shipping and total',
      'Cart saved in the browser, with prices always taken from the catalog',
      'Checkout clearly labeled as a simulation, with no payment',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Browser storage'],
    quoteCta: 'I want an online store like this',
    goal: 'Show the full purchase path, from catalog to checkout, making the product, size, quantity and price clear at every step.',
    decisions: [
      { title: 'Prices always from the catalog', text: 'The cart stores only product, size and quantity. Prices come from the catalog on every load, so a value changed in the browser does not change the total.' },
      { title: 'Saved cart, checked on load', text: 'When the store opens, saved data is checked: items that no longer exist are dropped and quantities above stock are adjusted, with a notice to the visitor.' },
      { title: 'Stock respected', text: 'Quantity buttons and the cart never go beyond the illustrative stock of each size.' },
      { title: 'Simulation clearly labeled', text: 'The checkout asks the visitor to confirm it is a simulation, and a fixed notice on every screen says no purchase is processed and no payment is made.' },
    ],
    needs: [
      { who: 'Shoppers', text: 'Find the product by search or category, choose size and quantity and check the total before finishing.' },
      { who: 'Store owners', text: 'Show the stock of each size and avoid orders for more than is available.' },
    ],
    tryIt: [
      'Search for a product, or filter by category and sort by price.',
      'Open a product, choose size and quantity and add it to the cart.',
      'In the cart, change quantities and see the subtotal, fictional shipping and total.',
      'Reload the page: the cart is still there. Checkout is a simulation, with no payment.',
    ],
    adaptations: [
      'Your products, photos, sizes and stock',
      'Orders completed over WhatsApp, as a catalog with a cart',
      'Online payment and calculated shipping, evaluated according to your sales volume',
      'A panel or spreadsheet to update prices and stock',
    ],
    screens: [
      { alt: 'Arena Store catalog with search, categories and sorting', caption: 'Catalog with search, categories and sorting' },
      { alt: 'Arena Store product page with size and quantity selection', caption: 'Product with size, quantity and stock' },
      { alt: 'Arena Store cart with subtotal, fictional shipping and total', caption: 'Cart with subtotal, fictional shipping and total' },
      { alt: 'Arena Store catalog on a phone', caption: 'The store on a phone' },
    ],
    videoShows: 'Product search, size and quantity choice, item in the cart and updated total.',
  },
  orcafacil: {
    category: 'Business calculator',
    teaser: 'Quote calculator with fixed pricing rules, discounts and a proposal ready to print or save as PDF.',
    summary:
      'Quote calculator set up for a fictional print shop: it applies material, finish, turnaround and discount, and builds a proposal to print or save as PDF.',
    problem:
      'Quotes worked out in someone’s head or in different spreadsheets make the same service come out at different prices. The calculator always applies the same rules, shows the math for every line and prepares the proposal.',
    features: [
      'Editable catalog with up to 10 products or services',
      'Three pricing variables: material, finish and turnaround',
      'Subtotals, discount and total calculated in cents',
      'Detailed calculation for every line of the quote',
      'Proposal to print or save as PDF from the browser',
      'Summary ready to copy and catalog saved in the browser',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Print and PDF', 'Browser storage'],
    quoteCta: 'I want a quote generator like this',
    goal: 'Make the same service always cost the same: fixed pricing rules, the math visible line by line and a proposal ready to send.',
    decisions: [
      { title: 'No rounding surprises', text: 'Amounts are calculated in whole cents, avoiding the rounding differences common in calculations with decimals and percentages.' },
      { title: 'Math you can follow', text: 'Every quote line shows the full calculation: base price, material multiplier and finish and turnaround surcharges.' },
      { title: 'PDF without an external generator', text: 'The proposal has its own print stylesheet: the browser prints or saves only the document, on a single A4 page.' },
      { title: 'Local catalog, validated', text: 'The editable catalog is saved in the browser and checked on load; invalid data falls back to the sample catalog.' },
    ],
    needs: [
      { who: 'Whoever prepares quotes', text: 'Apply the same pricing rules to every customer, without redoing the math or checking loose price lists.' },
      { who: 'Customers receiving the proposal', text: 'Get an organized document with items, amounts and total, to print or keep as a PDF.' },
    ],
    tryIt: [
      'Add items and choose the material, finish and turnaround for each one.',
      'Check the detailed math for every line and apply a discount.',
      'Open the proposal and print it or save it as PDF from the browser.',
      'Edit the product and price catalog: it stays saved in the browser.',
    ],
    adaptations: [
      'Your products, services and pricing rules',
      'A proposal with your brand, company details and terms',
      'A spreadsheet version, if your team already works in Excel or Google Sheets',
      'Quote history and sending the proposal over WhatsApp or email',
    ],
    screens: [
      { alt: 'OrçaFácil with items being added and material, finish and turnaround options', caption: 'Building a quote with the three pricing variables' },
      { alt: 'Preview of the business proposal generated by OrçaFácil', caption: 'Proposal ready to print or save as PDF' },
      { alt: 'OrçaFácil on a phone', caption: 'The calculator on a phone' },
    ],
    videoShows: 'Items with material and turnaround, a discount applied and the proposal built with the calculated amounts.',
  },
};
