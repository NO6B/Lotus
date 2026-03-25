var HEURES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];
var JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
var offsetSemaine = 0;
var selectedDate = '';
var selectedHeure = '';

async function construireCalendrier() {
    const response = await fetch('/api/creneaux-occupes');
    const dataOccupes = await response.json();

    const lundi = getLundiSemaine(offsetSemaine);
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    const dimanche = new Date(lundi); 
    dimanche.setDate(dimanche.getDate() + 6);
    document.getElementById('cal-week-label').textContent = 
        lundi.toLocaleDateString('fr-FR') + ' - ' + dimanche.toLocaleDateString('fr-FR');
    
    grid.innerHTML = ''; 

    // Cellule vide (haut gauche)
    grid.appendChild(document.createElement('div'));

    // En-têtes des jours
    const jours = [];
    for (var i = 0; i < 7; i++) {
        var d = new Date(lundi); 
        d.setDate(d.getDate() + i);
        jours.push(d);
        const header = document.createElement('div');
        header.innerHTML = `<strong>${JOURS_COURTS[i]}</strong><br>${d.getDate()}`;
        grid.appendChild(header);
    }

    // Lignes d'heures
    HEURES.forEach(heure => {
        const timeLabel = document.createElement('div');
        timeLabel.innerHTML = `<small>${heure}</small>`;
        grid.appendChild(timeLabel);

        jours.forEach(jour => {
            const dateStr = formatDate(jour);
            const cle = dateStr + '_' + heure;
            const rdvInfo = dataOccupes[cle];

            const div = document.createElement('div');
            div.className = 'cal-slot ' + (rdvInfo ? 'occupe' : 'libre');
            div.innerHTML = rdvInfo ? 'REÇU' : '-';

            // GESTION DU CLIC
            div.onclick = function() {
                selectedDate = dateStr;
                selectedHeure = heure;
                const modal = document.getElementById('modal-creneau');
                const subtitle = document.getElementById('modal-subtitle');
                const actions = document.getElementById('modal-admin-actions');

                if (rdvInfo) {
                    subtitle.innerHTML = `
                        <div style="padding: 10px; border-left: 4px solid #3498db; background: #f9f9f9;">
                            <p><strong>Client :</strong> ${rdvInfo.client}</p>
                            <p><strong>Message :</strong><br>${rdvInfo.message}</p>
                        </div>
                    `;
                    actions.style.display = 'grid'; 
                } else {
                    subtitle.innerHTML = `Créneau libre : <strong>${dateStr} à ${heure}</strong>`;
                    actions.style.display = 'grid';
                }
                modal.setAttribute('open', true);
            };
            grid.appendChild(div);
        });
    });
}

async function actionCreneau(typeAction) {
    // Cette fonction envoie l'ordre au serveur (nécessite la route Python correspondante)
    const response = await fetch('/api/admin/creneau/action', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            date: selectedDate,
            heure: selectedHeure,
            action: typeAction
        })
    });
    
    if (response.ok) {
        document.getElementById('modal-creneau').removeAttribute('open');
        construireCalendrier();
    } else {
        alert("Erreur lors de la modification du créneau.");
    }
}

function getLundiSemaine(offset) {
    var d = new Date(); 
    var jour = d.getDay();
    var diff = (jour === 0) ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff + offset * 7);
    d.setHours(0,0,0,0);
    return d;
}

function formatDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

function changerSemaine(dir) { 
    offsetSemaine += dir; 
    construireCalendrier(); 
}

document.addEventListener('DOMContentLoaded', construireCalendrier);