const agua = document.getElementById('agua');
const objeto = document.getElementById('objeto');
const nivelLiquido = document.getElementById('nivelLiquido');
const valorNivel = document.getElementById('valorNivel');
const btnHuevo = document.getElementById('btn-huevo');
const btnMetal = document.getElementById('btn-metal');
const btnHielo = document.getElementById('btn-hielo');
const btnSoltar = document.getElementById('btn-soltar');
const tipoLiquido = document.getElementById('tipo-liquido');
const masaObjeto = document.getElementById('masa-objeto');
const valorMasa = document.getElementById('valor-masa');

const presionHidrostaticaText = document.getElementById('presion-hidrostatica');
const presionAbsolutaText = document.getElementById('presion-absoluta');
const alturaLiquidoText = document.getElementById('altura-liquido');

const densidadObjeto = document.getElementById('densidad-objeto');
const densidadLiquidoEl = document.getElementById('densidad-liquido');
const volumenEl = document.getElementById('volumen');
const empujeEl = document.getElementById('empuje');
const presionEl = document.getElementById('presion');
const masaMostradaEl = document.getElementById('masa-mostrada');

const noObjeto1 = document.getElementById('no-objeto-1');
const noObjeto2 = document.getElementById('no-objeto-2');

const alturaVaso = 50; // cm

const GRAVEDAD = 9.81; // m/s²
const PRESION_ATMOSFERICA = 101325; // Pa

let objetoActual = null;
let nivelLiquidoActual = 70; // %
let densidadLiquidoActual = 1000; // kg/m³
let masaObjetoActual = 20; // g
let objetoEnCaida = false;
let posicionObjetoActual = 0; // % desde arriba

let tipoLiquidoActual = "agua-dulce";

let alturaLiquidoActual = 35; // cm
let presionHidrostaticaActual = 137340; // Pa
let presionAbsolutaActual = PRESION_ATMOSFERICA + presionHidrostaticaActual; // Pa

const liquidos = {
    'agua-dulce': {
        nombre: 'Agua dulce',
        densidad: 1000, // kg/m³
        clase: 'agua-dulce'
    },
    'agua-salada': {
        nombre: 'Agua salada',
        densidad: 1200, // kg/m³
        clase: 'agua-salada'
    },
    'aceite': {
        nombre: 'Aceite',
        densidad: 900, // kg/m³
        clase: 'aceite'
    },
    'mercurio': {
        nombre: 'Mercurio',
        densidad: 13546, // kg/m³
        clase: 'mercurio'
    }
};

const objetos = {
    huevo: {
        nombre: 'Huevo',
        clase: 'huevo',
        densidad: 1050, // kg/m³
        altura: 0.02, // m (2 cm)
        volumenBase: 0.000001, // m³ (1 cm³)
    },
    metal: {
        nombre: 'Metal',
        clase: 'metal',
        densidad: 7874, // kg/m³
        altura: 0.04, // m (4 cm)
        volumenBase: 0.000064, // m³ (64 cm³)
    },
    hielo: {
        nombre: 'Hielo',
        clase: 'hielo',
        densidad: 917, // kg/m³
        altura: 0.04, // m (4 cm)
        volumenBase: 0.000064, // m³ (64 cm³)
    }
};

let presionData = [];
let empujeData = [];

const presionChart = new Chart(
    document.getElementById('presionChart'),
    {
        type: 'line',
        data: {
            labels: Array.from({ length: 100 }, (_, i) => i),
            datasets: [{
                label: 'Presión vs. Profundidad',
                data: presionData,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Presión (Pa)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Profundidad (%)'
                    }
                }
            }
        }
    }
);

const empujeChart = new Chart(
    document.getElementById('empujeChart'),
    {
        type: 'bar',
        data: {
            labels: ['Peso', 'Empuje'],
            datasets: [{
                label: 'Fuerza (N)',
                data: empujeData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Fuerza (N)'
                    }
                }
            }
        }
    }
);

function calcularAlturaLiquido(alturaVaso, nivelLiquido) {
    return (alturaVaso * nivelLiquido) / 100; // cm
}

function calcularHidrostatica(densidadLiquido, gravedad, alturaLiquido) {
    return densidadLiquido * gravedad * (alturaLiquido / 100); // Pa (convertir altura a metros)
}

function calcularPresionAbsoluta(presionAtm, presionHidro) {
    return presionAtm + presionHidro; // Pa
}

function calcularFuerzaEmpuje(densidadLiquido, volumenObjeto) {
    return densidadLiquido * GRAVEDAD * volumenObjeto; // N
}

function calcularAlturaSumergida(objeto, liquido) {
    return (objeto.densidad / liquido.densidad) * objeto.altura; // m
}

function calcularVolumenSumergido(objeto, densidadLiquido) {
    return (objeto.densidad / densidadLiquido) * objeto.volumenBase; // m³
}

