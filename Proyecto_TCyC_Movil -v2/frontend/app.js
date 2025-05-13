// Variables globales
const API_KEY = '7ff325a88de5d44f49ce85f4e1aa92cf'; 
const CIUDAD = "Ciudad de México";
let recognition;
let synth = window.speechSynthesis;
let voices = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    setupVoices();
    setupSpeechRecognition();
    
    // Cargar voces si no se cargaron automáticamente
    setTimeout(() => {
        if (voices.length === 0) {
            voices = synth.getVoices();
            populateVoiceList();
        }
    }, 1000);
});

// Configurar las voces disponibles
function setupVoices() {
    synth.onvoiceschanged = function() {
        voices = synth.getVoices();
        populateVoiceList();
    };
}

// Llenar la lista de voces
function populateVoiceList() {
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = '';
    
    // Filtrar voces en español o mostrar todas si no hay
    const spanishVoices = voices.filter(voice => 
        voice.lang.includes('es') || voice.lang.includes('ES'));
    
    const availableVoices = spanishVoices.length > 0 ? spanishVoices : voices;
    
    availableVoices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

// Configurar el reconocimiento de voz
function setupSpeechRecognition() {
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'es-ES';
        
        recognition.onstart = function() {
            showStatus("Escuchando... Di algo por favor.");
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            showResult(`<i class="fas fa-microphone"></i> Has dicho: ${transcript}`);
            decideAction(transcript.toLowerCase());
        };
        
        recognition.onerror = function(event) {
            let errorMsg = "Error en el reconocimiento de voz: ";
            switch(event.error) {
                case 'no-speech':
                    errorMsg += "No se detectó voz.";
                    break;
                case 'audio-capture':
                    errorMsg += "No se pudo capturar audio.";
                    break;
                case 'not-allowed':
                    errorMsg += "El acceso al micrófono no está permitido.";
                    break;
                default:
                    errorMsg += event.error;
            }
            showStatus(errorMsg);
        };
        
        recognition.onend = function() {
            showStatus("Listo para escuchar de nuevo.");
        };
    } catch(e) {
        showStatus("El reconocimiento de voz no es compatible con este navegador.");
        console.error(e);
    }
}

// Mostrar resultados en el área de texto
function showResult(text) {
    const resultText = document.getElementById('resultText');
    resultText.innerHTML = text;
    resultText.scrollTop = resultText.scrollHeight;
}

// Mostrar estado
function showStatus(text) {
    document.getElementById('status').textContent = text;
}

// Hablar texto
function speak(text) {
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar la voz seleccionada
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoiceIndex = voiceSelect.value;
    
    if (selectedVoiceIndex !== 'default' && voices[selectedVoiceIndex]) {
        utterance.voice = voices[selectedVoiceIndex];
    }
    
    // Configuración adicional de voz
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = function() {
        showResult(`<i class="fas fa-volume-up"></i> ${text}`);
    };
    
    utterance.onerror = function(event) {
        showResult(`<i class="fas fa-exclamation-triangle"></i> Error de voz: ${event.error}`);
    };
    
    synth.speak(utterance);
}

// Escuchar comando de voz
function listenCommand() {
    if (!recognition) {
        showStatus("El reconocimiento de voz no está disponible.");
        return;
    }
    
    try {
        recognition.start();
    } catch(e) {
        showStatus("Error al iniciar el reconocimiento de voz: " + e.message);
    }
}

// Decidir acción basada en el comando de voz
function decideAction(text) {
    if (text.includes("hora")) {
        tellTime();
    } else if (text.includes("fecha") || text.includes("día es hoy")) {
        tellDate();
    } else if (text.includes("clima") || text.includes("tiempo")) {
        tellWeather();
    } else {
        speak(`No entendí el comando: ${text}`);
    }
}

