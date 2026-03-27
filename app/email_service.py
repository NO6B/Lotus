from flask_mail import Message

JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']


def envoyer_confirmation_rdv(mail, prenom, email, date_heure):
    """
    Envoie un email de confirmation de rendez-vous au client via Gmail.
    Reçoit des données simples pour éviter les problèmes de session SQLAlchemy dans un thread.
    """
    print(f">>> Tentative envoi mail à : {email}")
    try:
        # Date en français sans dépendance à la locale système
        date_formatee = f"{JOURS[date_heure.weekday()]} {date_heure.day} {MOIS[date_heure.month - 1]} {date_heure.year}"
        heure_formatee = date_heure.strftime('%H:%M')

        msg = Message(
            subject="Confirmation de votre rendez-vous — Lotus",
            recipients=[email]
        )

        msg.body = f"""Bonjour {prenom},

Votre rendez-vous a bien été enregistré.

  Date    : {date_formatee}
  Heure   : {heure_formatee}

En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.

À bientôt,
"""

        msg.html = f"""
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background:#F7F3EC; font-family:'DM Sans', Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow: 0 8px 32px rgba(42,42,42,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background:#2A2A2A; padding: 32px 40px; text-align:center;">
              <p style="margin:0; font-size:28px; font-weight:300; color:#F7F3EC; letter-spacing:0.06em; font-family:Georgia, serif;">
                Lotus
              </p>
              <p style="margin:6px 0 0; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:rgba(247,243,236,0.4);">
                Medecine chinoise
              </p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 40px 40px 32px;">

              <p style="margin:0 0 8px; font-size:13px; letter-spacing:0.15em; text-transform:uppercase; color:#7A9B82;">
                Confirmation
              </p>
              <h1 style="margin:0 0 24px; font-size:26px; font-weight:300; color:#2A2A2A; font-family:Georgia, serif; line-height:1.3;">
                Votre rendez-vous<br>est <em style="color:#7A9B82;">confirmé</em>
              </h1>

              <p style="margin:0 0 24px; font-size:15px; color:#7A7167; line-height:1.7;">
                Bonjour <strong style="color:#2A2A2A;">{prenom}</strong>,<br>
                votre rendez-vous a bien été enregistré.
              </p>

              <!-- CARTE RDV -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC; border-radius:14px; margin-bottom:28px;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-bottom:14px; border-bottom:1px solid rgba(122,155,130,0.2);">
                          <p style="margin:0; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#7A9B82;">Date</p>
                          <p style="margin:4px 0 0; font-size:17px; font-weight:500; color:#2A2A2A;">{date_formatee}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:14px;">
                          <p style="margin:0; font-size:11px; letter-spacing:0.12em; text-transform:uppercase; color:#7A9B82;">Heure</p>
                          <p style="margin:4px 0 0; font-size:17px; font-weight:500; color:#2A2A2A;">{heure_formatee}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0; font-size:13px; color:#7A7167; line-height:1.7; padding:16px 20px; background:rgba(122,155,130,0.07); border-radius:10px; border-left:3px solid #7A9B82;">
                En cas d'empêchement, merci de nous prévenir <strong>au moins 24h à l'avance</strong>.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px; border-top:1px solid rgba(122,155,130,0.15); text-align:center;">
              <p style="margin:0; font-size:13px; color:#7A7167;">
                À bientôt,<br>
                <strong style="color:#2A2A2A; font-family:Georgia, serif; font-size:15px; font-weight:400;">Lotus</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
"""
        mail.send(msg)
        print(f">>> ✅ Mail envoyé avec succès à {email}")

    except Exception as e:
        print(f">>> ❌ ERREUR envoi mail : {type(e).__name__} — {e}")