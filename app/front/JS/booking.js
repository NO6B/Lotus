var dataCreneaux = {};
var offsetSemaine = 0;
var selectedDate = '';
var selectedHeure = '';

async function chargerDonnees() {
  const response = await fetch('/api/creneaux-occupes');
  dataCreneaux = await response.json();
  construireSelecteurSemaine();
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

function construireSelecteurSemaine() {
  const dayList = document.getElementById('day-list');
  const weekLabel = document.getElementById('week-label');
  if (!dayList) return;
  dayList.innerHTML = '';

  const lundi = getLundiSemaine(offsetSemaine);
  const dimanche = new Date(lundi);
  dimanche.setDate(dimanche.getDate() + 6);

  // Label de la semaine
  const opts = { day: 'numeric', month: 'long' };
  if (weekLabel) {
    weekLabel.textContent =
      lundi.toLocaleDateString('fr-FR', opts) + ' – ' +
      dimanche.toLocaleDateString('fr-FR', opts);
  }

  // Construire les 7 jours
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  let hasSlots = false;

  for (var i = 0; i < 7; i++) {
    var d = new Date(lundi);
    d.setDate(d.getDate() + i);
    const dateStr = formatDate(d);

    // Trouver les créneaux disponibles pour ce jour
    const heuresDispo = Object.keys(dataCreneaux)
      .filter(k => k.startsWith(dateStr + '_') && dataCreneaux[k].statut === 'disponible')
      .map(k => k.split('_')[1])
      .sort();

    if (heuresDispo.length === 0) continue;
    hasSlots = true;

    const btn = document.createElement('button');
    btn.className = 'day-pill outline secondary';
    btn.innerHTML =
      '<strong>' + JOURS[i] + '</strong>' +
      '<span>' + d.getDate() + ' ' + d.toLocaleDateString('fr-FR', { month: 'short' }) + '</span>' +
      '<em>' + heuresDispo.length + ' dispo</em>';

    btn.dataset.date = dateStr;
    btn.dataset.heures = JSON.stringify(heuresDispo);

    btn.onclick = function () {
      document.querySelectorAll('.day-pill').forEach(b => b.classList.add('outline'));
      this.classList.remove('outline');
      afficherHeures(this.dataset.date, JSON.parse(this.dataset.heures));
    };

    dayList.appendChild(btn);
  }

  if (!hasSlots) {
    dayList.innerHTML = '<p class="no-slots">Aucun créneau disponible cette semaine.</p>';
  }

  // Reset sélection heure si on change de semaine
  const timeContainer = document.getElementById('time-selector-container');
  const formSection = document.getElementById('client-info-section');
  if (timeContainer) timeContainer.style.display = 'none';
  if (formSection) formSection.classList.remove('visible');
}

function afficherHeures(dateStr, heures) {
  selectedDate = dateStr;
  const timeContainer = document.getElementById('time-selector-container');
  const timeGrid = document.getElementById('time-grid');
  const formSection = document.getElementById('client-info-section');

  timeContainer.style.display = 'block';
  formSection.classList.remove('visible');
  timeGrid.innerHTML = '';

  heures.forEach(function (h) {
    const btn = document.createElement('button');
    btn.className = 'time-pill outline secondary';
    btn.textContent = h;

    btn.onclick = function () {
      document.querySelectorAll('.time-pill').forEach(b => b.classList.add('outline'));
      this.classList.remove('outline');
      selectedHeure = h;

      document.getElementById('date').value = dateStr;
      document.getElementById('heure').value = h;

      const dateObj = new Date(dateStr);
      document.getElementById('selection-display').innerHTML =
        'Rendez-vous le <strong>' +
        dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) +
        '</strong> à <strong>' + h + '</strong>';

      formSection.classList.add('visible');
    };

    timeGrid.appendChild(btn);
  });
}

function changerSemaineClient(dir) {
  // Empêcher de naviguer dans le passé
  if (offsetSemaine + dir < 0) return;
  offsetSemaine += dir;
  construireSelecteurSemaine();
}

document.addEventListener('DOMContentLoaded', chargerDonnees);