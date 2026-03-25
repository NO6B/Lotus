var dataOccupes = {};

async function chargerDonnees() {
    const response = await fetch('/api/creneaux-occupes');
    dataOccupes = await response.json();
    construireSelecteurJours();
}

function construireSelecteurJours() {
    const dayList = document.getElementById('day-list');
    if (!dayList) return;
    dayList.innerHTML = '';

    // On regroupe les créneaux 'disponible' par date
    const joursDisponibles = {};
    Object.keys(dataOccupes).forEach(cle => {
        if (dataOccupes[cle].statut === 'disponible') {
            const date = cle.split('_')[0];
            if (!joursDisponibles[date]) joursDisponibles[date] = [];
            joursDisponibles[date].push(cle.split('_')[1]);
        }
    });

    const dates = Object.keys(joursDisponibles).sort();

    if (dates.length === 0) {
        dayList.innerHTML = '<p class="no-slots">Aucun créneau disponible pour le moment.</p>';
        return;
    }

    dates.forEach(dateStr => {
        const d = new Date(dateStr);
        const btn = document.createElement('button');
        btn.className = 'day-pill outline secondary';
        btn.innerHTML = `<strong>${d.toLocaleDateString('fr-FR', {weekday: 'short'})}</strong><span>${d.getDate()} ${d.toLocaleDateString('fr-FR', {month: 'short'})}</span>`;
        
        btn.onclick = function() {
            document.querySelectorAll('.day-pill').forEach(b => b.classList.add('outline'));
            btn.classList.remove('outline');
            afficherHeures(dateStr, joursDisponibles[dateStr]);
        };
        dayList.appendChild(btn);
    });
}

function afficherHeures(dateStr, heures) {
    const timeContainer = document.getElementById('time-selector-container');
    const timeGrid = document.getElementById('time-grid');
    const formSection = document.getElementById('client-info-section');
    
    timeContainer.style.display = 'block';
    formSection.classList.remove('visible');
    timeGrid.innerHTML = '';

    heures.sort().forEach(h => {
        const btn = document.createElement('button');
        btn.className = 'time-pill outline secondary';
        btn.textContent = h;
        
        btn.onclick = function() {
            document.querySelectorAll('.time-pill').forEach(b => b.classList.add('outline'));
            btn.classList.remove('outline');
            
            document.getElementById('date').value = dateStr;
            document.getElementById('heure').value = h;
            document.getElementById('selection-display').innerHTML = `Rendez-vous le <strong>${new Date(dateStr).toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}</strong> à <strong>${h}</strong>`;
            formSection.classList.add('visible');
        };
        timeGrid.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', chargerDonnees);