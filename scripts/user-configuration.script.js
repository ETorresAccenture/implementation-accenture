const {
  user: { isMainAdmin, partnerRegistration, ...user },
} = req;
const profiles = user.originalProfiles || user.profiles;

// const isSalesAdmin = profiles.includes("SALESADMIN");
const isPartner = profiles && profiles.length === 1 && profiles[0] === "PARTNER";
// const isFunder = profiles.includes("FUNDER");
const isSales = profiles.includes("SALES");
const isClient = profiles && profiles.length === 1 && profiles[0] === "CLIENT";
// const isAPI = profiles.includes("API");
const isPartnerManager = profiles.includes("PARTNERMANAGER");
const isBO = profiles.includes("BO");
// const isMO = profiles.includes("MO");
// const isRisk = profiles.includes("RISK");
// const isAudit = profiles.includes("AUDITOR");
// const hasRenew = profiles.includes("RENEW");
const isManager = profiles.includes("MANAGER");

const isNotDevOrProd = !envIsDevelopment() && !envIsProduction();

const config = {
  defaultValues: {
    crif: {
      service: "report",
      type: "CREDIT_CHECK_BUSINESS",
      identifierType: "CH_UID",
      personRegistration: "CHE191694187",
    },
    ellisphere: {
      service: "report-order",
      personRegistration: "SIR542035753",
    },
  },
  consoleMessages: {
    // showAxiosInterceptors: false,
    showLocalScriptLog: true,
    // showLocalScriptError: true,
    // showContractLayout: false,
    showContractComputation: true,
    // showContractAssetsSubcatalogs: false,
    // showEntityWorkflowTransitions: false,
    showFirebaseLog: isNotDevOrProd,
    // showOfflineLog: false,
    showPersonsQuickAddRelations: true,
    // showEligibility: true
  },
};

if (isPartnerManager) config.landingPage = "/content/dashboard-int-partners";
else if (isClient) config.landingPage = "/content/dashboard-customer";
else if (isPartner) config.landingPage = "/content/dashboard-sales";
else if (isManager) config.landingPage = "/content/wsl-dashboard";
else if (isSales) config.landingPage = "/content/dashboard-sales";
else if (isMainAdmin) config.landingPage = "/documentation";
else config.landingPage = "/content/dashboard-main";

