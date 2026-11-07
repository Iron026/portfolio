import { Check, Mail, MessageCircle } from 'lucide-react';
import { MotionArea } from '@/components/ui/MotionArea';

/**
 * Diagrama discreto do caminho de um pedido: a necessidade escrita vira uma
 * mensagem organizada, segue pelo canal escolhido e volta como orçamento.
 * É o que o formulário ao lado faz de verdade (monta a mensagem e abre o
 * WhatsApp ou o e-mail). Decorativo e separado dos campos.
 */
export function ContactFlow() {
  return (
    <MotionArea aria-hidden="true" className="contact-flow mt-10 text-mist">
      {/* 1. necessidade */}
      <div className="cf-stage">
        <span className="cf-label">necessidade</span>
        <span className="cf-bubble">
          <i className="cf-line" style={{ width: '88%', animationDelay: '0s' }} />
          <i className="cf-line" style={{ width: '64%', animationDelay: '0.35s' }} />
          <i className="cf-line" style={{ width: '76%', animationDelay: '0.7s' }} />
        </span>
      </div>
      <span className="cf-link"><i className="cf-dot" /></span>
      {/* 2. mensagem organizada */}
      <div className="cf-stage">
        <span className="cf-label">mensagem</span>
        <span className="cf-card">
          <i className="cf-field" />
          <i className="cf-field" />
          <i className="cf-field cf-field--wide" />
        </span>
      </div>
      <span className="cf-link"><i className="cf-dot cf-dot--2" /></span>
      {/* 3. canal */}
      <div className="cf-stage cf-stage--fixed">
        <span className="cf-label">canal</span>
        <span className="flex flex-col gap-1.5">
          <span className="cf-channel cf-channel--a"><MessageCircle className="h-3.5 w-3.5" /></span>
          <span className="cf-channel cf-channel--b"><Mail className="h-3.5 w-3.5" /></span>
        </span>
      </div>
      <span className="cf-link cf-link--short"><i className="cf-dot cf-dot--3" /></span>
      {/* 4. orçamento */}
      <div className="cf-stage cf-stage--fixed">
        <span className="cf-label">orçamento</span>
        <span className="grid h-[58px] place-items-center">
          <span className="cf-check"><Check className="h-4 w-4" strokeWidth={2.5} /></span>
        </span>
      </div>
    </MotionArea>
  );
}
