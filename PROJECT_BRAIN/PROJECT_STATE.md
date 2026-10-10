PROJECT: WOB ART
STATUS: IN_PROGRESS
CURRENT_PHASE: 09
CURRENT_TASK: NEXT-GEN LAYER (3D CONFIGURATOR, SCROLL STAGE, FAQ, JSON-LD, WHATSAPP) — RESEARCH-BACKED, BUILD GREEN, VISUAL PASS PENDING
COMPLETED_PHASES: [00-07]
IN_PROGRESS: PHASE 09
NEXT_PHASE: 10
NEXT_TASK: FINAL VALIDATION / RELEASE READINESS
BLOCKERS: Runtime integration must be validated in the user's environment with real environment variables and services.
LAST_BUILD: 2026-10-10 `pnpm build` exit 0 (Next 16.2.0, Turbopack), 15/15 static pages; `pnpm lint` 0 errors / 20 warnings (unchanged baseline); `tsc --noEmit` 0.
LAST_TEST: 2026-10-10 runtime smoke on `next start`: / 200 with #configurator and #process rendered server-side, FAQ correctly absent without CMS items, /admin/website 200; /api/content 503 without MONGO_URL (pre-existing, defaults used). No browser/visual test yet.
LAST_VALIDATION: LINT+TSC+BUILD+HTTP_SMOKE; VISUAL_UNVERIFIED
REAL_FLOWS_COMPLETED: [quote-request-persistence, admin-orders-view, admin-contact-requests-view, admin-order-status-update, admin-contact-status-update, real-login, real-registration, real-mongodb-cms-storage, authenticated-cms-editing, hero-cms-rendering, services-cms-rendering, portfolio-cms-rendering, cms-draft-publish-history-restore, website-studio-routing, reviews-cms-rendering, configurator-cms-rendering, faq-cms-rendering, json-ld-from-cms, whatsapp-cta-from-cms-phone, website-studio-configurator-faq-editors, legacy-trust-claims-removed, legacy-metadata-claims-removed]
IMPORTANT_DECISIONS: [native_scroll_instead_of_scroll_jacking, editorial_asymmetric_portfolio, semantic_visual_tokens, mobile_first_responsive_art_direction, frontend_calls_real_api, admin_uses_database_data, cms_content_is_server_persisted, public-site-reads-latest-published-cms-version, marketing-claims-must-be-source-backed, memory-vault-editorial-tech, memory-vault-gsap-scrolltrigger-storytelling, no-unvalidated-homepage-replacement, pointer-interactions-throttled-with-requestAnimationFrame, services-use-roving-keyboard-tabs, procedural-3d-car-no-licensed-glb, one-webgl-scene-lazy-paused-offscreen-dpr-cap-2, poster-fallback-for-reduced-motion-mobile-no-webgl, css-scroll-driven-animations-behind-supports-instead-of-gsap, native-details-faq, structured-data-only-from-cms-data, cms-keys-configurator-faq-optional-back-compat]
SELECTED_SKILLS: [editorial-tech, gsap-scrolltrigger-storytelling, visual-web-engineering, design-system-foundation, core-web-vitals, wcag-aa]
ADMIN_SCOPE: [overview, crm_leads, orders, clients, website_studio, identity_contact, hero, services, portfolio, seo, theme_motion, system]
KNOWN_PROBLEMS: [3d-and-scroll-driven-css-not-yet-seen-in-a-browser, json-ld-rendered-client-side, next-image-remote-posterUrl-needs-remotePatterns, photo-upload-storage_not_yet_connected, password-reset-email_not_yet_connected, cookie-security_requires_production_https_config, some-homepage-sections-still-use-legacy-constants, legacy_frontend_directory_requires_separate_audit, current_phase_requires_final_local_validation]
VISUAL_PASS_FILES: [components/sections/HeroSection.tsx, app/wob-art-hero.css, components/sections/ServicesSection.tsx, app/wob-art-services.css, components/sections/PortfolioSection.tsx, app/wob-art-portfolio.css, PROJECT_BRAIN/SELECTED_SKILLS/phase-08-visual-direction.md]
HARDENING_PASS_FILES: [components/sections/HeroSection.tsx, components/sections/PortfolioSection.tsx, components/ui/BeforeAfter.tsx, components/sections/ServicesSection.tsx, PROJECT_BRAIN/PHASE_09_PERFORMANCE_ACCESSIBILITY.md]
LAST_UPDATED: 2026-10-10
RESEARCH: PROJECT_BRAIN/RESEARCH/2026-10-10_next_gen_research.md
NEXT_GEN_FILES: [components/canvas/WrapConfigurator.tsx, components/sections/ConfiguratorSection.tsx, components/sections/FaqSection.tsx, components/sections/ProcessSection.tsx, components/seo/StructuredData.tsx, components/ui/WhatsAppCta.tsx, app/admin/website/page.tsx, lib/cms-schema.ts, lib/site-content.ts]
