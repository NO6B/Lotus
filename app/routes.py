import os
import threading
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, session, current_app
from datetime import datetime
from .model import RendezVous, Message, Client, Creneau
from .email_service import envoyer_confirmation_rdv
from app import db, mail

bp = Blueprint("main", __name__)


def admin_requis(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect(url_for('main.admin_login'))
        return f(*args, **kwargs)
    return decorated


def envoyer_mail_async(app, mail, prenom, email, date_heure):
    """Lance l'envoi du mail dans un thread avec le contexte Flask."""
    with app.app_context():
        envoyer_confirmation_rdv(mail, prenom, email, date_heure)


@bp.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        mail_client = request.form.get('mail')
        nom = request.form.get('nom')
        prenom = request.form.get('prenom')
        tel = request.form.get('tel')
        date_str = request.form.get('date')
        heure_str = request.form.get('heure')
        contenu_message = request.form.get('message')

        if not mail_client or not date_str or not heure_str:
            return redirect(url_for('main.index'))

        client = Client.query.filter_by(mail=mail_client).first()
        if not client:
            client = Client(mail=mail_client, nom=nom, prenom=prenom, tel=tel)
            db.session.add(client)
            db.session.flush()
        else:
            if tel and not client.tel:
                client.tel = tel

        date_heure_obj = datetime.strptime(f"{date_str} {heure_str}", "%Y-%m-%d %H:%M")
        creneau = Creneau.query.filter_by(date_heure=date_heure_obj).first()

        if creneau:
            # Vérifier que le créneau n'est pas déjà pris
            rdv_existant = RendezVous.query.filter_by(creneau_id=creneau.id).first()
            if rdv_existant:
                return redirect(url_for('main.index'))

            rdv = RendezVous(client_id=client.id, creneau_id=creneau.id, statut='en_attente_mail')
            db.session.add(rdv)
            if contenu_message and contenu_message.strip():
                db.session.add(Message(contenu=contenu_message, client_id=client.id))
            db.session.commit()

            # Copie des données avant le thread
            prenom_client = client.prenom
            email_client = client.mail
            date_heure_creneau = creneau.date_heure
            app = current_app._get_current_object()

            # Envoi en arrière-plan avec contexte Flask
            t = threading.Thread(
                target=envoyer_mail_async,
                args=(app, mail, prenom_client, email_client, date_heure_creneau)
            )
            t.daemon = True
            t.start()

        return redirect(url_for('main.index'))
    return render_template('index.html')


@bp.route('/api/creneaux-occupes')
def get_creneaux_occupes():
    creneaux = Creneau.query.all()
    data = {}
    for c in creneaux:
        cle = c.date_heure.strftime('%Y-%m-%d_%H:%M')
        rdv = RendezVous.query.filter_by(creneau_id=c.id).first()
        if rdv:
            dernier_message = Message.query.filter_by(client_id=rdv.client.id)\
                .order_by(Message.date_envoi.desc()).first()
            data[cle] = {
                "statut": "occupe",
                "client": f"{rdv.client.prenom} {rdv.client.nom}",
                "prenom": rdv.client.prenom,
                "nom": rdv.client.nom,
                "mail": rdv.client.mail,
                "tel": rdv.client.tel or "",
                "message": dernier_message.contenu if dernier_message else None
            }
        else:
            data[cle] = {"statut": "disponible"}
    return jsonify(data)


@bp.route('/api/admin/creneau/action', methods=['POST'])
@admin_requis
def admin_creneau_action():
    data = request.json
    date_heure_obj = datetime.strptime(f"{data['date']} {data['heure']}", "%Y-%m-%d %H:%M")
    action = data['action']

    creneau = Creneau.query.filter_by(date_heure=date_heure_obj).first()

    if action == 'fermer':
        if creneau:
            RendezVous.query.filter_by(creneau_id=creneau.id).delete()
            db.session.delete(creneau)
    elif action == 'ouvrir':
        if not creneau:
            creneau = Creneau(date_heure=date_heure_obj, statut='libre')
            db.session.add(creneau)

    db.session.commit()
    return jsonify({"status": "success"})


@bp.route('/admin/dashboard')
@admin_requis
def dashboard():
    return render_template('dashboard.html',
        rdv_en_attente=RendezVous.query.filter_by(statut='en_attente_mail').all(),
        rdv_confirmes=RendezVous.query.filter_by(statut='confirme').all(),
        clients=Client.query.all(),
        messages=Message.query.order_by(Message.date_envoi.desc()).all()
    )


@bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if (username == os.environ.get('ADMIN_USERNAME') and
                password == os.environ.get('ADMIN_PASSWORD')):
            session['admin_logged_in'] = True
            return redirect(url_for('main.dashboard'))
        return render_template('login.html', erreur='Identifiants incorrects')
    return render_template('login.html')


@bp.route('/admin/logout')
def logout():
    session.pop('admin_logged_in', None)
    return redirect(url_for('main.admin_login'))