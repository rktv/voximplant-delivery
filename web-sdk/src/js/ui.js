class UI {
    constructor() {
        this.loader = document.querySelector('.progress');
    }

    showLoader() {
        this.loader.classList.add('progress_active')
    }

    hideLoader() {
        this.loader.classList.remove('progress_active')
    }
}

export const ui = new UI();