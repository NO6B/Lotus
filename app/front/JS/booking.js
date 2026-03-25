var HEURES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];
var JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
var offsetSemaine = 0;

async function construirePlanningReservation() {
    const response = await fetch('/api/creneaux-occupes');
    const dataOccupes = await response.json();

    const lundi = getLundiSemaine(offsetSemaine);
    const grid = document.getElementById('booking-grid');
    if (!grid) return;

    const dimanche = new Date(lundi); 
    dimanche.setDate(dimanche.getDate() + 6);
    document.getElementById('cal-week-label').textContent = 
        lundi.toLocaleDateString('fr-FR') + ' - ' + dimanche.toLocaleDateString('fr-FR');
    
    grid.innerHTML = ''; 

    // Coin haut gauche
    grid.appendChild(document.createElement('div'));

    // En-têtes jours
    const jours = [];
    for (var i = 0; i < 7; i++) {
        var d = new Date(lundi); 
        d.setDate(d.getDate() + i);
        jours.push(d);
        const header = document.createElement('div');
        header.innerHTML = `<strong>${JOURS_COURTS[i]}</strong><br>${d.getDate()}`;
        grid.appendChild(header);
    }

    // Heures et créneaux
    HEURES.forEach(heure => {
        const timeLabel = document.createElement('div');
        timeLabel.innerHTML = `<small>${heure}</small>`;
        grid.appendChild(timeLabel);

        jours.forEach(jour => {
            const dateStr = formatDate(jour);
            const cle = dateStr + '_' + heure;
            const rdvInfo = dataOccupes[cle];

            const div = document.createElement('div');
            
            if (rdvInfo) {
                div.className = 'cal-slot occupe';
                div.innerHTML = 'Indispo.';
            } else {
                div.className = 'cal-slot libre';
                div.innerHTML = 'Libre';
                
                // Action au clic pour réserver
                div.onclick = function() {
                    // On retire la sélection visuelle des autres cases
                    document.querySelectorAll('.cal-slot').forEach(s => s.classList.remove('selected'));
                    // On ajoute la sélection sur celle-ci
                    div.classList.add('selected');
                    
                    // On remplit les champs cachés du formulaire
                    document.getElementById('date').value = dateStr;
                    document.getElementById('heure').value = heure;
                    
                    // On met à jour le texte et on active le bouton
                    document.getElementById('selection-info').textContent = 
                        "Sélectionné : le " + jour.toLocaleDateString('fr-FR') + " à " + heure;
                    document.getElementById('btn-submit').disabled = false;
                };
            }
            grid.appendChild(div);
        });
    });
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
    construirePlanningReservation(); 
}

document.addEventListener('DOMContentLoaded', construirePlanningReservation);