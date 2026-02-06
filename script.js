// Obtener elementos canvas
const timeCanvas = document.getElementById('timeCanvas');
const magnitudeCanvas = document.getElementById('magnitudeCanvas');
const phaseCanvas = document.getElementById('phaseCanvas');

// Contextos de dibujo
const timeCtx = timeCanvas.getContext('2d');
const magnitudeCtx = magnitudeCanvas.getContext('2d');
const phaseCtx = phaseCanvas.getContext('2d');

// Datos de los armónicos
const harmonics = [
    { freq: 1, amp: 100, phase: 0, color: '#9BFF00' },
    { freq: 2, amp: 0, phase: 0, color: '#FFFF00' },
    { freq: 3, amp: 0, phase: 0, color: '#FF9900' },
    { freq: 4, amp: 0, phase: 0, color: '#FF6600' },
    { freq: 5, amp: 0, phase: 0, color: '#FF0000' }
];

// Frecuencia fundamental (Hz)
const fundamentalFreq = 1;

// Parámetros de visualización
const timeDomainPoints = 1000;
const timeRange = 2; // segundos

// Ajustar tamaño de canvas según el contenedor
function resizeCanvases() {
    const timeContainer = timeCanvas.parentElement;
    const magnitudeContainer = magnitudeCanvas.parentElement;
    const phaseContainer = phaseCanvas.parentElement;
    
    timeCanvas.width = timeContainer.clientWidth;
    timeCanvas.height = timeContainer.clientHeight;
    
    magnitudeCanvas.width = magnitudeContainer.clientWidth;
    magnitudeCanvas.height = magnitudeContainer.clientHeight;
    
    phaseCanvas.width = phaseContainer.clientWidth;
    phaseCanvas.height = phaseContainer.clientHeight;
    
    // Redibujar con el nuevo tamaño
    updateAllVisualizations();
}

// Obtener referencias a los controles deslizantes
const harmonicSliders = [
    { amp: document.getElementById('harmonic1Amp'), phase: document.getElementById('harmonic1Phase') },
    { amp: document.getElementById('harmonic2Amp'), phase: document.getElementById('harmonic2Phase') },
    { amp: document.getElementById('harmonic3Amp'), phase: document.getElementById('harmonic3Phase') },
    { amp: document.getElementById('harmonic4Amp'), phase: document.getElementById('harmonic4Phase') },
    { amp: document.getElementById('harmonic5Amp'), phase: document.getElementById('harmonic5Phase') }
];

// Obtener referencias a los displays de valores
const valueDisplays = [
    { amp: document.getElementById('harmonic1AmpValue'), phase: document.getElementById('harmonic1PhaseValue') },
    { amp: document.getElementById('harmonic2AmpValue'), phase: document.getElementById('harmonic2PhaseValue') },
    { amp: document.getElementById('harmonic3AmpValue'), phase: document.getElementById('harmonic3PhaseValue') },
    { amp: document.getElementById('harmonic4AmpValue'), phase: document.getElementById('harmonic4PhaseValue') },
    { amp: document.getElementById('harmonic5AmpValue'), phase: document.getElementById('harmonic5PhaseValue') }
];

// Inicializar valores de los controles
function initializeControls() {
    for (let i = 0; i < harmonicSliders.length; i++) {
        const slider = harmonicSliders[i];
        const display = valueDisplays[i];
        
        // Establecer valores iniciales
        slider.amp.value = harmonics[i].amp;
        slider.phase.value = harmonics[i].phase;
        
        // Actualizar displays
        display.amp.textContent = harmonics[i].amp;
        display.phase.textContent = harmonics[i].phase + "°";
        
        // Agregar listeners
        slider.amp.addEventListener('input', function() {
            harmonics[i].amp = parseInt(this.value);
            display.amp.textContent = this.value;
            updateAllVisualizations();
        });
        
        slider.phase.addEventListener('input', function() {
            harmonics[i].phase = parseInt(this.value);
            display.phase.textContent = this.value + "°";
            updateAllVisualizations();
        });
    }
}

