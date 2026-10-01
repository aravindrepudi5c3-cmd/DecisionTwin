import { Link } from 'react-router-dom'
import './Footer.css'

export function Footer() {
  return (
    <footer className="product-footer">
      <div className="product-footer__top">
        <Link className="product-footer__brand" to="/" aria-label="DecisionTwin home">
          <span className="product-footer__mark" aria-hidden="true">DT</span>
          <span>
            <strong>DecisionTwin</strong>
            <small>Simulate Before You Decide</small>
          </span>
        </Link>

        <nav className="product-footer__nav" aria-label="Footer navigation">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>

      <div className="product-footer__bottom">
        <span>© 2026 DecisionTwin. All rights reserved.</span>
        <span>Built by Decision Forge</span>
      </div>
    </footer>
  )
}
