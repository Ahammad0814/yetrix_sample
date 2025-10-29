const imageInput = document.getElementById('imageInput');
const extractBtn = document.getElementById('extractBtn');
const output = document.getElementById('output');
const jsonArea = document.getElementById('jsonArea');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');

let currentJSON = {};

imageInput.addEventListener('change', () => {
    extractBtn.disabled = !imageInput.files.length;
    output.textContent = '';
    jsonArea.value = '';
    generateBtn.disabled = true;
    downloadBtn.disabled = true;
});

extractBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;
    output.textContent = 'Processing...';
    jsonArea.value = '';
    generateBtn.disabled = true;
    downloadBtn.disabled = true;

    const imageURL = URL.createObjectURL(file);
    const result = await Tesseract.recognize(imageURL, 'eng', {
        logger: m => output.textContent = `Progress: ${Math.floor(m.progress * 100)}%`
    });

    output.textContent = result.data.text || 'No text found';

    // Try to auto-split lines into key: value pairs and fill textarea for manual review
    const lines = result.data.text.split('\n').filter(l => l.trim());
    let parsedPairs = '';
    lines.forEach(line => {
        let parts = line.split(/:|-/);
        if (parts.length >= 2) {
            parsedPairs += parts[0].trim() + ': ' + parts.slice(1).join(':').trim() + '\n';
        }
    });
    if (parsedPairs.trim()) {
        jsonArea.value = parsedPairs.trim();
    } else {
        jsonArea.value = result.data.text;
    }
    generateBtn.disabled = false;
});

generateBtn.addEventListener('click', () => {
    // Convert edited key-value text area into json object
    const lines = jsonArea.value.split('\n').filter(l => l.trim());
    let obj = {};
    lines.forEach(line => {
        let parts = line.split(/:|-/);
        if (parts.length >= 2) {
            obj[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
    });
    currentJSON = obj;
    alert('JSON generated! Review output before download.');
    downloadBtn.disabled = Object.keys(obj).length === 0;
});

downloadBtn.addEventListener('click', () => {
    let blob = new Blob([JSON.stringify(currentJSON, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = "extracted_receipt.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
