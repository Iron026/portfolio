import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, Copy, ExternalLink, Info, Mail, MessageCircle, Send, X } from 'lucide-react';
import { getLocalizedProject, type Project } from '@/data/projects';
import { getServices, type Service } from '@/data/services';
import { site } from '@/config/site';
import { useLocale } from '@/i18n/useLocale';
import { useSiteText } from '@/i18n/content';
import { useUi, type UiText } from '@/i18n/ui';
import {
  contact,
  formatPhone,
  hasAnyChannel,
  hasEmail,
  hasProfile,
  hasWhatsapp,
  mailtoLink,
  whatsappLink,
} from '@/utils/contact';
import { Section, SectionHeading } from '@/components/ui/Section';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { ContactFlow } from './ContactFlow';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type Canal = 'whatsapp' | 'email';

interface FormValues {
  nome: string;
  /** Canal escolhido para o retorno: define o teclado, a validação e o texto do campo. */
  canal: Canal;
  retorno: string;
  servico: string;
  mensagem: string;
}

type Errors = Partial<Record<Exclude<keyof FormValues, 'canal'>, string>>;

const CANAL = {
  whatsapp: { type: 'tel', inputMode: 'tel', autoComplete: 'tel' },
  email: { type: 'email', inputMode: 'email', autoComplete: 'email' },
} as const;

/** Formata um telefone brasileiro enquanto a pessoa digita: (71) 98888-7777. */
function formatPhoneInput(raw: string) {
  const d = raw.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const OTHER = 'outro';

function validate(values: FormValues, e: UiText['contact']['errors']): Errors {
  const errors: Errors = {};
  if (values.nome.trim().length < 2) errors.nome = e.name;
  const retorno = values.retorno.trim();
  if (values.canal === 'email') {
    if (!retorno) errors.retorno = e.emailEmpty;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(retorno)) errors.retorno = e.emailInvalid;
  } else {
    const digits = retorno.replace(/\D/g, '');
    if (!digits) errors.retorno = e.phoneEmpty;
    else if (digits.length < 10 || digits.length > 11) errors.retorno = e.phoneLength;
    else if (!/^[1-9]{2}/.test(digits)) errors.retorno = e.phoneDdd;
    else if (digits.length === 11 && digits[2] !== '9') errors.retorno = e.phoneMobile;
  }
  if (!values.servico) errors.servico = e.service;
  const msg = values.mensagem.trim();
  if (msg.length < 20) errors.mensagem = e.messageShort;
  else if (msg.length > 1500) errors.mensagem = e.messageLong;
  return errors;
}

function buildMessage(values: FormValues, reference: Project | null, services: Service[], m: UiText['contact']['message']) {
  const serviceName = services.find((s) => s.id === values.servico)?.name ?? m.otherService;
  return [
    m.hello(values.nome.trim()),
    `${m.type}: ${serviceName}`,
    ...(reference ? [m.reference(reference.name)] : []),
    `${m.returnBy(values.canal)}: ${values.retorno.trim()}`,
    '',
    values.mensagem.trim(),
  ].join('\n');
}

