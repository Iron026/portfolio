/** Etapas de trabalho e perguntas frequentes — inglês. */
import type { faqs, processSteps } from './content';

export const processStepsEn: typeof processSteps = [
  {
    title: 'First conversation',
    description: 'You tell me what you need through the form or WhatsApp. If something is missing, I ask before proposing anything.',
  },
  {
    title: 'Proposal and quote',
    description: 'You get the scope, milestones, timeline and price in writing, based on the size and complexity of the project. Work only starts once you approve.',
  },
  {
    title: 'Development you follow',
    description: 'At each milestone you get an update, review it and give feedback before moving on.',
  },
  {
    title: 'Testing and adjustments',
    description: 'Everything is tested on phones and computers. You review the final version, and the adjustments included in the proposal are made.',
  },
  {
    title: 'Delivery and support',
    description: 'You receive the files, access and usage guidance. The support period and future updates follow what was agreed in the proposal.',
  },
];

export const faqsEn: typeof faqs = [
  {
    question: 'How do I request a quote?',
    answer:
      'Fill in the form or message me on WhatsApp describing what you need. Examples, screenshots or spreadsheets you already use help me understand your case. With that information, I come back with questions if needed, and with a proposal.',
  },
  {
    question: 'How much does a project cost?',
    answer:
      'It depends on what needs to be built: number of pages or screens, features and integrations. That is why there is no fixed price list. Once I understand your needs, you receive a written proposal with scope, timeline and price, free and with no obligation.',
  },
  {
    question: 'What kinds of projects do you take on?',
    answer:
      'Company websites, landing pages, catalogs, tracking spreadsheets, dashboards, automation of repetitive tasks and small to medium web systems, such as admin panels and record systems.',
  },
  {
    question: 'How are timelines defined?',
    answer:
      'The timeline depends on the size of the project and how quickly content and approvals arrive. It is included in the proposal, broken down by milestone, before work begins.',
  },
  {
    question: 'Will I be able to update what is delivered?',
    answer:
      'Yes, in the parts agreed in the proposal. Content and data are organized to make the most common changes easy, and you receive written guidance on how to make them.',
  },
  {
    question: 'How does support work after delivery?',
    answer:
      'The proposal sets a period for fixing problems in what was delivered. Improvements, new features and ongoing maintenance after that are quoted separately.',
  },
  {
    question: 'Were the portfolio projects built for clients?',
    answer:
      'No. They are original demos, with fictional companies and data, created to show what I can build. The features described really work and can be tested.',
  },
];
