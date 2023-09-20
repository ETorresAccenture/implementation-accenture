const language = req.user.locale?.split("-")[0] || "en";


let strings 

if (language === "fr") {
   strings = {
    "Force status": "Forcer statut",
    "Create customer space": "Créer l'espace client",
    "Missing person email": "Email de la personne manquant",
    "Missing person first name": "Prénom de la personne manquant",
    "Missing person last name": "Nom de famille de la personne manquant",
    "Customer space already created": "Espace client déjà créé",
    "Customer space created": "Espace client créé",
    "Pay in several times": "Payer en plusieurs fois",
    "Could not send email to the customer": "L'envoi d'email au client a échoué",
    Photocopier: "Photocopieur",
    Softwares: "Logiciels",
    "Home page": "Accueil",
    "My news": "Mes actus",
    Advisor: "Conseiller",
    Requests: "Opérations",
    "Simulation request": "Demande de simulation",
    "Common requests": "Opérations courantes",
    "Next payment": "Prochaine échéance",

  };

}else if (language === "es") {
  strings = {
    "Force status": "Forcer statut",
    "Create customer space": "Créer l'espace client",
    "Missing person email": "Email de la personne manquant",
    "Missing person first name": "Prénom de la personne manquant",
    "Missing person last name": "Nom de famille de la personne manquant",
    "Customer space already created": "Espace client déjà créé",
    "Customer space created": "Espace client créé",
    "Pay in several times": "Payer en plusieurs fois",
    "Could not send email to the customer": "L'envoi d'email au client a échoué",
    Photocopier: "Photocopieur",
    Softwares: "Logiciels",
    "Home page": "Accueil",
    "My news": "Mes actus",
    Advisor: "Conseiller",
    Requests: "Opérations",
    "Simulation request": "Demande de simulation",
    "Common requests": "Opérations courantes",
    "Next payment": "Prochaine échéance",
    "On line": "Desde internet",
    "By pass agreement ?": "Producto promocional",
    "Limit engagement": "Importe max cartera"
  };

}else if (language === "pt") {
  strings = {
    "Force status": "Forcer statut",
    "Create customer space": "Créer l'espace client",
    "Missing person email": "Email de la personne manquant",
    "Missing person first name": "Prénom de la personne manquant",
    "Missing person last name": "Nom de famille de la personne manquant",
    "Customer space already created": "Espace client déjà créé",
    "Customer space created": "Espace client créé",
    "Pay in several times": "Payer en plusieurs fois",
    "Could not send email to the customer": "L'envoi d'email au client a échoué",
    Photocopier: "Photocopieur",
    Softwares: "Logiciels",
    "Home page": "Accueil",
    "My news": "Mes actus",
    Advisor: "Conseiller",
    Requests: "Opérations",
    "Simulation request": "Demande de simulation",
    "Common requests": "Opérations courantes",
    "Next payment": "Prochaine échéance",
    "On line": "Da internet"
  };

}
 res.json(strings);
