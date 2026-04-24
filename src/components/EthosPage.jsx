import React from 'react';
import SiteHeader from './SiteHeader';
import { SiteFooter, PlayNowCta } from './SharedLayout';
import { useDMEState } from '../context/dme-states';

/* Token shorthand helpers */
const fh = 'var(--font-heading)';
const fs = 'var(--font-subheading)';
const fb = 'var(--font-body)';
const fp = 'var(--font-pill)';
const fm = 'var(--font-meta)';

/* ─── Sub-components ─────────────────────────────────────────── */

function HRule() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border)', flexShrink: 0 }} />;
}

function SectionBreak() {
  return <div style={{ height: 1, width: '100%', background: 'var(--color-border-light)', flexShrink: 0 }} />;
}

function H2({ children }) {
  return (
    <h2
      className="article-heading--h2"
      data-role-id="et-section-heading"
      style={{ fontFamily: fs, color: 'var(--color-heading)' }}
    >
      {children}
    </h2>
  );
}

function H3({ children }) {
  return (
    <h3
      data-role-id="et-subsection-heading"
      style={{
        fontFamily: fs,
        fontWeight: 700,
        fontSize: 'var(--size-h3)',
        lineHeight: 'var(--font-subheading-lh)',
        color: 'var(--color-heading)',
        margin: 0,
      }}
    >
      {children}
    </h3>
  );
}

function BodyText({ children, muted = false }) {
  return (
    <div data-role-id="et-body-text" style={{
      fontFamily: fb,
      fontWeight: 'var(--prim-type-body-md-weight)',
      fontSize: 'var(--size-body)',
      lineHeight: 'var(--lh-body)',
      color: muted ? 'var(--color-muted)' : 'var(--color-body)',
      width: '100%',
    }}>
      {children}
    </div>
  );
}

function SepIcon() {
  return (
    <svg width="54" height="30" viewBox="0 0 54 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', opacity: 0.3 }}>
      <path d="M0.997701 30C0.659468 30 0.490352 30 0.37735 29.9295C0.278381 29.8677 0.206255 29.7709 0.175284 29.6585C0.139922 29.53 0.188179 29.3679 0.284694 29.0438L7.98119 3.19309C8.26657 2.23457 8.40926 1.7553 8.62784 1.63231C8.81661 1.52608 9.04713 1.52608 9.2359 1.63231C9.45447 1.7553 9.59716 2.23457 9.88254 3.19309L17.579 29.0438C17.6756 29.368 17.7238 29.53 17.6885 29.6585C17.6575 29.771 17.5854 29.8677 17.4864 29.9295C17.3734 30 17.2043 30 16.866 30L0.997701 30Z" fill="currentColor"/>
      <path d="M18.8615 30C18.5232 30 18.3541 30 18.2411 29.9295C18.1422 29.8677 18.07 29.7709 18.0391 29.6585C18.0037 29.53 18.0519 29.3679 18.1485 29.0438L25.845 3.19309C26.1303 2.23457 26.273 1.7553 26.4916 1.63231C26.6804 1.52608 26.9109 1.52608 27.0997 1.63231C27.3182 1.7553 27.4609 2.23457 27.7463 3.19309L35.4428 29.0438C35.5393 29.368 35.5876 29.53 35.5522 29.6585C35.5213 29.771 35.4491 29.8677 35.3502 29.9295C35.2372 30 35.068 30 34.7298 30L18.8615 30Z" fill="currentColor" opacity="0.45"/>
      <path d="M36.7252 30C36.387 30 36.2179 30 36.1049 29.9295C36.0059 29.8677 35.9338 29.7709 35.9028 29.6585C35.8675 29.53 35.9157 29.3679 36.0122 29.0438L43.7087 3.19309C43.9941 2.23457 44.1368 1.7553 44.3554 1.63231C44.5441 1.52608 44.7747 1.52608 44.9634 1.63231C45.182 1.7553 45.3247 2.23457 45.6101 3.19309L53.3066 29.0438C53.4031 29.368 53.4514 29.53 53.416 29.6585C53.385 29.771 53.3129 29.8677 53.2139 29.9295C53.1009 30 52.9318 30 52.5936 30L36.7252 30Z" fill="currentColor"/>
    </svg>
  );
}

function SectionSep() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: 16, paddingBottom: 8 }}>
      <SepIcon />
    </div>
  );
}

