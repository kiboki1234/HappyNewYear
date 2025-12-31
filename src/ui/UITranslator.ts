import { i18n } from '../i18n/translations';

export class UITranslator {
  constructor() {
    this.applyTranslations();

    // Setup language selector
    const languageSelect = document.getElementById('languageSelect') as HTMLSelectElement;
    if (languageSelect) {
      languageSelect.value = i18n.getLanguage();
      languageSelect.addEventListener('change', () => {
        i18n.setLanguage(languageSelect.value as 'es' | 'en');
        this.applyTranslations();
      });
    }

    // Listen for language changes
    i18n.onChange(() => this.applyTranslations());
  }

  private applyTranslations(): void {
    // Control panel headings
    this.setText('simulationTitle', i18n.t('simulation'));
    this.setText('visualTitle', i18n.t('visual'));
    this.setText('cameraTitle', i18n.t('camera'));
    this.setText('languageTitle', i18n.t('language'));
    this.setText('countryTitle', i18n.t('country'));
    this.setText('qualityTitle', i18n.t('quality'));
    this.setText('celebrationTitle', i18n.t('celebration'));
    this.setText('handControlTitle', i18n.t('handTracking'));

    // Control panel labels
    this.setText('timeScaleLabel', i18n.t('timeScale') + ':');
    this.setText('atmosphereLabel', ' ' + i18n.t('atmosphere'));
    this.setText('cloudsLabel', ' ' + i18n.t('clouds'));
    this.setText('bloomLabel', ' ' + i18n.t('bloom'));
    this.setText('orbitLabel', ' ' + i18n.t('orbitRing'));
    this.setText('handControlLabel', ' ' + i18n.t('enable') + ' ' + i18n.t('handTracking'));
    this.setText('handControlStatusLabel', i18n.t('status') + ':');

    // Buttons
    const playPauseBtn = document.getElementById('playPause');
    if (playPauseBtn) {
      const isPaused = playPauseBtn.textContent?.includes('▶');
      playPauseBtn.textContent = isPaused ? `▶ ${i18n.t('resume')}` : `⏸ ${i18n.t('pause')}`;
    }
    this.setText('reset', `↻ ${i18n.t('reset')}`);
    this.setText('cameraGeneral', i18n.t('general'));
    this.setText('cameraFollow', i18n.t('followEarth'));
    this.setText('cameraClose', i18n.t('closeUp'));

    // Status
    const statusEl = document.getElementById('handControlStatus');
    if (statusEl) {
      const isActive = statusEl.classList.contains('active');
      statusEl.textContent = isActive ? i18n.t('active') : i18n.t('inactive');
    }

    // Privacy modal
    this.setHTML('privacyModal', `
      <div class="modal-content">
        <h2>${i18n.t('privacyTitle')}</h2>
        <p>${i18n.t('privacyMessage')}</p>
        <div class="privacy-info">
          <strong>${i18n.t('privacyTitle')}:</strong>
          <ul>
            <li>${i18n.t('privacyPoints.p1')}</li>
            <li>${i18n.t('privacyPoints.p2')}</li>
            <li>${i18n.t('privacyPoints.p3')}</li>
          </ul>
        </div>
        <div class="modal-actions">
          <button id="acceptCamera" class="btn btn-primary">${i18n.t('accept')}</button>
          <button id="declineCamera" class="btn btn-secondary">${i18n.t('decline')}</button>
        </div>
      </div>
    `);
  }

  private setText(id: string, text: string): void {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  private setHTML(id: string, html: string): void {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }
}
