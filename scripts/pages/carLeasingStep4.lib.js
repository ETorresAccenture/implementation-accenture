const carLeasingStep4 = {};

carLeasingStep4.cards = async ({ pageState }) => {
  const periodicityList = [
    {
      value: "month",
      label: "Month",
    },
    {
      value: "trimester",
      label: "Trimester",
    },
    {
      value: "semester",
      label: "Semester",
    },
    {
      value: "year",
      label: "Year",
    },
  ];

  const incomeTypeList = [
    {
      value: "salary",
      label: "Salary",
    },
    {
      value: "allowance",
      label: "Allowance",
    },
    {
      value: "pension",
      label: "Pension",
    },
    {
      value: "rent",
      label: "Rent",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  const spendingTypeList = [
    {
      value: "rent",
      label: "Rent",
    },
    {
      value: "pension",
      label: "Pension",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  const loanTypeList = [
    {
      value: "realEstate",
      label: "Real estate",
    },
    {
      value: "vehicle",
      label: "Vehicle",
    },
    {
      value: "consumption",
      label: "Consumption",
    },
    {
      value: "other",
      label: "Other",
    },
  ];

  const professionalCategories = [
    {
      value: "managersIntellectualProfessionsPrivate",
      label: "Executives and intellectual professions in the public sector",
    },
    {
      value: "managersIntellectualProfessionsPublic",
      label: "Managers and intellectual professions in the public sector",
    },
    {
      value: "employeesPrivate",
      label: "Private sector employees",
    },
    {
      value: "employeesPublic",
      label: "Public servants and employees",
    },
    {
      value: "retirees",
      label: "Retirees",
    },
    {
      value: "liberalProfessions",
      label: "Liberal professions",
    },
    {
      value: "liberalProfessionsMedical",
      label: "Liberal medical professions",
    },
    {
      value: "companyChiefs",
      label: "CEOs",
    },
    {
      value: "independantProfessions",
      label: "Independent professions",
    },
    {
      value: "tradersAndLike",
      label: "Traders and assimilated",
    },
    {
      value: "craftsmen",
      label: "Artisans",
    },
    {
      value: "farmerOperators",
      label: "Farmer operators",
    },
    {
      value: "workers",
      label: "Workers, foremen, supervisors in the private sector",
    },
    {
      value: "pupilsStudentsApprentices",
      label: "Pupils, students, apprentices",
    },
    {
      value: "otherPeopleWithoutProfessionalActivity",
      label: "Other people without professionalActivity",
    },
    {
      value: "unemployed",
      label: "Unemployed",
    },
  ];

  const contractTypes = [
    {
      value: "CDI",
      label: "Open-ended contract",
    },
    {
      value: "CDD",
      label: "Fixed-term / Interim contract",
    },
    {
      value: "intermittent",
      label: "Intermittent",
    },
    {
      value: "contractNewEmployement",
      label: "New hire contract",
    },
    {
      value: "contractant",
      label: "Contractual",
    },
    {
      value: "temporary",
      label: "Temporary",
    },
  ];

  const occupationCategory1 = [
    "managersIntellectualProfessionsPrivate",
    "managersIntellectualProfessionsPublic",
    "employeesPrivate",
    "employeesPublic",
    "workers",
  ].includes(pageState.person.occupation?.csp);

  const occupationCategory2 = [
    "liberalProfessions",
    "liberalProfessionsMedical",
    "companyChiefs",
    "independantProfessions",
    "tradersAndLike",
    "craftsmen",
    "farmerOperators",
  ].includes(pageState.person.occupation?.csp);

  const occupationCategory3 = ["retirees", "unemployed", "pupilsStudentsApprentices", "otherPeopleWithoutProfessionalActivity"].includes(
    pageState.person.occupation?.csp,
  );

  if (!pageState.person.income) {
    pageState.person.income = [
      {
        amount: null,
        type: incomeTypeList[0].value,
        periodicity: periodicityList[0].value,
      },
    ];
  }

  return [
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 5 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Your income and expenses</h4>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 7 },
        rows: [
          {
            type: "Html",
            props: {
              html:
                `<h5 class="mt-0 mb-05 font-weight-bold">Bank connection</h5>` +
                `<div>` +
                `Instead of manually entering your finances, we can find them automatically through a connection to your bank accounts. ` +
                `Access is completly secure and for one-time use : we will not be able to access your accounts later.` +
                `</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Connect to your bank accounts",
                colProps: { xs: 12 },
                pullRight: false,
                pageState: { ...pageState, bankConnectionGetUrlTime: Date.now() },
              },
            },
          ],
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          {
            type: "Html",
            props: {
              html:
                `<h5 class="mt-0 mb-05 font-weight-bold">Analysis of bank statements</h5>` +
                `<div>` +
                `We will need to know your current and savings bank statements to analyse your application. ` +
                `You can also upload them now and we will automatically find your income and expenses if you do not want to connect your bank accounts.` +
                `</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Upload bank statements",
                colProps: { xs: 12 },
                pullRight: false,
                pageState: { ...pageState, bankStatementsClickTime: Date.now() },
              },
            },
          ],
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          {
            type: "Html",
            props: {
              html: `<h5 class="mt-0 mb-05 font-weight-bold">Income</h5>`,
            },
          },
          {
            type: "Table",
            props: {
              className: "table-compact",
              filter: false,
              columns: [
                { title: `Amount`, name: "amount", type: "currency", className: "w-30" },
                { title: `Type`, name: "type", select: incomeTypeList, formInputProps: { hideClear: true }, className: "w-30" },
                { title: `Periodicity`, name: "periodicity", select: periodicityList, formInputProps: { hideClear: true }, className: "w-35" },
                { name: "actions" },
              ],
              actions: [
                {
                  tooltip: "Delete income",
                  bsStyle: "danger",
                  icon: "icon-times",
                  disabled: () => (pageState.person.income?.length || 0) < 2,
                  onClick: ({ pageState, rowIndex }) => {
                    pageState.person.income.splice(rowIndex, 1);
                    return { person: pageState.person };
                  },
                },
              ],
              data: pageState.person.income,
              onRowChange: ({ pageState, rowIndex, patch }) => {
                const patchKey = Object.keys(patch)[0];
                pageState.person.income[rowIndex][patchKey] = patch[patchKey];
                return { person: pageState.person };
              },
            },
          },
          [
            {
              buttonProps: {
                label: "Add income",
                colProps: { xs: 12 },
                pullRight: false,
                onClick: ({ pageState }) => {
                  pageState.person.income.push({
                    amount: null,
                    type: incomeTypeList[0].value,
                    periodicity: periodicityList[0].value,
                  });
                  return { pageState };
                },
              },
            },
          ],
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          {
            type: "Html",
            props: {
              html: `<h5 class="mt-0 mb-05 font-weight-bold">Spendings</h5>`,
            },
          },
          {
            type: "Table",
            props: {
              className: "table-compact",
              filter: false,
              hidden: !pageState.person.spendings || pageState.person.spendings.length === 0,
              columns: [
                { title: `Amount`, name: "amount", type: "currency", className: "w-30" },
                { title: `Type`, name: "type", select: spendingTypeList, formInputProps: { hideClear: true }, className: "w-30" },
                { title: `Periodicity`, name: "periodicity", select: periodicityList, formInputProps: { hideClear: true }, className: "w-35" },
                { name: "actions" },
              ],
              actions: [
                {
                  tooltip: "Delete spending",
                  bsStyle: "danger",
                  icon: "icon-times",
                  onClick: ({ pageState, rowIndex }) => {
                    pageState.person.spendings.splice(rowIndex, 1);
                    return { person: pageState.person };
                  },
                },
              ],
              data: pageState.person.spendings,
              onRowChange: ({ pageState, rowIndex, patch }) => {
                const patchKey = Object.keys(patch)[0];
                pageState.person.spendings[rowIndex][patchKey] = patch[patchKey];
                return { person: pageState.person };
              },
            },
          },
          [
            {
              buttonProps: {
                label: "Add spending",
                colProps: { xs: 12 },
                pullRight: false,
                onClick: ({ pageState }) => {
                  if (!pageState.person.spendings) pageState.person.spendings = [];
                  pageState.person.spendings.push({
                    amount: null,
                    type: spendingTypeList[0].value,
                    periodicity: periodicityList[0].value,
                  });
                  return { pageState };
                },
              },
            },
          ],
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          {
            type: "Html",
            props: {
              html: `<h5 class="mt-0 mb-05 font-weight-bold">Loans</h5>`,
            },
          },
          {
            type: "Table",
            props: {
              className: "table-compact",
              filter: false,
              hidden: !pageState.person.loans || pageState.person.loans.length === 0,
              columns: [
                { title: `Remaining amount`, name: "remainingAmount", type: "currency", className: "w-25" },
                { title: `Monthly repayment`, name: "monthlyRepayment", type: "currency", className: "w-25" },
                { title: `Type`, name: "type", select: loanTypeList, formInputProps: { hideClear: true }, className: "w-25" },
                { title: `End date`, name: "endDate", type: "date", className: "w-20" },
                { name: "actions" },
              ],
              actions: [
                {
                  tooltip: "Delete loan",
                  bsStyle: "danger",
                  icon: "icon-times",
                  onClick: ({ pageState, rowIndex }) => {
                    pageState.person.loans.splice(rowIndex, 1);
                    return { person: pageState.person };
                  },
                },
              ],
              data: pageState.person.loans,
              onRowChange: ({ pageState, rowIndex, patch }) => {
                const patchKey = Object.keys(patch)[0];
                pageState.person.loans[rowIndex][patchKey] = patch[patchKey];
                return { person: pageState.person };
              },
            },
          },
          [
            {
              buttonProps: {
                label: "Add loan",
                colProps: { xs: 12 },
                pullRight: false,
                onClick: ({ pageState }) => {
                  if (!pageState.person.loans) pageState.person.loans = [];
                  pageState.person.loans.push({
                    remainingAmount: null,
                    monthlyRepayment: null,
                    type: loanTypeList[0].value,
                  });
                  return { pageState };
                },
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
        rows: [
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 5 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Your occupation</h4>` },
          },
        ],
      },
    },
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 7 },
        rows: [
          {
            type: "Html",
            props: {
              html:
                `<div>` +
                `Your application must include proof of resources. If you have dematerialized payslips we can collect them directly from your supplier.` +
                `</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Connect to a provider",
                colProps: { xs: 12 },
                pullRight: false,
                pageState: { ...pageState, bankConnectionGetUrlTime: Date.now() },
              },
            },
          ],
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          [
            {
              formInputProps: {
                field: "person.occupation.csp",
                label: "Socio-professional category",
                select: professionalCategories,
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.occupation.employer",
                label: "Name of your employer",
                hidden: !occupationCategory1,
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.occupation.employmentSector",
                label: "Employment sector",
                hidden: !occupationCategory1,
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.occupation.jobDescription",
                label: "Job description",
                hidden: !occupationCategory1,
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.occupation.isSelfEmployed",
                label: "Are you self-employed ?",
                hidden: !occupationCategory2,
                colProps: { xs: 12, sm: 6 },
                type: "checkbox",
              },
            },
            {
              formInputProps: {
                field: "person.occupation.jobActivity",
                label: "Activity",
                hidden: !occupationCategory2,
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                modelPath: "company",
                obj: "company",
                type: "personRegistration",
                hidden: !occupationCategory2,
                person: { ...pageState.company },
                label: "Company registration number",
                placeholder: "Company registration number",
                colProps: { xs: 12 },
                allowDuplicates: true,
              },
            },
            {
              formInputProps: {
                field: "person.occupation.employmentStartDate",
                label: "Activity start date",
                hidden: !pageState.person.occupation?.csp || occupationCategory3,
                colProps: { xs: 12, sm: 6 },
                type: "date",
              },
            },
            {
              formInputProps: {
                field: "person.occupation.employmentContractType",
                label: "Contract type",
                hidden: !occupationCategory1,
                colProps: { xs: 12, sm: 6 },
                select: contractTypes,
              },
            },
            {
              formInputProps: {
                field: "person.resources.remaingSavingsAfterLoan",
                label: "Remaing savings after loan",
                colProps: { xs: 12 },
                hidden: !occupationCategory3,
                type: "currency",
              },
            },
          ],
        ],
      },
    },
  ];
};
