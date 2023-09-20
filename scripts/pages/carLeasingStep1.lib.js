const carLeasingStep1 = {};

carLeasingStep1.cards = async ({ pageState, parameters }) => {
  const { linkToCurrent } = parameters;
  const isAutoLoan = pageState.projectType === "auto";

  if (!pageState.carBrands) {
    pageState.carBrands = (await wsGet(`/api/script/runs/pages/car-models-catalog?brandsOnly=true`))?.items;
  }

  if (pageState.carBrand && pageState.prevPageState?.carBrand !== pageState.carBrand) {
    delete pageState.carModel;
    delete pageState.selectedCarModel;
    delete pageState.carColor;
    delete pageState.carTyres;
    delete pageState.carPacks;
    delete pageState.carPrice;
    delete pageState.quotations;
  }

  if (pageState.carModel && pageState.prevPageState?.carModel !== pageState.carModel) {
    const carModels = JSON.parse(sessionStorage.getItem("carModels") || []);
    pageState.selectedCarModel = carModels?.find(carModel => carModel.value === pageState.carModel);

    pageState.quotations = (
      (await wsPost("/api/script/runs/pages/carLeasingHandler?runComputations=true&computationType=AUTO", {
        assetCostExclTax: pageState.selectedCarModel?.unitPrice,
      })) || {}
    ).quotations;
  }

  const defaultFinancedAmount = 10000;
  const defaultDuration = 30;
  if (
    !isAutoLoan &&
    (pageState.prevPageState?.projectType !== pageState.projectType ||
      pageState.prevPageState?.financedAmount !== pageState.financedAmount ||
      pageState.prevPageState?.durationInMonths !== pageState.durationInMonths)
  ) {
    pageState.quotations = (
      (await wsPost("/api/script/runs/pages/carLeasingHandler?runComputations=true&computationType=SIMPLE", {
        financedAmount: pageState.financedAmount || defaultFinancedAmount,
        durationInMonths: pageState.durationInMonths || defaultDuration,
      })) || {}
    ).quotations;
    pageState.selectedQuotation = pageState.quotations[0];
  }

  const [selectedSimulationIndex, selectedSimulationJindex] = pageState.selectedSimulation?.split(",") || [];
  if (pageState.carModel) {
    if (pageState.quotations) {
      if (
        pageState.quotations !== pageState.prevPageState?.quotations ||
        selectedSimulationIndex !== pageState.selectedSimulationIndex ||
        pageState.selectedSimulationJindex !== selectedSimulationJindex
      ) {
        pageState.selectedSimulationIndex = selectedSimulationIndex;
        pageState.selectedSimulationJindex = selectedSimulationJindex;

        pageState.multiSimulationsCards = pageState.quotations.map((quotation, index) => {
          return {
            card: "Layout",
            props: {
              noCard: true,
              hidden: !isAutoLoan && !pageState.showAllForm,
              colProps: { xs: 12, sm: 3 },
              rows: [
                {
                  type: "Html",
                  props: {
                    html: quotation.simulation?.simulations?.map(simulation => {
                      return (
                        `<div class="font-weight-bold mb-1">${simulation.label}</div>` +
                        simulation.durations
                          ?.map(({ duration, downPayment, payment }, jndex) => {
                            const isSelected = selectedSimulationIndex === index.toString() && selectedSimulationJindex === jndex.toString();
                            if (isSelected) {
                              pageState.selectedQuotation = {
                                ...quotation,
                                durationInMonths: duration,
                                paymentExclTax: payment,
                              };
                            }
                            return (
                              `<div class="car-simulation-tile pd-05 mb-1 c-pointer" data-is-selected="${isSelected}" href="${linkToCurrent}&selectedSimulation=${index},${jndex}">` +
                              `<div>${duration} months</div>` +
                              `<div>${formatCurrency(payment)} / month</div>` +
                              `<div>Down payment : ${formatCurrency(downPayment || 0)}</div>` +
                              `</div>`
                            );
                          })
                          .join("")
                      );
                    }),
                  },
                },
              ],
            },
          };
        });
      }
    } else {
      pageState.multiSimulationsCards = [];
    }
  }

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
              html: `<h4 class="font-weight-bold text-center mt-0">Your project</h4>`,
            },
          },
          [
            {
              formInputProps: {
                buttonGroupClassName: `btn-group w-100 grid-btn-group text-center`,
                button: true,
                field: "projectType",
                showLabel: false,
                value: pageState.projectType,
                colProps: { xs: 12 },
                select: [
                  {
                    value: "auto",
                    labelHtml: `<i class="fa fa-car"></i> Car loan`,
                  },
                  {
                    value: "moto",
                    labelHtml: `<i class="fa fa-motorcycle"></i> Motorbike loan`,
                  },
                  {
                    value: "autoElectric",
                    labelHtml: `<i class="fa fa-bolt" style="color: #F4CA16"></i> Electric car loan`,
                  },
                  {
                    value: "homeRenovation",
                    labelHtml: `<i class="fa fa-wrench"></i> Home renovation loan`,
                  },
                  {
                    value: "eco",
                    labelHtml: `<i class="fa fa-leaf" style="color: #34C759"></i> Green loan`,
                  },
                  {
                    value: "personalLoan",
                    labelHtml: `<i class="fa fa-user"></i>Personal loan`,
                  },
                  {
                    value: "revolving",
                    labelHtml: `<i class="fa fa-euro" style="color: #003299; text-shadow: 0px 0px 3px white;"></i> Revolving loan`,
                  },
                  {
                    value: "other",
                    labelHtml: `<i class="fa fa-plus-circle"></i> Other loans`,
                  },
                ].map(it => {
                  return { ...it, className: "col-xs-6 col-md-3 br-0" };
                }),
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
        hidden: !pageState.projectType && !pageState.showAllForm,
        rows: [{ type: "Html", props: { html: `<div class="section-break"></div>` } }],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (!isAutoLoan || !pageState.projectType) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Car brand</h4>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (!isAutoLoan || !pageState.projectType) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          [
            {
              formInputProps: {
                buttonGroupClassName: `btn-group w-100 grid-btn-group text-center`,
                button: true,
                field: "carBrand",
                showLabel: false,
                value: pageState.carBrand,
                colProps: { xs: 12 },
                select: pageState.carBrands?.map(carBrand => {
                  return {
                    ...carBrand,
                    labelHtml: `<img src="/imp/accenture/img/car/logo/${carBrand.logo}"> ${carBrand.label}`,
                    className: "col-xs-6 col-md-4 br-0",
                  };
                }),
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
        hidden: (!isAutoLoan || !pageState.projectType || !pageState.carBrand) && !pageState.showAllForm,
        rows: [{ type: "Html", props: { html: `<div class="section-break"></div>` } }],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (!isAutoLoan || !pageState.projectType || !pageState.carBrand) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Configurator</h4>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (!isAutoLoan || !pageState.projectType || !pageState.carBrand) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          [
            {
              formInputProps: {
                field: "carModel",
                label: "Car model",
                colProps: { xs: 12 },
                value: pageState.carModel,
                debounce: true,
                select: query => {
                  return new Promise(resolve => {
                    if (!query || !pageState.carBrand) return;
                    wsGet(`/api/script/runs/pages/car-models-catalog?brand=${pageState.carBrand}&model=${query}`).then(data => {
                      const carModels = data?.items?.[0]?.items;
                      sessionStorage.setItem("carModels", JSON.stringify(carModels));
                      resolve(carModels);
                    });
                  });
                },
              },
            },
          ],
          {
            type: "Html",
            props: {
              hidden: !pageState.selectedCarModel && !pageState.showAllForm,
              html: `<img class="car-model w-100 mb-theme ${pageState.selectedCarModel?.image ? "" : "bg-muted"}" src="/imp/accenture/img/${
                pageState.selectedCarModel?.image || "placeholder-image.png"
              }" />`,
            },
          },
          [
            {
              formInputProps: {
                field: "carColor",
                label: "Color",
                colProps: { xs: 12, sm: 4 },
                hidden: !pageState.selectedCarModel && !pageState.showAllForm,
                value: pageState.carColor,
                select: [
                  {
                    value: "normal",
                    label: "Normal",
                  },
                  {
                    value: "metal",
                    label: "Métal",
                  },
                  {
                    value: "extra",
                    label: "Extra",
                  },
                ],
              },
            },
            {
              formInputProps: {
                field: "carTyres",
                label: "Tyres",
                colProps: { xs: 12, sm: 4 },
                hidden: !pageState.selectedCarModel && !pageState.showAllForm,
                value: pageState.carTyres,
                select: [
                  {
                    value: "normal",
                    label: "Normal",
                  },
                  {
                    value: "ellingto",
                    label: "Ellingto",
                  },
                  {
                    value: "race",
                    label: "Course",
                  },
                ],
              },
            },
            {
              formInputProps: {
                field: "carPacks",
                label: "Packs",
                colProps: { xs: 12, sm: 4 },
                hidden: !pageState.selectedCarModel && !pageState.showAllForm,
                value: pageState.carPacks,
                select: [
                  {
                    value: "connect+",
                    label: "Connect +",
                  },
                  {
                    value: "drive",
                    label: "Drive",
                  },
                  {
                    value: "sport",
                    label: "Sport",
                  },
                ],
              },
            },
            {
              formInputProps: {
                field: "carPrice",
                label: "Price",
                type: "currency",
                colProps: { xs: 12 },
                hidden: !pageState.selectedCarModel && !pageState.showAllForm,
                value: pageState.selectedCarModel?.unitPrice,
                readOnly: true,
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
        hidden: (!isAutoLoan || !pageState.multiSimulationsCards) && !pageState.showAllForm,
        rows: [{ type: "Html", props: { html: `<div class="section-break"></div>` } }],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (!isAutoLoan || !pageState.multiSimulationsCards) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 3 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Multi-simulations</h4>` },
          },
        ],
      },
    },
    ...(pageState.multiSimulationsCards || []),
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (isAutoLoan || !pageState.projectType) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Your simulation</h4>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        hidden: (isAutoLoan || !pageState.projectType) && !pageState.showAllForm,
        colProps: { xs: 12, sm: 6 },
        rows: [
          [
            {
              formInputProps: {
                type: "slider",
                field: "financedAmount",
                label: "Amount to finance",
                value: pageState.financedAmount,
                colProps: { xs: 12 },
                sliderOptions: {
                  start: pageState.financedAmount || defaultFinancedAmount,
                  step: 500,
                  pipsValues: [1000, 5000, 10000, 15000, 20000, 25000],
                  hidePipsValues: {
                    xs: true,
                    sm: true,
                  },
                },
              },
            },
          ],
          [
            {
              formInputProps: {
                type: "slider",
                field: "durationInMonths",
                label: "Duration (in months)",
                value: pageState.durationInMonths,
                colProps: { xs: 12 },
                sliderOptions: {
                  start: pageState.durationInMonths || defaultDuration,
                  step: 6,
                  pipsValues: [12, 18, 24, 30, 36, 42, 48],
                  hidePipsValues: {},
                },
              },
            },
          ],
          {
            type: "Html",
            props: {
              html:
                `<div class="font-2 text-center color-primary">` +
                `<div>` +
                `${formatCurrency(pageState.financedAmount || defaultFinancedAmount)} over ${pageState.durationInMonths || defaultDuration} months` +
                `</div>` +
                `<div class="font-weight-bold">` +
                `${formatCurrency(pageState.selectedQuotation?.paymentExclTax)} / month` +
                `</div>` +
                `</div>`,
            },
          },
          [
            {
              formInputProps: {
                label: "Insurances",
                formGroupClassName: "mt-theme mb-0",
                type: "checkbox",
                field: "insuranceDeathDisabilitySickness",
                value: pageState.insuranceDeathDisabilitySickness,
                placeholder: "Death Disability Sickness (DDS)",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                formGroupClassName: "mb-0",
                type: "checkbox",
                field: "insuranceTotalIrreversibleLossAutonomy",
                value: pageState.insuranceTotalIrreversibleLossAutonomy,
                showLabel: false,
                placeholder: "Total and Irreversible Loss of Autonomy (TILA)",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                formGroupClassName: "mb-0",
                type: "checkbox",
                field: "insuranceJobLoss",
                value: pageState.insuranceJobLoss,
                showLabel: false,
                placeholder: "Job loss",
                colProps: { xs: 12 },
              },
            },
          ],
        ],
      },
    },
  ];
};
