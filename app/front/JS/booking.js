document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('date');
    if (dateInput) {
        flatpickr(dateInput, {
            dateFormat: "Y-m-d",
            altInput: true,
            altFormat: "j F Y",
            minDate: "today",
            locale: {
                firstDayOfWeek: 1,
                weekdays: {
                    shorthands: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
                    longhand: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
                },
                months: {
                    shorthands: ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"],
                    longhand: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]
                }
            },
            onChange: function(selectedDates, dateStr) {
                chargerCreneaux(dateStr);
            }
        });
    }
});

var HEURES_DISPO = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];

async function chargerCreneaux(date) {
    if (!date) return;
    const grid = document.getElementById('slot-grid');
    const slotSection = document.getElementById('slot-section');
    slotSection.style.display = 'block';
    grid.innerHTML = '<p aria-busy="true">Chargement des créneaux...</p>';

    try {
        const response = await fetch('/api/creneaux-occupes');
        const data = await response.json();
        grid.innerHTML = '';

        let auMoinsUnDispo = false;

        HEURES_DISPO.forEach(heure => {
            const cle = date + '_' + heure;
            if (!(cle in data)) {
                auMoinsUnDispo = true;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'outline secondary';
                btn.textContent = heure;
                btn.onclick = function() {
                    document.querySelectorAll('#slot-grid button').forEach(b => {
                        b.classList.remove('primary');
                        b.classList.add('secondary');
                    });
                    this.classList.remove('secondary');
                    this.classList.add('primary');
                    document.getElementById('heure').value = heure;
                };
                grid.appendChild(btn);
            }
        });

        if (!auMoinsUnDispo) {
            grid.innerHTML = '<p><em>Aucun créneau disponible pour cette date.</em></p>';
        }

    } catch (e) {
        console.error(e);
        grid.innerHTML = '<p style="color:red;">Erreur lors du chargement des créneaux.</p>';
    }
}