const { user } = req;
if (!user.isAdmin && !user.isMainAdmin) throw Error("403|Forbidden");

const token = await genActionAuthorizationToken({
  expiresIn: 180, // 3 min
});

const buildArtifactsVmRootUrl = "https://uat2.hyperfront.io/";
const buildArtifactsApiUrl = `${buildArtifactsVmRootUrl}api/core/artifacts/builds`;
const { data: buildArtifacts } = await axios.get(`${buildArtifactsApiUrl}?token=${token}`);
buildArtifacts.sort((a, b) => (a.time > b.time ? 1 : -1));

return res.json({
  rows: [
    [
      {
        colProps: { xs: 12 },
        content: {
          type: "table",
          props: {
            columns: [
              { title: "Name", name: "name", linkTo: `${buildArtifactsApiUrl}/{name}?token=${token}` },
              { title: "Size", name: "size" },
              { title: "Modified date", name: "mtime", type: "datetime" },
            ],
            data: buildArtifacts,
            actions: [
              {
                method: "GET",
                tooltip: "Upload to external repo",
                bsStyle: "warning",
                icon: "fa-cloud-upload",
                url: `${buildArtifactsApiUrl}/{name}/sendToExternalRepo?token=${token}`,
              },
            ],
          },
        },
      },
    ],
  ],
});
