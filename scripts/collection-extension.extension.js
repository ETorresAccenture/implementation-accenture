const { query: { name: schemaName } } = req
let fields = {};

switch (schemaName) {
  case "Product": {
    fields = {
      externalReference: "String",
      authorizedChannels: ["String"],
      limitEngagement: "Number"
    }
  }
}

res.json(fields);
