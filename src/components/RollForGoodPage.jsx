import React, { useState } from 'react';
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
      data-role-id="rfg-section-heading"
      style={{ fontFamily: fs, color: 'var(--color-heading)' }}
    >
      {children}
    </h2>
  );
}

function BodyText({ children, muted = false }) {
  return (
    <div data-role-id="rfg-body-text" style={{
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
        fontWeight: 700,
        fontSize: 'var(--size-body)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--color-muted)',
        margin: 0,
        flex: '1 0 0',
      }}>
        {children}
      </p>
    </div>
  );
}

function BulletItem({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 6, height: 6,
        borderRadius: '50%',
        background: 'var(--color-callout-border)',
        marginTop: 10,
      }} />
      <BodyText>
        <p style={{ margin: 0 }}>
          {label && <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{label}</strong>}
          {label ? ' — ' : ''}{children}
        </p>
      </BodyText>
    </div>
  );
}

/* ─── Impact card icons ──────────────────────────────────────── */

function IconMind() {
  return (
    <svg width="35" height="36" viewBox="0 0 35 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.875 3.9375C7.875 1.76484 9.63984 0 11.8125 0H13.5C14.7445 0 15.75 1.00547 15.75 2.25V33.75C15.75 34.9945 14.7445 36 13.5 36H11.25C9.15469 36 7.38984 34.5656 6.89062 32.625C6.84141 32.625 6.79922 32.625 6.75 32.625C3.64219 32.625 1.125 30.1078 1.125 27C1.125 25.7344 1.54688 24.5672 2.25 23.625C0.885938 22.5984 0 20.9672 0 19.125C0 16.9523 1.2375 15.0609 3.0375 14.1258C2.53828 13.282 2.25 12.2977 2.25 11.25C2.25 8.14219 4.76719 5.625 7.875 5.625V3.9375ZM27 3.9375V5.625C30.1078 5.625 32.625 8.14219 32.625 11.25C32.625 12.3047 32.3367 13.2891 31.8375 14.1258C33.6445 15.0609 34.875 16.9453 34.875 19.125C34.875 20.9672 33.9891 22.5984 32.625 23.625C33.3281 24.5672 33.75 25.7344 33.75 27C33.75 30.1078 31.2328 32.625 28.125 32.625C28.0758 32.625 28.0336 32.625 27.9844 32.625C27.4852 34.5656 25.7203 36 23.625 36H21.375C20.1305 36 19.125 34.9945 19.125 33.75V2.25C19.125 1.00547 20.1305 0 21.375 0H23.0625C25.2352 0 27 1.76484 27 3.9375Z" fill="var(--prim-mint-600)"/>
    </svg>
  );
}

function IconConnection() {
  return (
    <svg width="39" height="36" viewBox="0 0 39 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.7949 3.52059L10.0787 12.0971C9.77427 12.4346 9.7875 12.9574 10.1118 13.2816C12.1301 15.3 15.4059 15.3 17.4243 13.2816L19.5287 11.1772C19.8066 10.8993 20.1574 10.7471 20.5147 10.7206C20.9647 10.6809 21.4279 10.8331 21.7721 11.1772L33.4588 22.7647L38.1176 19.0588V0L30.7059 4.23529L29.1309 3.18309C28.0853 2.48824 26.861 2.11765 25.6037 2.11765H20.9449C20.8721 2.11765 20.7926 2.11765 20.7199 2.12426C19.6015 2.18382 18.5493 2.68676 17.7949 3.52059ZM7.71618 9.97279L14.7838 2.11765H12.1632C10.4757 2.11765 8.86103 2.78603 7.66985 3.97721L0 12.7059V36L9.52941 27L10.35 27.6816C11.8721 28.9522 13.7912 29.6471 15.7699 29.6471H16.8088L16.3456 29.1838C15.7235 28.5618 15.7235 27.5559 16.3456 26.9404C16.9676 26.325 17.9735 26.3184 18.589 26.9404L21.3022 29.6537H21.8978C23.1618 29.6537 24.3993 29.3691 25.5243 28.8397L23.7574 27.0662C23.1353 26.4441 23.1353 25.4382 23.7574 24.8228C24.3794 24.2074 25.3853 24.2007 26.0007 24.8228L28.1184 26.9404L29.2765 25.7824C29.8654 25.1934 30.0375 24.3397 29.7794 23.5919L20.6537 14.539L19.6676 15.525C16.4051 18.7875 11.1243 18.7875 7.86177 15.525C6.33971 14.0029 6.28015 11.561 7.71618 9.96618V9.97279Z" fill="var(--prim-mint-600)"/>
    </svg>
  );
}