export function Contact() {
  const location = useLocation();
  const { locale } = useLocale();
  const ui = useUi();
  const t = ui.contact;
  const text = useSiteText();
  const services = getServices(locale);
  const message = () => buildMessage(values, reference, services, t.message);
  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>({ nome: '', canal: 'whatsapp', retorno: '', servico: '', mensagem: '' });
  /** Mensagem exibida para cópia manual quando a área de transferência não está disponível. */
  const [manualCopy, setManualCopy] = useState(false);
  /** Mostra o link de reserva do WhatsApp depois de tentar abrir a nova aba. */
  const [waFallback, setWaFallback] = useState(false);
  /** Mostra a alternativa ao aplicativo de e-mail (nem todo aparelho tem um configurado). */
  const [mailFallback, setMailFallback] = useState(false);
  const manualRef = useRef<HTMLTextAreaElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState('');
  const [reference, setReference] = useState<Project | null>(null);

  // Pré-seleciona o serviço vindo de "Pedir orçamento de ..." ou de um projeto ("Quero ... assim")
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const project = getLocalizedProject(params.get('projeto') ?? undefined, locale) ?? null;
    const servico = params.get('servico') ?? project?.service;
    setReference(project);
    if (servico && (servico === OTHER || services.some((s) => s.id === servico))) {
      setValues((v) => ({ ...v, servico }));
    }
  }, [location.search, locale]);

  function update<K extends keyof Errors>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function changeCanal(canal: Canal) {
    // Mantém o que já foi digitado só se fizer sentido no novo canal
    setValues((v) => ({
      ...v,
      canal,
      retorno: canal === 'whatsapp' ? (v.retorno.includes('@') ? '' : formatPhoneInput(v.retorno)) : v.retorno.includes('@') ? v.retorno : '',
    }));
    setErrors((e) => ({ ...e, retorno: undefined }));
  }

  function check(): boolean {
    const found = validate(values, t.errors);
    setErrors(found);
    const first = (Object.keys(found) as Array<keyof Errors>)[0];
    if (first) {
      setStatus('');
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return false;
    }
    return true;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!check()) return;
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const channel = submitter?.value;
    const msg = message();
    if (channel === 'whatsapp' && hasWhatsapp) {
      window.open(whatsappLink(msg), '_blank', 'noopener,noreferrer');
      setWaFallback(true);
      setStatus(t.status.whatsapp);
    } else if (channel === 'email' && hasEmail) {
      window.location.href = mailtoLink(t.message.subject(values.nome.trim()), msg);
      setMailFallback(true);
      setStatus(t.status.email);
    }
  }

  async function copyMessage() {
    if (!check()) return;
    try {
      await navigator.clipboard.writeText(message());
      setManualCopy(false);
      setStatus(t.status.copied);
    } catch {
      // Sem acesso à área de transferência (navegador antigo, permissão negada ou página sem HTTPS):
      // a mensagem aparece em um campo já selecionado para a pessoa copiar.
      setManualCopy(true);
      setStatus(t.status.copyFailed);
      window.setTimeout(() => {
        manualRef.current?.focus();
        manualRef.current?.select();
      }, 0);
    }
  }

  const fieldClass = (hasError: boolean) =>
    cn(
      'mt-2 block w-full rounded-lg bg-paper px-4 py-3 text-base text-ink ring-1 transition-[box-shadow,background-color] placeholder:text-slate/70 hover:ring-ink/25 focus:bg-card focus:outline-none focus:ring-2',
      hasError ? 'ring-red-600 focus:ring-red-600' : 'ring-line focus:ring-tide-deep',
    );

  return (
    <Section id="contato" labelledBy="contato-title" tone="dark" className="bg-ink!" background={<AmbientBackground variant="contact" />}>
      {/*
        No celular a ordem é título → formulário → canais, para quem toca em "Pedir orçamento"
        encontrar o formulário logo abaixo do título. No desktop o formulário ocupa a coluna da
        direita nas duas linhas, como antes.
      */}
      <div className="grid gap-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-10 lg:gap-y-0 [&>*]:min-w-0">
        <div className="lg:col-span-5">
          <SectionHeading
            id="contato-title"
            index="06"
            label={ui.sections.contact.label}
            stacked
            title={
              <>
                {t.title[0]}
                <span className="text-tide">{t.title[1]}</span>
              </>
            }
          />
          <p className="type-lead mt-6 text-mist">{t.lead}</p>
          {hasAnyChannel && (
            <p className="type-small mt-4 text-mist lg:hidden">
              {t.quick}{' '}
              {hasWhatsapp && (
                <a href={whatsappLink(text.whatsappGreeting)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center font-semibold text-tide underline underline-offset-4">
                  {t.quickWhatsapp}
                  <span className="sr-only"> {ui.common.newTab}</span>
                </a>
              )}
              {hasWhatsapp && hasEmail && t.quickOr}
              {hasEmail && (
                <a href={`mailto:${contact.email}`} className="inline-flex min-h-10 items-center font-semibold text-tide underline underline-offset-4">
                  {t.quickEmail}
                </a>
              )}
              {t.quickAfter}
            </p>
          )}
        </div>

        <form
          ref={formRef}
          noValidate
          onSubmit={onSubmit}
          aria-labelledby="contato-title"
          className="tone-light on-light rounded-[18px] bg-card! p-6 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)] sm:p-10 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
        >
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="type-h4">{t.formTitle}</p>
              <p className="type-small mt-1 text-slate">{t.formSub}</p>
            </div>
            <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-tide-wash text-tide-deep">
              <Send className="h-5 w-5" />
            </span>
          </div>
          {reference && (
            <div className="type-small -mt-2 mb-7 flex items-center gap-3 rounded-lg bg-tide-wash p-3 pl-4">
              <p className="min-w-0 flex-1">
                <span className="text-slate">{t.reference}</span>
                <span className="font-semibold text-ink">{reference.name}</span>
                <span className="block text-[0.875rem] text-slate">{t.referenceNote}</span>
              </p>
              <button
                type="button"
                onClick={() => setReference(null)}
                aria-label={t.removeReference(reference.name)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-card text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors hover:bg-ink hover:text-white"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            <Field id={`${formId}-nome`} label={t.name} error={errors.nome}>
              <input
                id={`${formId}-nome`}
                name="nome"
                autoComplete="name"
                value={values.nome}
                onChange={(e) => update('nome', e.target.value)}
                aria-invalid={!!errors.nome}
                aria-describedby={errors.nome ? `${formId}-nome-erro` : undefined}
                className={fieldClass(!!errors.nome)}
              />
            </Field>
            <fieldset>
              <legend className="type-small font-medium text-ink">{t.returnBy}</legend>
              <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-paper p-1">
                {(['whatsapp', 'email'] as const).map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input
                      type="radio"
                      name="canal"
                      value={c}
                      checked={values.canal === c}
                      onChange={() => changeCanal(c)}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-10 items-center justify-center rounded-md text-[0.95rem] font-medium text-slate transition-colors peer-checked:bg-card peer-checked:text-ink peer-checked:shadow-[inset_0_0_0_1px_var(--color-line)] peer-focus-visible:outline-2 peer-focus-visible:outline-tide-deep">
                      {c === 'whatsapp' ? t.whatsapp : t.email}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <Field id={`${formId}-retorno`} label={t.channelLabel[values.canal]} error={errors.retorno} className="mt-6">
            <input
              id={`${formId}-retorno`}
              name="retorno"
              type={CANAL[values.canal].type}
              inputMode={CANAL[values.canal].inputMode}
              autoComplete={CANAL[values.canal].autoComplete}
              autoCapitalize="off"
              spellCheck={false}
              placeholder={t.channelPlaceholder[values.canal]}
              value={values.retorno}
              onChange={(e) => update('retorno', values.canal === 'whatsapp' ? formatPhoneInput(e.target.value) : e.target.value.trim())}
              aria-invalid={!!errors.retorno}
              aria-describedby={errors.retorno ? `${formId}-retorno-erro` : undefined}
              className={fieldClass(!!errors.retorno)}
            />
          </Field>

          <Field id={`${formId}-servico`} label={t.type} error={errors.servico} className="mt-6">
            <select
              id={`${formId}-servico`}
              name="servico"
              value={values.servico}
              onChange={(e) => update('servico', e.target.value)}
              aria-invalid={!!errors.servico}
              aria-describedby={errors.servico ? `${formId}-servico-erro` : undefined}
              className={cn(fieldClass(!!errors.servico), 'appearance-none bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-10')}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2348566f' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
              }}
            >
              <option value="">{t.select}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
              <option value={OTHER}>{t.other}</option>
            </select>
          </Field>

          <Field
            id={`${formId}-mensagem`}
            label={t.need}
            error={errors.mensagem}
            hint={t.needHint}
            className="mt-6"
          >
            <textarea
              id={`${formId}-mensagem`}
              name="mensagem"
              rows={5}
              value={values.mensagem}
              onChange={(e) => update('mensagem', e.target.value)}
              aria-invalid={!!errors.mensagem}
              aria-describedby={`${formId}-mensagem-dica${errors.mensagem ? ` ${formId}-mensagem-erro` : ''}`}
              className={cn(fieldClass(!!errors.mensagem), 'resize-y')}
            />
          </Field>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {hasWhatsapp && (
              <Button type="submit" value="whatsapp" size="lg">
                <MessageCircle aria-hidden="true" className="h-5 w-5" />
                {t.sendWhatsapp}
              </Button>
            )}
            {hasEmail && (
              <Button type="submit" value="email" size="lg" variant={hasWhatsapp ? 'secondary' : 'primary'}>
                <Mail aria-hidden="true" className="h-5 w-5" />
                {t.sendEmail}
              </Button>
            )}
            <Button onClick={copyMessage} size="lg" variant={hasAnyChannel ? 'ghost' : 'primary'}>
              <Copy aria-hidden="true" className="h-5 w-5" />
              {t.copy}
            </Button>
          </div>

          <p role="status" aria-live="polite" className={cn('type-small font-medium text-tide-deep', status && 'mt-5')}>
            {status}
          </p>

          {waFallback && hasWhatsapp && (
            <p className="type-small mt-2 text-slate">
              {t.waFallback}{' '}
              <a
                href={whatsappLink(message())}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-tide-deep underline underline-offset-4"
              >
                {t.waFallbackLink}
                <span className="sr-only"> {ui.common.newTab}</span>
              </a>
            </p>
          )}

          {mailFallback && hasEmail && (
            <p className="type-small mt-2 text-slate">
              {t.mailFallback[0]}
              <strong className="font-semibold text-ink">{t.mailFallback[1]}</strong>
              {t.mailFallback[2]}
              <a href={`mailto:${contact.email}`} className="font-semibold break-all text-tide-deep underline underline-offset-4">
                {contact.email}
              </a>
              .
            </p>
          )}

          {manualCopy && (
            <div className="mt-4">
              <label htmlFor={`${formId}-copia`} className="type-small font-medium text-ink">
                {t.manualLabel}
              </label>
              <textarea
                id={`${formId}-copia`}
                ref={manualRef}
                readOnly
                rows={7}
                value={message()}
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 block w-full resize-y rounded-lg bg-paper px-4 py-3 font-code text-[0.875rem] text-ink ring-1 ring-line focus:ring-2 focus:ring-tide-deep focus:outline-none"
              />
            </div>
          )}

          <p className="type-small mt-6 border-t border-line pt-5 text-slate">
            {t.privacy}
          </p>
        </form>

        <div className="lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mt-10">
          <ContactFlow />

          {hasAnyChannel || hasProfile ? (
            <ul className="mt-10 grid border-t border-white/15 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1 [&>li]:min-w-0">
              {hasWhatsapp && (
                <li>
                  <ChannelLink href={whatsappLink(text.whatsappGreeting)} icon={<MessageCircle className="h-5 w-5" />} label={t.whatsapp} value={formatPhone(contact.whatsapp)} external newTab={ui.common.newTab} />
                </li>
              )}
              {hasEmail && (
                <li>
                  <ChannelLink href={`mailto:${contact.email}`} icon={<Mail className="h-5 w-5" />} label={t.email} value={contact.email} newTab={ui.common.newTab} />
                </li>
              )}
              {contact.profiles.map((profile) => (
                <li key={profile.url}>
                  <ChannelLink href={profile.url} icon={<ExternalLink className="h-5 w-5" />} label={profile.label} value={t.profile} external newTab={ui.common.newTab} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="type-small mt-10 flex gap-3 rounded-lg p-5 text-mist shadow-[inset_0_0_0_1px_rgb(255_255_255/0.15)]">
              <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-tide" />
              <p>
                {t.noChannels(site.name)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="type-small font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-dica`} className="type-small mt-1 text-slate">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-erro`} className="type-small mt-2 font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function ChannelLink({
  href,
  icon,
  label,
  value,
  external,
  newTab,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  value: string;
  external?: boolean;
  newTab: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex min-h-16 items-center gap-4 border-b border-white/15 py-4 transition-colors"
    >
      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-tide shadow-[inset_0_0_0_1px_rgb(34_195_176/0.4)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="type-label block text-mist">{label}</span>
        <span className="mt-0.5 block truncate font-semibold text-white transition-colors group-hover:text-tide">{value}</span>
      </span>
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0 text-mist transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-tide" />
      {external && <span className="sr-only">{newTab}</span>}
    </a>
  );
}
