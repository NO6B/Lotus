var HEURES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];
var JOURS_COURTS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
var offsetSemaine = 0;

async function construireCalendrier() {
    try {
        const response = await fetch('/api/creneaux-occupes');
        const dataOccupes = await response.json();
        const lundi = getLundiSemaine(offsetSemaine);
        const grid = document.getElementById('cal-grid');
        if (!grid) return;

        const dimanche = new Date(lundi);
        dimanche.setDate(dimanche.getDate() + 6);
        document.getElementById('cal-week-label').textContent =
            lundi.toLocaleDateString('fr-FR') + ' – ' + dimanche.toLocaleDateString('fr-FR');
        grid.innerHTML = '';

        const empty = document.createElement('div');
        grid.appendChild(empty);

        const jours = [];
        for (var i = 0; i < 7; i++) {
            var d = new Date(lundi);
            d.setDate(d.getDate() + i);
            jours.push(d);
            const header = document.createElement('div');
            header.style.textAlign = 'center';
            header.style.fontWeight = 'bold';
            header.style.fontSize = '0.85rem';
            header.innerHTML = JOURS_COURTS[i] + '<br><small>' + d.getDate() + '</small>';
            grid.appendChild(header);
        }

        HEURES.forEach(heure => {
            const timeLabel = document.createElement('div');
            timeLabel.style.fontSize = '0.75rem';
            timeLabel.style.color = 'var(--pico-muted-color)';
            timeLabel.style.paddingTop = '10px';
            timeLabel.textContent = heure;
            grid.appendChild(timeLabel);

            jours.forEach(jour => {
                const dateStr = formatDate(jour);
                const cle = dateStr + '_' + heure;
                const rdv = dataOccupes[cle];
                const div = document.createElement('div');
                div.className = 'cal-slot ' + (rdv ? 'occupe' : 'libre');
                div.textContent = rdv ? '●' : '·';
                div.title = rdv ? rdv.client : 'Libre';
                div.style.cursor = 'pointer';

                div.onclick = function() {
                    const subtitle = document.getElementById('modal-subtitle');
                    const actions = document.getElementById('modal-admin-actions');
                    if (rdv) {
                        subtitle.innerHTML =
                            '<p><strong>Client :</strong> ' + rdv.client + '</p>' +
                            '<p><strong>Message :</strong><br>' + rdv.message + '</p>';
                        actions.style.display = 'none';
                    } else {
                        subtitle.innerHTML = '<p>Créneau libre : <strong>' + dateStr + '</strong> à <strong>' + heure + '</strong></p>';
                        actions.style.display = 'block';
                    }
                    document.getElementById('modal-creneau').setAttribute('open', true);
                };
                grid.appendChild(div);
            });
        });
    } catch(e) {
        console.error('Erreur calendrier:', e);
    }
}

function getLundiSemaine(offset) {
    var d = new Date();
    var jour = d.getDay();
    var diff = (jour === 0) ? -6 : 1 - jour;
    d.setDate(d.getDate() + diff + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function changerSemaine(dir) {
    offsetSemaine += dir;
    construireCalendrier();
}

document.addEventListener('DOMContentLoaded', construireCalendrier);