const {
  body,
  user: { tenant },
} = req;
const {
  checkFieldsToken,
  companyName,
  siren,
  denominationLegale,
  legalForm,
  addressLine,
  address1,
  zipcode,
  city,
  location,
  contactTitle,
  contactFirstName,
  contactLastName,
  contactPosition,
  contactPhone,
  contactEmail,
  contactPreferredMethod,
  contactPreferredDate,
  contactPreferredTimeFrame,
  contactSelectedPurpose,
  contactSelectedSubPurpose,
  contactMessage,
  // contactConsent,
  contactIsHuman,
} = body;

if (!contactEmail) return res.status(400).send("Missing contactEmail");

if (checkFieldsToken) {
  try {
    await wsPost("/api/core/otp/check-fields", { token: checkFieldsToken, email: contactEmail });
  } catch (error) {
    console.log("Invalid checkFieldsToken");
    throw Error("401");
  }
} else {
  throw Error("401");
}

const today = new Date();
const authToken = await genActionAuthorizationToken({ expiresIn: 60, username: `automatic@${tenant}` });
const reqConfig = { headers: { authorization: `Bearer ${authToken}` } };

async function logErrorInExternalData(externalData, error = {}, body, service) {
  await wsPut(
    `/api/external/external-data/${externalData.registration}`,
    {
      ...externalData,
      status: "ERROR",
      resultData: {
        service,
        code: error.code,
        message: error.message,
        stack: error.stack,
        body,
      },
    },
    reqConfig,
  );
}

const externalData = await wsPost(
  "/api/external/external-data",
  {
    provider: "FLOW",
    service: `Become partner request ${siren}`,
    status: "PROCESSING",
    requestData: { ...body, documents: undefined },
  },
  reqConfig,
);

const partnerRegistration = `SIR${siren}`;

let partner;
try {
  partner = await wsGet(`/api/person/persons/${partnerRegistration}`, reqConfig);
} catch (error) {} // eslint-disable-line

if (!partner) {
  partner = {
    type: "C",
    name: denominationLegale,
    legalForm,
    registration: partnerRegistration,
    roles: ["PARTNER"].map(role => ({ role })),
    phone: contactPhone,
    email: contactEmail,
    registrations: [{ type: "SIR", number: siren }],
    addresses: [
      {
        type: "MAIN",
        address1,
        zipcode,
        city,
        country: "FR",
        addressLine,
        location,
      },
    ],
    bankAccounts: [],
    contacts: [],
  };

  try {
    partner = await wsPost("/api/person/persons", partner, reqConfig);
  } catch (error) {
    logErrorInExternalData(externalData, error, partner, "POST /api/person/persons");
    throw Error(`400| Impossibble de créer le partenaire ${error}`);
  }
}

let personContactRegistration;
try {
  const personContact = await wsPost(
    `/api/person/persons`,
    {
      type: "I",
      title: contactTitle,
      firstName: contactFirstName,
      lastName: contactLastName,
      phone: contactPhone,
      email: contactEmail,
      roles: [{ role: "MANAGER" }, { role: "SALES" }],
      descendants: [{ relation: "MANAGEROF", personRegistration: partnerRegistration }],
    },
    reqConfig,
  );
  personContactRegistration = personContact.registration;
} catch (error) {
  logErrorInExternalData(externalData, error, `POST /api/person/persons`);
  throw Error(`400|Impossible de créer la personne contact ${error}`);
}

let newAgreement;
try {
  newAgreement = await wsPost(
    `/api/financing/agreements`,
    {
      partnerRegistration: partnerRegistration,
      name: denominationLegale,
      status: "REQUEST",
      persons: [
        { role: "PARTNER", personRegistration: partnerRegistration },
        { role: "MANAGER", personRegistration: personContactRegistration },
      ],
      reasons: [
        { value: "MSG01", label: "Bienvenue dans votre espace Partenaire" },
        { value: "MSG02", label: "Merci de joindre les documents suivants:" },
        { value: "MSGCNIRECTO", label: "CNI Recto du representant légal" },
        { value: "MSGCNIVERSO", label: "CNI VERSO du representant légal" },
        { value: "MSGKBIS", label: "KBIS de moins de 6 mois" },
        { value: "MSGDECLARATION", label: "Imprimer la declaration et attacher là signée" },
      ],
      contactPosition,
      contactPreferredMethod,
      contactPreferredTimeFrame,
      contactMessage,
      contactPreferredDate,
      contactSelectedPurpose,
      contactSelectedSubPurpose,
      contactIsHuman,
      contactVerifiedEmail: true,
    },
    reqConfig,
  );
} catch (error) {
  throw Error(`400|Impossible de créer l'agrément ${error}`);
}

let managerUser;
try {
  managerUser = await wsGet(`/api/core/users/${partner.registration + "_" + contactEmail?.trim()}`, reqConfig);
} catch (error) {} // eslint-disable-line

if (!managerUser) {
  let newManagerUser = {
    username: partner.registration + "_" + contactEmail?.trim(),
    email: contactEmail?.trim(),
    tenant: "demo",
    firstName: contactFirstName,
    lastName: contactLastName,
    profiles: ["SALES", "MANAGER"],
    locale: req.user.locale,
    personRegistration: personContactRegistration,
    partnerRegistration: partner.registration,
  };

  try {
    newManagerUser = await wsPost("/api/core/users", newManagerUser, reqConfig);
  } catch (error) {
    logErrorInExternalData(externalData, error, newManagerUser, "POST /api/core/users");
    throw Error(`400| Impossible de créer l'utilisateur manager du partenaire ${error}`);
  }
} else {
  await wsPost(
    "/api/core/tasks",
    {
      ownerUsername: "partner.manager@demo",
      project: partnerRegistration,
      subject: `Attention  ${partnerRegistration}`,
      profiles: ["PARTNERMANAGER"],
      entityName: "Person",
      entityRegistration: partnerRegistration,
    },
    reqConfig,
  );
}

let partnerManager;
partnerManager = await wsGet(`/api/person/persons/USR00000295`, reqConfig);
partnerManager.descendants.push({ relation: "PARTNERMANAGEROF", personRegistration: partnerRegistration });

try {
  partnerManager = await wsPut(`/api/person/persons/USR00000295`, partnerManager, reqConfig);
} catch (error) {
  logErrorInExternalData(externalData, error, partnerManager, `POST /api/person/persons/USR00000295`);
  throw Error(`400|Impossibble  de mettre a jour le partneraire manager ${error}`);
}

await wsPost(
  "/api/core/tasks",
  {
    ownerUsername: "partner.manager@demo",
    project: partnerRegistration,
    creationDate: today,
    dueDate: contactPreferredDate,
    subject: `Nouveau partenaire potentiel ${partnerRegistration} // ${companyName} à contacter le ${contactPreferredDate || "n/d"} entre ${
      contactPreferredTimeFrame || "n/d"
    }`,
    profiles: ["PARTNERMANAGER"],
    type: "CALL",
    entityName: "Agreement",
    entityRegistration: newAgreement.registration,
  },
  reqConfig,
);

return res.json();
