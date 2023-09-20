const carLeasingStep3 = {};

carLeasingStep3.cards = async ({ pageState }) => {
  if (pageState.identityOcrGetUrlTime && pageState.prevPageState?.identityOcrGetUrlTime !== pageState.identityOcrGetUrlTime) {
    const { identificationId, identificationUrl } = await wsGet(`/api/script/runs/pages/commonPageModules?identityOcrGetUrl=true`);
    pageState.identificationId = identificationId;
    pageState.identificationUrl = identificationUrl;
    window.open(identificationUrl);

    if (!pageState.identityOcrInterval) {
      pageState.identityOcrInterval = setInterval(async () => {
        const identityOcrResults =
          (await wsGet(`/api/script/runs/pages/commonPageModules?identityOcrGetResults=true&identificationId=${pageState.identificationId}`)) || {};
        const {
          personBirthDate, // YYYY-MM-DD
          personFirstName,
          personLastName,
          idDocFront,
          idDocBack,
          livenessFaceImage,
        } = identityOcrResults;

        if (personFirstName && personLastName) {
          pageState.person.birthDate = personBirthDate;
          pageState.person.firstName = personFirstName;
          pageState.person.lastName = personLastName;
          pageState.documents.idDocFront = !!idDocFront;
          pageState.documents.idDocBack = !!idDocBack;
          pageState.documents.livenessFaceImage = !!livenessFaceImage;
          if (idDocFront) sessionStorage.setItem("documents.idDocFront", idDocFront);
          if (idDocBack) sessionStorage.setItem("documents.idDocBack", idDocBack);
          if (livenessFaceImage) sessionStorage.setItem("documents.livenessFaceImage", livenessFaceImage);
          clearInterval(pageState.identityOcrInterval);
          res.render({ state: pageState });
        }
      }, 5000);
    }
  }

  const housingTypeList = [
    {
      value: "owner",
      label: "Owner",
    },
    {
      value: "tenant",
      label: "Tenant",
    },
    {
      value: "hostedByParent",
      label: "Hosted by parent",
    },
    {
      value: "hostedByThirdParty",
      label: "Hosted by third party",
    },
  ];

  const familyMaritalStatus = [
    {
      value: "single",
      label: "Single",
    },
    {
      value: "pacs",
      label: "Civil contract",
    },
    {
      value: "marriedLife",
      label: "Married life",
    },
    {
      value: "married",
      label: "Married",
    },
    {
      value: "separated",
      label: "Separated",
    },
    {
      value: "divorced",
      label: "Divorced",
    },
    {
      value: "widow",
      label: "Widow",
    },
  ];

  return [
    {
      card: "Layout",
      props: {
        noCard: true,
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Your identity</h4>` },
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
                `<h5 class="mt-0 mb-05 font-weight-bold">Intelligent identification</h5>` +
                `<div>` +
                `You can now start an identity recognition process that will check and collect your ID document. Doing so will allow your application to be processed faster. It will automatically fill in the form and attach it to your application file.` +
                `</div>`,
            },
          },
          [
            {
              buttonProps: {
                label: "Start ID check with our partner",
                colProps: { xs: 12 },
                pullRight: false,
                pageState: { ...pageState, identityOcrGetUrlTime: Date.now() },
              },
            },
          ],
          {
            type: "Html",
            props: {
              hidden: !pageState.documents.idDocFront && !pageState.documents.idDocBack && !pageState.documents.livenessFaceImage,
              html:
                `<div class="mt-1">` +
                Object.keys(pageState.documents)
                  .map(docKey => {
                    if (pageState.documents[docKey]) {
                      return (
                        `<div class="img-preview">` +
                        `<i class="fa icon-times delete-img-btn" data-doc-key="${docKey}" onclickhandler="deleteDocument"></i>` +
                        `<img src="${sessionStorage.getItem(`documents.${docKey}`)}" />` +
                        `</div>`
                      );
                    }
                  })
                  .join("") +
                `</div>`,
              onClickHandlers: {
                deleteDocument: ({ pageState, event }) => {
                  const docKey = event.target.getAttribute("data-doc-key");
                  delete pageState.documents[docKey];
                  sessionStorage.removeItem(`documents.${docKey}`);
                  return { documents: pageState.documents };
                },
              },
            },
          },
          {
            type: "Html",
            props: { html: `<div class="section-break"></div>` },
          },
          [
            {
              formInputProps: {
                field: "person.title",
                label: "Civility",
                select: "personTitle",
                hideClear: true,
                colProps: { xs: 12, sm: 6 },
              },
            },
          ],
          [
            {
              formInputProps: {
                field: "person.firstName",
                label: "First name",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.lastName",
                label: "Last name",
                colProps: { xs: 12 },
              },
            },
          ],
          [
            {
              formInputProps: {
                field: "person.nationality",
                label: "Nationality",
                select: "country",
                hideClear: true,
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.birthDate",
                label: "Birth date",
                type: "date",
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.family.maritalStatus",
                label: "Marital status",
                select: familyMaritalStatus,
                hideClear: true,
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.family.numberOfDependents",
                label: "Tax household nb. of dependents",
                select: [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }],
                hideClear: true,
                colProps: { xs: 12, sm: 6 },
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
        colProps: { xs: 12, sm: 6 },
        rows: [
          {
            type: "Html",
            props: { html: `<h4 class="section-title">Your housing</h4>` },
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
                colProps: { xs: 12, sm: 6 },
                label: "Housing type",
                field: "person.housingType",
                select: housingTypeList,
                hideClear: true,
              },
            },
            {
              formInputProps: {
                colProps: { xs: 12, sm: 6 },
                label: "Since the",
                field: "person.housingSince",
                type: "date",
              },
            },
          ],
          {
            type: "Html",
            props: {
              html: `<div>` + `We need a proof of housing. From which supplier can we pick it up ?` + `</div>`,
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
                type: "address",
                field: "person.mainAddress.addressLine",
                label: "Address line",
                colProps: { xs: 12 },
              },
            },
            {
              formInputProps: {
                field: "person.mainAddress.city",
                label: "City",
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.mainAddress.division",
                label: "Division",
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.mainAddress.zipcode",
                label: "Zipcode",
                colProps: { xs: 12, sm: 6 },
              },
            },
            {
              formInputProps: {
                field: "person.mainAddress.country",
                label: "Country",
                colProps: { xs: 12, sm: 6 },
                select: "country",
                hideClear: true,
              },
            },
          ],
        ],
      },
    },
  ];
};
