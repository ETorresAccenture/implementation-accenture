const commonPageHandler = await importScripts(`pages/commonPageHandler`);
const genericSettings = commonPageHandler.execute(req, {
  mainColor: "#C5003E",
  mainColorHover: "#FF3C7A",
  firstStep: 1,
  lastStep: 3,
  steps: ["Diagnostic", "Nos conseils", "Prendre un rendez-vous"],
  logoHeight: "50px",
  logoUrl: "https://www.amplifon.com/content/dam/amplifon-emea/global/Icons/amplifon-logo@3x.png",
  stepperType: "tabs",
  pitchTitle: "Diagnostic auditif rapide",
  pitchText: "Obtenez une réponse personnalisée à votre diagnostic",
});

res.render({
  ...genericSettings,
  title: "Amplifon - Auto Diagnostic Personnel",
  faviconUrl: "https://www.amplifon.com/etc/designs/amplifonsite/amplifon-emea/clientlib-amplifon-emea/img/amplifon/favicon.ico",
  cards: [...genericSettings.headerCards, genericSettings.navButtonsCard],
});
