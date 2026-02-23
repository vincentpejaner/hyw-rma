import React, { useState, useEffect } from "react";
import "./login.css";
import "./about.css";
import logo from "./images/logo1.png";

export default function About() {
	const [menuOpen, setMenuOpen] = useState(false);

	useEffect(() => {
		const opts = { threshold: 0.15, rootMargin: "0px 0px -5% 0px" };
		const observer = new IntersectionObserver((entries, obs) => {
			entries.forEach((entry) => {
				const el = entry.target;
				if (entry.isIntersecting) {
					const delay = el.dataset.delay || el.getAttribute("data-delay") || 0;
					if (delay) el.style.transitionDelay = `${delay}s`;
					el.classList.add("in-view");
					obs.unobserve(el);
				}
			});
		}, opts);

		document.querySelectorAll(".animate").forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	return (
		<div>
			<header className="page-header">
				<button
					className="menu-toggle"
					onClick={() => setMenuOpen(!menuOpen)}
					aria-label="Toggle menu"
				>
					<span></span>
					<span></span>
					<span></span>
				</button>
				<div className="header-content">
					<nav className={`header-nav header-nav-left ${menuOpen ? "active" : ""}`}>
						<a href="#home" onClick={() => setMenuOpen(false)}>
							Home
						</a>
						<a href="#submit" onClick={() => setMenuOpen(false)}>
							Submit RMA
						</a>
					</nav>
					<div className="header-logo">
						<img src={logo} alt="HYW Logo" />
					</div>
					<nav className={`header-nav header-nav-right ${menuOpen ? "active" : ""}`}>
						<a href="#track" onClick={() => setMenuOpen(false)}>
							Track RMA
						</a>
						<a href="#about" onClick={() => setMenuOpen(false)}>
							About Us
						</a>
					</nav>
				</div>
			</header>

			<section className="about-hero">
				<div className="container">
					<h1 className="animate"></h1>
					
				</div>
			</section>

			<main className="about-content">
				<div className="container">
					<section className="section-block">
						<h2 className="animate">COMPANY PROFILE</h2>
						<p className="lead animate" data-delay="0.04">
							HYW IT Distributor delivers top-quality IT products and dependable
							post-sales service. Below is a concise snapshot of our history,
							vision, mission and values.
						</p>

						<div className="about-grid">
							<div>
								<div className="card animate" data-delay="0.06">
									<h3>Brief History</h3>
									<div className="timeline">
										<div className="event">
											<div className="date">2012</div>
											<div className="desc">
												Established in June 2012 in Cebu City. Recognized for earnest
												service in IT-product distribution and guaranteed prompt,
												quality deliveries nationwide.
											</div>
										</div>

										<div className="event">
											<div className="date">2013</div>
											<div className="desc">
												Expanded operations to Davao City a year after initial
												launch to serve rising demand in the region.
											</div>
										</div>

										<div className="event">
											<div className="date">2018</div>
											<div className="desc">
												Opened a northern access point in Quezon City to better
												serve clients in Luzon and support nationwide distribution.
											</div>
										</div>
									</div>
								</div>

								<div className="card feature-grid" style={{ marginTop: 20 }}>
									<div className="feature-box animate" data-delay="0.08">
										<h4>Mission</h4>
										<p>
											To help our clients succeed by supplying exceptional
											products and unmatched service, sourcing up-to-date items
											from trusted national and international suppliers.
										</p>
									</div>

									<div className="feature-box animate" data-delay="0.1">
										<h4>Values</h4>
										<p>
											We focus on reliable service, cordial partnerships, fair
											pricing, and standing behind our products with warranties
											and guarantees.
										</p>
									</div>
								</div>
							</div>

							<aside>
								<div className="card animate" data-delay="0.09">
									<h4>Goals & Vision</h4>
									<p>
										We aim to supply top-tier IT brands across all market levels
										and deliver maximum satisfaction to all customers through
										quality products and dependable support.
									</p>
								</div>

								<div className="card" style={{ marginTop: 18 }}>
									<h4>Key Brands</h4>
									<div className="brand-grid" style={{ marginTop: 12 }}>
										{[
											"ACER","AOC","ASUS","BIOSTAR","DAHUA","EPSON",
											"GIGABYTE","HIKVISION","HP","KINGSTON","LENOVO",
											"MSI","SEAGATE","TENDA","WD"
										].map((b, i) => (
											<div key={b} className="brand-badge animate" data-delay={(0.02*(i+1)).toFixed(2)}>
												{b}
											</div>
										))}
									</div>
								</div>
							</aside>
						</div>
					</section>
				</div>
			</main>

			<footer className="page-footer">
				<div className="footer-content">
					<div className="footer-section">
						<h3>HYW</h3>
						<p>
							HYW RMA Management System - Your trusted return and warranty
							solution.
						</p>
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
							Email: <a href="mailto:support@hyw.com">hywcebu.corporate@gmail.com</a>
						</p>
						<p>
							Phone: <a href="tel:+1234567890">032-415-1014</a>
						</p>
						<p>Address: Unit 3 Ang-Atillo Bldg.,

Legaspi St. cor. Plaridel Extn.

Brgy. Sto. Nino, Cebu City,

Cebu, Philippines</p>
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
					<p>&copy; 2026 HYW IT DISTRIBUTOR. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