if (isPartnerManager) {
  config.title = "Basikon Financial Services";
  config.menus = [
    {
      path: "/contracts",
      name: "Contracts",
      icon: "pe-7s-wallet",
    },
    {
      path: "/contract?type=LC1",
      name: "Software",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=LC2",
      name: "Staged lease",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=LC3",
      name: "Multi-asset",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=LC4",
      name: "Multi-simulation",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=EQP&financialProduct=ONEOL&financialScheme=ONE",
      name: "Equipment",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=AU1&financialProduct=AUTOLOAN",
      name: "Auto",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract?type=MIC",
      name: "Micro-contract",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/contract",
      name: "Contract",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/agreements",
      name: "Agreements",
      icon: "pe-7s-shopbag",
      profiles: ["PARTNERMANAGER"],
    },
    {
      path: "/persons",
      name: "Persons",
      icon: "pe-7s-users",
      profiles: ["PARTNERMANAGER"],
    },
    {
      path: "/invoices",
      name: "Invoices",
      icon: "pe-7s-culture",
      profiles: ["PARTNERMANAGER"],
    },
    {
      path: "/cashflows",
      name: "Cashflows",
      icon: "pe-7s-culture",
      profiles: ["PARTNERMANAGER"],
    },
  ];
} else if (isClient) {
  config.title = "Basikon Financial Services";
  config.menus = [
    {
      path: "/content/dashboard-customer",
      name: "Home page",
      icon: "pe-7s-home",
    },
    {
      // for now use communcations rather
      // than notifications entity for demo
      // notifications have been temprarily disabled
      path: "/communications",
      name: "My news",
      icon: "pe-7s-bell",
    },
    /*
    // for now diasble advisor (chat) menu
    // feature not complitely available
    {
      path: "/advisor",
      name: "Advisor",
      icon: "pe-7s-chat",
    },
    */
    {
      path: "/requests",
      name: "Common requests",
      icon: "pe-7s-magic-wand",
    },
    {
      path: "/credit-lines",
      name: "Credit lines",
      icon: "pe-7s-wallet",
    },
    {
      path: "/bank-accounts",
      name: "Bank accounts",
      icon: "pe-7s-credit",
    },
  ];
} else if (isPartner) {
  config.title = "LC1 Partner";
  config.menus = [
    {
      path: "/contracts",
      name: "Contracts",
      icon: "pe-7s-wallet",
    },
    {
      path: "/contract?type=GRT",
      name: "New guarantee",
      icon: "pe-7s-umbrella",
    },
  ];

  if (partnerRegistration) {
    config.menus.push({
      path: "/catalog/products-catalog-agreement",
      name: "Products",
    });
  }
} else if (isManager) {
  // user sophie.stique@basikon.io
  config.title = "LC1 partner";
  config.menus = [
    {
      path: "/content/wsl-dashboard",
      name: "Accueil",
      icon: "pe-7s-home",
    },
    {
      path: "/credit-lines",
      name: "Credit lines",
      icon: "pe-7s-wallet",
      profiles: ["SALES"],
    },
    {
      path: "/contracts",
      name: "Contracts",
      icon: "pe-7s-wallet",
      profiles: ["SALES"],
    },
    {
      path: "/requests",
      name: "Requests",
      icon: "pe-7s-magic-wand",
      profiles: ["SALES"],
    },
    {
      path: "/contract?type=GRT",
      name: "New guarantee",
      icon: "pe-7s-umbrella",
      profiles: ["SALES"],
    },
    {
      path: "/users",
      name: "Users",
      icon: "pe-7s-users",
    },
  ];

  if (partnerRegistration) {
    config.menus.push({
      path: "/catalog/products-catalog-agreement",
      name: "Products",
    });
  }
} else if (isSales) {
  // load agreement if any
  let agreement;
  try {
    if (partnerRegistration) agreement = await wsGet(`/api/financing/agreements/current-for-person/${partnerRegistration}`);
  } catch (error) {} // eslint-disable-line

  config.agreement = agreement;
  if (agreement?.registration === "AGR00000001") {
    // Partner Inc (Fred Voyage)
    config.title = "Partner Inc";
    config.menus = [
      {
        path: "/contracts",
        name: "Contracts",
        icon: "pe-7s-wallet",
      },
      {
        path: "/contract?type=LC1",
        name: "Software",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC2",
        name: "Staged lease",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC3",
        name: "Multi-asset",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC4",
        name: "Multi-simulation",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=EQP&financialProduct=ONEOL&financialScheme=ONE",
        name: "Equipment",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=AU1&financialProduct=AUTOLOAN",
        name: "Auto",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=MIC",
        name: "Micro-contract",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract",
        name: "Contract",
        icon: "pe-7s-magic-wand",
      },
    ];
  } else if (agreement?.registration === "AGR00000002") {
    // BMW (Gérard Manvussa)
    config.title = "BMW partner";
    config.menus = [
      {
        path: "/contracts",
        name: "Contracts",
        icon: "pe-7s-wallet",
      },
      {
        path: "/contract?type=AU1&financialProduct=AUTOLOAN",
        name: "Single car",
        icon: "pe-7s-car",
      },
      {
        path: "/contract?financialProduct=HP",
        name: "Fleet",
        icon: "fa fa-industry",
      },
    ];
  } else {
    // no partner (sales1@test)
    config.title = "Basikon Financial Services";
    config.menus = [
      {
        path: "/contracts",
        name: "Contracts",
        icon: "pe-7s-wallet",
      },
      {
        path: "/contract?type=LC1",
        name: "Software",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC2",
        name: "Staged lease",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC3",
        name: "Multi-asset",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=LC4",
        name: "Multi-simulation",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=EQP&financialProduct=ONEOL&financialScheme=ONE",
        name: "Equipment",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=AU1&financialProduct=AUTOLOAN",
        name: "Auto",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract?type=MIC",
        name: "Micro-contract",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/contract",
        name: "Contract",
        icon: "pe-7s-magic-wand",
      },
      {
        path: "/agreements",
        name: "Agreements",
        icon: "pe-7s-shopbag",
        profiles: ["PARTNERMANAGER"],
      },
      {
        path: "/persons",
        name: "Persons",
        icon: "pe-7s-users",
        profiles: ["PARTNERMANAGER"],
      },
      {
        path: "/invoices",
        name: "Invoices",
        icon: "pe-7s-culture",
        profiles: ["PARTNERMANAGER"],
      },
      {
        path: "/cashflows",
        name: "Cashflows",
        icon: "pe-7s-culture",
        profiles: ["PARTNERMANAGER"],
      },
    ];
  }
} else {
  config.menus = [
    {
      name: "Financing",
      icon: "pe-7s-wallet",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/contracts",
          name: "Contracts",
        },
        {
          path: "/assets",
          name: "Assets",
        },
        {
          path: "/credit-lines",
          name: "Credit lines",
        },
        {
          path: "/amendments",
          name: "Amendments",
        },
        {
          path: "/funds",
          name: "Funds",
        },
        {
          path: "/contract-lots",
          name: "Contract lots",
        },
        {
          path: "/deals",
          name: "Deals",
        },
      ],
    },
    {
      name: "New contracts",
      icon: "pe-7s-magic-wand",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO"],
      menus: [
        {
          path: "/contract",
          name: "Contract",
        },
        {
          path: "/contract?financialProduct=LOAN&financialScheme=FS1&clientType=I",
          name: "Asset backed loan",
        },
        {
          path: "/contract?type=FIN&financialProduct=PLOAN&financialScheme=FS3&clientType=I",
          name: "Personal loan",
        },
        {
          path: "/contract?type=FIN&financialProduct=XLOAN&financialScheme=X03&clientType=I",
          name: "Payment in X times",
        },
        {
          path: "/contract?type=MLO&financialProduct=DRWREV&financialScheme=WITHREVOLVING&clientType=I",
          name: "Miniloan + revolving",
        },
        {
          path: "/contract?type=MIC",
          name: "Micro-contract",
        },
        {
          path: "/contract?type=LC1",
          name: "Software",
        },
        {
          path: "/contract?type=LC2",
          name: "Staged lease",
        },
        {
          path: "/contract?type=LC3",
          name: "Multi-asset",
        },
        {
          path: "/contract?type=LC4",
          name: "Multi-simulation",
        },
        {
          path: "/contract?type=AU1&financialProduct=AUTOLOAN",
          name: "Automobile",
        },
        {
          path: "/contract?type=EQP&financialProduct=ONEOL&financialScheme=ONE",
          name: "Equipment",
        },
        {
          path: "/contract?type=RE1&financialScheme=MORTGAGE1&financialProduct=MORTGAGE&clientType=C&assetType=OFFICE",
          name: "Office real estate",
        },
        {
          path: "/contract?type=RE1&financialScheme=MORTGAGE1&financialProduct=MORTGAGE&clientType=I&assetType=RESIDENTIAL",
          name: "Residential real estate",
        },
        {
          path: "/contract?type=GRT",
          name: "Guarantee",
        },
        {
          path: "/contract?type=FCT&financialProduct=INFINE&clientType=C",
          name: "Factoring",
        },
        {
          path: "/deal",
          name: "Deal",
        },
        // {
        // path: "/deal?contractType=FIN&financialProducts=PCP,HPA&financialProduct=PCP&clientType=I&assetState=NEW&assetSourceCatalog=assets-catalog",
        // name: "MultiQuote offer IRL",
        // },
      ],
    },
    {
      name: "Billing",
      icon: "pe-7s-news-paper",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        { path: "/invoices", name: "Invoices" },
        { path: "/cashflows", name: "Cashflows" },
        { path: "/content/dashboard-int-unpaid", name: "Unpaid" },
        { path: "/sepas", name: "Sepas" },
        { path: "/camts", name: "Camts" },
        { path: "/cases", name: "Collections" },
        { path: "/payment-files", name: "Payment files" },
        {
          path: "/endowments",
          name: "Endowments",
        },
      ],
    },
    {
      name: "Accounting",
      icon: "pe-7s-calculator",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/content/dashboard-accounting-events",
          name: "Events",
        },
        {
          path: "/content/dashboard-accounting-postings",
          name: "Postings",
        },
        {
          path: "/postings",
          name: "Postings gen.",
        },
        { name: "Balance AG", path: "/content/dashboard-postings" },
        { name: "Balance Banques", path: "/content/dashboard-postings?type=banks" },
        { name: "Balance Fournisseurs", path: "/content/dashboard-postings?type=suppliers" },
        { name: "Balance Clients", path: "/content/dashboard-postings?type=clients" },
        {
          path: "/content/dashboard-accounting-fecFiles",
          name: "Posting Files",
        },
        {
          path: "/inventories",
          name: "Inventories",
        },
      ],
    },
    {
      name: "CRM",
      icon: "pe-7s-users",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/persons",
          name: "Persons",
        },
        {
          path: "/agreements",
          name: "Agreements",
        },
        {
          path: "/prospects",
          name: "Prospects",
        },
        // {
        // path: "/campaigns",
        // name: "Campaigns",
        // profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
        // },
        { name: "Demographics", path: "/content/dashboard-persons-demographics" },
      ],
    },
    {
      name: "Bank",
      icon: "pe-7s-culture",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/bank-accounts",
          name: "Bank accounts",
        },
        {
          path: "/bank-operations",
          name: "Bank operations",
        },
        {
          path: "/scores",
          name: "Scores",
          profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
        },
        {
          path: "/move-money",
          name: "Move money",
        },
        {
          path: "/content/bank-rates",
          name: "Rates",
        },
      ],
    },
    {
      name: "Catalogs",
      icon: "pe-7s-notebook ",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          name: "Products",
          path: "/catalog/products-catalog?action=/products",
        },
        // {
        // name: "Wholesale products",
        // path: "/catalog/products-catalog-wsl",
        // },
        {
          name: "Assets",
          path: "/catalog/assets-catalog",
        },
        { path: "/asset-catalog-items", name: "Asset catalog items" },
        {
          name: "Amendments",
          path: "/catalog/amendments-catalog?action=/product-amendments",
        },
        {
          name: "Rates",
          path: "/catalog/rates" + (profiles.includes("BO") ? "?action=/rates" : ""),
        },
      ],
    },
    {
      name: "Dashboards",
      icon: "pe-7s-display1",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/content/dashboard-main-consumer",
          name: "Consumer",
          icon: "pe-7s-shopbag",
        },
        {
          path: "/content/dashboard-real-estate-consumer-calc",
          name: "Calculatrice prêt immobilier",
          icon: "pe-7s-shopbag",
        },
        {
          path: "/content/dashboard-main-b2b",
          name: "B2B",
          icon: "pe-7s-share",
        },
        {
          path: "/content/dashboard-main-slider",
          name: "Slider Calculator",
          icon: "pe-7s-share",
        },
        { name: "Statistics per months", path: "/content/dashboard-perMonth-internal", icon: "pe-7s-share" },
        {
          path: "/content/dashboard-int-partners",
          name: "Partner management",
          icon: "pe-7s-share",
        },
        {
          path: "/content/wsl-dashboard",
          name: "Wholesale",
          icon: "pe-7s-share",
        },
        {
          path: "/content/dashboard-docusign",
          name: "DocuSign",
        },
        {
          path: "/content/dashboard-yousign",
          name: "Yousign",
        },
        {
          path: "/communications",
          name: "Communications",
        },
        {
          path: "/external-datas",
          name: "External data",
        },
        {
          path: "/content/dashboard-int-demands",
          name: "Requests",
          icon: "pe-7s-home",
        },
        {
          path: "/content/dashboard-int-signature",
          name: "e-Signature",
          icon: "pe-7s-pen",
        },
        {
          path: "/content/dashboard-int-payout",
          name: "Conformity",
          icon: "pe-7s-stopwatch",
        },
        {
          path: "/content/dashboard-int-portfolio",
          name: "Portfolio",
          icon: "pe-7s-shopbag",
        },
        {
          path: "/content/dashboard-pivot-contracts",
          name: "Pivot contracts",
          icon: "pe-7s-graph",
        },
        {
          path: "/content/dashboard-pivot-invoices",
          name: "Pivot invoices",
          icon: "pe-7s-graph",
        },
        {
          path: "/content/dashboard-pivot-payment-plan-items",
          name: "Pivot payment plan",
          icon: "pe-7s-graph",
        },
        {
          path: "/content/dashboard-invoicePostings",
          name: "Invoice to excel",
          icon: "pe-7s-pen",
        },
        {
          path: "/content/dashboard-documents",
          name: "Documents",
        },
        {
          path: "/content/dashboard-export",
          name: "XLS Reports",
        },
      ],
    },
    {
      name: "Pages",
      icon: "fa fa-stack-overflow",
      profiles: ["ADMIN", "ACCOUNTANT", "BO", "MO", "LOCALBO", "LOCALMO", "AUDITOR"],
      menus: [
        {
          path: "/page/pages/carLeasing",
          name: "Car leasing",
        },
        {
          path: "/page/pages/becomePartner",
          name: "Become partner",
        },
        {
          path: "/page/billPayment",
          name: "Bill payment",
        },
        {
          path: "/page/accountFundingByCard",
          name: "Account funding by card",
        },
        {
          path: "/page/things",
          name: "Things (dyno)",
        },
        {
          path: "/page/products",
          name: "Products (dyno)",
        },
        {
          path: "/page/external-persons",
          name: "External persons (dyno)",
        },
      ],
    },
    {
      name: "Parameters",
      icon: "pe-7s-helm",
      profiles: ["ADMIN", "BO"],
      menus: [
        { path: "/content/dashboard-build-artifacts", name: "Artifacts" },
        { path: "/pdf-reports", name: "PDF reports" },
        { path: "/content/dashboard-pivot-contracts", name: "Pivot Contracts" },
        { path: "/content/dashboard-pivot-invoices", name: "Pivot Invoices" },
        { path: "/content/dashboard-pivot-payment-plan-items", name: "Pivot Payment Plans" },
        { path: "/products", name: "Products" },
        { path: "/product-tables", name: "Product Tables" },
        { path: "/asset-catalog-items", name: "Items table" },
        { path: "/imports?importScript=/api/script/runs/import-person", name: "Imports person" },
        { path: "/page/jato/jato", name: "Imports Jato" },
        { path: "/metrics", name: "Metrics" },
        { path: "/object-storage-containers", name: "Object Storage Containers" },
      ],
    },
    {
      icon: "pe-7s-date",
      path: "/calendar",
      name: "Calendar",
      profiles: ["ADMIN", "BO"],
    },
  ];
}

