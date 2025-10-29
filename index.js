const imageInput = document.getElementById('imageInput');
const extractBtn = document.getElementById('extractBtn');
const output = document.getElementById('output');
const jsonResult = document.getElementById('jsonResult');
const downloadBtn = document.getElementById('downloadBtn');

let extractedJSON = {};

imageInput.addEventListener('change', () => {
    extractBtn.disabled = !imageInput.files.length;
});

extractBtn.addEventListener('click', async () => {
    const file = imageInput.files[0];
    if (!file) return;

    output.innerText = "Processing image, please wait...";
    jsonResult.innerText = "";
    downloadBtn.style.display = "none";

    const imageURL = URL.createObjectURL(file);
    // OCR with Tesseract
    const result = await Tesseract.recognize(imageURL, 'eng', {
        logger: m => output.innerText = `Progress: ${Math.floor(m.progress*100)}%`
    });

    output.innerText = result.data.text || "No text found.";
    
    // Simple Form Field Extraction Logic (customize for your forms structure)
    let lines = result.data.text.split('\n').filter(l => l.trim());
    let formData = {};
    lines.forEach(line => {
        // Sample basic parsing: fieldName: fieldValue
        let parts = line.split(/:|-/);
        if (parts.length >= 2) {
            let key = parts[0].trim();
            let value = parts.slice(1).join(':').trim();
            formData[key] = value;
        }
    });

    // If structure is different, adapt parsing as needed
    extractedJSON = formData;
    jsonResult.innerText = JSON.stringify(formData, null, 2);

    if (Object.keys(formData).length > 0) {
        downloadBtn.style.display = "inline-block";
    }
});

downloadBtn.addEventListener('click', () => {
    let blob = new Blob([JSON.stringify(extractedJSON, null, 2)], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = "extracted_receipt.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});