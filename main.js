document.addEventListener('DOMContentLoaded', () => {

    const escuelasIniciales = [
        { nombre: "Escuela Secundaria Nº 35 Latzina", acciones: 142, puntos: 2150 },
        { nombre: "Instituto Belgrano Verde", acciones: 118, puntos: 1820 },
        { nombre: "Colegio San Martín Eco", acciones: 95, puntos: 1410 },
        { nombre: "Escuela Técnica Nº 1", acciones: 82, puntos: 1190 },
        { nombre: "Liceo Norte Sustentable", acciones: 64, puntos: 930 }
    ];

    let listaEscuelas = JSON.parse(localStorage.getItem('ecowin_escuelas')) || escuelasIniciales;

    const puntosMapaIniciales = [
        { id: 1, lat: -34.6037, lng: -58.3816, titulo: "Escuela Secundaria Nº 35 Latzina", tipo: "escuela", desc: "Líder actual en la competencia interescolar Eco-Win." },
        { id: 2, lat: -34.6080, lng: -58.3740, titulo: "Punto Verde Plaza de Mayo", tipo: "reciclaje", desc: "Recepción de cartón, botellas PET y tapitas." },
        { id: 3, lat: -34.5980, lng: -58.3880, titulo: "Instituto Belgrano Verde", tipo: "escuela", desc: "2º Puesto en la tabla de posiciones ambientales." },
        { id: 4, lat: -34.6120, lng: -58.3850, titulo: "Estación Bici Sustentable Parque Lezama", tipo: "bici", desc: "Punto de ciclovía y taller comunal gratuito." },
        { id: 5, lat: -34.6000, lng: -58.3700, titulo: "Ecopunto Tapitas Retiro Glaciar", tipo: "reciclaje", desc: "Centro inteligente de recolección de tapitas y latas." }
    ];

    let puntosMapa = JSON.parse(localStorage.getItem('ecowin_puntos_mapa')) || puntosMapaIniciales;

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });

    let streakData = JSON.parse(localStorage.getItem('ecowin_streak')) || { count: 0, lastDate: null };

    function actualizarUIStreak() {
        document.getElementById('mainStreakCount').textContent = streakData.count;
        document.getElementById('headerStreakCount').textContent = streakData.count;
    }
    actualizarUIStreak();

    const btnMarcarRacha = document.getElementById('btnMarcarRacha');
    const rachaMsg = document.getElementById('rachaMsg');

    btnMarcarRacha.addEventListener('click', () => {
        const hoy = new Date().toDateString();

        if (streakData.lastDate === hoy) {
            rachaMsg.style.color = 'var(--acento-naranja)';
            rachaMsg.textContent = '⚠️ ¡Ya marcaste tu ingreso de hoy! Volvé mañana para mantener tu racha.';
            return;
        }

        streakData.count += 1;
        streakData.lastDate = hoy;
        localStorage.setItem('ecowin_streak', JSON.stringify(streakData));
        actualizarUIStreak();

        rachaMsg.style.color = 'var(--azul-profundo)';
        rachaMsg.textContent = '🎉 ¡Excelente! Sumaste un día más a tu racha de constancia ecológica.';

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 85,
                spread: 75,
                origin: { y: 0.6 }
            });
        }
    });

    const map = L.map('mapa-leaflet', {
        zoomControl: true,
        scrollWheelZoom: true
    }).setView([-34.6037, -58.3816], 13);

    // AQUÍ ESTÁ EL CAMBIO SOLICITADO: Capa oficial de OpenStreetMap sin requerir API Key
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    let layerGroup = L.layerGroup().addTo(map);
    let tempMarker = null;

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    function getCustomIcon(tipo) {
        let symbol = "📍";
        let bg = "#214354";
        let borderColor = "#88b8c7";

        if (tipo === 'escuela') { symbol = "🏫"; bg = "#214354"; borderColor = "#c6e3eb"; }
        else if (tipo === 'reciclaje') { symbol = "♻️"; bg = "#40809b"; borderColor = "#88b8c7"; }
        else if (tipo === 'bici') { symbol = "🚲"; bg = "#88b8c7"; borderColor = "#214354"; }

        return L.divIcon({
            html: `<div style="background:${bg}; color:white; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; font-size:20px; border:3px solid ${borderColor}; box-shadow:0 6px 14px rgba(33,67,84,0.35); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));">${symbol}</div>`,
            className: '',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
    }

    function renderizarMapa(filtro = 'todos') {
        layerGroup.clearLayers();
        let countTodos = 0, countEscuelas = 0, countReciclaje = 0, countBici = 0;

        puntosMapa.forEach(pt => {
            countTodos++;
            if (pt.tipo === 'escuela') countEscuelas++;
            if (pt.tipo === 'reciclaje') countReciclaje++;
            if (pt.tipo === 'bici') countBici++;

            if (filtro === 'todos' || pt.tipo === filtro) {
                const marker = L.marker([pt.lat, pt.lng], { icon: getCustomIcon(pt.tipo) });
                marker.bindPopup(`
                    <div style="font-family: 'DM Sans', sans-serif; padding: 4px 6px;">
                        <h4 style="margin: 0 0 4px 0; color: #214354; font-size: 15px;">${pt.titulo}</h4>
                        <p style="margin: 0; font-size: 12px; color: #31586b; line-height: 1.4;">${pt.desc}</p>
                        <span class="custom-popup-tag tag-${pt.tipo}">${pt.tipo === 'escuela' ? 'Escuela' : pt.tipo === 'reciclaje' ? 'Reciclaje / Tapitas' : 'Estación Bici'}</span>
                    </div>
                `);
                layerGroup.addLayer(marker);
            }
        });

        document.getElementById('count-todos').textContent = countTodos;
        document.getElementById('count-escuelas').textContent = countEscuelas;
        document.getElementById('count-reciclaje').textContent = countReciclaje;
        document.getElementById('count-bici').textContent = countBici;
    }

    renderizarMapa();

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderizarMapa(btn.dataset.filter);
        });
    });

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        document.getElementById('latInput').value = lat.toFixed(5);
        document.getElementById('lngInput').value = lng.toFixed(5);

        if (tempMarker) map.removeLayer(tempMarker);
        tempMarker = L.marker([lat, lng], { 
            icon: L.divIcon({
                html: `<div style="background:#e66d49; color:white; width:34px; height:34px; border-radius:50%; display:grid; place-items:center; font-size:16px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); animation: bounce 0.6s infinite alternate;">📌</div>`,
                className: '',
                iconSize: [34, 34],
                iconAnchor: [17, 17]
            })
        }).addTo(map);

        modalMapa.classList.add('open');
    });

    const modalMapa = document.getElementById('modalMapa');
    const btnAbrirModalMapa = document.getElementById('btnAbrirModalMapa');
    const btnCerrarModalMapa = document.getElementById('btnCerrarModalMapa');
    const formNuevoPuntoMapa = document.getElementById('formNuevoPuntoMapa');

    btnAbrirModalMapa.addEventListener('click', () => {
        const center = map.getCenter();
        document.getElementById('latInput').value = center.lat.toFixed(5);
        document.getElementById('lngInput').value = center.lng.toFixed(5);
        modalMapa.classList.add('open');
    });

    btnCerrarModalMapa.addEventListener('click', () => {
        modalMapa.classList.remove('open');
        if (tempMarker) map.removeLayer(tempMarker);
    });

    formNuevoPuntoMapa.addEventListener('submit', (e) => {
        e.preventDefault();
        const nuevoPunto = {
            id: Date.now(),
            titulo: document.getElementById('nombrePuntoInput').value,
            tipo: document.getElementById('tipoPuntoSelect').value,
            desc: document.getElementById('descPuntoInput').value,
            lat: parseFloat(document.getElementById('latInput').value),
            lng: parseFloat(document.getElementById('lngInput').value)
        };

        puntosMapa.push(nuevoPunto);
        localStorage.setItem('ecowin_puntos_mapa', JSON.stringify(puntosMapa));
        renderizarMapa();

        modalMapa.classList.remove('open');
        if (tempMarker) map.removeLayer(tempMarker);
        formNuevoPuntoMapa.reset();

        alert('📍 ¡Nuevo Punto Verde agregado con éxito!');
    });

    const listaRanking = document.getElementById('listaRanking');

    function renderizarRanking() {
        listaRanking.innerHTML = '';
        listaEscuelas.sort((a, b) => b.puntos - a.puntos);

        listaEscuelas.forEach((escuela, index) => {
            const row = document.createElement('div');
            row.className = 'ranking-row';

            let podioIcon = `${index + 1}º`;
            if (index === 0) podioIcon = "🥇";
            else if (index === 1) podioIcon = "🥈";
            else if (index === 2) podioIcon = "🥉";

            row.innerHTML = `
                <span class="posicion">${podioIcon}</span>
                <div class="escuela-info">
                    <span>🌱 ${escuela.nombre}</span>
                </div>
                <div><span class="escuela-badge">${escuela.acciones} acciones</span></div>
                <span class="puntos-col">${escuela.puntos.toLocaleString('es-AR')} pts</span>
            `;
            listaRanking.appendChild(row);
        });
    }

    renderizarRanking();

    const formAccion = document.getElementById('formAccion');

    formAccion.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombreEscuela = document.getElementById('escuelaSelect').value;
        const puntosSuma = parseInt(document.getElementById('tipoAccionSelect').value);

        if (!nombreEscuela || !puntosSuma) return;

        let escuelaObj = listaEscuelas.find(e => e.nombre === nombreEscuela);

        if (escuelaObj) {
            escuelaObj.puntos += puntosSuma;
            escuelaObj.acciones += 1;
        } else {
            listaEscuelas.push({
                nombre: nombreEscuela,
                acciones: 1,
                puntos: puntosSuma
            });
        }

        localStorage.setItem('ecowin_escuelas', JSON.stringify(listaEscuelas));
        renderizarRanking();

        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 80,
                origin: { y: 0.5 }
            });
        }

        alert(`🎉 ¡Acción registrada con éxito!\nSumaste +${puntosSuma} puntos para ${nombreEscuela}.`);
        formAccion.reset();

        document.getElementById('ranking').scrollIntoView({ behavior: 'smooth' });
    });

});