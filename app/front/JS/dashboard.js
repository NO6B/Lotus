var HEURES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];
var JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
var offsetSemaine = 0;
var selectedDate = '', selectedHeure = '';

async function construireCalendrier() {
    const response = await fetch('/api/creneaux-occupes');
    const data = await response.json();
    const lundi = getLundiSemaine(offsetSemaine);
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    document.getElementById('cal-week-label').textContent = lundi.toLocaleDateString('fr-FR');
    grid.innerHTML = '';
    grid.appendChild(document.createElement('div'));

    for (var i = 0; i < 7; i++) {
        var d = new Date(lundi); d.setDate(d.getDate() + i);
        const header = document.createElement('div');
        header.className = 'booking-day-header';
        header.innerHTML = `<strong>${JOURS_COURTS[i]}</strong><small>${d.getDate()}</small>`;
        grid.appendChild(header);
    }

    HEURES.forEach(h => {
        const timeLabel = document.createElement('div');
        timeLabel.innerHTML = `<strong>${h}</strong>`;
        grid.appendChild(timeLabel);

        for (var i = 0; i < 7; i++) {
            var d = new Date(lundi); d.setDate(d.getDate() + i);
            const dateStr = formatDate(d);
            const cle = dateStr + '_' + h;
            const info = data[cle];
            const div = document.createElement('div');
            
            div.className = 'booking-slot ' + (info ? (info.statut === 'occupe' ? 'occupe' : 'libre') : 'ferme');
            div.innerHTML = info ? (info.statut === 'occupe' ? 'RDV' : 'OUVERT') : '-';

            div.onclick = function() {
                selectedDate = dateStr; selectedHeure = h;
                const modal = document.getElementById('modal-creneau');
                const subtitle = document.getElementById('modal-subtitle');
                const footer = document.getElementById('modal-admin-actions');

                if (info && info.statut === 'occupe') {
                    subtitle.innerHTML = `<p>Client : ${info.client}</p>`;
                    footer.innerHTML = `<button class="secondary" onclick="actionCreneau('fermer')">Fermer et Annuler</button>`;
                } else if (info && info.statut === 'disponible') {
                    subtitle.innerHTML = `<p>Creneau ouvert. Voulez-vous le retirer ?</p>`;
                    footer.innerHTML = `<button class="secondary" onclick="actionCreneau('fermer')">Retirer l'ouverture</button>`;
                } else {
                    subtitle.innerHTML = `<p>Creneau ferme. Voulez-vous l'ouvrir aux clients ?</p>`;
                    footer.innerHTML = `<button onclick="actionCreneau('ouvrir')">Ouvrir le creneau</button>`;
                }
                modal.setAttribute('open', true);
            };
            grid.appendChild(div);
        }
    });
}

async function actionCreneau(action) {
    const resp = await fetch('/api/admin/creneau/action', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ date: selectedDate, heure: selectedHeure, action: action })
    });
    if (resp.ok) { document.getElementById('modal-creneau').removeAttribute('open'); construireCalendrier(); }
}

function getLundiSemaine(offset) {
    var d = new Date(); var jour = d.getDay();
    var diff = (jour === 0) ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff + offset * 7);
    d.setHours(0,0,0,0); return d;
}
function formatDate(d) { return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
function changerSemaine(dir) { offsetSemaine += dir; construireCalendrier(); }
document.addEventListener('DOMContentLoaded', construireCalendrier);