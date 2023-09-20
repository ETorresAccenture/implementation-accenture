const { body: pageState = {}, query } = req;
const { brand = "BASIKON" } = query;

// **** debug zone
const showAllForm = false; // to show all the form without custom errors
const showFormErrors = false; // to show custom errors
const showEndCards = false; // to show the last screen
// console.log(pageState)
// ****

const brands = {
  BASIKON: {
    name: "Basikon",
    mainColor: "#1E90FF",
    mainColorHover: "#06D0D3",
    logoUrl: "/imp/standard/hosts/hyperfront/basikon.svg",
    cgvUrl: "https://www.basikon.com/en/corporate-responsability",
    websiteUrl: "https://www.basikon.com/",
    faviconUrl: "/imp/standard/hosts/hyperfront/favicon.ico",
    title: "Devenir partenaire de Basikon",
    logoHeight: "80px",
  },
  FLOA: {
    name: "Floa Bank",
    mainColor: "#029FFF",
    mainColorHover: "#02FF87",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Floa_bank_logo.png",
    cgvUrl: "https://www.floabank.fr/images/pdf/CB4X/Conditions-Gnrales-Vente-CB3X-CB4X.pdf",
    websiteUrl: "https://www.floabank.fr/",
    faviconUrl: "https://cdn.floabank.fr/favicon.ico",
    title: "Devenir partenaire de Floa Bank",
    logoHeight: "100px",
  },
  LBP: {
    name: "La Banque Postale",
    mainColor: "#142849",
    mainColorHover: "#E68061",
    logoUrl: "https://siecledigital.fr/wp-content/uploads/2022/03/logo-django-banque-postale-1250x566.png",
    cgvUrl: "https://www.laposte.fr/conditions-generales-de-vente",
    websiteUrl: "https://www.laposte.fr/",
    faviconUrl: "https://www.labanquepostale.com/content/dam/lbp/favicon/LOGO-digital-fd-clair-RVB-blanc-16px.ico",
    title: "Devenir partenaire de La Banque Postale",
    logoHeight: "130px",
  },
};

const renderTime = Date.now();
const commonPageHandler = await importScripts(`pages/commonPageHandler`);
const genericSettings = commonPageHandler.execute(req, {
  mainColor: brands[brand].mainColor,
  mainColorHover: brands[brand].mainColorHover,
  logoUrl: brands[brand].logoUrl,
  logoHeight: brands[brand].logoHeight,
  pitchTitle:
    pageState.submissionIsOver || showEndCards
      ? `Votre demande a bien été reçue <i class="pe-7s-rocket rocket-icon"></i>`
      : `Devenir partenaire de ${brands[brand].name}`,
  pitchText: pageState.submissionIsOver || showEndCards ? "" : "Faites votre demande en 5 minutes !",
});

const sendEmailVerificationThrottleMessage = "Veuillez attendre 10 secondes entre chaque essai.";
const emailVerificationErrorMessage = "Une erreur est survenue, avez-vous saisi le bon code ?";
const formSubmissionErrorMessage = "Une erreur est survenue lors de la soumission des données. Veuillez essayer à nouveau.";
const mandatoryFieldErrorMessage = "Field is mandatory";

function isFormInvalid(pageState) {
  const mandatoryFieldPaths = [
    "contactFirstName",
    "contactLastName",
    "contactPosition",
    "contactSelectedPurpose",
    "contactSelectedSubPurpose",
    "contactConsent",
    "contactIsHuman",
  ];

  let firstMissingModelFieldPath;
  for (const mandatoryFieldPath of mandatoryFieldPaths) {
    const mandatoryFieldValue = pageState[mandatoryFieldPath];
    let isFieldEmpty;
    if (Array.isArray(mandatoryFieldValue) && mandatoryFieldValue.length === 0) isFieldEmpty = true;
    if (typeof mandatoryFieldValue === "string" && mandatoryFieldValue.trim() === "") isFieldEmpty = true;
    if ([null, undefined].includes(mandatoryFieldValue)) isFieldEmpty = true;

    if (isFieldEmpty) {
      if (!firstMissingModelFieldPath) firstMissingModelFieldPath = mandatoryFieldPath;
      pageState[`props_${mandatoryFieldPath}`] = { errorFormat: mandatoryFieldErrorMessage };
    } else {
      pageState[`props_${mandatoryFieldPath}`] = null;
    }
  }

  return firstMissingModelFieldPath;
}