function DividerLabel({ children }) {
  return (
    <span style={{
      fontFamily: fp,
      fontWeight: 700,
      fontSize: 'var(--size-pill)',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--color-accent)',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

function Callout({ children }) {
  return (
    <div style={{
      borderLeft: '2px solid var(--color-callout-border)',
      paddingLeft: 16,
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <p style={{
        fontFamily: fb,
        fontWeight: 400,
        fontSize: 'var(--size-body)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--color-muted)',
        margin: 0,
        fontStyle: 'italic',
        flex: '1 0 0',
      }}>
        {children}
      </p>
    </div>
  );
}


/* ─── Mobile nav (same as lesson template) ───────────────────── */

function IconLearning() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M42.5 50H20C15.8594 50 12.5 46.6406 12.5 42.5V17.5C12.5 13.3594 15.8594 10 20 10H43.75C45.8203 10 47.5 11.6797 47.5 13.75V36.25C47.5 37.8828 46.4531 39.2734 45 39.7891V45C46.3828 45 47.5 46.1172 47.5 47.5C47.5 48.8828 46.3828 50 45 50H42.5ZM20 40C18.6172 40 17.5 41.1172 17.5 42.5C17.5 43.8828 18.6172 45 20 45H40V40H20ZM22.5 21.875C22.5 22.9141 23.3359 23.75 24.375 23.75H38.125C39.1641 23.75 40 22.9141 40 21.875C40 20.8359 39.1641 20 38.125 20H24.375C23.3359 20 22.5 20.8359 22.5 21.875ZM24.375 27.5C23.3359 27.5 22.5 28.3359 22.5 29.375C22.5 30.4141 23.3359 31.25 24.375 31.25H38.125C39.1641 31.25 40 30.4141 40 29.375C40 28.3359 39.1641 27.5 38.125 27.5H24.375Z" fill="currentColor"/>
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
    </svg>
  );
}

function IconNewGame() {
  return (
    <svg width="34" height="34" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 12.2321C28.6052 12.1702 27.1759 12.5529 25.9893 13.319C23.8809 14.6445 22.6251 17.1787 22.834 19.5778C22.875 20.129 22.9835 20.672 23.1562 21.1872C23.2586 21.4926 23.3834 21.7888 23.5283 22.0719C23.4456 21.7649 23.3837 21.4547 23.3418 21.1442C23.271 20.6202 23.2577 20.0939 23.2988 19.5778C23.4665 17.3335 24.7174 15.315 26.5293 14.1608C27.5573 13.4993 28.7591 13.1144 30 13.0583C31.4401 12.9878 32.9247 13.3672 34.2041 14.1842C34.4685 14.3525 34.7243 14.5395 34.9688 14.7428C34.772 14.4929 34.5546 14.2557 34.3203 14.0348C33.1907 12.9612 31.6226 12.2925 30 12.2321Z" fill="currentColor"/>
      <path d="M30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
    </svg>
  );
}

function IconSettingsNav() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function IconActivityNav() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0038 0C18.6547 0 17.5648 1.08994 17.5648 2.43902V2.68293C12.0008 3.81098 7.80871 8.73476 7.80871 14.6341V16.2881C7.80871 19.9543 6.55871 23.5137 4.27213 26.3796L3.52518 27.3095C3.13646 27.7896 2.93066 28.3841 2.93066 29.0015C2.93066 30.4954 4.14255 31.7073 5.63646 31.7073H34.3636C35.8575 31.7073 37.0694 30.4954 37.0694 29.0015C37.0694 28.3841 36.8636 27.7896 36.4749 27.3095L35.7279 26.3796C33.449 23.5137 32.199 19.9543 32.199 16.2881V14.6341C32.199 8.73476 28.0069 3.81098 22.4429 2.68293V2.43902C22.4429 1.08994 21.3529 0 20.0038 0Z"/>
      <path d="M14.386 34.386C14.386 35.8749 14.9775 37.3028 16.0303 38.3557C17.0832 39.4085 18.5111 40 20.0001 40C21.489 40 22.917 39.4085 23.9698 38.3557C25.0226 37.3028 25.6141 35.8749 25.6141 34.386H14.386Z"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Learn',         Icon: IconLearning },
  { label: 'My Profile',    Icon: IconProfile },
  { label: 'New Game',      Icon: IconNewGame },
  { label: 'Notifications', Icon: IconActivityNav, hasBadge: true },
  { label: 'Settings',      Icon: IconSettingsNav },
];

function MobileNav({ onNavigate, hasUnread }) {
  return (
    <nav className="mobile-nav">
      {NAV_ITEMS.map(({ label, Icon, hasBadge }) => (
        <button
          key={label}
          className={`mobile-nav__item${hasBadge ? ' mobile-nav__item--has-badge' : ''}`}
          onClick={
            label === 'Learn' ? () => onNavigate?.('learn-hub')
            : label === 'My Profile' ? () => onNavigate?.('profile')
            : label === 'New Game' ? () => onNavigate?.('play')
            : label === 'Settings' ? () => onNavigate?.('settings')
            : undefined
          }
        >
          <Icon />
          {hasBadge && hasUnread && <span className="mobile-nav__badge" />}
        </button>
      ))}
    </nav>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function EthosPage({ onNavigate }) {
  const launchMvp = useDMEState('global.launchMvp', true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      width: '100%',
      position: 'relative',
      minHeight: '100vh',
    }}>

      {/* ── HEADER ── */}
      <SiteHeader onNavigate={onNavigate} />

      {/* ── HERO / INTRO ── */}
      <section className="section" data-section-id="et-hero">
        <div className="article-content" style={{ textAlign: 'center', alignItems: 'center' }}>

          <h1
            className="article-heading--h1"
            data-role-id="et-hero-title"
            style={{ fontFamily: fh, color: 'var(--color-heading)', textAlign: 'center' }}
          >
            Our Ethos
          </h1>

          <div data-role-id="et-hero-subtitle" style={{
            fontFamily: fs,
            fontWeight: 'var(--font-subheading-weight)',
            fontSize: 'var(--size-h2)',
            lineHeight: 'var(--font-subheading-lh)',
            color: 'var(--color-muted)',
            textAlign: 'center',
          }}>
            The values that shape every move we make
          </div>

        </div>
      </section>

      {/* ── CONTENT BODY ── */}
      <section className="section surface-inverse" data-section-id="et-content">
        <div className="article-content article-content--gap-lg">

          {/* ── Pillar I: Human Connection ── */}
          <div id="section-connection" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Pillar I</DividerLabel>
            <H2>Human Connection</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Backgammon.com is built on the bonds between people. It keeps friends close across distance, opens the door to new acquaintances, and creates space for every kind of relationship to take root. In the meeting of skill and luck, something quietly human emerges — shared laughter, held breath, the warmth that lingers long after the final piece is moved.
              </p>
            </BodyText>
            <Callout>
              Every feature, message, and experience is designed to spark connection. We bring the glance, the laugh, and the comfortable silence into the digital world — so that play always feels genuinely human.
            </Callout>
          </div>

          <SectionSep />

          {/* ── Pillar II: Culture & Timelessness ── */}
          <div id="section-culture" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Pillar II</DividerLabel>
            <H2>Culture &amp; Timelessness</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Backgammon has endured for millennia. Backgammon.com carries that heritage forward — not as a relic, but as a living part of modern culture. The game belongs at a cafe table, on a phone during a commute, in a late-night match with old friends. Timeless enough to carry credibility. Alive enough to feel entirely of today.
              </p>
            </BodyText>
            <Callout>
              We always connect the ancient to the present — showing how a game played across centuries still has a place in daily life, and why that continuity makes every match feel meaningful.
            </Callout>
          </div>

          <SectionSep />

          {/* ── Pillar III: Inclusivity ── */}
          <div id="section-inclusivity" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Pillar III</DividerLabel>
            <H2>Inclusivity</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Backgammon is for everyone. Young and old, newcomer and champion, across every background and way of playing. The element of luck lowers the threshold — the game is easy to begin, quick to enjoy, and open to all. At the board, the field is level. Here, everyone belongs.
              </p>
            </BodyText>
            <Callout>
              We design for the beginner without diminishing the depth that experts seek. Backgammon.com is always simple, welcoming, and barrier-free — a platform where anyone can find their place, at their own pace.
            </Callout>
          </div>

          <SectionSep />

          {/* ── How We Speak ── */}
          <DividerLabel>How We Speak About What We Do</DividerLabel>
          <div id="section-voice" style={{ display: 'flex', flexDirection: 'column', gap: 32, width: '100%' }}>

            {/* Mission */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <H2>Mission</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  For thousands of years, backgammon has been more than a game — it is where bonds are made, rivalries are born, and fortunes turn on a single roll. We carry that spirit forward, crafting play that sparks laughter, tension, and connection across any distance. Our mission is simple: to create moments of human connection through a game anyone can play, made alive for today's world.
                </p>
              </BodyText>
            </div>

            {/* Positioning */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <H2>Positioning</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  Backgammon.com is the social backgammon platform that turns timeless play into modern culture. It is where friends reconnect across distance, strangers become rivals, and every kind of relationship finds room to grow. Easy to learn, open to all, and designed with cheeky energy and cultural style — so the game always feels human, fun, and alive.
                </p>
              </BodyText>
            </div>

            {/* Purpose */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <H2>Purpose</H2>
              <BodyText>
                <p style={{ margin: 0 }}>
                  Backgammon.com exists to bring people together through backgammon. For thousands of years this game has connected friends and communities. We carry that spirit forward — making it easy to learn, open to everyone, and designed with care and style to feel social, welcoming, and endlessly engaging.
                </p>
              </BodyText>
            </div>
          </div>

          {!launchMvp && <div className="mobile-nav__spacer" />}

        </div>
      </section>

      {/* ── CTA END CAP ── */}
      <PlayNowCta sectionId="gl-cta" />

      {/* ── FOOTER ── */}
      <SiteFooter sectionId="gl-footer" onNavigate={onNavigate} />

      {/* ── MOBILE BOTTOM NAV ── */}
      {!launchMvp && <MobileNav onNavigate={onNavigate} />}

    </div>
  );
}
