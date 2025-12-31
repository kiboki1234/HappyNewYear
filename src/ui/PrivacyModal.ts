export class PrivacyModal {
    private modal: HTMLElement;
    private acceptBtn: HTMLButtonElement;
    private declineBtn: HTMLButtonElement;
    private onAccept?: () => void;
    private onDecline?: () => void;

    constructor() {
        this.modal = document.getElementById('privacyModal')!;
        this.acceptBtn = document.getElementById('acceptCamera') as HTMLButtonElement;
        this.declineBtn = document.getElementById('declineCamera') as HTMLButtonElement;

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.acceptBtn.addEventListener('click', () => {
            this.hide();
            if (this.onAccept) this.onAccept();
        });

        this.declineBtn.addEventListener('click', () => {
            this.hide();
            if (this.onDecline) this.onDecline();
        });
    }

    show(onAccept: () => void, onDecline: () => void): void {
        this.onAccept = onAccept;
        this.onDecline = onDecline;
        this.modal.classList.add('active');
    }

    hide(): void {
        this.modal.classList.remove('active');
    }
}
