const { user, query } = req;
const { tenant } = user;
const { identityOcrGetUrl, identityOcrGetResults, identificationId } = query;

const authToken = await genActionAuthorizationToken({ expiresIn: 60, username: `automatic@${tenant}` });
const reqConfig = { headers: { authorization: `Bearer ${authToken}` } };

async function _identityOcrGetUrl() {
  // yes this is indeed data.data, no mistake here
  const { data } = (await axios.post("/api/external/ubble/identifications", {}, reqConfig)).data;
  const {
    attributes: { "identification-id": identificationId, "identification-url": identificationUrl },
  } = data;
  return { identificationId, identificationUrl };
}

async function _identityOcrGetResults(identificationId) {
  res.json((await axios.get(`/api/external/ubble/identifications/${identificationId}?formatted=true`, reqConfig)).data);
}

if (["1", "true"].includes(identityOcrGetUrl)) {
  return res.json(await _identityOcrGetUrl());
}

if (["1", "true"].includes(identityOcrGetResults) && identificationId) {
  return res.json(await _identityOcrGetResults(identificationId));
}

res.json();
