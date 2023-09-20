// compile-to ES5
({
  execute: ( parameters ) => {
    
    let { product } = parameters;
    

    // const isLoan = product.productFamily === "CRD";
    // const isLease = product.productFamily === "ALG";
    const isLoan = product.family === "CRD";
    const isLease = product.family === "ALG";
    const isNew = !product._id;
    //console.log('HHH product-layout   isloan: ' , isLoan)

    const renaultInfo = {
      card: "Layout",
      props: {
        collapse: true,
        noCard: false,
        title: "Renault params",
        rows: [
          [
            {
              formInputProps: { obj: "product", field: "externalReference", label: "Product code" },
              colProps: { xs: 12, md: 3 },
            },
            {
              formInputProps: { obj: "product", field: "startDate", type: "date", label: "Start date", mandatoryState: true },
              colProps: { xs: 12, md: 3 },
            },
            {
              colProps: { xs: 12, md: 3, lg: 3 },
              formInputProps: { obj: "product", field: "authorizedChannels", label: "Multiple liste", select: "channel", multiple: true },
            }
          ],
          [
            {
              formInputProps: { obj: "product", field: "description", label: "Description", type: "textarea", rows: 10, minRows: 3, placeholder: "Describe tu producto" },
              colProps: { xs: 12, md: 6 },
            },
            {
              formInputProps: { obj: "product", field: "limitEngagement", label: "Limit engagement", type: "currency"  },
              colProps: { xs: 12, md: 6 },
            }
          ],
          [
            {
              formInputProps: { obj: "product", field: "alwaysAddToCatalog", label: "By pass agreement ?", type: "checkbox" },
              colProps: { xs: 12, md: 3 },
           }
          ]
        ]
        
      }
    };

    const schemesTableCard = {
        card: "Layout",
        props: {
          noCard: true,
         // hidden: !agreements?.length,
          rows: [
            {
              type: "Table",
              noCard: false,
              props: {
                title: "Schemes",
                filter: true,
                columns: [
                  { title: "Code", name: "code", type: "text" },
                  { title: "Name", name: "name", type: "text" },
                  { title: "Is default", name: "isDefault", type: "checkBox" },
                ],
                data: product.schemes,
                //pageSize: 5
              },
            },
          ],
        },
      
    }

    const schemesCard =  {
      card: "Schemes",
      props: {
        collapse: false,
        hidden: isNew,
        rows: [
          {
            title: "Scheme information",
            collapse: true,
            rows: [
              ["defaultCurrency", "calendarType","minFinancedAmount", "maxFinancedAmount"],
              
            ],
          },
          {
            title: "Scheme information",
            collapse: true,
            rows: [
            [
              { formInputProps: { field: "defaultCurrency", label: "Default Currency", select: ["EUR", "USD", "GBP", "CHF", "QAR", "HKD"], button: true, colProps: { xs: 12 } } },
            ],
            [
              { formInputProps: { field: "calendarType", label: "Calendar", select: "calendar", colProps: { xs: 12, md: 3 } } },
              { formInputProps: { field: "minFinancedAmount", label: "min Financed Amount", type: "currency", colProps: { xs: 12, md: 3 } } },
              { formInputProps: { field: "maxFinancedAmount", label: "max Financed Amount", type: "currency", colProps: { xs: 12, md: 3 } } },
              ],
            ],
          },
          {
            title: loc`Amount`,
            collapse: true,
            rows: [
              ["defaultCurrency","calendarType", "financedAmountBase"],
              ["minFinancedAmount", "maxFinancedAmount"],
              ["showSettlementAmount"],
              ["roundingType"],
            ],
          },
          {
            title: loc`Duration`,
            collapse: true,
            rows: [
              [
                "paymentDayType",
                "selectPaymentDay",
                "paymentDay",
                "defaultPaymentDay",
                "autoSelectPaymentDay",
                "minInstallmentDuration",
              ],
              [ "gracePeriodType"],
              ["frequencies", "defaultFrequency"],
              {
                name: "durations",
                rows: [
                  ["minDuration", "maxDuration", "defaultDuration"],
                  ["selectDurations", "simulationDurations"],
                  ["minGracePeriod", "maxGracePeriod", "selectGracePeriods"],
                ],
              },
            ],
          },
          {
            title: loc`Rate`,
            collapse: true,
            rows: [
              ["rateType", "annualRate", "defaultAnnualRate", "minAnnualRate", "maxAnnualRate", "actuarialRate"],
              ["defaultAdvanceMode", "interestOnPaymentDay", "computeApr"],
              ["indexes", "defaultIndex"],
              ["minFloor", "maxFloor", "defaultFloor"],
              ["minCap", "maxCap", "defaultCap"],
              ["minSpread", "maxSpread", "defaultSpread"],
              ["fixingMethod", "revisionMethod"],
              ["ratesTableDaily", "ratesTableMonthly", "ratesTableQuarterly", "ratesTableSemesterly", "ratesTableAnnually"],
            ],
          },
          {
            title: loc`Asset`,
            collapse: true,
            rows: [
              ["assetCatalog", "showAssetCost", "showPartExchangeCost", "inputPartExchangeCost"],
              ["usages", "usageUnit"],
              [
                "residualValueType",
                "residualValueAmount",
                "residualValueCostBase",
                "residualValueRatio",
                "minResidualValueRatio",
                "maxResidualValueRatio",
                "assetTaxSplit",
                "assetTaxPaidUpfront",
              ],
            ],
          },
          {
            title: loc`Maintenance`,
            collapse: true,
            rows: [["maintenanceType", "maintenanceRatio", "minMaintenanceRatio", "maxMaintenanceRatio"]],
          },
          {
            title: loc`Deposit`,
            collapse: true,
            hidden: isLoan,
            rows: [
              ["depositType", "depositRatio", "minDepositRatio", "maxDepositRatio", "depositInstallmentNumbers", "defaultDepositInstallmentNumber"],
            ],
          },
          {
            title: loc`Interim`,
            collapse: true,
            rows: [["interimType"]],
          },
          {
            title: loc`Down payment`,
            collapse: true,
            hidden: isLease,
            rows: [
              ["downPaymentType", "downPaymentWithPercent"],
              ["minDownPaymentRatio", "maxDownPaymentRatio", "defaultDownPaymentRatio", "minDownPayment", "maxDownPayment", "defaultDownPayment"],
            ],
          }, 
          {
            title: loc`First payment`,
            collapse: true,
            hidden: isLoan,
            rows: [
              ["firstPaymentType", "firstPaymentWithPercent"],
              [
                "minFirstPaymentRatio",
                "maxFirstPaymentRatio",
                "defaultFirstPaymentRatio",
                "firstPaymentOnStartDate",
                "minFirstPayment",
                "maxFirstPayment",
                "defaultFirstPayment",
                "firstPaymentInstallmentNumbers",
                "defaultFirstPaymentInstallmentNumber",
              ],
            ],
          },
          {
            title: loc`Last payment or balloon`,
            collapse: true,
            rows: [
              ["lastPaymentType", "lastPaymentWithPercent"],
              ["minLastPaymentRatio", "maxLastPaymentRatio", "defaultLastPaymentRatio", "minLastPayment", "maxLastPayment", "defaultLastPayment"],
            ],
          },
          {
            name: "elements",
            rows: [
              {
                title: loc`Information`,
                collapse: true,
                rows: [
                  ["type", "code", "name", "pr"],
                  ["occurrenceMode", "occurrenceOffset", "occurrenceOffset2", "paidDuringGracePeriod", "frequency", "duration"],
                  ["editable", "optional", "hidden", "deactivated"],
                ],
              },
              {
                title: loc`Persons`,
                collapse: true,
                rows: [
                  ["payerRole", "payerPerson", "payerIban"],
                  ["payeeRole", "payeePerson", "payeeIban"],
                ],
              },
              {
                title: loc`Invoicing`,
                collapse: true,
                rows: [
                  ["groupKeyInvoiceType", "groupKeyEntity"],
                  ["paymentMode", "paymentCondition"],
                ],
              },
              {
                title: loc`Cost`,
                collapse: true,
                rows: [
                  ["currency"],
                  [
                    "costType",
                    "elementCodeBasis",
                    "costCalculationBasis",
                    "costRatio",
                    "additionalCost",
                    "defaultAmount",
                    "taxInclusive",
                    "costPerYear",
                    "costMinimumOrFixedAmount",
                    "costPerInstallment",
                    "costProductTableCode",
                  ],
                  ["costMaxType", "costMaxCalculationBasis", "costMaxRatio"],
                  ["costTableType", "costRatesTable"],
                ],
              },
              "options",
              {
                title: loc`Taxes`,
                collapse: true,
                rows: [["taxable"], ["taxCode", "principalTaxCode", "interestTaxCode"]],
              },
            ],
          },
        ],
      },
    };


    const cards = [
      { card: "Workflow" },
      { card: "History", props: { collapse: false } },
      { card: "Information", props: { collapse: false } },
      renaultInfo,
      schemesCard,
      schemesTableCard,
      { card: "Catalogs", props: { collapse: false } },
      { card: "AssetServices", props: { collapse: false } },
      // { card: "Schemes", props: { collapse: false } },
      { card: "Persons", props: { collapse: true } },
    ];

    return { cards };
  },
});
