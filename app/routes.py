from flask import Blueprint, render_template
from model import RendezVous, Message, Admin, Client

bp = Blueprint("main", __name__)

@bp.route('/admin/dashboard')
@admin_requis
def dashboard():
    rdv_en_attente = RendezVous.query.filter_by(statut='en_attente').order_by(RendezVous.date_heure).all()
    
    rdv_confirmes = RendezVous.query.filter_by(statut='confirme').order_by(RendezVous.date_heure).all()

    tous_les_clients = Client.query.all()

    return render_template(
        'index.html', 
        rdv_en_attente=rdv_en_attente, 
        rdv_confirmes=rdv_confirmes,
        clients=tous_les_clients
    )