// Calcular la señal en el dominio del tiempo
function calculateTimeSignal() {
    const signal = [];
    const timeStep = timeRange / timeDomainPoints;
    
    for (let tIndex = 0; tIndex < timeDomainPoints; tIndex++) {
        const t = tIndex * timeStep;
        let y = 0;
        
        // Sumar contribución de cada armónico
        for (const harmonic of harmonics) {
            if (harmonic.amp > 0) {
                const freq = fundamentalFreq * harmonic.freq;
                // Convertir fase de grados a radianes
                const phaseRad = harmonic.phase * Math.PI / 180;
                y += harmonic.amp * Math.sin(2 * Math.PI * freq * t + phaseRad);
            }
        }
        
        signal.push({ t, y });
    }
    
    return signal;
}

// Dibujar la señal en el dominio del tiempo
function drawTimeSignal(signal) {
    const ctx = timeCtx;
    const width = timeCanvas.width;
    const height = timeCanvas.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar rejilla
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Líneas verticales
    for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Dibujar ejes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Etiquetas de los ejes
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Etiquetas del eje X
    for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * graphWidth;
        const t = (i / 10) * timeRange;
        ctx.fillText(t.toFixed(1) + 's', x, height - padding + 20);
    }
    
    // Etiquetas del eje Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Calcular valor máximo de la señal para escalado
    let maxY = 0;
    for (const point of signal) {
        maxY = Math.max(maxY, Math.abs(point.y));
    }
    
    if (maxY === 0) maxY = 100; // Evitar división por cero
    
    for (let i = -5; i <= 5; i++) {
        const y = padding + graphHeight/2 - (i / 5) * (graphHeight / 2);
        const value = (i / 5) * maxY;
        ctx.fillText(value.toFixed(0), padding - 10, y);
    }
    
    // Título de ejes
    ctx.textAlign = 'center';
    ctx.fillText('Tiempo (s)', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitud', 0, 0);
    ctx.restore();
    
    // Dibujar señal
    ctx.strokeStyle = '#9BFF00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < signal.length; i++) {
        const point = signal[i];
        const x = padding + (point.t / timeRange) * graphWidth;
        const y = padding + graphHeight/2 - (point.y / maxY) * (graphHeight / 2);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

// Dibujar espectro de magnitud
function drawMagnitudeSpectrum() {
    const ctx = magnitudeCtx;
    const width = magnitudeCanvas.width;
    const height = magnitudeCanvas.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar rejilla
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Líneas verticales (una por cada armónico)
    for (let i = 1; i <= 5; i++) {
        const x = padding + (i / 6) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let i = 0; i <= 5; i++) {
        const y = padding + (i / 5) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Dibujar ejes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Etiquetas de los ejes
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Etiquetas del eje X (frecuencias)
    for (let i = 1; i <= 5; i++) {
        const x = padding + (i / 6) * graphWidth;
        const freq = i * fundamentalFreq;
        ctx.fillText(freq + 'f₀', x, height - padding + 20);
    }
    
    // Etiquetas del eje Y
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
        const y = padding + (1 - i/5) * graphHeight;
        const value = i * 20;
        ctx.fillText(value, padding - 10, y);
    }
    
    // Título de ejes
    ctx.textAlign = 'center';
    ctx.fillText('Frecuencia', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Amplitud', 0, 0);
    ctx.restore();
    
    // Dibujar barras de magnitud
    const barWidth = graphWidth / 7;
    
    for (let i = 0; i < harmonics.length; i++) {
        const harmonic = harmonics[i];
        if (harmonic.amp > 0) {
            const x = padding + ((i+1) / 6) * graphWidth - barWidth/2;
            const barHeight = (harmonic.amp / 100) * graphHeight;
            
            // Dibujar barra
            ctx.fillStyle = '#FFFF00';
            ctx.fillRect(x, height - padding - barHeight, barWidth, barHeight);
            
            // Etiqueta de valor
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.fillText(harmonic.amp, x + barWidth/2, height - padding - barHeight - 10);
        }
    }
}

// Dibujar espectro de fase
function drawPhaseSpectrum() {
    const ctx = phaseCtx;
    const width = phaseCanvas.width;
    const height = phaseCanvas.height;
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dibujar rejilla
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    
    // Líneas verticales (una por cada armónico)
    for (let i = 1; i <= 5; i++) {
        const x = padding + (i / 6) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
    }
    
    // Líneas horizontales
    for (let i = -2; i <= 2; i++) {
        const y = padding + graphHeight/2 - (i / 2) * (graphHeight / 2);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Dibujar ejes
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // Línea horizontal en 0
    ctx.strokeStyle = '#555555';
    ctx.beginPath();
    ctx.moveTo(padding, padding + graphHeight/2);
    ctx.lineTo(width - padding, padding + graphHeight/2);
    ctx.stroke();
    
    // Etiquetas de los ejes
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    // Etiquetas del eje X (frecuencias)
    for (let i = 1; i <= 5; i++) {
        const x = padding + (i / 6) * graphWidth;
        const freq = i * fundamentalFreq;
        ctx.fillText(freq + 'f₀', x, height - padding + 20);
    }
    
    // Etiquetas del eje Y (fase)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = -2; i <= 2; i++) {
        const y = padding + graphHeight/2 - (i / 2) * (graphHeight / 2);
        const phase = i * 180;
        ctx.fillText(phase + '°', padding - 10, y);
    }
    
    // Título de ejes
    ctx.textAlign = 'center';
    ctx.fillText('Frecuencia', width / 2, height - 5);
    
    ctx.save();
    ctx.translate(10, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Fase (°)', 0, 0);
    ctx.restore();
    
    // Dibujar puntos de fase
    const pointRadius = 6;
    
    for (let i = 0; i < harmonics.length; i++) {
        const harmonic = harmonics[i];
        if (harmonic.amp > 0) {
            const x = padding + ((i+1) / 6) * graphWidth;
            // Mapear fase de -180 a 180 a la coordenada Y
            const phaseNormalized = (harmonic.phase > 180 ? harmonic.phase - 360 : harmonic.phase) / 180;
            const y = padding + graphHeight/2 - phaseNormalized * (graphHeight / 2);
            
            // Dibujar punto
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Etiqueta de valor
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            const labelY = phaseNormalized > 0 ? y - 15 : y + 15;
            ctx.fillText(harmonic.phase + '°', x, labelY);
        }
    }
}

// Actualizar todas las visualizaciones
function updateAllVisualizations() {
    const signal = calculateTimeSignal();
    drawTimeSignal(signal);
    drawMagnitudeSpectrum();
    drawPhaseSpectrum();
}

// Configuraciones preestablecidas
const presets = {
    sineWave: () => {
        // Solo la frecuencia fundamental
        setHarmonics([100, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
    },
    squareWave: () => {
        // Serie de Fourier para onda cuadrada
        setHarmonics([100, 0, 33.3, 0, 20], [0, 0, 0, 0, 0]);
    },
    triangleWave: () => {
        // Serie de Fourier para onda triangular
        setHarmonics([100, 0, 11.1, 0, 4], [0, 0, 0, 0, 0]);
    },
    sawtoothWave: () => {
        // Serie de Fourier para onda diente de sierra
        setHarmonics([100, 50, 33.3, 25, 20], [0, 180, 0, 180, 0]);
    }
};

// Función para establecer los valores de los armónicos
function setHarmonics(amps, phases) {
    for (let i = 0; i < harmonics.length; i++) {
        harmonics[i].amp = amps[i];
        harmonics[i].phase = phases[i];
        
        // Actualizar controles
        harmonicSliders[i].amp.value = amps[i];
        harmonicSliders[i].phase.value = phases[i];
        valueDisplays[i].amp.textContent = amps[i];
        valueDisplays[i].phase.textContent = phases[i] + "°";
    }
    updateAllVisualizations();
}

// Función para reiniciar todos los controles
function resetControls() {
    setHarmonics([100, 0, 0, 0, 0], [0, 0, 0, 0, 0]);
}

// Inicializar botones de presets
function initializePresetButtons() {
    document.getElementById('sineWave').addEventListener('click', presets.sineWave);
    document.getElementById('squareWave').addEventListener('click', presets.squareWave);
    document.getElementById('triangleWave').addEventListener('click', presets.triangleWave);
    document.getElementById('sawtoothWave').addEventListener('click', presets.sawtoothWave);
    document.getElementById('resetBtn').addEventListener('click', resetControls);
}

// Inicializar la aplicación
function initializeApp() {
    initializeControls();
    initializePresetButtons();
    resizeCanvases();
    updateAllVisualizations();
    
    // Redimensionar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', resizeCanvases);
}

// Iniciar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', initializeApp);