const dashboardName = "dashboard-ext-demands";

let content = {
  rows: [
    [
      {
        colClassName: "col-md-2 col-xs-12",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationSimulations&type=simulations`,
      },
      {
        colClassName: "col-md-2 col-xs-6",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationSubmission&type=submission`,
      },
      {
        colClassName: "col-md-2 col-xs-6",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationStudy&type=processing`,
      },
      {
        colClassName: "col-md-2 col-xs-6",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationApproved&type=approved`,
      },
      {
        colClassName: "col-md-2 col-xs-6",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationInfos&type=reqInfos`,
      },
      {
        colClassName: "col-md-2 col-xs-6",
        contentPath: `/api/script/runs/${dashboardName}?kpi=quotationRejected&type=rejected`,
      },
    ],
    [
      {
        colClassName: "col-md-6 col-xs-12",
        content: {
          type: "calculator",
          props: {
            showPerson: false,
            title: "Personal loan",
            catalogName: "purposes-catalog",
            amountFieldLabel: "How much I need?",
            paymentFieldLabel: "How much can I pay?",
          },
        },
      },
      {
        colClassName: "col-md-6 col-xs-12",
        contentPath: "/api/script/runs/dashboard-contractsMap",
      },
    ],
    [
      {
        colClassName: "col-md-12 col-xs-12",
        content: { type: "tasksList" },
      },
    ],
  ],
};

res.json(content);
