/**
 * Formulário de orçamento da Nova Serviços.
 * Valida de verdade, foca o primeiro erro e, quando tudo está certo,
 * prepara a mensagem para copiar. Não há servidor: nada é enviado e a
 * interface nunca diz que o pedido foi recebido.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Check, CircleAlert, Copy, Pencil, RotateCcw } from 'lucide-react';
import {
  DESCRIPTION_MAX, EMPTY_FORM, SERVICES, URGENCY_LABELS,
  FIELD_ORDER, firstError, mailtoLink, quoteMessage, validate,
  type Errors, type FieldName, type QuoteForm as Form, type Urgency,
} from './ns-data';

const IDS: Record<FieldName, string> = {
  name: 'ns-nome', contact: 'ns-contato', service: 'ns-servico', area: 'ns-bairro', description: 'ns-descricao', consent: 'ns-consentimento',
};

const LABELS: Record<FieldName, string> = {
  name: 'Nome', contact: 'Contato', service: 'Tipo de serviço', area: 'Bairro ou região', description: 'Descrição', consent: 'Autorização',
};

export function QuoteForm({ form, setForm }: { form: Form; setForm: (updater: (f: Form) => Form) => void }) {
  const [errors, setErrors] = useState<Errors>({});
  const [attempted, setAttempted] = useState(false);
  const [prepared, setPrepared] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  // Depois da primeira tentativa, os erros acompanham a digitação.
  useEffect(() => {
    if (attempted) setErrors(validate(form));
  }, [form, attempted]);

  useEffect(() => {
    if (prepared) successRef.current?.focus();
  }, [prepared]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(form);
    setAttempted(true);
    setErrors(found);
    const first = firstError(found);
    if (first) {
      document.getElementById(IDS[first])?.focus();
      return;
    }
    setCopyStatus('');
    setPrepared(true);
  }

  function edit() {
    setPrepared(false);
    window.setTimeout(() => document.getElementById(IDS.name)?.focus(), 0);
  }

  function restart() {
    setForm(() => EMPTY_FORM);
    setAttempted(false);
    setErrors({});
    setPrepared(false);
    window.setTimeout(() => document.getElementById(IDS.name)?.focus(), 0);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(quoteMessage(form));
      setCopyStatus('Mensagem copiada. Lembre-se: nesta demonstração ela não foi enviada a ninguém.');
    } catch {
      textRef.current?.focus();
      textRef.current?.select();
      setCopyStatus('Não foi possível copiar automaticamente. O texto foi selecionado: use Ctrl+C (ou toque e segure) para copiar.');
    }
  }

  if (prepared) {
    const mailto = mailtoLink(form);
    return (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-(--ns-line) sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-(--ns-wash) px-3 py-1 text-sm font-semibold text-(--ns-petrol)">
          <Check aria-hidden="true" className="h-4 w-4" />
          Dados conferidos
        </p>
        <h3 ref={successRef} tabIndex={-1} className="mt-4 text-[1.6rem] font-semibold outline-none">
          Seu pedido está pronto, mas ainda não foi enviado
        </h3>
        <p className="mt-2 max-w-[60ch] text-(--ns-muted)">
          Esta é uma página de demonstração, sem servidor e sem atendimento real. Copie a mensagem abaixo para ver como o pedido chegaria à empresa.
        </p>
        <label htmlFor="ns-mensagem" className="mt-5 block text-[0.95rem] font-medium">
          Mensagem preparada
        </label>
        <textarea
          id="ns-mensagem"
          ref={textRef}
          readOnly
          value={quoteMessage(form)}
          rows={11}
          className="mt-2 w-full resize-none rounded-xl bg-(--ns-bg) p-4 text-[0.95rem] leading-relaxed ring-1 ring-(--ns-line) outline-none focus-visible:ring-2 focus-visible:ring-(--ns-petrol)"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-full bg-(--ns-petrol) px-6 py-3 font-semibold text-white hover:bg-(--ns-petrol-2)">
            <Copy aria-hidden="true" className="h-5 w-5" />
            Copiar mensagem
          </button>
          {mailto && (
            <a href={mailto} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-(--ns-petrol) ring-1 ring-(--ns-petrol)">
              Abrir no e-mail
            </a>
          )}
          <button type="button" onClick={edit} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-(--ns-petrol) ring-1 ring-(--ns-petrol)/50 hover:bg-(--ns-wash)">
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Editar pedido
          </button>
          <button type="button" onClick={restart} className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 font-semibold text-(--ns-muted) hover:text-(--ns-ink)">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Começar outro pedido
          </button>
        </div>
        <p role="status" aria-live="polite" className="mt-4 min-h-[1.5rem] font-medium text-(--ns-petrol)">
          {copyStatus}
        </p>
      </div>
    );
  }

  const errorList = attempted ? FIELD_ORDER.filter((f) => errors[f]) : [];
  const fieldClass = (name: FieldName) =>
    `mt-2 block w-full rounded-xl bg-white px-4 py-3 text-base ring-1 outline-none transition-shadow focus-visible:ring-2 ${
      errors[name] ? 'ring-(--ns-error) focus-visible:ring-(--ns-error)' : 'ring-(--ns-line) focus-visible:ring-(--ns-petrol)'
    }`;
  const describe = (name: FieldName, hint?: boolean) =>
    [hint ? `${IDS[name]}-dica` : '', errors[name] ? `${IDS[name]}-erro` : ''].filter(Boolean).join(' ') || undefined;
  const isEmail = form.method === 'email';

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} aria-labelledby="ns-form-titulo" className="rounded-3xl bg-white p-6 ring-1 ring-(--ns-line) sm:p-8">
      <h3 id="ns-form-titulo" className="text-[1.5rem] font-semibold">
        Pedir orçamento
      </h3>
      <p className="mt-1 text-[0.95rem] text-(--ns-muted)">Campos marcados com * são obrigatórios.</p>

      {errorList.length > 0 && (
        <div className="mt-5 rounded-xl bg-[#fdecea] p-4 text-[0.95rem] text-(--ns-error) ring-1 ring-(--ns-error)/30">
          <p className="flex items-center gap-2 font-semibold">
            <CircleAlert aria-hidden="true" className="h-5 w-5" />
            {errorList.length === 1 ? 'Corrija 1 campo para continuar:' : `Corrija ${errorList.length} campos para continuar:`}
          </p>
          <ul className="mt-2 list-disc space-y-0.5 pl-7">
            {errorList.map((f) => (
              <li key={f}>
                <a
                  href={`#${IDS[f]}`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(IDS[f])?.focus();
                  }}
                  className="underline underline-offset-2"
                >
                  {LABELS[f]}: {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 [&>*]:min-w-0">
        <Field name="name" label="Seu nome *" error={errors.name}>
          <input id={IDS.name} name="name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} aria-invalid={!!errors.name} aria-describedby={describe('name')} className={fieldClass('name')} />
        </Field>
        <Field name="service" label="Tipo de serviço *" error={errors.service}>
          <select id={IDS.service} name="service" value={form.service} onChange={(e) => set('service', e.target.value as Form['service'])} aria-invalid={!!errors.service} aria-describedby={describe('service')} className={fieldClass('service')}>
            <option value="">Selecione</option>
            {SERVICES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="sm:col-span-2">
          <fieldset>
            <legend className="text-[0.95rem] font-medium">Como prefere ser contatado? *</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['whatsapp', 'email'] as const).map((m) => (
                <label key={m} className="cursor-pointer">
                  <input type="radio" name="method" value={m} checked={form.method === m} onChange={() => set('method', m)} className="peer sr-only" />
                  <span className="block rounded-full px-4 py-1.5 text-sm font-medium ring-1 ring-(--ns-line) peer-checked:bg-(--ns-petrol) peer-checked:text-white peer-checked:ring-(--ns-petrol) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--ns-petrol)">
                    {m === 'whatsapp' ? 'WhatsApp' : 'E-mail'}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <label htmlFor={IDS.contact} className="sr-only">
            {isEmail ? 'Seu e-mail' : 'Seu WhatsApp com DDD'}
          </label>
          <input
            id={IDS.contact}
            name="contact"
            type={isEmail ? 'email' : 'tel'}
            inputMode={isEmail ? 'email' : 'tel'}
            autoComplete={isEmail ? 'email' : 'tel'}
            placeholder={isEmail ? 'nome@email.com' : '(71) 98888-7777'}
            value={form.contact}
            onChange={(e) => set('contact', e.target.value)}
            aria-invalid={!!errors.contact}
            aria-describedby={describe('contact')}
            className={fieldClass('contact')}
          />
          <FieldError id={IDS.contact} error={errors.contact} />
        </div>
        <Field name="area" label="Bairro ou região *" error={errors.area} hintBelow hint="Não precisa do endereço completo. Ele só é combinado ao agendar.">
          <input id={IDS.area} name="area" autoComplete="address-level3" value={form.area} onChange={(e) => set('area', e.target.value)} aria-invalid={!!errors.area} aria-describedby={describe('area', true)} className={fieldClass('area')} />
        </Field>
        <fieldset>
          <legend className="text-[0.95rem] font-medium">Para quando?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(URGENCY_LABELS) as Urgency[]).map((u) => (
              <label key={u} className="cursor-pointer">
                <input type="radio" name="urgency" value={u} checked={form.urgency === u} onChange={() => set('urgency', u)} className="peer sr-only" />
                <span className="block rounded-full px-4 py-1.5 text-sm ring-1 ring-(--ns-line) peer-checked:bg-(--ns-wash) peer-checked:font-semibold peer-checked:text-(--ns-petrol) peer-checked:ring-(--ns-petrol) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--ns-petrol)">
                  {URGENCY_LABELS[u]}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5">
        <Field name="description" label="O que precisa ser feito? *" error={errors.description} hint="Conte o problema, o cômodo e, se souber, as medidas ou o modelo do equipamento.">
          <textarea
            id={IDS.description}
            name="description"
            rows={5}
            maxLength={DESCRIPTION_MAX + 50}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            aria-invalid={!!errors.description}
            aria-describedby={`${describe('description', true) ?? ''} ns-descricao-contador`.trim()}
            className={`${fieldClass('description')} resize-y`}
          />
        </Field>
        <p id="ns-descricao-contador" className={`mt-1 text-right text-sm tabular-nums ${form.description.trim().length > DESCRIPTION_MAX ? 'text-(--ns-error)' : 'text-(--ns-muted)'}`}>
          {form.description.trim().length}/{DESCRIPTION_MAX} caracteres
        </p>
      </div>

      <div className="mt-3">
        <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
          <input
            id={IDS.consent}
            type="checkbox"
            checked={form.consent}
            onChange={(e) => set('consent', e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={describe('consent')}
            className="mt-1 h-5 w-5 shrink-0 accent-(--ns-petrol)"
          />
          <span>Autorizo a Nova Serviços a usar estes dados somente para responder a este pedido de orçamento. *</span>
        </label>
        <FieldError id={IDS.consent} error={errors.consent} />
      </div>

      <button type="submit" className="mt-6 w-full rounded-full bg-(--ns-petrol) px-6 py-3.5 text-lg font-semibold text-white hover:bg-(--ns-petrol-2) sm:w-auto">
        Preparar pedido
      </button>
      <p className="mt-3 text-sm text-(--ns-muted)">
        Demonstração sem servidor: ao preparar, você verá a mensagem pronta para copiar. Nenhum dado é enviado ou guardado.
      </p>
    </form>
  );
}

function Field({ name, label, error, hint, hintBelow, children }: { name: FieldName; label: string; error?: string; hint?: string; hintBelow?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={IDS[name]} className="text-[0.95rem] font-medium">
        {label}
      </label>
      {hint && !hintBelow && (
        <p id={`${IDS[name]}-dica`} className="mt-0.5 text-sm text-(--ns-muted)">
          {hint}
        </p>
      )}
      {children}
      {hint && hintBelow && (
        <p id={`${IDS[name]}-dica`} className="mt-1.5 text-sm text-(--ns-muted)">
          {hint}
        </p>
      )}
      <FieldError id={IDS[name]} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-erro`} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-(--ns-error)">
      <CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      {error}
    </p>
  );
}
