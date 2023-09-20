({
  workflowStatusList: "productStatus",
  actors: ["BO", "PRODUCT", "ADMIN"],
  status: [
    { code: "DRAFT", canModify: ["PRODUCT", "BO", "ADMIN", "MO"], color: "lightblue" },
    { code: "SUBMITTED", canModify: ["ADMIN"], color: "yellowgreen" },
    { code: "ACCEPTED", canModify: ["ADMIN"], color: "lightgreen" },
    { code: "ACTIVE", canModify: ["ADMIN"], color: "limegreen" },
    { code: "CANCELLED", canModify: ["ADMIN"], color: "lightgray" },
    { code: "ARCHIVED", canModify: [], color: "gray" },
  ],
  
  transitions: [
    {
      code: "documents1",
      label: "Documents",
      documentTypesList: "productDocumentType",
      props: { bsStyle: "success", fill: false, position: "top", pullRight: true },
      icon: "fa fa-paperclip",
      actors: ["BO", "MO", "ADMIN"],
    },
    {
      code: "submitForApproval",
      label: "Submit",
      props: { bsStyle: "success", fill: true, pullRight: false, position: "top" },
      source: ["DRAFT"],
      target: "SUBMITTED",
      actors: ["BO", "ADMIN"],
      execute: async (product, transition) => {
        product.submitterUsername = req.user.username;
        product.status = transition.target;
      },
    },
    {
      code: "accept",
      label: "Accept",
      props: { bsStyle: "success", fill: true, pullRight: false, position: "top" },
      source: ["SUBMITTED"],
      target: "ACCEPTED",
      actors: ["BO", "ADMIN"],
      execute: async (product, transition) => {
        // check 4 eyes
        if (product.submitterUsername === req.user.username && !req.user.isAdmin) {
          throw Error("499|La personne acceptant le produit doit être différente de celle qui demande l'acceptation");
        }
        product.acceptorUsername = req.user.username;
        product.status = transition.target;
      },
    },
    {
      code: "reject",
      label: "Reject",
      props: { bsStyle: "warning", fill: true, pullRight: false, position: "top" },
      source: ["SUBMITTED"],
      target: "DRAFT",
      actors: ["BO", "ADMIN"],
    },
    {
      code: "activate",
      label: "Activate",
      props: { bsStyle: "success", fill: true, pullRight: false, position: "top" },
      source: ["ACCEPTED"],
      target: "ACTIVE",
      actors: ["BO", "ADMIN"],
      execute: async (product, transition) => {
        if (!product.startDate) throw Error("499|Start date is mandatory");
        let activeProducts = await wsGet("/api/financing/products?status=ACTIVE&code=" + product.code);
        // check active product is in the future
        for (let activeProduct of activeProducts) {
          if (product.startDate < activeProduct.startDate) {
            throw Error("499|A product cannot be activated in the past");
          }
        }
        for (let activeProduct of activeProducts) {
          if (product.startDate >= activeProduct.startDate && (!activeProduct.endDate || product.startDate < activeProduct.endDate)) {
            // stop current active product when new product starts
            activeProduct.endDate = product.startDate;
            await wsPost("/api/financing/products", activeProduct);
          }
        }
        product.status = transition.target;
      },
    },
    {
      code: "cancel",
      label: "Cancel",
      props: { bsStyle: "warning", fill: true, pullRight: false, position: "top" },
      source: ["ACTIVE"],
      target: "CANCELLED",
      actors: ["BO", "ADMIN"],
    },
    {
      code: "archive",
      label: "Archive",
      props: { bsStyle: "default", fill: false, pullRight: true, position: "top" },
      target: "ARCHIVED",
      actors: ["BO", "ADMIN"],
    },
    {
      code: "restart",
      label: "Restart",
      props: { bsStyle: "default", fill: false, pullRight: true, position: "top" },
      source: ["SUBMITTED", "ARCHIVED", "ACCEPTED", "ACTIVE", "CANCELLED"],
      target: "DRAFT",
      actors: ["BO", "ADMIN"],
    },
    {
      code: "duplicate",
      label: "Duplicate",
      props: { bsStyle: "default", pullRight: true, position: "top" },
      actors: ["BO", "ADMIN"],
      execute: async productOrProductTable => {
        // Product table
        if (productOrProductTable.tableType) {
          const productTable = await wsPost("/api/financing/product-tables", {
            ...productOrProductTable,
            _id: undefined,
            status: undefined,
            _insertUser: undefined,
            _insertDate: undefined,
            _updateUser: undefined,
            _updateDate: undefined,
            registration: undefined,
          });
          return { redirectTo: `/product-table/${productTable.registration}` };
        } else {
          let productToDuplicate = {
            ...productOrProductTable,
            _id: undefined,
            status: undefined,
            _insertUser: undefined,
            _insertDate: undefined,
            _updateUser: undefined,
            _updateDate: undefined,
            registration: undefined,
            code: productOrProductTable.code + "-copy",
            name: productOrProductTable.name + "-copy",
          };
          let newProduct = await wsPost("/api/financing/products", productToDuplicate);
          return { redirectTo: `/product/${newProduct.registration}` };
        }
      },
    },
  ],
});