function actualizarLiquido(nivel) {
    nivelLiquidoActual = nivel;
    agua.style.height = `${nivel}%`;
    valorNivel.textContent = nivel;

    tipoLiquidoActual = tipoLiquido.value;
    densidadLiquidoActual = liquidos[tipoLiquidoActual].densidad;

    alturaLiquidoActual = calcularAlturaLiquido(alturaVaso, nivel);

    presionHidrostaticaActual = calcularHidrostatica(densidadLiquidoActual, GRAVEDAD, alturaLiquidoActual);
    presionAbsolutaActual = calcularPresionAbsoluta(PRESION_ATMOSFERICA, presionHidrostaticaActual);

    presionAbsolutaText.textContent = presionAbsolutaActual.toFixed(2);
    alturaLiquidoText.textContent = alturaLiquidoActual.toFixed(2);
    presionHidrostaticaText.textContent = presionHidrostaticaActual.toFixed(2);
    densidadLiquidoEl.textContent = densidadLiquidoActual.toFixed(2);
}

function añadirObjeto(tipo) {
    objetoActual = { ...objetos[tipo] };

    densidadObjeto.textContent = objetoActual.densidad;

    objeto.className = 'objeto ' + objetoActual.clase;
    objeto.style.display = 'block';

    posicionObjetoActual = 0;
    objeto.style.top = '0';
    objeto.style.bottom = 'auto';

    objetoEnCaida = false;
    objeto.classList.remove('cayendo');

    btnHuevo.classList.remove('active');
    btnMetal.classList.remove('active');
    btnHielo.classList.remove('active');

    if (tipo === 'huevo') btnHuevo.classList.add('active');
    if (tipo === 'metal') btnMetal.classList.add('active');
    if (tipo === 'hielo') btnHielo.classList.add('active');

    btnSoltar.disabled = false;

    noObjeto1.style.display = 'none';
    noObjeto2.style.display = 'none';
}

function soltarObjeto() {
    if (!objetoActual || objetoEnCaida) return;

    objetoEnCaida = true;
    objeto.classList.add('cayendo');

    const relacionDensidad = objetoActual.densidad / densidadLiquidoActual;

    setTimeout(() => {
        objetoEnCaida = false;
        objeto.classList.remove('cayendo');

        if (relacionDensidad < 1) {
            // Calcular la altura sumergida correctamente
            const alturaSumergida = calcularAlturaSumergida(objetoActual, liquidos[tipoLiquidoActual]);

            // Altura de flotación: restar la altura sumergida desde el fondo del líquido
            const posicionFinal = (alturaLiquidoActual / 100) - alturaSumergida; // Convertir a metros

            // Convertir la altura a porcentaje con base en la altura total del vaso
            const porcentajeFlotacion = (posicionFinal / (alturaVaso / 100)) * 100;

            // Aplicar la posición en porcentaje
            objeto.style.top = `${100 - porcentajeFlotacion}%`;
            objeto.style.bottom = 'auto';
        } else {
            // Se hunde completamente
            objeto.style.top = 'auto';
            objeto.style.bottom = '0';
        }
    }, 1000); // Coincidir con la duración de la animación

    // Calcular empuje hidrostático y volumen sumergido
    const empujeHidrostatico = calcularFuerzaEmpuje(densidadLiquidoActual, objetoActual.volumenBase);
    const volumenSumergido = calcularVolumenSumergido(objetoActual, densidadLiquidoActual);

    // Actualizar valores en la interfaz
    empujeEl.textContent = empujeHidrostatico.toFixed(2);
    volumenEl.textContent = (volumenSumergido * 1e6).toFixed(2); // Convertir a cm³

    // Actualizar gráficos
    actualizarGraficoProfundidadPresion();
    actualizarGraficoEmpuje(
        objetoActual.densidad * GRAVEDAD * objetoActual.volumenBase, // Peso
        empujeHidrostatico // Empuje
    );
}

// Actualizar gráfico de presión vs. profundidad
function actualizarGraficoProfundidadPresion() {
    presionData = [];
    for (let i = 0; i <= 500; i += 5) {
        let profundidad = (alturaLiquidoActual * i) / 100; // Convertir a metros
        let presion = calcularHidrostatica(densidadLiquidoActual, GRAVEDAD, profundidad * 100); // Convertir a cm
        presionData.push(presion);
    }

    presionChart.data.datasets[0].data = presionData;
    presionChart.update();
}

// Actualizar gráfico de empuje vs. peso
function actualizarGraficoEmpuje(peso, empuje) {
    empujeData = [peso, empuje];
    empujeChart.data.datasets[0].data = empujeData;
    empujeChart.update();
}

// Event listeners
nivelLiquido.addEventListener('input', function () {
    actualizarLiquido(parseInt(this.value, 10));
});

tipoLiquido.addEventListener('change', function () {
    agua.className = 'agua ' + liquidos[this.value].clase;
    actualizarLiquido(nivelLiquido.value);
});

btnHuevo.addEventListener('click', function () {
    añadirObjeto('huevo');
});

btnMetal.addEventListener('click', function () {
    añadirObjeto('metal');
});

btnHielo.addEventListener('click', function () {
    añadirObjeto('hielo');
});

btnSoltar.addEventListener('click', soltarObjeto);