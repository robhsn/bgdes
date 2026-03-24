import React, { useState } from 'react';
import { useDMEState } from '../context/dme-states';
import { SiteHeader, SiteFooter } from './SharedLayout';
import {
  SettingsContent, AvatarModal, CoverModal, ImageCropModal,
  PRESET_AVATARS, PRESET_COVERS,
} from './ProfilePage';
import profileData from '../tokens/profile-data.json';
import './SettingsPage.css';

/* ─── Mobile Nav ─────────────────────────────────────────────── */

function IconLearnNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M42.5 50H20C15.8594 50 12.5 46.6406 12.5 42.5V17.5C12.5 13.3594 15.8594 10 20 10H43.75C45.8203 10 47.5 11.6797 47.5 13.75V36.25C47.5 37.8828 46.4531 39.2734 45 39.7891V45C46.3828 45 47.5 46.1172 47.5 47.5C47.5 48.8828 46.3828 50 45 50H42.5ZM20 40C18.6172 40 17.5 41.1172 17.5 42.5C17.5 43.8828 18.6172 45 20 45H40V40H20ZM22.5 21.875C22.5 22.9141 23.3359 23.75 24.375 23.75H38.125C39.1641 23.75 40 22.9141 40 21.875C40 20.8359 39.1641 20 38.125 20H24.375C23.3359 20 22.5 20.8359 22.5 21.875ZM24.375 27.5C23.3359 27.5 22.5 28.3359 22.5 29.375C22.5 30.4141 23.3359 31.25 24.375 31.25H38.125C39.1641 31.25 40 30.4141 40 29.375C40 28.3359 39.1641 27.5 38.125 27.5H24.375Z" fill="currentColor"/>
    </svg>
  );
}

function IconProfileNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 29.0476C31.2507 29.0476 32.4892 28.8013 33.6446 28.3227C34.8001 27.844 35.85 27.1425 36.7344 26.2582C37.6188 25.3738 38.3203 24.3239 38.7989 23.1684C39.2775 22.0129 39.5238 20.7745 39.5238 19.5238C39.5238 18.2731 39.2775 17.0347 38.7989 15.8792C38.3203 14.7237 37.6188 13.6738 36.7344 12.7895C35.85 11.9051 34.8001 11.2036 33.6446 10.725C32.4892 10.2463 31.2507 10 30 10C28.7493 10 27.5109 10.2463 26.3554 10.725C25.1999 11.2036 24.15 11.9051 23.2657 12.7895C22.3813 13.6738 21.6798 14.7237 21.2012 15.8792C20.7226 17.0347 20.4762 18.2731 20.4762 19.5238C20.4762 20.7745 20.7226 22.0129 21.2012 23.1684C21.6798 24.3239 22.3813 25.3738 23.2657 26.2582C24.15 27.1425 25.1999 27.844 26.3554 28.3227C27.5109 28.8013 28.7493 29.0476 30 29.0476ZM27.6429 33.4921C19.8254 33.4921 13.4921 39.8254 13.4921 47.6429C13.4921 48.9444 14.5477 50 15.8492 50H44.1508C45.4524 50 46.508 48.9444 46.508 47.6429C46.508 39.8254 40.1746 33.4921 32.3572 33.4921H27.6429Z" fill="currentColor"/>
    </svg>
  );
}

function IconNewGameNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 60 60" fill="none">
      <path d="M30 5.81998C37.5987 5.81998 43.7586 11.9794 43.7588 19.5778C43.7588 23.0493 42.4718 26.2196 40.3506 28.6403C37.8287 25.7625 34.1271 23.944 30 23.944C25.8726 23.944 22.1703 25.7622 19.6484 28.6403C17.5275 26.2196 16.2412 23.049 16.2412 19.5778C16.2414 11.9794 22.4013 5.82 30 5.81998ZM30 26.6634C37.5987 26.6634 43.7586 32.8228 43.7588 40.4212C43.7588 48.0198 37.5988 54.18 30 54.18C22.4012 54.18 16.2412 48.0197 16.2412 40.4212C16.2414 32.8228 22.4013 26.6634 30 26.6634ZM30 33.0472C29.3893 33.0474 28.8945 33.5428 28.8945 34.1536V39.3157H23.7324C23.1216 39.3157 22.6261 39.8104 22.626 40.4212C22.626 41.0321 23.1215 41.5276 23.7324 41.5276H28.8945V46.6898C28.8946 47.3005 29.3893 47.796 30 47.7962C30.6108 47.796 31.1064 47.3005 31.1064 46.6898V41.5276H36.2686C36.8793 41.5275 37.375 41.032 37.375 40.4212C37.3748 39.8105 36.8792 39.3159 36.2686 39.3157H31.1064V34.1536C31.1064 33.5428 30.6108 33.0473 30 33.0472Z" fill="currentColor"/>
    </svg>
  );
}

