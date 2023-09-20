const { body: pageState = {} } = req;

const commonPageHandler = await importScripts(`pages/commonPageHandler`);
const genericSettings = commonPageHandler.execute(req, {
  mainColor: "#1E90FF",
  mainColorHover: "#3DAEFF",
  firstStep: 1,
  lastStep: 5,
  steps: ["Votre simulation", "Votre projet", "Informations Personnelles", "Informations Financières", "Notre Proposition"],
  logoUrl: "/imp/standard/hosts/hyperfront/basikon.svg",
  logoHeight: "70px",
  stepperType: "dots",
  pitchTitle: "Demande de crédit en 5 minutes",
  pitchText: "Obtenez une réponse de principe immédiatement",
  pitchNotice:
    "Les informations déclarées doivent être le reflet exact de la réalité, toutes fausses déclarations ou omissions pourront engager votre responsabilité. Nous vous informons que dans le cadre de votre demande de crédit, il sera procédé à une interrogation du Fichier national des Incidents de remboursement des Crédits aux Particuliers (FICP).",
});
const { currentStep } = genericSettings.parameters || {};

let cards = [];

if (currentStep === 1) {
  cards = [
    {
      card: "Content",
      props: {
        colProps: { xs: 12, className: "form-section" },
        noCard: true,
        content: {
          type: "form",
          props: {
            fields: [
              [
                {
                  formInputProps: {
                    obj: "mainAddress",
                    type: "address",
                    value: pageState.mainAddress?.addressLine,
                    label: "Address line",
                    colProps: { xs: 12 },
                  },
                },
              ],
              [
                {
                  formInputProps: {
                    field: "mainAddress.address1",
                    label: "Adresse",
                    hidden: true,
                    colProps: { xs: 12, sm: 6 },
                  },
                },
                {
                  formInputProps: {
                    field: "mainAddress.city",
                    label: "City",
                    colProps: { xs: 12, sm: 6 },
                  },
                },
                {
                  formInputProps: {
                    field: "mainAddress.division",
                    label: "Division",
                    colProps: { xs: 12, sm: 6 },
                  },
                },
                {
                  formInputProps: {
                    field: "mainAddress.zipcode",
                    label: "Zipcode",
                    colProps: { xs: 12, sm: 6 },
                  },
                },
                {
                  formInputProps: {
                    field: "mainAddress.country",
                    label: "Country",
                    colProps: { xs: 12, sm: 6 },
                    select: "country",
                  },
                },
              ],
            ],
          },
        },
      },
    },
  ];
}

res.render({
  ...genericSettings,
  faviconUrl: "https://uat.hyperfront.io/imp/standard/hosts/hyperfront/favicon.ico",
  title: "Basikon - All Loans",
  cards: [...genericSettings.headerCards, ...cards, genericSettings.navButtonsCard],
});