if (isMainAdmin) config.menus.push({ path: "/tests", name: "Tests", icon: "pe-7s-play" });

//config.scriptOverrides = await wsGet("/api/script/runs/script-overrides");

config.options = {
  showUserOrganization: true,
  addressSearch: "Google",
  // Change public path to "/imp/demo" which will point to "/implementation-standard/public" folder
  // Because we don't have an "implementation-test" project
  publicPath: "/imp/standard",
  syncPerson: true,
  // Default is true. Set to false to hide the button to upload an image or PDF to be scanned for a QR registration.
  showQrUploadButton: true,
  // Default is true. Set to false to hide the button toggling the width of the left sidebar.
  showNavControlsToggleButton: true,
  // whether or not to save the expanded state of outer panels so that when a user toggles them
  // leaves the page and come back to it, the user finds them in the same state
  saveOuterPanelsExpandedState: true,
  // Hide autocomplete from list pages
  hideAutocomplete: true,
  showVirtualKeyboardButton: true,
  // allowDebugMode: false,
  // sortLists: true,
};

config.clientRoutes = {
  endowmentsPage: {
    clientRoute: "/endowments",
    clientAliasRoute: "/contracts",
    title: "Endowments",
    hideKpis: true,
    query: {
      type: "EDW",
      include: "organizationName,fundings",
    },
    columns: ["registration", "name", "status", "financialProduct", "startDate", "financedAmountExclTax", "fund"],
    showAdd: [{ name: "Add", path: "?type=EDW&financialProduct=EDW&financialScheme=YEARLY" }],
  },
  contractsPage: {
    clientRoute: "/contracts",
    clientAliasRoute: "/contracts",
    title: "Contracts",
    hideKpis: true,
    query: {
      type: "-EDW,-MLO",
      include: "organizationName,partnerName,assetsNames", // salesName
    },
    hideAutocomplete: true,
    showCardTableViewButton: true,
    columns: [
      "registration",
      // "organization.name",
      "name",
      "status",
      "financialProduct",
      "startDate",
      "financedAmountExclTax",
      // "purpose",
      // "subPurpose",
      "assets",
      "partner",
      // "sales",
      // "durationInMonths",
      // "financialScheme",
      // "paymentExclTax",
      // "purpose"
      // "subPurpose",
    ],
  },
  catalogItemsPage: {
    hideKpis: true,
  },
  amendmentsPage: {
    hideKpis: true,
  },
  assetLotsPage: {
    hideKpis: true,
  },
  sepasPage: {
    hideKpis: true,
  },
  camtsPage: {
    hideKpis: true,
  },
  prospectsPage: {
    hideKpis: true,
  },
  bankAccountsPage: {
    hideKpis: true,
  },
  bankOperationsPage: {
    hideKpis: true,
  },
  scoresPage: {
    hideKpis: true,
  },
  invoicesPage: {
    columns: [
      { title: "Registration", name: "registration" },
      // "organization.name",
      { title: "Invoice number", name: "invoiceNumber" },
      { title: "Payable/Receivable", name: "pr" },
      // { title: "Payment mode", name: "paymentMode" },
      { title: "Status", name: "status" },
      //{ title: "Name", name: "name" },
      { title: "Contract", name: "contractRegistration" },
      //{ title: "Payer", name: "payer" },
      //{ title: "Payee", name: "payee" },
      { title: "Person", name: "payerOrPayee" },
      { title: "Amount HT", name: "amountExclTax" },
      { title: "Due date", name: "dueDate" },
      // { title: "Payment date", name: "paymentDate" },
      // { title: "Internal reference", name: "internalReference" },
      // { title: "External reference", name: "externalReference" },
      { name: "_insertUser" },
      // { name: "_updateDate" },
      // { title: "", name: "actions" },
    ],
  },
  cashflowsPage: {
    columns: [
      { title: "Registration", name: "registration" },
      "organization.name",
      { title: "Status", name: "status" },
      { title: "Date", name: "paymentDate" },
      { title: "Type", name: "type" },
      { title: "Name", name: "name" },
      { title: "Invoice", name: "invoice" },
      { title: "Contract", name: "contract" },
      { title: "Payer", name: "payer" },
      { title: "Payee", name: "payee" },
      // { title: "Person", name: "payerOrPayee" },
      // { title: "Method", name: "method" },
      { title: "Iban", name: "bankIban" },
      { title: "Amount", name: "amount" },
    ],
  },
  productsPage: {
    showCopyPasteButton: true,
  },
  assetsPage: {
    columns: [
      { title: "Registration", name: "registration" },
      // "organization.name",
      { title: "Status", name: "status" },
      { title: "Name", name: "name" },
      { title: "Price", name: "priceExclTax" },
      { title: "Type", name: "type" },
    ],
  },
  tasksPage: {
    showTasksMonitor: !isBO,
    showUserActivityMonitor: isBO,
    channelProfiles: ["TASK_CHANNEL_WORKER_1", "TASK_CHANNEL_WORKER_2", "TASK_CHANNEL_WORKER_3"],
  },
  // personsPage: {
  // columns: [
  // { title: "Registration", name: "registration" },
  // { title: "Status", name: "status" },
  // { title: "Name", name: "name" },
  // { title: "Role", name: "role" },
  // { title: "Type", name: "type" },
  // { title: "Address", name: "address" },
  // ]
  // },
  postingsPage: {
    columns: [
      { title: "Registration", name: "registration" },
      { title: "Status", name: "status" },
      { title: "Name", name: "name" },
      { title: "Date", name: "date" },
      { title: "D/C", name: "dc" },
      { title: "Account", name: "account" },
      { title: "Account details", name: "secondaryAccount" },
      { title: "Amount", name: "amount" },
      { title: "Ref", name: "auditTrailReference" },
      { title: "Type", name: "type" },
      { title: "Code", name: "code" },
      //{ title: "Person", name: "person" },
      { title: "Contract", name: "contract" },
      { title: "Invoice", name: "invoice" },
      //{ title: "Guarantee", name: "guarantee" },
      //{ title: "Creditline", name: "creditline" },
    ],
  },
  ratesPage: {
    showAddButton: isBO,
  },
  dynoThingsPage: {
    hideKpis: true,
    title: loc`Things` + " (dyno)",
    columns: ["registration", { title: "Status", name: "status", select: "productStatus" }, "name"],
  },
  dynoProductsPage: {
    hideKpis: true,
    title: loc`Products` + " (dyno)",
    columns: ["registration", { title: "Status", name: "status", select: "productStatus" }, "name"],
  },
  dynoExternalPersonsPage: {
    hideKpis: true,
    title: loc`External persons` + " (dyno)",
    columns: ["registration", { title: "Status", name: "status", select: "productStatus" }, "name"],
  },
};