// Decir la hora actual
function tellTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeString = `Son las ${hours}:${minutes}`;
    
    // Mostrar en formato AM/PM también
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const timeString12 = `${hours12}:${minutes} ${ampm}`;
    
    showResult(`
        <div class="time-info">
            <h3><i class="fas fa-clock"></i> Hora Actual</h3>
            <p><strong>Formato 24h:</strong> ${hours}:${minutes}</p>
            <p><strong>Formato 12h:</strong> ${timeString12}</p>
            <p class="update-time">Actualizado: ${now.toLocaleTimeString()}</p>
        </div>
    `);
    
    //speak(timeString);
}

// Decir la fecha actual
function tellDate() {
    const now = new Date();
    const months = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio", 
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];
    const days = [
        "domingo", "lunes", "martes", "miércoles", 
        "jueves", "viernes", "sábado"
    ];
    
    const dateText = `Hoy es ${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} del ${now.getFullYear()}`;
    
    showResult(`
        <div class="date-info">
            <h3><i class="fas fa-calendar-alt"></i> Fecha Actual</h3>
            <p><strong>Fecha completa:</strong> ${now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Formato corto:</strong> ${now.toLocaleDateString('es-MX')}</p>
            <p class="update-time">Actualizado: ${now.toLocaleTimeString()}</p>
        </div>
    `);
    
    speak(dateText);
}

// Obtener y decir el clima
function tellWeather() {
    showStatus("Obteniendo datos del clima...");
    showResult(`
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i> Consultando el clima actual...
        </div>
    `);

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${CIUDAD}&appid=${API_KEY}&units=metric&lang=es`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status === 401 ? "API key no válida" : 
                              response.status === 404 ? "Ciudad no encontrada" :
                              `Error ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.main || !data.weather || !data.weather[0]) {
                throw new Error("Datos del clima incompletos");
            }

            const temp = Math.round(data.main.temp);
            const desc = data.weather[0].description.charAt(0).toUpperCase() + 
                         data.weather[0].description.slice(1);
            const humedad = data.main.humidity;
            const feelsLike = Math.round(data.main.feels_like);
            const windSpeed = data.wind.speed ? `${(data.wind.speed * 3.6).toFixed(1)} km/h` : 'No disponible';
            const iconCode = data.weather[0].icon;
            const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            
            const mensaje = `El clima en ${CIUDAD}: ${desc}. 
                           Temperatura: ${temp} grados Celsius. 
                           Sensación térmica: ${feelsLike} grados. 
                           Humedad: ${humedad} por ciento. 
                           Viento: ${windSpeed}.`;
            
            const weatherHTML = `
                <div class="weather-info">
                    <h3><i class="fas fa-cloud-sun"></i> Clima en ${CIUDAD}</h3>
                    <div class="weather-main">
                        <img src="${iconUrl}" alt="${desc}" class="weather-icon">
                        <div class="weather-temp">${temp}°C</div>
                    </div>
                    <p><strong>Condición:</strong> ${desc}</p>
                    <p><strong>Sensación térmica:</strong> ${feelsLike}°C</p>
                    <p><strong>Humedad:</strong> ${humedad}%</p>
                    <p><strong>Viento:</strong> ${windSpeed}</p>
                    <p><strong>Presión:</strong> ${data.main.pressure} hPa</p>
                    <p class="weather-update">Actualizado: ${new Date().toLocaleTimeString()}</p>
                </div>
            `;
            
            showResult(weatherHTML);
            speak(mensaje);
            showStatus("");
        })
        .catch(error => {
            const errorMsg = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i> 
                    <strong>Error obteniendo el clima:</strong> ${error.message}
                    <p>Intenta nuevamente más tarde.</p>
                </div>
            `;
            
            showResult(errorMsg);
            speak("No se pudo obtener la información del clima. Por favor, intenta más tarde.");
            showStatus("");
        });
}

// Probar la voz seleccionada
function testVoice() {
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoice = voiceSelect.options[voiceSelect.selectedIndex].text.split(' (')[0];
    speak(`Esta es una prueba de voz con la configuración: ${selectedVoice}`);
}

// Función para agregar iconos de Font Awesome
function loadFontAwesome() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);
}

// Cargar Font Awesome al iniciar
loadFontAwesome();