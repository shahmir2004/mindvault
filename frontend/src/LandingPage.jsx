// frontend/src/LandingPage.jsx
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiLink, FiSearch, FiZap, FiChevronRight } from 'react-icons/fi';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles'; // A necessary import for the library to work

import './LandingPage.css';
import { particlesOptions } from './particlesConfig'; // We will create this config file

// Feature Card sub-component for cleaner code
const Feature = ({ icon, title, description }) => (
    <div className="feature-card">
        <div className="feature-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{description}</p>
    </div>
);

// A simple component for placeholder logos
const CompanyLogos = () => (
    <div className="social-proof-section">
        <p className="social-proof-text">TRUSTED BY DEVELOPERS AT COMPANIES LIKE</p>
        <div className="company-logos">
            {/* Replace with actual SVGs or use placeholders */}
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Stripe</title><path d="M22.923 2.54h-3.473L15.34 8.225l-1.39-3.95H10.43l3.22 8.712-2.31 4.542h3.424l4.16-9.117h.02L24 17.519h3.473L22.923 2.54zM9.91 5.954c-.95.002-1.68.79-1.68 1.91v7.746H4.757V7.864c0-1.12-.73-1.91-1.68-1.91C2.127 5.956 0 5.954 0 5.954v11.565h11.75V5.954H9.91z" /></svg>
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Vercel</title><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>
            <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.323 24 17.82 24 12.297c0-6.627-5.373-12-12-12" /></svg>
        </div>
    </div>
);

export default function LandingPage({ session }) {
    const particlesInit = useCallback(async (engine) => {
        // This is required for tsparticles to work
        await loadFull(engine);
    }, []);

    return (
        <div className="page-container">
            {/* --- HERO SECTION --- */}
            <section className="hero-section">
                <Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
                <div className="hero-content">
                    <h1 className="hero-headline">
                        Your knowledge, <span className="highlight">instantly recalled.</span>
                    </h1>
                    <p className="hero-subheadline">
                        MindVault is an intelligent second brain that captures the content you consume and makes it universally searchable. Never lose a great idea again.
                    </p>
                    {session ? (
                        <Link to="/app" className="btn hero-cta">
                            Go to Your Vault <FiChevronRight />
                        </Link>
                    ) : (
                        <Link to="/login" className="btn hero-cta">
                            Get Started for Free <FiChevronRight />
                        </Link>
                    )}
                    <CompanyLogos />
                </div>
            </section>

            {/* --- FEATURES SECTION --- */}
            <section className="features-section">
                <h2 className="section-title">A Capture Engine for Your Mind</h2>
                <div className="features-grid">
                    <Feature
                        icon={<FiLink />}
                        title="Effortless Capture"
                        description="Save any article, video, or note. MindVault intelligently extracts the core content, cleaning out the clutter."
                    />
                    <Feature
                        icon={<FiSearch />}
                        title="Intelligent Search"
                        description="Go beyond keyword search. Our engine understands context, showing you the exact snippets where your query was found."
                    />
                    <Feature
                        icon={<FiZap />}
                        title="Instant Recall"
                        description="Connect disparate ideas and rediscover lost knowledge in seconds. Your vault becomes more valuable with every item you add."
                    />
                </div>
            </section>

            {/* --- FOOTER SECTION --- */}
            <footer className="footer">
                © {new Date().getFullYear()} MindVault. Built with passion.
            </footer>
        </div>
    );
}