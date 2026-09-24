(function () {
  function linesToList(value) {
    return String(value || "")
      .split(/\n|,/)
      .map(item => item.trim())
      .filter(Boolean);
  }

  function section(label, value) {
    const clean = String(value || "").trim();
    return clean ? `${label}:\n${clean}` : "";
  }

  function buildDescription(data) {
    const parts = [];

    if (data.businessName) parts.push(section("Business Name", data.businessName));
    if (data.category) parts.push(section("Business Category", data.category));
    if (data.address) parts.push(section("Address", data.address));
    if (data.phone) parts.push(section("Contact Number", data.phone));
    if (data.email) parts.push(section("Company Email", data.email));
    if (data.website) parts.push(section("Website", data.website));
    if (data.hours) parts.push(section("Business Hours", data.hours));
    if (data.businessDescription) parts.push(section("Business Description", data.businessDescription));
    if (data.gbp) parts.push(section("Google Business Profile", data.gbp));

    const services = linesToList(data.services);
    if (services.length) parts.push(`Services Offered:\n${services.join("\n")}`);

    const socials = [
      ["Facebook", data.facebook],
      ["Instagram", data.instagram],
      ["LinkedIn", data.linkedin],
      ["YouTube", data.youtube],
      ["X / Twitter", data.twitter],
      ["TikTok", data.tiktok],
      ["Pinterest", data.pinterest]
    ].filter(([, value]) => String(value || "").trim());

    if (socials.length) {
      parts.push(`Social Media:\n${socials.map(([name, url]) => `${name}: ${url}`).join("\n")}`);
    }

    const areas = linesToList(data.areas);
    if (areas.length) parts.push(`Sub Areas:\n${areas.join("\n")}`);

 if (data.experienceNotProvided) {
  parts.push("Multiple Years of Experience");
} else if (String(data.yearsExperience || "").trim()) {
  parts.push(`${data.yearsExperience} Years of Experience`);
}

    return parts.filter(Boolean).join("\n\n");
  }

  function parseKeywords(value) {
    const raw = String(value || "")
      .split(/\n|,/)
      .map(item => item.trim())
      .filter(Boolean);

    const seen = new Set();
    return raw.filter(keyword => {
      const key = keyword.toLocaleLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  window.MappingMapDescription = {
    buildDescription,
    parseKeywords,
    linesToList
  };
})();