function IconActivityNav() {
  return (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="currentColor">
      <path d="M20.0038 0C18.6547 0 17.5648 1.08994 17.5648 2.43902V2.68293C12.0008 3.81098 7.80871 8.73476 7.80871 14.6341V16.2881C7.80871 19.9543 6.55871 23.5137 4.27213 26.3796L3.52518 27.3095C3.13646 27.7896 2.93066 28.3841 2.93066 29.0015C2.93066 30.4954 4.14255 31.7073 5.63646 31.7073H34.3636C35.8575 31.7073 37.0694 30.4954 37.0694 29.0015C37.0694 28.3841 36.8636 27.7896 36.4749 27.3095L35.7279 26.3796C33.449 23.5137 32.199 19.9543 32.199 16.2881V14.6341C32.199 8.73476 28.0069 3.81098 22.4429 2.68293V2.43902C22.4429 1.08994 21.3529 0 20.0038 0Z"/>
      <path d="M14.386 34.386C14.386 35.8749 14.9775 37.3028 16.0303 38.3557C17.0832 39.4085 18.5111 40 20.0001 40C21.489 40 22.917 39.4085 23.9698 38.3557C25.0226 37.3028 25.6141 35.8749 25.6141 34.386H14.386Z"/>
    </svg>
  );
}

function IconSettingsNavSt() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

const ST_NAV_ITEMS = [
  { label: 'Learn',         Icon: IconLearnNav },
  { label: 'My Profile',    Icon: IconProfileNav },
  { label: 'New Game',      Icon: IconNewGameNav },
  { label: 'Notifications', Icon: IconActivityNav,  hasBadge: true },
  { label: 'Settings',      Icon: IconSettingsNavSt },
];