function IconHeritage() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16.7836 0.358594C17.5219 -0.119531 18.4781 -0.119531 19.2164 0.358594L34.9664 10.4836C35.8031 11.025 36.1898 12.0516 35.9086 13.0078C35.6273 13.9641 34.7484 14.625 33.75 14.625H31.5V29.25L35.1 31.95C35.6695 32.3719 36 33.0398 36 33.75C36 34.9945 34.9945 36 33.75 36H2.25C1.00547 36 0 34.9945 0 33.75C0 33.0398 0.330469 32.3719 0.9 31.95L4.5 29.25V14.625H2.25C1.25156 14.625 0.372656 13.9641 0.0914062 13.0078C-0.189844 12.0516 0.196875 11.018 1.03359 10.4836L16.7836 0.358594ZM23.625 14.625V29.25H28.125V14.625H23.625ZM15.75 29.25H20.25V14.625H15.75V29.25ZM7.875 14.625V29.25H12.375V14.625H7.875Z" fill="var(--prim-mint-600)"/>
    </svg>
  );
}

function IconResilience() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.9938 0.00624774C18.5186 0.00624774 19.0121 0.281152 19.2808 0.737244L22.7484 6.52274L29.2961 4.87956C29.8084 4.7546 30.352 4.90455 30.7206 5.27317C31.0892 5.64179 31.2392 6.1916 31.1142 6.69767L29.471 13.2392L35.2628 16.7067C35.7126 16.9754 35.9938 17.4689 35.9938 17.9938C35.9938 18.5186 35.7189 19.0122 35.2628 19.2808L29.471 22.7546L31.1142 29.2961C31.2392 29.8084 31.0892 30.352 30.7206 30.7206C30.352 31.0892 29.8022 31.2454 29.2961 31.1204L22.7546 29.4773L19.2871 35.269C19.0184 35.7189 18.5248 36 18 36C17.4752 36 16.9816 35.7251 16.7129 35.269L13.2392 29.4773L6.69767 31.1204C6.18535 31.2454 5.64804 31.0955 5.27317 30.7268C4.8983 30.3582 4.74835 29.8084 4.87331 29.2961L6.51024 22.7546L0.724748 19.2871C0.274905 19.0122 0 18.5248 0 18C0 17.4752 0.274905 16.9816 0.730996 16.7129L6.51649 13.2454L4.87331 6.69767C4.74835 6.18535 4.89205 5.64804 5.26692 5.27317C5.64179 4.8983 6.18535 4.7546 6.69767 4.87956L13.2392 6.51649L16.7067 0.730996L16.8192 0.568553C17.1003 0.212426 17.5314 0 17.9938 0V0.00624774ZM17.9938 9.00313C15.6076 9.00313 13.3192 9.95101 11.632 11.6382C9.94476 13.3255 8.99688 15.6139 8.99688 18C8.99688 20.3861 9.94476 22.6745 11.632 24.3618C13.3192 26.049 15.6076 26.9969 17.9938 26.9969C20.3799 26.9969 22.6683 26.049 24.3555 24.3618C26.0427 22.6745 26.9906 20.3861 26.9906 18C26.9906 15.6139 26.0427 13.3255 24.3555 11.6382C22.6683 9.95101 20.3799 9.00313 17.9938 9.00313ZM17.9938 23.9979C16.403 23.9979 14.8774 23.366 13.7526 22.2412C12.6278 21.1163 11.9958 19.5907 11.9958 18C11.9958 16.4093 12.6278 14.8837 13.7526 13.7588C14.8774 12.634 16.403 12.0021 17.9938 12.0021C19.5845 12.0021 21.1101 12.634 22.2349 13.7588C23.3597 14.8837 23.9917 16.4093 23.9917 18C23.9917 19.5907 23.3597 21.1163 22.2349 22.2412C21.1101 23.366 19.5845 23.9979 17.9938 23.9979Z" fill="var(--prim-mint-600)"/>
    </svg>
  );
}

/** Icon + text card for the "What the Game Builds" grid */
const ICON_OVERHANG = 18; // how far the icon pokes above the card

const IMPACT_GRID_STYLE = `
.rfg-impact-grid {
  gap: 12px;
}
@media (max-width: 600px) {
  .rfg-impact-grid {
    gap: ${ICON_OVERHANG + 16}px;
  }
}
`;

