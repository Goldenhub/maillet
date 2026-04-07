import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";
import { Doodles } from "../Doodles";

export function LandingPage() {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const { mode, cycleTheme } = useTheme();

  const themeIcon = mode === "light" ? "sun" : mode === "dark" ? "moon" : "monitor";

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">Maillet</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="theme-toggle" onClick={cycleTheme} type="button" title={`Theme: ${mode}`}>
              {themeIcon === "sun" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
              {themeIcon === "moon" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {themeIcon === "monitor" && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              )}
            </button>
            <Link className="landing-nav-btn" to="/playground">
              Launch App
            </Link>
          </div>
        </div>
      </nav>

      <section className="landing-hero">
        <Doodles />
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">Stop fighting email clients.</h1>
          <p className="landing-hero-subtitle">Write modern HTML/CSS and let Maillet compile it into reliable, cross-client email code — instantly.</p>
          <div className="landing-hero-trustline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span>No signup required. Works with Gmail, Outlook, Apple Mail. Instant preview.</span>
          </div>
          <div className="landing-hero-actions">
            <Link className="landing-cta-btn" to="/playground">
              Start Compiling
            </Link>
            <a href="#features" className="landing-secondary-btn">
              See Features
            </a>
          </div>
        </div>
        <div className="landing-hero-visual">
          <div className="landing-app-preview">
            <div className="landing-preview-bar">
              <span className="landing-preview-dot red" />
              <span className="landing-preview-dot yellow" />
              <span className="landing-preview-dot green" />
              <span className="landing-preview-label">Maillet Playground</span>
            </div>
            <div className="landing-preview-body">
              <div className="landing-preview-editor">
                <div className="landing-preview-code">
                  <code>
                    <span className="code-tag">&lt;style&gt;</span>
                    {"\n"} <span className="code-attr">.header</span> {`{`}
                    {"\n"} <span className="code-prop">background</span>: <span className="code-value">#4F46E5</span>;{"\n"} <span className="code-prop">color</span>: <span className="code-value">#fff</span>;{"\n"} <span className="code-prop">padding</span>: <span className="code-value">24px</span>;{"\n"} <span className="code-prop">text-align</span>: <span className="code-value">center</span>;{"\n"} {`}`}
                    {"\n"} <span className="code-attr">.cta</span> {`{`}
                    {"\n"} <span className="code-prop">display</span>: <span className="code-value">inline-block</span>;{"\n"} <span className="code-prop">padding</span>: <span className="code-value">12px 24px</span>;{"\n"} <span className="code-prop">background</span>: <span className="code-value">#10B981</span>;{"\n"} <span className="code-prop">color</span>: <span className="code-value">#fff</span>;{"\n"} <span className="code-prop">text-decoration</span>: <span className="code-value">none</span>;{"\n"} <span className="code-prop">border-radius</span>: <span className="code-value">6px</span>;{"\n"} {`}`}
                    {"\n"}
                    <span className="code-tag">&lt;/style&gt;</span>
                    {"\n"}
                    {"\n"}
                    <span className="code-tag">&lt;div</span> <span className="code-attr">class</span>=<span className="code-string">"header"</span>
                    <span className="code-tag">&gt;</span>
                    {"\n"} <span className="code-tag">&lt;h1&gt;</span>Welcome to Maillet<span className="code-tag">&lt;/h1&gt;</span>
                    {"\n"} <span className="code-tag">&lt;p&gt;</span>Your email, compiled.<span className="code-tag">&lt;/p&gt;</span>
                    {"\n"}
                    <span className="code-tag">&lt;/div&gt;</span>
                    {"\n"}
                    {"\n"}
                    <span className="code-tag">&lt;a</span> <span className="code-attr">href</span>=<span className="code-string">"#"</span> <span className="code-attr">class</span>=<span className="code-string">"cta"</span>
                    <span className="code-tag">&gt;</span>
                    {"\n"} Get Started →{"\n"}
                    <span className="code-tag">&lt;/a&gt;</span>
                  </code>
                </div>
              </div>
              <div className="landing-preview-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="landing-preview-output">
                <div className="landing-preview-output-label">Compiled Output</div>
                <div className="landing-email-preview">
                  <div className="email-header">
                    <h3>Welcome to Maillet</h3>
                    <p>Your email, compiled.</p>
                  </div>
                  <div className="email-body">
                    <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#666" }}>Your modern HTML & CSS has been compiled into email-safe code.</p>
                    <a className="email-cta" href="#">
                      Get Started →
                    </a>
                  </div>
                  <div className="email-footer">
                    <p>© 2026 Maillet · All rights reserved</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-features">
        <h2 className="landing-section-title">Features</h2>
        <div className="landing-features-grid">
          <div className={`landing-feature-card ${activeFeature === 0 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(0)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3>Visual Drag & Drop Builder</h3>
            <p>Build email templates visually — drag blocks from the sidebar, drop them into columns, and see live previews instantly.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 1 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(1)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>JSON-to-HTML Compilation</h3>
            <p>Builder output compiles from structured JSON into email-safe table-based HTML, passed through the full compiler pipeline.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 2 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(2)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <h3>Preview, Code & JSON Views</h3>
            <p>Toggle between rendered preview, compiled HTML source, and raw builder JSON — with desktop and mobile viewport modes.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 3 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(3)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3>Block-Based Editing</h3>
            <p>Configure every block — text, heading, image, button, link, divider, spacer, and columns — with full style controls.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 4 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(4)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="18" rx="1" />
                <rect x="14" y="3" width="7" height="18" rx="1" />
              </svg>
            </div>
            <h3>Column Layouts</h3>
            <p>Add 1, 2, or 3-column layouts with adjustable gaps. Drop any block into any column with full drag-and-drop support.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 5 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(5)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3>Flex & Grid to Tables</h3>
            <p>Automatically converts display:flex and display:grid into email-safe table layouts with proper column widths.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 6 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(6)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>CSS Inlining</h3>
            <p>All CSS is automatically inlined into style attributes, exactly how email clients require it.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 7 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(7)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3>Smart Warnings</h3>
            <p>Real-time warnings for unsupported CSS, missing alt text, unsafe links, and more — with auto-fixes where possible.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 8 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(8)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </div>
            <h3>Auto-Fixes</h3>
            <p>Strips scripts, converts semantic HTML5 elements, sanitizes links, replaces unsafe fonts — all automatically.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 9 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(9)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3>100% Client-Side</h3>
            <p>Everything runs in your browser. No server, no uploads, no tracking. Your templates never leave your machine.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 10 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(10)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h3>Copy & Export</h3>
            <p>One-click copy of compiled HTML to clipboard. Clean output ready to paste into your email service provider.</p>
          </div>
          <div className={`landing-feature-card ${activeFeature === 11 ? "active" : ""}`} onMouseEnter={() => setActiveFeature(11)} onMouseLeave={() => setActiveFeature(null)}>
            <div className="landing-feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <h3>Code Editor Mode</h3>
            <p>Prefer writing HTML directly? Switch to Editor mode with Monaco Editor, live preview, and full compiler pipeline.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>
          Built with{" "}
          <svg className="footer-heart" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>{" "}
          by Golden{" "}
          <a className="footer-link" href="https://github.com/goldenhub" target="_blank" rel="noopener noreferrer">
            Github
          </a>
          <a className="footer-link" href="https://x.com/gazu_chi" target="_blank" rel="noopener noreferrer">
            X
          </a>
        </p>
        <p>All processing happens in your browser.</p>
      </footer>
    </div>
  );
}
