const commonPageHandler = {};

commonPageHandler.execute = function (req, options) {
  const { body: pageState = {}, query } = req;
  const { step = "1" } = query;
  const baseLink = getUrlPathname();

  const {
    mainColor,
    mainColorHover,
    firstStep,
    lastStep,
    steps,
    logoHeight,
    logoUrl,
    stepperType,
    pitchTitle,
    pitchText,
    pitchNotice,
    footerText,
    hideNextButton,
    disableNextButton,
  } = options || {};

  let currentStep = parseInt(step);
  const linkToCurrent = `${baseLink}?step=${currentStep}`;
  const linkToBack = `${baseLink}?step=${currentStep - 1}`;
  const linkToNext = `${baseLink}?step=${currentStep + 1}`;

  const parameters = {
    currentStep,
    lastStep,
    linkToCurrent,
    linkToBack,
    linkToNext,
  };

  function getStepper() {
    let stepperHtml = "";

    if (!stepperType || stepperType === "none") return stepperHtml;

    for (let i = 1; i < lastStep + 1; i++) {
      const isPreviousStep = i < currentStep;
      const isCurrentStep = i === currentStep;

      if (stepperType === "tabs") {
        stepperHtml += `<div class="stepper-step"
          ${!isCurrentStep && `href="${baseLink}?step=${i}"`}
          ${isPreviousStep && "data-is-previous-step=true"}
          ${isCurrentStep && "data-is-current-step=true"}>${i}. ${steps[i - 1]}</div>`;
      }

      if (stepperType === "dots") {
        stepperHtml +=
          `<div class="stepper-step"
          ${!isCurrentStep && `href="${baseLink}?step=${i}"`}
          ${isPreviousStep && "data-is-previous-step=true"}
          ${isCurrentStep && "data-is-current-step=true"}>` +
          `<div class="stepper-step-name">` +
          `<div>${i}</div>` +
          `<div class="stepper-dot-wrapper">` +
          `<div class="stepper-dot"></div>` +
          `<div class="stepper-line"></div>` +
          `</div>` +
          `<div>${steps[i - 1]}</div>` +
          `</div>` +
          `</div>`;
      }

      if (stepperType === "dots-condensed") {
        stepperHtml += `<div class="stepper-step"
          ${!isCurrentStep && `href="${baseLink}?step=${i}"`}
          ${isPreviousStep && "data-is-previous-step=true"}
          ${isCurrentStep && "data-is-current-step=true"}></div>`;
      }
    }

    return `<div class="mt-theme stepper" data-stepper-type=${stepperType} style="--nb-of-steps:${lastStep}">` + stepperHtml + `</div>`;
  }

  function getHeaderCards() {
    return [
      {
        card: "Content",
        props: {
          colProps: { xs: 12 },
          noCard: true,
          content: {
            type: "html",
            props: {
              html:
                `<div class="page-header">` +
                `<div><img class="logo-brand" style="height: ${logoHeight}; content: url(${logoUrl})"></div>` +
                (pitchTitle ? `<h1 class="mt-theme mb-theme font-weight-bold">${pitchTitle}</h1>` : "") +
                (pitchText ? `<h4 class="mt-0 mb-theme">${pitchText}</h4>` : "") +
                (pitchNotice ? `<div class="pitch-notice mb-theme pd-05">${pitchNotice}</div>` : "") +
                getStepper() +
                `</div>`,
            },
          },
        },
      },
    ];
  }

  function getFooterCards() {
    if (!footerText) return [];

    return [
      {
        card: "Content",
        props: {
          colProps: { xs: 12 },
          noCard: true,
          content: {
            type: "html",
            props: {
              html: `<div class="footer color-gray-dark">${footerText}</div>`,
            },
          },
        },
      },
    ];
  }

  function getButtons({ parameters }) {
    return [
      {
        className: "back-button btn-simple",
        label: "Retour",
        pullRight: false,
        fill: false,
        hidden: currentStep === firstStep,
        linkTo: parameters.linkToBack,
      },
      {
        className: "forward-button",
        label: "Valider",
        pullRight: false,
        linkTo: parameters.linkToNext,
        hidden: hideNextButton || parameters.currentStep === parameters.lastStep,
        disabled: disableNextButton,
      },
    ];
  }

  function getNavButtonsCard() {
    if (!firstStep || !lastStep || firstStep === lastStep) return {};
    return {
      card: "Content",
      props: {
        colProps: { xs: 12, className: "nav-buttons" },
        noCard: true,
        content: {
          type: "form",
          props: {
            buttons: getButtons({ parameters }),
          },
        },
      },
    };
  }

  function getTopInlineStyle() {
    const topInlineStyle = {};
    if (mainColor) topInlineStyle["--primary-color"] = mainColor;
    if (mainColorHover) topInlineStyle["--primary-states-color"] = mainColorHover;
    return topInlineStyle;
  }

  const genericSettings = {
    parameters,
    state: pageState,
    headerCards: getHeaderCards(),
    footerCards: getFooterCards(),
    navButtonsCard: getNavButtonsCard(),
    cssFile: `pages/commonPageStyles`,
    topInlineStyle: getTopInlineStyle(),
  };

  return genericSettings;
};
