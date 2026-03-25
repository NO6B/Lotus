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
                weekdays: { shorthands: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"], longhand: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"] },
                months: { shorthands: ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"], longhand: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"] }
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
    document.getElementById('slot-section').style.display = 'block';
    grid.innerHTML = 'Chargement...';
    
    try {
        const response = await fetch('/api/creneaux-occupes');
        const data = await response.json();
        grid.innerHTML = ''; 

        HEURES_DISPO.forEach(heure => {
            const cle = date + '_' + heure;
            if (!(cle in data)) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'outline secondary';
                btn.textContent = heure;
                btn.onclick = function() {
                    document.querySelectorAll('#slot-grid button').forEach(b => b.classList.replace('primary', 'secondary'));
                    this.classList.replace('secondary', 'primary');
                    document.getElementById('heure').value = heure;
                };
                grid.appendChild(btn);
            }
        });
    } catch (e) { grid.innerHTML = 'Erreur.'; }
}