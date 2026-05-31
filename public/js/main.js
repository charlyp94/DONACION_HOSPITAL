// ==========================================================================
// CONTROL DE INTERACCIÓN DEL FORMULARIO DE DONACIONES - HOSPITAL LUIS A. GÜEMES
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CAPTURA DE ELEMENTOS DEL DOM ---
    const modal = document.getElementById('modalDonacion');
    const btnAbrirModal = document.getElementById('btnAbrirModal');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    
    const radioPersona = document.getElementById('radioPersona');
    const radioEmpresa = document.getElementById('radioEmpresa');
    
    const camposPersona = document.getElementById('camposPersona');
    const camposEmpresa = document.getElementById('camposEmpresa');
    const formDonacion = document.getElementById('formDonacion');

    // --- 2. LOGIC DE APERTURA Y CIERRE DEL MODAL ---
    
    // Abrir el formulario flotante
    btnAbrirModal.addEventListener('click', () => {
        modal.classList.add('mostrar');
        document.body.style.overflow = 'hidden'; // Evita que la página del fondo se mueva
    });

    // Cerrar desde la "X"
    btnCerrarModal.addEventListener('click', cerrarModal);

    // Cerrar si el usuario hace clic afuera del recuadro blanco (en la zona oscura)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    function cerrarModal() {
        modal.classList.remove('mostrar');
        document.body.style.overflow = 'auto'; // Devuelve el scroll a la página
    }

    // --- 3. COMPORTAMIENTO DINÁMICO DEL FORMULARIO ---
    
    // Escuchamos el cambio en los botones de selección (Radio Buttons)
    radioPersona.addEventListener('change', alternarCamposFormulario);
    radioEmpresa.addEventListener('change', alternarCamposFormulario);

    function alternarCamposFormulario() {
        if (radioPersona.checked) {
            camposPersona.style.display = 'block';
            camposEmpresa.style.display = 'none';
            if(document.getElementById('nombreEmpresa')) document.getElementById('nombreEmpresa').value = '';
        } else if (radioEmpresa.checked) {
            camposEmpresa.style.display = 'block';
            camposPersona.style.display = 'none';
            if(document.getElementById('nombreCompleto')) document.getElementById('nombreCompleto').value = '';
            if(document.getElementById('dni')) document.getElementById('dni').value = '';
            if(document.getElementById('fechaNacimiento')) document.getElementById('fechaNacimiento').value = '';
        }
    }

    // --- 4. ENVÍO DE DATOS AL SERVIDOR DE NODE.JS ---
    formDonacion.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log("¡Hiciste clic en enviar! Intentando mandar los datos...");

        // Capturar cuál radio button está seleccionado
        const tipoDonante = radioPersona.checked ? 'persona' : 'empresa';
        const correo = document.getElementById('correo').value;
        
        // Capturar los checkboxes de las categorías que estén tildadas
        const checkboxes = document.querySelectorAll('input[name="categorias"]:checked');
        const categoriasSeleccionadas = Array.from(checkboxes).map(cb => {
            return cb.parentNode.querySelector('span')?.innerText || cb.value;
        });
        
        const categoriaFinal = categoriasSeleccionadas.length > 0 ? categoriasSeleccionadas.join(', ') : 'General';

        // CAPTURA SEGURA: Usamos ?.value || '' por si el campo está oculto y no existe en el DOM
        const datosDonacion = {
            tipoDonante: tipoDonante,
            nombreCompleto: document.getElementById('nombreCompleto')?.value || '',
            nombreEmpresa: document.getElementById('nombreEmpresa')?.value || '',
            dni: document.getElementById('dni')?.value || null,
            fechaNacimiento: document.getElementById('fechaNacimiento')?.value || null,
            correo: correo,
            categoria: categoriaFinal
        };

        try {
            // Mandamos los datos al backend usando la URL relativa
            const respuesta = await fetch('/api/donaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosDonacion)
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert('¡Excelente! Tu donación fue registrada con éxito en la base de datos del Hospital.');
                formDonacion.reset(); // Limpiamos el formulario
                cerrarModal();       // Cerramos la ventana flotante
            } else {
                alert('Hubo un problema en el servidor: ' + resultado.error);
            }

        } catch (error) {
            console.error('Error en la conexión con el servidor:', error);
            alert('No se pudo conectar con el servidor. Asegurate de que Node.js esté corriendo.');
        }
    });

});
// Esperamos a que el DOM esté listo para asignarle el evento al nuevo botón
document.addEventListener('DOMContentLoaded', () => {
    // ... Tu código actual que abre y cierra el modal de donaciones se queda como está ...

    // Nueva lógica para el botón del personal
    const btnPersonal = document.getElementById('btnAccesoPersonal');
    if (btnPersonal) {
        btnPersonal.addEventListener('click', () => {
            const clave = prompt("Ingrese la contraseña de acceso del personal:");
            if (clave === "HospitalGuemes2026") {
                window.location.href = "admin.html"; // Redirige al panel de gestión
            } else if (clave !== null) {
                alert("Contraseña incorrecta. Acceso denegado.");
            }
        });
    }
});
// ==========================================================================
// CÓDIGO INDEPENDIENTE PARA EL MODAL DE ACCESO AL PERSONAL
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnPersonal = document.getElementById('btnAccesoPersonal');
    const modalLoginAdmin = document.getElementById('modalLoginAdmin');
    const btnCerrarLogin = document.getElementById('btnCerrarLogin');
    const btnConfirmarAdmin = document.getElementById('btnConfirmarAdmin');
    const inputPass = document.getElementById('passAdmin');

    // Abrir el modal usando display flex directo para no depender de clases CSS
    if (btnPersonal && modalLoginAdmin) {
        btnPersonal.addEventListener('click', () => {
            if (inputPass) inputPass.value = ""; 
            modalLoginAdmin.style.display = 'flex'; 
        });
    }

    // Cerrar desde la "X"
    if (btnCerrarLogin && modalLoginAdmin) {
        btnCerrarLogin.addEventListener('click', () => {
            modalLoginAdmin.style.display = 'none';
        });
    }

    // Cerrar si hacen clic afuera en el fondo oscuro
    if (modalLoginAdmin) {
        modalLoginAdmin.addEventListener('click', (e) => {
            if (e.target === modalLoginAdmin) {
                modalLoginAdmin.style.display = 'none';
            }
        });
    }

    // Validar contraseña
    if (btnConfirmarAdmin && inputPass) {
        btnConfirmarAdmin.addEventListener('click', () => {
            if (inputPass.value === "HospitalGuemes2026") {
                modalLoginAdmin.style.style.display = 'none';
                window.location.href = "admin.html"; 
            } else {
                alert("Contraseña incorrecta. Acceso denegado.");
            }
        });

        // Enter para ingresar
        inputPass.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnConfirmarAdmin.click();
            }
        });
    }
});
// ==========================================================================
// CÓDIGO PARA EL HISTORIAL PÚBLICO DE DONACIONES
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnVerHistorial = document.getElementById('btnVerHistorial');
    const modalHistorial = document.getElementById('modalHistorial');
    const btnCerrarHistorial = document.getElementById('btnCerrarHistorial');
    const tablaHistorialCuerpo = document.getElementById('tablaHistorialCuerpo');

    // Abrir modal y cargar datos
    if (btnVerHistorial && modalHistorial) {
        btnVerHistorial.addEventListener('click', () => {
            modalHistorial.style.display = 'flex';
            cargarHistorialPublico();
        });
    }

    // Cerrar modal con la X
    if (btnCerrarHistorial && modalHistorial) {
        btnCerrarHistorial.addEventListener('click', () => {
            modalHistorial.style.display = 'none';
        });
    }

    // Cerrar haciendo clic afuera
    window.addEventListener('click', (e) => {
        if (e.target === modalHistorial) {
            modalHistorial.style.display = 'none';
        }
    });

    // Función para hacer la petición al servidor
    async function cargarHistorialPublico() {
        try {
            if (!tablaHistorialCuerpo) return;
            tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">Cargando historial...</td></tr>';

            const respuesta = await fetch('http://localhost:3000/api/donaciones/aprobadas');
            const donaciones = await respuesta.json();

            tablaHistorialCuerpo.innerHTML = ''; // Limpiamos el mensaje de carga

            if (donaciones.length === 0) {
                tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">Aún no hay donaciones registradas en este sector.</td></tr>';
                return;
            }

            // Recorremos las donaciones y armamos las filas
            donaciones.forEach(donacion => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #eee';
                
                // Formateamos la fecha para que quede prolija (DD/MM/AAAA)
                const fecha = new Date(donacion.fecha).toLocaleDateString('es-AR');

                fila.innerHTML = `
                    <td style="padding: 10px; font-weight: bold;">${donacion.nombre}</td>
                    <td style="padding: 10px;">${donacion.categoria}</td>
                    <td style="padding: 10px; color: #666;">${fecha}</td>
                `;
                tablaHistorialCuerpo.appendChild(fila);
            });

        } catch (error) {
            console.error('Error al cargar el historial:', error);
            if (tablaHistorialCuerpo) {
                tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:red;">No se pudo cargar el historial en este momento.</td></tr>';
            }
        }
    }
});
// ==========================================================================
// AGREGADO EXCLUSIVO PARA EL HISTORIAL PÚBLICO (PEGA ESTO ABAJO DEL TODO)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnVerHistorial = document.getElementById('btnVerHistorial');
    const modalHistorial = document.getElementById('modalHistorial');
    const btnCerrarHistorial = document.getElementById('btnCerrarHistorial');
    const tablaHistorialCuerpo = document.getElementById('tablaHistorialCuerpo');

    if (btnVerHistorial && modalHistorial) {
        btnVerHistorial.addEventListener('click', () => {
            // Usamos el método nativo de tu diseño para abrir modales de forma segura
            modalHistorial.style.display = 'flex'; 
            cargarHistorialPublico();
        });
    }

    if (btnCerrarHistorial && modalHistorial) {
        btnCerrarHistorial.addEventListener('click', () => {
            modalHistorial.style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modalHistorial) {
            modalHistorial.style.display = 'none';
        }
    });

    async function cargarHistorialPublico() {
        try {
            if (!tablaHistorialCuerpo) return;
            tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">Cargando historial...</td></tr>';

            // Usamos ruta relativa segura para evitar problemas de red local
            const respuesta = await fetch('/api/donaciones/aprobadas');
            const donaciones = await respuesta.json();

            tablaHistorialCuerpo.innerHTML = ''; 

            if (donaciones.length === 0) {
                tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#666;">Aún no hay donaciones aprobadas para mostrar.</td></tr>';
                return;
            }

            donaciones.forEach(donacion => {
                const fila = document.createElement('tr');
                fila.style.borderBottom = '1px solid #eee';
                
                // Leemos 'fecha' a secas como lo corregiste en tu MySQL
                let fechaFormateada = "Sin fecha";
                if (donacion.fecha) {
                    fechaFormateada = new Date(donacion.fecha).toLocaleDateString('es-AR');
                }

                fila.innerHTML = `
                    <td style="padding: 12px 15px; font-weight: bold; color: #333;">${donacion.nombre}</td>
                    <td style="padding: 12px 15px; color: #555;">${donacion.categoria}</td>
                    <td style="padding: 12px 15px; color: #777;">${fechaFormateada}</td>
                `;
                tablaHistorialCuerpo.appendChild(fila);
            });

        } catch (error) {
            console.error('Error al cargar el historial:', error);
            if (tablaHistorialCuerpo) {
                tablaHistorialCuerpo.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:red;">No se pudo conectar al servidor.</td></tr>';
            }
        }
    }
});