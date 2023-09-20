const { body: pageState = {}, query } = req;
const { brand = "CREDIT_AGRICOLE", selectedSimulation, step = "1" } = query;
const currentStep = parseInt(step);
const baseLink = getUrlPathname();
const linkToCurrent = `${baseLink}?step=${currentStep}`;

// **** debug zone
pageState.showAllForm = false; // to show all the form without custom errors
pageState.showFormErrors = false; // to show custom errors
pageState.showEndCards = false; // to show the last screen
// console.log(pageState)
// ****

const brands = {
  CREDIT_AGRICOLE: {
    name: "Crédit Agricole",
    mainColor: "#007D8F",
    mainColorHover: "#006675",
    logoUrl:
      "https://www.credit-agricole.fr/content/dam/assetsca/master/public/commun/images/autre/images/NPC-logo_Agir_chaque_jour_CA_H_Desktop-1.svg",
    cgvUrl: "https://www.floabank.fr/images/pdf/CB4X/Conditions-Gnrales-Vente-CB3X-CB4X.pdf",
    websiteUrl: "https://www.floabank.fr/",
    faviconUrl: "https://www.credit-agricole.fr/favicon.ico",
    title: "Crédit Agricole - Application without commitment",
  },
};

if (!pageState.person) pageState.person = {};
if (!pageState.documents) pageState.documents = {};
pageState.selectedSimulation = selectedSimulation;

const currentStepScript = await importScripts(`pages/carLeasingStep${currentStep}`);
// the cards must be computed before calling genericSettings because pageState is mutated
const cards = await currentStepScript?.cards({
  pageState,
  parameters: {
    currentStep,
    linkToCurrent,
  },
});

const commonPageHandler = await importScripts(`pages/commonPageHandler`);
const genericSettings = commonPageHandler.execute(req, {
  mainColor: brands[brand].mainColor,
  mainColorHover: brands[brand].mainColorHover,
  firstStep: 1,
  lastStep: 5,
  logoUrl: brands[brand].logoUrl,
  logoHeight: "130px",
  pitchTitle:
    pageState.submissionIsOver || pageState.showEndCards
      ? `Votre demande a bien été reçue <i class="pe-7s-rocket rocket-icon"></i>`
      : `Application without commitment`,
  pitchText: pageState.submissionIsOver || pageState.showEndCards ? "" : "Get an answer in principle immediately",
  pitchNotice: "A loan commits you and must be repaid. Check your repayment capacity before committing.",
  footerText:
    "For a personal loan of € 7,000 (excluding optional insurance) over 36 months at a fixed APR of 5.21%: 35 monthly payments of € 210.08 and a final one of € 209.86. Total amount due of 7,562.66 €. Fixed borrowing rate of 5.09%. The cost of optional insurance for a borrower is € 12.60 per month, to be added to the monthly payment; i.e. an effective annual insurance rate of 4.20% for death, disability and incapacity guarantees and a total amount due under the insurance over the total term of the loan: € 453.60.",
  disableNextButton:
    ((!currentStep || currentStep === 1) && !pageState.selectedQuotation) ||
    (currentStep === 2 && (!pageState.person.email || !pageState.personEmailIsValid)) ||
    (currentStep === 3 && (!pageState.person.firstName || !pageState.person.lastName)),
});

res.render({
  ...genericSettings,
  title: brands[brand].title,
  faviconUrl: brands[brand].faviconUrl,
  cards: [...genericSettings.headerCards, ...cards, genericSettings.navButtonsCard, ...genericSettings.footerCards],
});