// - properties ending with "Color" can only receive a color but in any acceptable CSS format
// - properties ending with "Background" can only receive any acceptable CSS value for the background property
// - other properties' value are predefined in the front-end with the list of possible values provided
// - properties can be left undeclared in which case the front-end has it own fallback (default) value
config.styles = {
  globalDisplayMode:
    profiles.includes("SALES") ||
    profiles.includes("MO") ||
    profiles.includes("BO") ||
    profiles.includes("LOCALBO") ||
    profiles.includes("PARTNERMANAGER") ||
    profiles.includes("AUDITOR")
      ? "condensed-square"
      : "aerated-round",
  // buttonsDisplayMode: "big-round",
  // kpiDisplayMode: "inverted",
  // searchBarDisplayMode: "white-bordered-round",
  // searchBarPosition: "right",
  // tableStatusBadgeDisplayMode: "bullet",
  // borderStyle: "borderless",
  // navControlsLinksDisplayMode: "full"
  entityWorkflowCardPosition: "sticky",

  // navControlsLinksTextColor: "hsl(220, 4%, 13%)",
  // navControlsLinkActiveBackground: "#FFFFFF",
  // navControlsLinkActiveIconColor: "#24002F",
  // navControlsLinkActiveTextColor: "#24002F",
  navControlsBackground: "#182431",
  navControlsLogoPartnerOrTenantBackground: "#182431",
  // textDefaultColor: "#24002F",
  // primaryColor: "#E60050",
  // primaryStatesColor: "#651324",
  // bodyBackground: "#F5F7F9",
  // appControlsBackground: "#1F1E1D",
  // rowHoverBackgroundColor: "#F4E7E2",
  // notificationBackgroundColor: "#E60050",
  // fontFamily: "SpaceGrotesk, Arial",

  // fontFace: "SpaceGrotesk.ttf",
  // navControlsDisplayMode: "top"
};

config.documents = {
  modal: {
    // showUploadedDocumentsButton: true,
    // showMandatoryDocumentsButton: true,
    // showMetadataButton: true,
    // showFileReferenceButton: true,
  },
};

res.json(config);
