import { TICKET_URL } from '../../../config.js'

export default function TicketBand() {
  return (
    <section className="ticket-band tear" id="ticket" style={{ '--prev-bg': 'var(--crema)' }}>
      <img src="/assets/collage/nina-libro.webp" alt="" aria-hidden="true" className="decor decor-ticket-l" />
      <img src="/assets/collage/madre-hijo.webp" alt="" aria-hidden="true" className="decor decor-ticket-r" />

      <div className="ticket-band-inner">
        <img src="/assets/collage/globo.webp" alt="¡Entrada liberada!" className="ticket-globo" />
        <h2 className="ticket-title">Consigue tu ticket gratuito</h2>
        <p className="ticket-text">
          La entrada es liberada, pero debes sacar tu ticket: así sabemos cuántas personas nos visitan.
        </p>
        <a href={TICKET_URL} target="_blank" rel="noopener" className="ticket-btn">
          Conseguir ticket
        </a>
        <span className="ticket-nota">Gratis · a través de Ticketplus</span>
      </div>
    </section>
  )
}