function ImpactCard({ Icon, title, description }) {
  return (
    <div style={{
      flex: '1 1 200px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '24px 24px 20px',
      paddingTop: 36 - ICON_OVERHANG + 10, // space from where the icon actually sits inside the card
      background: 'var(--prim-mint-100)',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        top: -ICON_OVERHANG,
        left: 24,
        lineHeight: 0,
      }}>
        <Icon />
      </div>
      <div style={{
        fontFamily: fs,
        fontWeight: 700,
        fontSize: 22,
        color: 'var(--color-heading)',
        lineHeight: 1.3,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: fb,
        fontSize: 'var(--size-body)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--color-body)',
      }}>
        {description}
      </div>
    </div>
  );
}

/** Partner block — bold name + role description */
function PartnerBlock({ name, href, description }) {
  const nameEl = href
    ? <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{name}</a>
    : <strong style={{ fontWeight: 700, color: 'var(--color-heading)' }}>{name}</strong>;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0, width: 6, height: 6,
        borderRadius: '50%',
        background: 'var(--color-callout-border)',
        marginTop: 10,
      }} />
      <BodyText>
        <p style={{ margin: 0 }}>
          {nameEl}{' — '}{description}
        </p>
      </BodyText>
    </div>
  );
}

/** Timeline step for funding / structure sections */
function TimelineStep({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0,
        background: 'var(--color-callout-border)',
        borderRadius: 4,
        padding: '3px 10px',
        fontFamily: fp,
        fontWeight: 700,
        fontSize: 11,
        color: 'var(--color-bg)',
        letterSpacing: '0.04em',
        marginTop: 4,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <BodyText>
        <p style={{ margin: 0 }}>{children}</p>
      </BodyText>
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

/* ─── Contact form ───────────────────────────────────────────── */

const CONTACT_FORM_STYLE = `
.rfg-contact-form {
  --rfg-input-font: var(--font-lead);
  --rfg-input-size: var(--size-body-lg);
  --rfg-input-weight: var(--font-lead-weight);
  --rfg-input-lh: var(--font-lead-lh);
  --rfg-form-pad: 32px 28px;
  --rfg-form-gap: 24px;
  --rfg-field-gap: 16px;
}
@media (max-width: 600px) {
  .rfg-contact-form {
    --rfg-input-size: var(--size-body);
    --rfg-input-lh: var(--lh-body);
    --rfg-form-pad: 20px 16px;
    --rfg-form-gap: 16px;
    --rfg-field-gap: 10px;
  }
}
`;

const INTEREST_OPTIONS = [
  'Start a school club',
  'Start a youth organization club',
  'Volunteer as a teacher / speaker',
  'Financial contribution',
  'Other',
];

function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', org: '', role: '', interest: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    const fields = [
      { label: 'Name', value: form.name },
      { label: 'Email', value: form.email },
      { label: 'Organization', value: form.org },
      { label: 'Role', value: form.role },
      { label: 'Interest', value: form.interest },
      { label: 'Message', value: form.message },
    ].filter(f => f.value);

    return (
      <div className="surface-tertiary" style={{
        borderRadius: 16,
        padding: '32px 28px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            fontFamily: fh,
            fontWeight: 700,
            fontSize: 'var(--size-h2)',
            color: 'var(--color-heading)',
            lineHeight: 1.2,
          }}>
            Thank you
          </div>
          <div style={{
            fontFamily: fb,
            fontSize: 'var(--size-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-body)',
          }}>
            A member of the Roll for Good team will be in touch. Here is what you submitted:
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {fields.map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontFamily: fp,
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-muted)',
              }}>
                {label}
              </span>
              <span style={{
                fontFamily: fb,
                fontSize: 'var(--size-body)',
                lineHeight: 'var(--lh-body)',
                color: 'var(--color-heading)',
                wordBreak: 'break-word',
              }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="surface-tertiary rfg-contact-form" style={{
      borderRadius: 16,
      padding: 'var(--rfg-form-pad)',
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--rfg-form-gap)',
      '--color-input-placeholder': 'rgba(255, 255, 255, 0.7)',
    }}>
      <style>{CONTACT_FORM_STYLE}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          fontFamily: fh,
          fontWeight: 700,
          fontSize: 'var(--size-h2)',
          color: 'var(--color-heading)',
          lineHeight: 1.2,
        }}>
          Get in touch
        </div>
        <div style={{
          fontFamily: fb,
          fontSize: 'var(--size-body)',
          lineHeight: 'var(--lh-body)',
          color: 'var(--color-body)',
        }}>
          Whether you want to start a club, volunteer, or contribute — we would love to hear from you.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--rfg-field-gap)',
      }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={update('name')}
            required
            style={{ flex: '1 1 200px', fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
          />
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={update('email')}
            required
            style={{ flex: '1 1 200px', fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            className="form-input"
            type="text"
            placeholder="Organization name"
            value={form.org}
            onChange={update('org')}
            style={{ flex: '1 1 200px', fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
          />
          <input
            className="form-input"
            type="text"
            placeholder="Your role"
            value={form.role}
            onChange={update('role')}
            style={{ flex: '1 1 200px', fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
          />
        </div>

        <select
          className="form-input"
          value={form.interest}
          onChange={update('interest')}
          required
          style={{ color: form.interest ? undefined : 'var(--color-input-placeholder)', fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
        >
          <option value="" disabled>How would you like to get involved?</option>
          {INTEREST_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>

        <textarea
          className="form-input form-input--textarea"
          placeholder="Tell us a bit more (optional)"
          value={form.message}
          onChange={update('message')}
          rows={4}
          style={{ fontFamily: 'var(--rfg-input-font)', fontSize: 'var(--rfg-input-size)', fontWeight: 'var(--rfg-input-weight)', lineHeight: 'var(--rfg-input-lh)' }}
        />

        <button type="submit" className="com-btn com-btn--ui-primary" style={{ width: '100%' }}>
          Send Message
        </button>
      </form>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */

export default function RollForGoodPage({ onNavigate }) {
  const launchMvp = useDMEState('global.launchMvp', true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      width: '100%',
      position: 'relative',
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>

      {/* ── HEADER ── */}
      <SiteHeader onNavigate={onNavigate} />

      {/* ── HERO / INTRO ── */}
      <section className="section" data-section-id="rfg-hero">
        <div className="article-content" style={{ textAlign: 'center', alignItems: 'center' }}>

          <h1
            className="article-heading--h1"
            data-role-id="rfg-hero-title"
            style={{ fontFamily: fh, color: 'var(--color-heading)', textAlign: 'center' }}
          >
            Roll for Good
          </h1>

          <div data-role-id="rfg-hero-subtitle" style={{
            fontFamily: fs,
            fontWeight: 'var(--font-subheading-weight)',
            fontSize: 'var(--size-h2)',
            lineHeight: 'var(--font-subheading-lh)',
            color: 'var(--color-muted)',
            textAlign: 'center',
          }}>
            A social impact program connecting children to the game — and to each other
          </div>

          <BodyText muted>
            <p className="rfg-partners" style={{ margin: 0, textAlign: 'center' }}>
              <span>Led by Backgammon.com</span>
              <span className="rfg-partners__divider" />
              <span>In partnership with <a href="https://usbgf.org/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>USBGF</a> &amp; <a href="https://wbgf.info/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>WBGF</a></span>
            </p>
          </BodyText>

        </div>
      </section>

      {/* ── CONTENT BODY ── */}
      <section className="section surface-inverse" data-section-id="rfg-content">
        <div className="article-content article-content--gap-lg">

          {/* ── Our Purpose ── */}
          <div id="section-purpose" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Our Purpose</DividerLabel>
            <H2>Why Roll for Good Exists</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Backgammon has been bringing people together for thousands of years. Roll for Good ensures that legacy reaches every child — regardless of background, zip code, or circumstance. Led by Backgammon.com and delivered in partnership with the United States Backgammon Federation and the World Backgammon Federation, Roll for Good teaches backgammon to young people in underserved communities, funds the creation of scholastic clubs, and connects the next generation to a game that builds strategic thinking, patience, and the joy of human connection.
              </p>
            </BodyText>
            <Callout>
              Backgammon belongs to everyone. Roll for Good makes that literally true.
            </Callout>
          </div>

          <SectionSep />

          {/* ── Our Partners ── */}
          <div id="section-partners" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Our Partners</DividerLabel>
            <H2>Built on Institutional Strength</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Roll for Good is led by Backgammon.com and delivered in active partnership with two of the world's leading backgammon organizations. Together, we bring funding, infrastructure, expertise, and a global community of players to every school and youth organization we serve.
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <PartnerBlock
                name="Backgammon.com"
                description="Program lead. Provides funding, game boards, teaching resources, and program coordination."
              />
              <PartnerBlock
                name="USBGF"
                description="US partner. Connects the program to its network of American clubs, certified players, and scholastic communities."
              />
              <PartnerBlock
                name="WBGF"
                description="Global partner. Provides endorsement and local infrastructure across 40+ member nations for international rollout."
              />
            </div>
          </div>

          <SectionSep />

          {/* ── What We Deliver ── */}
          <div id="section-deliver" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>What We Deliver</DividerLabel>
            <H2>The Program in Practice</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Roll for Good works at the community level — entering schools, youth organizations, and community centers with everything needed to get a club up and running, and the ongoing support to keep it thriving.
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <BulletItem label="Scholastic Club Startup Funding">
                We provide startup grants to establish backgammon clubs within schools and youth organizations, covering the costs of launch so no institution faces a financial barrier to getting involved.
              </BulletItem>
              <BulletItem label="Game Boards & Teaching Resources">
                Every partner school and community center receives a set of physical backgammon boards and a full suite of teaching materials — designed to make learning accessible, structured, and fun.
              </BulletItem>
              <BulletItem label="Professional Player Instruction">
                Through our partnerships with the USBGF and WBGF, we bring professional and highly rated players directly into classrooms and club sessions. These players deliver lectures, run workshops, and mentor young players — giving children access to world-class instruction and inspiring role models from within the game's community.
              </BulletItem>
              <BulletItem label="Youth Organization Outreach">
                We actively promote backgammon clubs within established youth organizations, meeting young people in the spaces where they already gather — after-school programs, community leagues, and youth centers.
              </BulletItem>
            </div>
          </div>

          <SectionSep />

          {/* ── What the Game Builds ── */}
          <div id="section-impact" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>What the Game Builds</DividerLabel>
            <H2>More Than Moves on a Board</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Every session delivers something that lasts well beyond the game itself. Through structured play and guided instruction, children develop skills that serve them for life.
              </p>
            </BodyText>
            <div className="rfg-impact-grid" style={{
              display: 'flex',
              flexWrap: 'wrap',
              width: '100%',
              marginTop: ICON_OVERHANG + 20,
            }}>
              <style>{IMPACT_GRID_STYLE}</style>
              <ImpactCard
                Icon={IconMind}
                title="Mind"
                description="Strategic thinking and patience"
              />
              <ImpactCard
                Icon={IconConnection}
                title="Connection"
                description="Social skills and friendship"
              />
              <ImpactCard
                Icon={IconHeritage}
                title="Heritage"
                description="Cultural history and curiosity"
              />
              <ImpactCard
                Icon={IconResilience}
                title="Resilience"
                description="Handling chance and setbacks gracefully"
              />
            </div>
          </div>

          <SectionSep />

          {/* ── Program Structure ── */}
          <div id="section-structure" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Program Structure</DividerLabel>
            <H2>How We Grow</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Roll for Good launches as a named program within Backgammon.com, with a clear path to becoming a registered 501(c)(3) foundation as the program scales globally.
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TimelineStep label="Structure">
                Named program within Backgammon.com in Year 1. Converted to a registered 501(c)(3) foundation as global scale justifies the governance structure.
              </TimelineStep>
              <TimelineStep label="Year 1">
                US pilot across 10–20 schools and youth organizations in 3–4 cities, in coordination with the USBGF and its network of local clubs and players.
              </TimelineStep>
              <TimelineStep label="Global">
                International rollout through WBGF endorsement — 40+ member nations providing local infrastructure, player networks, and community relationships to carry the program worldwide.
              </TimelineStep>
            </div>
          </div>

          <SectionSep />

          {/* ── Get Involved ── */}
          <div id="section-apply" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Get Involved</DividerLabel>
            <H2>How to Apply</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                If you or your organization are interested in starting a Backgammon.com club in your school or youth organization, we would love to hear from you. Getting started is simple — reach out to us directly and we will take it from there.
              </p>
            </BodyText>
            <Callout>
              Every great club begins with a single move. Make yours today.
            </Callout>

            <ContactForm />
          </div>

          <SectionSep />

          {/* ── Funding ── */}
          <div id="section-funding" style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            <DividerLabel>Funding</DividerLabel>
            <H2>Independent by Design</H2>
            <BodyText>
              <p style={{ margin: 0 }}>
                Roll for Good is funded independently from the Backgammon.com product — ensuring its integrity and long-term sustainability across every stage of growth.
              </p>
            </BodyText>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <TimelineStep label="Year 1">
                Direct funding from Backgammon.com company budget, standalone from the product.
              </TimelineStep>
              <TimelineStep label="Near Term">
                Grants and corporate donors as the program demonstrates impact and scale.
              </TimelineStep>
              <TimelineStep label="Foundation">
                Independent fundraising once 501(c)(3) status is secured and governance is established across Backgammon.com, USBGF, and WBGF.
              </TimelineStep>
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
