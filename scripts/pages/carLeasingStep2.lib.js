const carLeasingStep2 = {};

carLeasingStep2.cards = async ({ pageState }) => {
  if (pageState.person.email) {
    pageState.personEmailIsValid = validationRegExps.emailRegExp.test(pageState.person.email);
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
            props: { html: `<h4 class="section-title">Our proposal</h4>` },
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
          {
            type: "Html",
            props: {
              html:
                `<div class="font-2 text-center color-primary mb-theme">` +
                `<div>` +
                `${formatCurrency(pageState.selectedQuotation?.financedAmount)} over ${pageState.selectedQuotation?.durationInMonths} months` +
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
                formGroupClassName: "mb-05",
                field: "person.email",
                value: pageState.person.email,
                label: "Email address",
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
        ],
      },
    },
  ];
};
