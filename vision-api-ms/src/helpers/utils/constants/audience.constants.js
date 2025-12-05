const AUDIENCE = Object.freeze({
  WEB: { code: "web", description: "Aplicaciones WEB" },
  APP: { code: "app", description: "Aplicaciones APP" }
});

function audienceFromCode(code) {
  return Object.values(AUDIENCE).find(item => item.code === code) || null;
}


module.exports = {
  AUDIENCE,
  audienceFromCode
};