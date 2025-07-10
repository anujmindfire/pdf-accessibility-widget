class AccessibilityWidget extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <div id="accessibility-toggle" style="position:fixed;bottom:20px;right:20px;z-index:10000;">
        <button id="accessibilityToggleButton" style="background:#007BFF;color:white;border:none;border-radius:50%;width:50px;height:50px;font-size:24px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.3);">♿</button>
      </div>
      <div id="accessibilityPanel" style="display:none;position:fixed;bottom:80px;right:20px;background:#fff;padding:15px 10px;border-radius:10px;z-index:9999;box-shadow:0 2px 10px rgba(0,0,0,0.3);width:300px;font-family:sans-serif;">
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:space-between;">
          <button id="increaseFont" style="flex:1">A+</button>
          <button id="decreaseFont" style="flex:1">A-</button>
          <button id="toggleTheme" style="flex:1">🌙/☀️</button>
          <button id="reset" style="flex:1">🔄</button>
        </div>
        <label style="margin-top:10px;display:block;font-size:12px;">Font Color</label>
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
        <div style="display:flex;justify-content:space-between;">
          <button id="speak" style="flex:1;margin-right:5px;">🔊 Speak</button>
          <button id="stopSpeak" style="flex:1">⏹️ Stop</button>
        </div>
      </div>
    `;

        let fontSize = 16;
        let isDarkMode = false;
        let hoverUtterance = null;

        const panel = this.querySelector('#accessibilityPanel');
        const toggleBtn = this.querySelector('#accessibilityToggleButton');
        toggleBtn.onclick = () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        };

        const updateFontSize = () => {
            document.body.style.fontSize = `${fontSize}px`;
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
            document.body.style.backgroundColor = isDarkMode ? '#121212' : '#ffffff';
            document.body.style.color = isDarkMode ? '#ffffff' : '#000000';
        };

        this.querySelector('#reset').onclick = () => {
            fontSize = 16;
            isDarkMode = false;
            document.body.style.fontSize = '16px';
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
        };

        this.querySelector('#fontColor').onchange = (e) => {
            const color = e.target.value;
            document.body.style.color = color;
        };

        const voiceSelect = this.querySelector('#voiceSelect');
        let voices = [];

        const languageLabels = {
            "en": "English", "hi": "Hindi", "mr": "Marathi", "ur": "Urdu", "bn": "Bengali", "ta": "Tamil", "te": "Telugu",
            "gu": "Gujarati", "kn": "Kannada", "ml": "Malayalam", "pa": "Punjabi", "or": "Odia", "as": "Assamese",
            "fa": "Persian", "fr": "French", "de": "German", "es": "Spanish", "zh": "Chinese", "ja": "Japanese", "ko": "Korean"
        };

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

        speechSynthesis.onvoiceschanged = () => {
            populateVoices();
        };
        populateVoices();

        this.querySelector('#speak').onclick = () => {
            const selection = window.getSelection().toString();
            const textToRead = selection || document.body.innerText;
            const utterance = new SpeechSynthesisUtterance(textToRead);
            const selectedVoice = voices[voiceSelect.value];
            if (selectedVoice) utterance.voice = selectedVoice;
            speechSynthesis.speak(utterance);
        };

        this.querySelector('#stopSpeak').onclick = () => {
            speechSynthesis.cancel();
        };

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
    }
}

customElements.define('accessibility-widget', AccessibilityWidget);
