export default function SiteFooter({
  email = "support@hyw.com",
  emailHref = "support@hyw.com",
  phoneLabel = "+1 (234) 567-890",
  phoneHref = "+1234567890",
  address = "123 HYW Street, City, Country",
  companyLabel = "HYW",
  description = "HYW RMA Management System - Your trusted return and warranty solution.",
  copyright = "\u00A9 2026 HYW Inc. All rights reserved.",
}) {
  return (
    <footer className="page-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{companyLabel}</h3>
          <p>{description}</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="#home">Home</a>
            </li>
            <li>
              <a href="#about">About Us</a>
            </li>
            <li>
              <a href="#rma">RMA Services</a>
            </li>
            <li>
              <a href="#support">Support</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>
            Email: <a href={`mailto:${emailHref}`}>{email}</a>
          </p>
          <p>
            Phone: <a href={`tel:${phoneHref}`}>{phoneLabel}</a>
          </p>
          <p>Address: {address}</p>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <ul>
            <li>
              <a href="#facebook">Facebook</a>
            </li>
            <li>
              <a href="#twitter">Twitter</a>
            </li>
            <li>
              <a href="#linkedin">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