async function getFormCards() {
  const companyRegistration = pageState.company?.registration;
  const companyAddressLine = pageState.company?.addresses?.[0]?.addressLine;
  const prevStatePersonAddressLine = pageState.prevPageState?.company?.addresses?.[0]?.addressLine;

  if (companyAddressLine && companyAddressLine !== prevStatePersonAddressLine) {
    const addressSuggestions = await wsGet(`/api/external/pivot/addresses?search=${companyAddressLine}`);
    pageState.personAddressSuggestion = addressSuggestions?.[0];
  }

  if (pageState.verifyEmailClickTime && pageState.verifyEmailClickTime !== pageState.prevPageState?.verifyEmailClickTime && pageState.contactEmail) {
    // 10 seconds minimum between calls
    if (renderTime - pageState.verifyEmailClickTimeLastAccepted < 10000) {
      pageState.showSendEmailVerificationThrottleMessage = true;
      pageState.isSendingEmailVerification = false;
    } else {
      pageState.verifyEmailClickTimeLastAccepted = renderTime;

      // debug code
      // setTimeout(() => {
      //   res.render({ state: { ...pageState, isSendingEmailVerification: false, showSendEmailVerificationThrottleMessage: false }})
      // }, 1000)

      wsPost("/api/core/otp/new", { email: pageState.contactEmail })
        .then(({ token: emailVerificationToken }) => {
          addNotification({ message: "Email envoyé" });
          res.render({
            state: {
              ...pageState,
              emailVerificationToken,
              isSendingEmailVerification: false,
              showSendEmailVerificationThrottleMessage: false,
            },
          });
        })
        .catch(() => {
          res.render({ state: { ...pageState, isSendingEmailVerification: false } });
        });
    }
  }

  if (
    pageState.validateEmailVerificationCodeClickTime &&
    pageState.validateEmailVerificationCodeClickTime !== pageState.prevPageState?.validateEmailVerificationCodeClickTime &&
    pageState.contactEmail
  ) {
    wsPost("/api/core/otp/verify", { token: pageState.emailVerificationToken, code: pageState.emailVerificationCode })
      .then(({ token: checkFieldsToken }) => {
        res.render({
          state: {
            ...pageState,
            checkFieldsToken,
            emailIsVerified: true,
            isValidatingEmailVerificationCode: false,
            showEmailVerificationError: false,
          },
        });
      })
      .catch(() => {
        addNotification({ message: "Code erroné" });
        res.render({ state: { ...pageState, emailIsVerified: false, isValidatingEmailVerificationCode: false, showEmailVerificationError: true } });
      });
  }

  if (pageState.contactEmail) {
    pageState.contactEmailIsValid = validationRegExps.emailRegExp.test(pageState.contactEmail);
  }

  return [
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: {
              html: `<h4 class="section-title"><i class="fa fa-building-o mr-1"></i> Votre entreprise</h4>`,
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        rows: [
          [
            {
              formInputProps: {
                modelPath: "company",
                obj: "company",
                type: "personRegistration",
                person: { ...pageState.company },
                label: "Indiquez votre SIREN ou nom d'entreprise",
                placeholder: "SIREN",
                colProps: { xs: 12 },
                allowDuplicates: true,
              },
            },
          ],
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        rows: [
          [
            {
              formInputProps: {
                value: pageState.company?.name,
                label: "Nom d'entreprise",
                readOnly: true,
                colProps: { xs: 12 },
                hidden: !companyRegistration && !showAllForm,
              },
            },
            {
              formInputProps: {
                value: companyAddressLine,
                label: "Adresse de l'entreprise",
                readOnly: true,
                colProps: { xs: 12 },
                hidden: !companyAddressLine && !showAllForm,
              },
            },
            {
              formInputProps: {
                value: pageState.company?.company?.creationDate,
                label: "Creation date",
                type: "date",
                readOnly: true,
                colProps: { xs: 12 },
                hidden: !companyRegistration && !showAllForm,
              },
            },
            {
              formInputProps: {
                value: pageState.company?.activityCode,
                label: "Activity code",
                select: "activityCode",
                readOnly: true,
                colProps: { xs: 12 },
                hidden: !companyRegistration && !showAllForm,
              },
            },
            {
              formInputProps: {
                value: pageState.company?.legalForm,
                label: "Legal form",
                select: "legalForm",
                readOnly: true,
                colProps: { xs: 12 },
                hidden: !companyRegistration && !showAllForm,
              },
            },
          ],
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Map",
            props: {
              hidden: (!companyAddressLine || !pageState.personAddressSuggestion?.location) && !showAllForm,
              position: pageState.personAddressSuggestion?.location?.coordinates,
              markers: [
                {
                  location: pageState.personAddressSuggestion?.location,
                  address: pageState.personAddressSuggestion?.addressLine,
                },
              ],
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12 },
        hidden: !companyRegistration && !showAllForm,
        rows: [
          {
            type: "Html",
            props: {
              html: `<div class="section-break"></div>`,
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        hidden: !companyRegistration && !showAllForm,
        rows: [
          {
            type: "Html",
            props: {
              html: `<h4 class="section-title"><i class="fa fa-id-card-o mr-1"></i> Votre identité</h4>`,
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        hidden: !companyRegistration && !showAllForm,
        rows: [
          [
            {
              formInputProps: {
                field: "contactTitle",
                label: "Civilité",
                select: "personTitle",
                colProps: { xs: 12, sm: 4 },
              },
            },
          ],
          [
            {
              formInputProps: {
                field: "contactFirstName",
                label: "Prénom",
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "contactLastName",
                label: "Nom de famille",
                colProps: { xs: 12, sm: 6 },
              },
            },
          ],
          [
            {
              formInputProps: {
                field: "contactPosition",
                label: "Votre rôle dans l'entreprise",
                colProps: { xs: 12 },
                select: [
                  {
                    value: "majorityShareholderCompanyManager",
                    label: "Gérant majoritaire",
                  },
                  {
                    value: "minorityShareholderCompanyManager",
                    label: "Gérant minoritaire",
                  },
                  {
                    value: "equalShareholderCompanyManager",
                    label: "Gérant égal",
                  },
                  {
                    value: "employee",
                    label: "Salarié",
                  },
                  {
                    value: "simpleAssociate",
                    label: "Simple associé",
                  },
                ],
              },
            },
            {
              formInputProps: {
                field: "contactPhone",
                label: "Téléphone",
                type: "phone",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                formGroupClassName: "mb-05",
                field: "contactEmail",
                label: "Adresse e-mail",
                type: "email",
                colProps: { xs: 12 },
              },
            },
          ],
          {
            type: "Html",
            props: {
              html: `<div>Cette adresse email doit être valide car elle sera utilisée pour le suivi de votre dossier et pour vous contacter.</div>`,
            },
          },
          {
            type: "Html",
            props: {
              hidden: !pageState.showSendEmailVerificationThrottleMessage && !showFormErrors,
              html: `<div class="validation-error mt-05">${sendEmailVerificationThrottleMessage}</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Vérification d'email",
                colProps: { xs: 12 },
                hidden: (!pageState.contactEmail || !pageState.contactEmailIsValid) && !showAllForm,
                pageState: { ...pageState, verifyEmailClickTime: Date.now(), isSendingEmailVerification: true },
                className: "w-100 mb-theme",
                loading: pageState.isSendingEmailVerification,
                disabled: !pageState.contactEmail || !pageState.contactEmailIsValid,
              },
            },
          ],
          [
            {
              formInputProps: {
                formGroupClassName: "mb-05",
                field: "emailVerificationCode",
                label: "Code de vérification",
                colProps: { xs: 12 },
                hidden: (!pageState.contactEmail || !pageState.contactEmailIsValid) && !showAllForm,
                disabled: !pageState.verifyEmailClickTime,
              },
            },
          ],
          {
            type: "Html",
            props: {
              hidden: (!pageState.contactEmail || !pageState.contactEmailIsValid) && !showAllForm,
              html: `<div>Si vous ne recevez pas le code vous pouvez en demander un nouveau avec le bouton précédent 10 secondes après chaque demande.</div>`,
            },
          },
          {
            type: "Html",
            props: {
              hidden: !pageState.showEmailVerificationError && !showFormErrors,
              html: `<div class="validation-error mt-05">${emailVerificationErrorMessage}</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Valider le code",
                colProps: { xs: 12 },
                hidden: (!pageState.contactEmail || !pageState.contactEmailIsValid) && !showAllForm,
                pageState: { ...pageState, validateEmailVerificationCodeClickTime: Date.now(), isValidatingEmailVerificationCode: true },
                className: "w-100 mb-theme",
                loading: pageState.isValidatingEmailVerificationCode,
                disabled: !pageState.emailVerificationCode,
              },
            },
          ],
          [
            {
              formInputProps: {
                field: "contactPreferredMethod",
                label: "Mode de contact préféré",
                colProps: { xs: 12 },
                hidden: !pageState.emailIsVerified && !showAllForm,
                select: [
                  {
                    value: "phone",
                    label: "Téléphone",
                  },
                  {
                    value: "email",
                    label: "Email",
                  },
                ],
              },
            },
            {
              formInputProps: {
                field: "contactPreferredDate",
                label: "Vous souhaitez être rappelé le",
                type: "date",
                colProps: { xs: 12, sm: 6 },
                hidden: (!pageState.emailIsVerified || pageState.contactPreferredMethod !== "phone") && !showAllForm,
              },
            },
            {
              formInputProps: {
                field: "contactPreferredTimeFrame",
                label: "Tranche horaire",
                colProps: { xs: 12, sm: 6 },
                hidden: (!pageState.emailIsVerified || pageState.contactPreferredMethod !== "phone") && !showAllForm,
                select: [
                  {
                    value: "8-10",
                    label: "8h - 10h",
                  },
                  {
                    value: "10-12",
                    label: "10h - 12h",
                  },
                  {
                    value: "14-16",
                    label: "14h - 16h",
                  },
                  {
                    value: "16-18",
                    label: "16h - 18h",
                  },
                ],
              },
            },
          ],
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12 },
        hidden: !pageState.contactPreferredMethod && !showAllForm,
        rows: [
          {
            type: "Html",
            props: {
              html: `<div class="section-break"></div>`,
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        hidden: (!companyRegistration || !pageState.contactPreferredMethod) && !showAllForm,
        rows: [
          {
            type: "Html",
            props: {
              html: `<h4 class="section-title"><i class="fa fa-line-chart mr-1"></i> Votre projet</h4>`,
            },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        hidden: (!companyRegistration || !pageState.contactPreferredMethod) && !showAllForm,
        rows: [
          [
            {
              formInputProps: {
                field: "contactSelectedPurpose",
                label: "Secteur d'activité",
                select: [
                  {
                    value: "homeAppliance",
                    label: "Electro-ménager",
                  },
                  {
                    value: "consumerElectronics",
                    label: "Electronique grand public",
                  },
                  {
                    value: "electricalGadgets",
                    label: "Gadgets électriques",
                  },
                  {
                    value: "majorConstructionProjects",
                    label: "Chaîne de magasins",
                  },
                ],
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "contactSelectedSubPurpose",
                label: "Products",
                multiple: true,
                select: [
                  {
                    value: "paymentIn3Times",
                    label: "Paiement en 3 fois sans frais",
                  },
                  {
                    value: "paymentInNTimes",
                    label: "Paiement en N fois",
                  },
                  {
                    value: "floaPay",
                    label: "Floa pay",
                  },
                  {
                    value: "traditionalFinancing",
                    label: "Financement classique",
                  },
                ],
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "contactMessage",
                label: "Nous laisser un message (facultatif)",
                colProps: { xs: 12 },
                type: "textarea",
              },
            },
          ],
          {
            type: "Html",
            props: {
              html: `<div class="mb-05"><a class="link" target="_blank" href="${brands[brand].cgvUrl}">Conditions Générales de Vente (CGV) <i class="fa fa-external-link"></i></a></div>`,
            },
          },
          [
            {
              formInputProps: {
                formGroupClassName: "mb-0",
                type: "checkbox",
                field: "contactConsent",
                showLabel: false,
                placeholder: "En cochant cette case je reconnais avoir lu les CGU.",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                formGroupClassName: "mb-0",
                type: "checkbox",
                field: "contactIsHuman",
                showLabel: false,
                placeholder: "En cochant cette case je reconnais être un humain.",
                colProps: { xs: 12 },
              },
            },
          ],
          {
            type: "Html",
            props: {
              hidden: !pageState.showSubmissingError && !showFormErrors,
              html: `<div class="validation-error mt-05">${formSubmissionErrorMessage}</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Send",
                colProps: { xs: 12 },
                disabled: !pageState.contactConsent || !pageState.contactIsHuman,
                className: "w-100",
                loading: pageState.isSubmittingForm,
                onClick: async ({ pageState }) => {
                  const firstMissingModelFieldPath = isFormInvalid(pageState);
                  if (firstMissingModelFieldPath) {
                    scrollToModelField(firstMissingModelFieldPath);
                    pageState.isSubmittingForm = false;
                    return { pageState };
                  }

                  await res.render({ state: { ...pageState, isSubmittingForm: true } });

                  const { name: companyName, legalForm, addresses } = pageState.company;
                  const { addressLine, address1, zipcode, city } = addresses?.[0] || {};
                  const { location } = pageState.personAddressSuggestion;
                  const {
                    checkFieldsToken,
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
                    contactConsent,
                    contactIsHuman,
                  } = pageState;

                  try {
                    await wsPost("/api/script/runs/pages/becomePartnerHandler", {
                      checkFieldsToken,
                      companyName,
                      siren: companyRegistration.substring(3),
                      denominationLegale: companyName,
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
                      contactConsent,
                      contactIsHuman,
                    });
                    pageState.isSubmittingForm = false;
                    pageState.submissionIsOver = true;
                    pageState.showSubmissingError = false;
                    return { pageState };
                  } catch (error) {
                    pageState.isSubmittingForm = false;
                    pageState.showSubmissingError = true;
                    return { pageState };
                  }
                },
              },
            },
          ],
        ],
      },
    },
  ];
}

function getEndCards() {
  return [
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12 },
        rows: [
          {
            type: "Html",
            props: {
              html:
                `<div class="pitch-end">` +
                `<div class="mb-theme">Nous allons étudier votre dossier attentivement. Nous vous avons envoyé un email pour vous permettre d'accéder à votre espace personnel et suivre votre demande. Sous 48h, nous vous informerons de l'état de votre dossier.</div>` +
                `<div class="mb-theme">Toute l'équipe de ${brands[brand].name} vous remercie pour votre attention</div>` +
                `<a href="${brands[brand].websiteUrl}" target="_blank">${brands[brand].websiteUrl}</a>` +
                `</div>`,
            },
          },
        ],
      },
    },
  ];
}

const cards = pageState.submissionIsOver || showEndCards ? getEndCards() : await getFormCards();
if (!cards) return;

res.render({
  ...genericSettings,
  title: brands[brand].title,
  faviconUrl: brands[brand].faviconUrl,
  cards: [...genericSettings.headerCards, ...cards, genericSettings.navButtonsCard],
});
