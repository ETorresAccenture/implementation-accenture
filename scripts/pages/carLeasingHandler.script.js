const { user, query, body } = req;
const { tenant } = user;
const { runComputations, computationType } = query;
const { assetCostExclTax, financedAmount, durationInMonths } = body;

const authToken = await genActionAuthorizationToken({ expiresIn: 60, username: `automatic@${tenant}` });
const reqConfig = { headers: { authorization: `Bearer ${authToken}` } };

if (runComputations) {
  let computations;
  if (computationType === "AUTO") {
    computations = await wsPost(
      "/api/financing/contracts/run-computation",
      {
        quotations: ["AUTOLOAN", "AUTOHP", "AUTOLEASE"].map(autoProductCode => {
          return {
            financialProduct: autoProductCode,
            financialScheme: "FS1",
            assetCostExclTax,
          };
        }),
      },
      reqConfig,
    );
  }

  if (computationType === "SIMPLE") {
    computations = await wsPost(
      "/api/financing/contracts/run-computation",
      {
        quotations: [
          {
            financialProduct: "LOAN",
            financialScheme: "FS1",
            financedAmount,
            duration: durationInMonths,
          },
        ],
      },
      reqConfig,
    );
  }

  res.json(computations);
}
