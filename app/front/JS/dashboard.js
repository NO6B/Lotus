var HEURES = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'];
var JOURS_COURTS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
var offsetSemaine = 0;
var selectedDate = '';
var selectedHeure = '';
var currentInfo = null;

async function construireCalendrier() {
  const response = await fetch('/api/creneaux-occupes');
  const data = await response.json();
  const lundi = getLundiSemaine(offsetSemaine);
  const grid = document.getElementById('cal-grid');
  if (!grid) return;

  // Stats
  let nbOccupe = 0, nbLibre = 0;
  Object.values(data).forEach(v => {
    if (v.statut === 'occupe') nbOccupe++;
    else if (v.statut === 'disponible') nbLibre++;
  });
  const total = nbOccupe + nbLibre;
  const statRdv = document.getElementById('stat-rdv');
  const statDispo = document.getElementById('stat-dispo');
  const statTaux = document.getElementById('stat-taux');
  if (statRdv) statRdv.textContent = nbOccupe;
  if (statDispo) statDispo.textContent = nbLibre;
  if (statTaux) statTaux.textContent = total ? Math.round((nbOccupe / total) * 100) + '%' : '—';

  // Mettre à jour le label de semaine
  const dimanche = new Date(lundi);
  dimanche.setDate(dimanche.getDate() + 6);
  const opts = { day: 'numeric', month: 'long' };
  document.getElementById('cal-week-label').textContent =
    lundi.toLocaleDateString('fr-FR', opts) + ' – ' +
    dimanche.toLocaleDateString('fr-FR', opts);

  grid.innerHTML = '';

  // Cellule vide coin haut-gauche
  const corner = document.createElement('div');
  corner.className = 'cal-corner';
  grid.appendChild(corner);

  // En-têtes des jours
  for (var i = 0; i < 7; i++) {
    var d = new Date(lundi);
    d.setDate(d.getDate() + i);
    const isToday = formatDate(d) === formatDate(new Date());

    const header = document.createElement('div');
    header.className = 'cal-day-header' + (isToday ? ' today' : '');
    header.innerHTML =
      '<span class="day-name">' + JOURS_COURTS[i] + '</span>' +
      '<span class="day-num">' + d.getDate() + '</span>';
    grid.appendChild(header);
  }

  // Lignes horaires
  HEURES.forEach(function (h) {
    const timeLabel = document.createElement('div');
    timeLabel.className = 'cal-time-label';
    timeLabel.textContent = h;
    grid.appendChild(timeLabel);

    for (var i = 0; i < 7; i++) {
      var d = new Date(lundi);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const cle = dateStr + '_' + h;
      const info = data[cle];

      const cell = document.createElement('div');

      if (!info) {
        cell.className = 'cal-slot ferme';
        cell.innerHTML = '<span class="slot-icon">—</span>';
      } else if (info.statut === 'occupe') {
        cell.className = 'cal-slot occupe';
        // Indicateur message si présent
        const msgIcon = info.message ? '<span class="slot-msg-icon" title="Message joint"></span>' : '';
        cell.innerHTML =
          '<span class="slot-icon">●</span>' +
          '<span class="slot-name">' + (info.client || '') + '</span>' +
          msgIcon;
      } else {
        cell.className = 'cal-slot libre';
        cell.innerHTML = '<span class="slot-icon">◆</span><span class="slot-label">Ouvert</span>';
      }

      (function (ds, hs, inf) {
        cell.onclick = function () {
          selectedDate = ds;
          selectedHeure = hs;
          currentInfo = inf;
          ouvrirModal(ds, hs, inf);
        };
      })(dateStr, h, info);

      grid.appendChild(cell);
    }
  });
}

function ouvrirModal(dateStr, heure, info) {
  const modal = document.getElementById('modal-creneau');
  const subtitle = document.getElementById('modal-subtitle');
  const footer = document.getElementById('modal-admin-actions');
  const title = document.getElementById('modal-title');

  const dateObj = new Date(dateStr);
  const dateFormatee = dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  title.textContent = dateFormatee + ' · ' + heure;

  if (info && info.statut === 'occupe') {
    // Bloc téléphone
    const telHtml = info.tel
      ? '<div class="modal-info-row"><span class="modal-info-icon"></span><a href="tel:' + info.tel + '" class="modal-tel">' + info.tel + '</a></div>'
      : '<div class="modal-info-row"><span class="modal-info-icon"></span><span class="modal-info-empty">Non renseigné</span></div>';

    // Bloc message
    const msgHtml = info.message
      ? '<div class="modal-message-block"><div class="modal-message-label">Message du client: </div><p class="modal-message-content">' + escapeHtml(info.message) + '</p></div>'
      : '';

    subtitle.innerHTML =
      '<div class="modal-status occupe">' +
        '<span class="status-dot"></span>Créneau réservé' +
      '</div>' +
      '<div class="modal-client-card">' +
        '<div class="modal-client-name">' + escapeHtml(info.prenom) + ' ' + escapeHtml(info.nom) + '</div>' +
        '<div class="modal-info-row"><span class="modal-info-icon"></span><span class="modal-info-text">' + escapeHtml(info.mail || '') + '</span></div>' +
        telHtml +
      '</div>' +
      msgHtml;

    footer.innerHTML =
      '<button class="modal-btn danger" onclick="actionCreneau(\'fermer\')">Annuler le rendez-vous</button>';

  } else if (info && info.statut === 'disponible') {
    subtitle.innerHTML =
      '<div class="modal-status libre">' +
        '<span class="status-dot"></span>Créneau ouvert aux réservations' +
      '</div>';
    footer.innerHTML =
      '<button class="modal-btn secondary" onclick="actionCreneau(\'fermer\')">Retirer ce créneau</button>';
  } else {
    subtitle.innerHTML =
      '<div class="modal-status ferme">' +
        '<span class="status-dot"></span>Créneau fermé' +
      '</div>' +
      '<p class="modal-hint">Ouvrez ce créneau pour permettre les réservations.</p>';
    footer.innerHTML =
      '<button class="modal-btn primary" onclick="actionCreneau(\'ouvrir\')">Ouvrir ce créneau</button>';
  }

  modal.classList.add('open');
}

// Sécurité : échapper le HTML pour éviter les injections
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fermerModal() {
  document.getElementById('modal-creneau').classList.remove('open');
}

async function actionCreneau(action) {
  const resp = await fetch('/api/admin/creneau/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: selectedDate, heure: selectedHeure, action: action })
  });
  if (resp.ok) {
    fermerModal();
    construireCalendrier();
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