import { ExternalLink, FileText, Mail, Phone, ShieldCheck } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Footer } from '../components/layout/Footer.tsx'

const legalContent = {
  '/terms': {
    title: 'Terms of Use',
    icon: FileText,
    sections: [
      {
        title: '1. Use of the Platform',
        content: 'DecisionTwin is a decision-support and simulation platform designed to help users explore potential workforce and project scenarios before making operational decisions.',
      },
      {
        title: '2. Simulation Results',
        content: 'Simulation results are estimates generated from the data and assumptions provided to the system. Results should be reviewed by the user before making real-world decisions.',
      },
      {
        title: '3. User Responsibility',
        content: 'Users are responsible for verifying simulation inputs and considering organizational requirements before acting on simulation results.',
      },
      {
        title: '4. Acceptable Use',
        content: 'Users should not use the platform for unlawful activities, unauthorized access, data misuse, or activities that could harm other users or organizations.',
      },
      {
        title: '5. Changes',
        content: 'These terms may be updated as the DecisionTwin platform evolves.',
      },
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    sections: [
      {
        title: 'Information We Handle',
        content: 'DecisionTwin may process information required for authentication, projects, workforce information, simulation inputs, and application functionality.',
      },
      {
        title: 'How Information Is Used',
        content: 'Information is used to provide application functionality, perform simulations, display project and workforce information, and improve the user experience.',
      },
      {
        title: 'Data Security',
        content: 'Reasonable technical measures should be used to protect application data.',
      },
      {
        title: 'Data Sharing',
        content: 'This page does not make claims about data sharing beyond the practices configured in the application.',
      },
      {
        title: 'User Control',
        content: 'Where supported by the application, users may manage or update information associated with their account.',
      },
    ],
  },
} as const

export function ProductInfo() {
  const { pathname } = useLocation()

  if (pathname === '/contact') {
    return (
      <div className="manager-theme product-info-shell">
        <main className="product-info-main">
          <section className="product-info-content" aria-labelledby="product-info-title">
            <p className="eyebrow">Decision Forge</p>
            <h1 id="product-info-title">Contact Decision Forge</h1>
            <p className="product-info-lead">Have a question about DecisionTwin? Get in touch with our team.</p>

            <div className="contact-list">
              <a href="mailto:vejendlaraju66@gmail.com" className="contact-item">
                <Mail size={19} aria-hidden="true" />
                <span><small>Email</small><strong>vejendlaraju66@gmail.com</strong></span>
              </a>
              <a href="tel:+919392769832" className="contact-item">
                <Phone size={19} aria-hidden="true" />
                <span><small>Phone</small><strong>+91 9392769832</strong></span>
              </a>
              <a
                href="https://www.linkedin.com/in/raju-vejendla/"
                className="contact-item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink size={19} aria-hidden="true" />
                <span><small>LinkedIn</small><strong>Raju Vejendla</strong></span>
              </a>
            </div>

            <Link className="product-info-back" to="/">Back to DecisionTwin</Link>
          </section>
          <Footer />
        </main>
      </div>
    )
  }

  const content = legalContent[pathname === '/privacy' ? '/privacy' : '/terms']
  const PageIcon = content.icon

  return (
    <div className="manager-theme product-info-shell">
      <main className="product-info-main">
        <section className="product-info-content" aria-labelledby="product-info-title">
          <p className="eyebrow product-info-kicker"><PageIcon size={15} aria-hidden="true" /> DecisionTwin</p>
          <h1 id="product-info-title">{content.title}</h1>

          <div className="product-info-sections">
            {content.sections.map(({ title, content: sectionContent }) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{sectionContent}</p>
              </section>
            ))}
          </div>

          <Link className="product-info-back" to="/">Back to DecisionTwin</Link>
        </section>
        <Footer />
      </main>
    </div>
  )
}
