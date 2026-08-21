(function () {
  function validateInput(data, keywords) {
    const errors = [];

    if (!Number.isFinite(data.latitude) || data.latitude < -90 || data.latitude > 90) {
      errors.push("Latitude must be a number between -90 and 90.");
    }
    if (!Number.isFinite(data.longitude) || data.longitude < -180 || data.longitude > 180) {
      errors.push("Longitude must be a number between -180 and 180.");
    }
    if (!Number.isFinite(data.radius) || data.radius <= 0) {
      errors.push("Radius must be greater than 0.");
    }
    if (!Number.isInteger(data.pointCount) || data.pointCount < 3 || data.pointCount > 1500) {
      errors.push("Number of pins must be a whole number between 3 and 1,500.");
    }
    if (!String(data.businessName || "").trim()) {
      errors.push("Business Name is required.");
    }
    if (!keywords.length) {
      errors.push("Add at least one keyword.");
    }

    return errors;
  }

  function validateRows(rows) {
    const errors = [];
    const coordinateSet = new Set();

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      if (!row.Name) errors.push(`Row ${rowNumber}: missing Name.`);
      if (!row.Description) errors.push(`Row ${rowNumber}: missing Description.`);
      if (!Number.isFinite(row.Latitude)) errors.push(`Row ${rowNumber}: invalid Latitude.`);
      if (!Number.isFinite(row.Longitude)) errors.push(`Row ${rowNumber}: invalid Longitude.`);

      const key = `${Number(row.Latitude).toFixed(6)},${Number(row.Longitude).toFixed(6)}`;
      if (coordinateSet.has(key)) {
        errors.push(`Row ${rowNumber}: duplicate coordinate ${key}.`);
      }
      coordinateSet.add(key);
    });

    return errors;
  }

  window.MappingMapValidation = {
    validateInput,
    validateRows
  };
})();
