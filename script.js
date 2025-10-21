const form = document.getElementById('imageForm');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const countInput = document.getElementById('count');
const imagesContainer = document.getElementById('imagesContainer');
const loading = document.getElementById('loading');
const downloadAllContainer = document.getElementById('downloadAllContainer');
const downloadAllBtn = document.getElementById('downloadAllBtn');

let generatedImages = [];

function validateInput(input, errorElement, max) {
    const value = parseInt(input.value);
    if (value > max || value < 1) {
        errorElement.style.display = 'block';
        return false;
    }
    errorElement.style.display = 'none';
    return true;
}

widthInput.addEventListener('input', () => {
    validateInput(widthInput, document.getElementById('widthError'), 5000);
});

heightInput.addEventListener('input', () => {
    validateInput(heightInput, document.getElementById('heightError'), 5000);
});

countInput.addEventListener('input', () => {
    validateInput(countInput, document.getElementById('countError'), 20);
});

async function downloadImage(url, index) {
    const response = await fetch(url);
    const blob = await response.blob();
    return { blob, index };
}

function downloadSingleImage(blob, filename) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

async function downloadAllAsZip() {
    downloadAllBtn.disabled = true;
    downloadAllBtn.textContent = '⏳ Préparation du ZIP...';

    try {
        const zip = new JSZip();

        for (let i = 0; i < generatedImages.length; i++) {
            const { blob, index } = await downloadImage(generatedImages[i].url, i);
            const filename = generatedImages[i].filename;
            zip.file(filename, blob);
            downloadAllBtn.textContent = `⏳ ${i + 1}/${generatedImages.length} images...`;
        }

        downloadAllBtn.textContent = '⏳ Création du ZIP...';
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        const url = window.URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `images-aleatoires-${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        downloadAllBtn.disabled = false;
        downloadAllBtn.textContent = '✅ Téléchargé ! Cliquer pour re-télécharger';

        setTimeout(() => {
            downloadAllBtn.textContent = '📦 Télécharger toutes les images (ZIP)';
        }, 1000);
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        downloadAllBtn.disabled = false;
        downloadAllBtn.textContent = '❌ Erreur - Réessayer';
    }
}

downloadAllBtn.addEventListener('click', downloadAllAsZip);

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);
    const count = parseInt(countInput.value);

    const isWidthValid = validateInput(widthInput, document.getElementById('widthError'), 5000);
    const isHeightValid = validateInput(heightInput, document.getElementById('heightError'), 5000);
    const isCountValid = validateInput(countInput, document.getElementById('countError'), 20);

    if (!isWidthValid || !isHeightValid || !isCountValid) {
        return;
    }

    imagesContainer.innerHTML = '';
    generatedImages = [];
    downloadAllContainer.style.display = 'none';
    loading.style.display = 'block';

    setTimeout(() => {
        loading.style.display = 'none';

        for (let i = 0; i < count; i++) {
            const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}-${i}`;
            const filename = `image-${width}x${height}-${i + 1}.jpg`;

            generatedImages.push({ url: imageUrl, filename: filename });

            const card = document.createElement('div');
            card.className = 'image-card';

            card.innerHTML = `
                        <img src="${imageUrl}" alt="Image aléatoire ${width}x${height}">
                        <div class="image-info">
                            <div class="image-dimensions">${width} × ${height} px</div>
                            <button class="btn-download" onclick="downloadImageByIndex(${i})">⬇️ Télécharger</button>
                        </div>
                    `;

            imagesContainer.appendChild(card);
        }

        downloadAllContainer.style.display = 'block';
    }, 300);
});

async function downloadImageByIndex(index) {
    const image = generatedImages[index];
    const { blob } = await downloadImage(image.url, index);
    downloadSingleImage(blob, image.filename);
}

window.downloadImageByIndex = downloadImageByIndex;