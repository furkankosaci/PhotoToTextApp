// DOM Elementleri
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewImage = document.getElementById('previewImage');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultContainer = document.getElementById('resultContainer');
const resultText = document.getElementById('resultText');
const copyButton = document.getElementById('copyButton');
const languageSelect = document.getElementById('languageSelect');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    // Upload area click event
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // File input change event
    fileInput.addEventListener('change', handleFileInputChange);

    // Copy button event
    copyButton.addEventListener('click', copyTextToClipboard);
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave() {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// File Input Handler
function handleFileInputChange(e) {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
}

// Copy to Clipboard
function copyTextToClipboard() {
    resultText.select();
    document.execCommand('copy');
    showSuccess('Metin panoya kopyalandı!');
}

// File Processing
function handleFile(file) {
    // File type validation
    if (!file.type.startsWith('image/')) {
        showError('Lütfen geçerli bir resim dosyası seçin.');
        return;
    }

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('Dosya boyutu çok büyük. Maksimum 10MB olmalıdır.');
        return;
    }

    hideMessages();
    
    // Show preview and process image
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        processImage(e.target.result);
    };
    reader.readAsDataURL(file);
}

// OCR Processing
function processImage(imageSrc) {
    progressContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    
    const selectedLanguage = languageSelect.value;
    
    Tesseract.recognize(imageSrc, selectedLanguage, {
        logger: handleProgressUpdate
    })
    .then(handleOCRSuccess)
    .catch(handleOCRError);
}

// Progress Update Handler
function handleProgressUpdate(m) {
    if (m.status === 'recognizing text') {
        const progress = Math.round(m.progress * 100);
        progressFill.style.width = progress + '%';
        progressText.textContent = `Metin tanınıyor... ${progress}%`;
    }
}

// OCR Success Handler
function handleOCRSuccess({ data: { text } }) {
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    
    if (text.trim()) {
        resultText.value = text.trim();
        showSuccess('Metin başarıyla çıkarıldı!');
    } else {
        showError('Görüntüde metin bulunamadı. Lütfen daha net bir görüntü deneyin.');
    }
}

// OCR Error Handler
function handleOCRError(error) {
    progressContainer.style.display = 'none';
    console.error('OCR Error:', error);
    showError('Metin çıkarma sırasında bir hata oluştu. Lütfen tekrar deneyin.');
}

// Message Display Functions
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
    setTimeout(hideMessages, 5000);
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
    setTimeout(hideMessages, 3000);
}

function hideMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}