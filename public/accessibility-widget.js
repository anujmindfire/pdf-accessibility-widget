class AccessibilityWidget extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <div style="display:flex;height:100vh;font-family:sans-serif;">
        <!-- Left PDF viewer -->
        <div id="pdf-viewer" style="flex:1;overflow:auto;padding:20px;border-right:2px solid #ddd;background:#f9f9f9;"></div>
        
        <!-- Right: Controls and Text Editor -->
        <div style="flex:1;display:flex;flex-direction:column;padding:15px;">
          <!-- Accessibility Controls -->
          <div id="accessibilityPanel" style="background:#fff;padding:10px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);margin-bottom:10px;">
            <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:space-between;">
              <button id="increaseFont" style="flex:1">A+</button>
              <button id="decreaseFont" style="flex:1">A-</button>
              <button id="toggleTheme" style="flex:1">🌙/☀️</button>
              <button id="reset" style="flex:1">🔄</button>
            </div>
            <label style="font-size:12px;margin-top:10px;display:block;">Font Color</label>
            <select id="fontColor" style="width:100%;margin-bottom:8px;">
              <option value="black">Black</option>
              <option value="red">Red</option>
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="orange">Orange</option>
              <option value="purple">Purple</option>
            </select>
            <label style="font-size:12px;">Voice</label>
            <select id="voiceSelect" style="width:100%;margin-bottom:8px;"></select>
            <div style="display:flex;gap:5px;">
              <button id="speak" style="flex:1">🔊 Speak</button>
              <button id="stopSpeak" style="flex:1">⏹️ Stop</button>
            </div>
          </div>

          <!-- Editable Text Area -->
          <textarea id="pdf-text-editor" style="flex:1;width:100%;resize:none;font-size:16px;line-height:1.6;border:1px solid #ccc;border-radius:6px;padding:10px;"></textarea>
        </div>
      </div>
    `;

        // Variables
        let fontSize = 16;
        let isDarkMode = false;
        let currentColor = 'black';
        let hoverUtterance = null;
        let voices = [];

        const editor = this.querySelector('#pdf-text-editor');
        const viewer = this.querySelector('#pdf-viewer');
        const voiceSelect = this.querySelector('#voiceSelect');

        const languageLabels = {
            "en": "English", "hi": "Hindi", "mr": "Marathi", "ur": "Urdu", "bn": "Bengali",
            "ta": "Tamil", "te": "Telugu", "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam",
            "pa": "Punjabi", "or": "Odia", "as": "Assamese", "fa": "Persian", "fr": "French",
            "de": "German", "es": "Spanish", "zh": "Chinese", "ja": "Japanese", "ko": "Korean"
        };

        // Voice setup
        function populateVoices() {
            voices = speechSynthesis.getVoices();
            voiceSelect.innerHTML = '';
            voices.forEach((voice, index) => {
                const baseLang = voice.lang.split('-')[0];
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${voice.name} — ${languageLabels[baseLang] || voice.lang}`;
                voiceSelect.appendChild(option);
            });
        }

        speechSynthesis.onvoiceschanged = () => populateVoices();
        populateVoices();

        // Accessibility Controls
        const updateFontSize = () => {
            editor.style.fontSize = `${fontSize}px`;
        };

        const updateColor = (color) => {
            currentColor = color;
            editor.style.color = currentColor;
        };

        const updateTheme = () => {
            const bgColor = isDarkMode ? '#121212' : '#ffffff';
            const textColor = isDarkMode ? '#ffffff' : currentColor;
            editor.style.backgroundColor = bgColor;
            editor.style.color = textColor;
            document.body.style.backgroundColor = bgColor;
        };

        this.querySelector('#increaseFont').onclick = () => {
            fontSize += 2;
            updateFontSize();
        };

        this.querySelector('#decreaseFont').onclick = () => {
            fontSize = Math.max(10, fontSize - 2);
            updateFontSize();
        };

        this.querySelector('#toggleTheme').onclick = () => {
            isDarkMode = !isDarkMode;
            updateTheme();
        };

        this.querySelector('#reset').onclick = () => {
            fontSize = 16;
            isDarkMode = false;
            currentColor = 'black';
            updateFontSize();
            updateTheme();
        };

        this.querySelector('#fontColor').onchange = (e) => {
            updateColor(e.target.value);
        };

        // TTS
        this.querySelector('#speak').onclick = () => {
            const selection = window.getSelection().toString();
            const textToRead = selection || editor.value;
            const utterance = new SpeechSynthesisUtterance(textToRead);
            const selectedVoice = voices[voiceSelect.value];
            if (selectedVoice) utterance.voice = selectedVoice;
            speechSynthesis.speak(utterance);
        };

        this.querySelector('#stopSpeak').onclick = () => {
            speechSynthesis.cancel();
        };

        // Hover TTS (optional)
        document.body.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (target && target.innerText && target.innerText.trim().length > 0 && !target.closest('accessibility-widget')) {
                if (hoverUtterance) {
                    speechSynthesis.cancel();
                    hoverUtterance = null;
                }
                const utterance = new SpeechSynthesisUtterance(target.innerText.trim());
                const selectedVoice = voices[voiceSelect.value];
                if (selectedVoice) utterance.voice = selectedVoice;
                hoverUtterance = utterance;
                speechSynthesis.speak(utterance);
            }
        });

        document.body.addEventListener('mouseout', () => {
            if (hoverUtterance) {
                speechSynthesis.cancel();
                hoverUtterance = null;
            }
        });

        // PDF Rendering + Extraction
        const renderPDFWithExtraction = async (url) => {
            try {
                const pdf = await window.pdfjsLib.getDocument(url).promise;
                let allText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const viewport = page.getViewport({ scale: 1.2 });

                    const canvas = document.createElement('canvas');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    const ctx = canvas.getContext('2d');
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    viewer.appendChild(canvas);

                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    allText += pageText + "\n\n";
                }
                editor.value = allText.trim();
            } catch (err) {
                console.error('PDF rendering/extraction failed:', err);
            }
        };

        // Load PDF (change path as needed)
        renderPDFWithExtraction('/sample.pdf');
    }
}

customElements.define('accessibility-widget', AccessibilityWidget);
