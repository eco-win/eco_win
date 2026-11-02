const SUPABASE_URL = "https://obtegezmgkgmafhsqngl.supabase.co";
const SUPABASE_KEY = "sb_publishable_WAF6gPUQ8xx3c4AJ2devFA_lyuc7Zvt";

const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const rankingLista = document.getElementById("ranking-lista");

async function cargarRanking() {
    rankingLista.innerHTML = "<p>Cargando ranking...</p>";

    const { data, error } = await clienteSupabase
     .from("ranking_escuelas")
        .select("escuela, acciones, puntos_totales")
        .order("puntos_totales", { ascending: false });

    if (error) {
        console.error("Error al cargar el ranking:", error);
        rankingLista.textContent = "No se pudo cargar el ranking.";
        return;
    }

    rankingLista.innerHTML = "";

    data.forEach((escuela, indice) => {
        const fila = document.createElement("div");
        fila.classList.add("fila");

        fila.innerHTML = `
            <span class="puesto">${indice + 1}°</span>
            <span class="nombre-escuela">🌱 ${escuela.escuela}</span>
            <span>${escuela.acciones}</span>
            <span class="puntos">${Number(escuela.puntos_totales).toLocaleString("es-AR")}</span>
        `;

        rankingLista.appendChild(fila);
    });
}

cargarRanking();


// Racha de ingreso de demostración
let diasDeRacha = 0;

const botonIngreso = document.getElementById("ingreso");
const racha = document.getElementById("racha");

botonIngreso.addEventListener("click", function () {
    diasDeRacha++;

    racha.textContent =
        diasDeRacha + (diasDeRacha === 1 ? " día" : " días");

    botonIngreso.textContent = "¡Ingreso marcado! ✓";
    botonIngreso.disabled = true;

    setTimeout(() => {
        botonIngreso.disabled = false;
        botonIngreso.textContent = "Marcar mi ingreso";
    }, 1500);
});

// Formulario para registrar acciones
const formulario = document.getElementById("form-accion");
const mensaje = document.getElementById("mensaje");

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const escuela = document.getElementById("escuela").value;
    const accion = document.getElementById("accion").value;
    const descripcion = document.getElementById("descripcion").value;
    const foto = document.getElementById("foto").files[0];

    if (escuela === "" || accion === "") {
        mensaje.textContent = "Elegí tu escuela y una acción.";
        return;
    }

    const puntos = Number(accion);

    mensaje.textContent =
        "¡Acción registrada en esta demostración! Sumaste " +
        puntos + " puntos para " + escuela + ".";

    console.log("Escuela:", escuela);
    console.log("Puntos:", puntos);
    console.log("Descripción:", descripcion);

    if (foto) {
        console.log("Foto seleccionada:", foto.name);
        mensaje.textContent +=
            " La foto se seleccionó, pero todavía no se sube a un servidor.";
    }

    formulario.reset();
});