function MobileNav({ onNavigate, hasUnread, activePage }) {
  return (
    <nav className="mobile-nav">
      {ST_NAV_ITEMS.map(({ label, Icon, hasBadge }) => (
        <button
          key={label}
          className={`mobile-nav__item${activePage === label ? ' mobile-nav__item--active' : ''}${hasBadge ? ' mobile-nav__item--has-badge' : ''}`}
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

/* ─── Settings Page ──────────────────────────────────────────── */

export default function SettingsPage({ onNavigate }) {
  const section = useDMEState('settings.section', 'Connected Accounts');
  const acState = useDMEState('social.activityCenter', 'Activity - Unread');
  const isMvp = useDMEState('profile.mvp', true);

  /* Local profile state */
  const [savedName, setSavedName] = useState(profileData.displayName);
  const [savedBio, setSavedBio] = useState(profileData.bio);
  const [socialLinks, setSocialLinks] = useState(profileData.socialLinks || {});
  const [country, setCountry] = useState(profileData.country || null);

  /* Avatar state */
  const initAvatar = (() => {
    if (profileData.avatarPreset) {
      const preset = PRESET_AVATARS.find(p => p.key === profileData.avatarPreset);
      if (preset) return { type: 'preset', key: preset.key, cropped: preset.src };
    }
    if (profileData.avatar) return { type: 'custom', original: profileData.avatar, cropParams: null, cropped: profileData.avatar };
    return null;
  })();
  const [avatarEdit, setAvatarEdit] = useState(initAvatar);

  /* Cover state */
  const [coverEdit, setCoverEdit] = useState(() => {
    if (profileData.coverPreset) {
      const preset = PRESET_COVERS.find(c => c.key === profileData.coverPreset);
      if (preset) return { type: 'preset', key: preset.key, color: preset.color, cropped: null };
    }
    if (profileData.coverImage) return { type: 'custom', original: profileData.coverImage, cropParams: null, cropped: profileData.coverImage };
    return null;
  });

  /* Modal state */
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);
  const [cropModal, setCropModal] = useState(null);

  function persistProfile(overrides = {}) {
    const currentAvatar = overrides.avatarEdit !== undefined ? overrides.avatarEdit : avatarEdit;
    const currentCover = overrides.coverEdit !== undefined ? overrides.coverEdit : coverEdit;
    const payload = {
      displayName: overrides.displayName !== undefined ? overrides.displayName : savedName,
      bio: overrides.bio !== undefined ? overrides.bio : savedBio,
      avatar: currentAvatar?.type === 'custom' ? currentAvatar.cropped : null,
      avatarPreset: currentAvatar?.type === 'preset' ? currentAvatar.key : null,
      coverImage: currentCover?.type === 'custom' ? currentCover.cropped : null,
      coverPreset: currentCover?.type === 'preset' ? currentCover.key : null,
      socialLinks: overrides.socialLinks !== undefined ? overrides.socialLinks : socialLinks,
      country: overrides.country !== undefined ? overrides.country : country,
    };
    fetch('/__profile_save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  function handleSaveAll({ displayName: name, bio: newBio, socialLinks: links, country: newCountry }) {
    setSavedName(name);
    setSavedBio(newBio);
    setSocialLinks(links);
    setCountry(newCountry);
    persistProfile({ displayName: name, bio: newBio, socialLinks: links, country: newCountry });
  }

  function handlePresetSelect(preset) {
    const newAvatar = { type: 'preset', key: preset.key, cropped: preset.src };
    setAvatarEdit(newAvatar);
    persistProfile({ avatarEdit: newAvatar });
    setShowAvatarModal(false);
  }

  function handleCropSave(croppedDataUrl, cropParams) {
    if (cropModal.target === 'avatar') {
      const newAvatar = { type: 'custom', original: cropModal.src, cropParams, cropped: croppedDataUrl };
      setAvatarEdit(newAvatar);
      persistProfile({ avatarEdit: newAvatar });
    } else {
      const newCover = { type: 'custom', original: cropModal.src, cropParams, cropped: croppedDataUrl };
      setCoverEdit(newCover);
      persistProfile({ coverEdit: newCover });
    }
    setCropModal(null);
  }

  return (
    <div className="st-page">
      <SiteHeader onLogoClick={() => onNavigate?.('index')} onNavigate={onNavigate} />

      <div className="st-body" data-section-id="st-content">
        <div className="st-content">
          <h1 className="st-title">Settings</h1>

          <SettingsContent
            displayName={savedName}
            bio={savedBio}
            socialLinks={socialLinks}
            country={country}
            avatarEdit={avatarEdit}
            coverEdit={coverEdit}
            onSaveAll={handleSaveAll}
            onChangeAvatar={() => setShowAvatarModal(true)}
            onChangeCover={() => setShowCoverModal(true)}
            onCancel={() => onNavigate?.('profile')}
            section={section}
          />
        </div>
      </div>

      <SiteFooter sectionId="gl-footer" />
      <MobileNav onNavigate={onNavigate} hasUnread={acState === 'Activity - Unread'} activePage="Settings" />
      <div className="mobile-nav__spacer" />

      {/* ── Avatar selection modal ── */}
      {showAvatarModal && (
        <AvatarModal
          currentAvatar={avatarEdit}
          onSelectPreset={handlePresetSelect}
          onCustomUpload={(dataUrl) => {
            setShowAvatarModal(false);
            setCropModal({ src: dataUrl, aspectRatio: 1, circular: true, target: 'avatar', initialCropParams: null });
          }}
          onEditCurrent={() => {
            if (avatarEdit?.type === 'custom' && avatarEdit.original) {
              setShowAvatarModal(false);
              setCropModal({ src: avatarEdit.original, aspectRatio: 1, circular: true, target: 'avatar', initialCropParams: avatarEdit.cropParams || null });
            }
          }}
          onClose={() => setShowAvatarModal(false)}
          isMvp={isMvp}
        />
      )}

      {/* ── Cover image selection modal ── */}
      {showCoverModal && (
        <CoverModal
          currentCover={coverEdit}
          onSelectPreset={(preset) => {
            const newCover = { type: 'preset', key: preset.key, color: preset.color, cropped: null };
            setCoverEdit(newCover);
            persistProfile({ coverEdit: newCover });
            setShowCoverModal(false);
          }}
          onCustomUpload={(dataUrl) => {
            setShowCoverModal(false);
            setCropModal({ src: dataUrl, aspectRatio: 16 / 6, circular: false, target: 'cover', initialCropParams: null });
          }}
          onEditCurrent={() => {
            if (coverEdit?.type === 'custom' && coverEdit.original) {
              setShowCoverModal(false);
              setCropModal({ src: coverEdit.original, aspectRatio: 16 / 6, circular: false, target: 'cover', initialCropParams: coverEdit.cropParams || null });
            }
          }}
          onClose={() => setShowCoverModal(false)}
          isMvp={isMvp}
        />
      )}

      {/* ── Image crop modal ── */}
      {cropModal && (
        <ImageCropModal
          src={cropModal.src}
          aspectRatio={cropModal.aspectRatio}
          circular={cropModal.circular}
          initialCropParams={cropModal.initialCropParams}
          onSave={handleCropSave}
          onCancel={() => setCropModal(null)}
        />
      )}
    </div>
  );
}
