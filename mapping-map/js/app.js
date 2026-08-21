(function () {
  const form = document.getElementById("generatorForm");
  const resultState = document.getElementById("resultState");
  const emptyState = document.getElementById("emptyState");
  const previewBody = document.getElementById("previewBody");
  const validationBox = document.getElementById("validationBox");
  const downloadBtn = document.getElementById("downloadBtn");
  const downloadNowBtn = document.getElementById("downloadNowBtn");
  const downloadCsvBtn = document.getElementById("downloadCsvBtn");
  const resetBtn = document.getElementById("resetBtn");
  const radiusInput = document.getElementById("radius");
  const pointCountInput = document.getElementById("pointCount");
  const unitInput = document.getElementById("unit");
  const pinSpacingInput = document.getElementById("pinSpacing");
  const completionBar = document.getElementById("completionBar");
  const completionText = document.getElementById("completionText");
  const customCountLive = document.getElementById("customCountLive");
  const customCoordinatesInput = document.getElementById("customCoordinates");

  let generatedRows = [];
  let generatedData = null;

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  function numberValue(id) {
    const raw = document.getElementById(id).value.trim();
    return raw === "" ? NaN : Number(raw);
  }

  function collectData() {
    return {
      latitude: numberValue("latitude"),
      longitude: numberValue("longitude"),
      radius: numberValue("radius"),
      unit: value("unit"),
      pointCount: numberValue("pointCount"),
      direction: value("direction"),
      businessName: value("businessName"),
      category: value("category"),
      address: value("address"),
      phone: value("phone"),
      email: value("email"),
      website: value("website"),
      gbp: value("gbp"),
      businessDescription: value("businessDescription"),
      services: value("services"),
      areas: value("areas"),
      yearsExperience: value("yearsExperience"),
      hours: value("hours"),
      facebook: value("facebook"),
      instagram: value("instagram"),
      linkedin: value("linkedin"),
      youtube: value("youtube"),
      twitter: value("twitter"),
      tiktok: value("tiktok"),
      pinterest: value("pinterest")
    };
  }

  function showErrors(errors) {
    validationBox.className = "validation-box error";
    validationBox.innerHTML = `<strong>Please fix the following:</strong><br>${errors.map(error => `• ${error}`).join("<br>")}`;
    validationBox.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearErrors() {
    validationBox.className = "validation-box hidden";
    validationBox.innerHTML = "";
  }

  function unitLabel(unit, radius) {
    const labels = {
      miles: Number(radius) === 1 ? "Mile" : "Miles",
      kilometers: Number(radius) === 1 ? "Kilometer" : "Kilometers",
      meters: Number(radius) === 1 ? "Meter" : "Meters",
      feet: "Feet"
    };
    return labels[unit] || unit;
  }

  function updatePinSpacing() {
    const radius = numberValue("radius");
    const pointCount = numberValue("pointCount");
    const unit = value("unit");
    const spacing = MappingMapGeo.calculatePinSpacing(radius, unit, pointCount);
    pinSpacingInput.value = MappingMapGeo.formatPinSpacing(spacing);
  }

  function updateCompletion() {
    const requiredIds = ["latitude", "longitude", "radius", "pointCount", "businessName", "keywords"];
    const completed = requiredIds.filter(id => value(id) !== "").length;
    const percent = Math.round((completed / requiredIds.length) * 100);

    if (completionBar) completionBar.style.width = `${percent}%`;
    if (completionText) completionText.textContent = `${percent}%`;
  }

  function updateCustomCount() {
    if (!customCountLive || !customCoordinatesInput) return;

    const raw = customCoordinatesInput.value.trim();
    if (!raw) {
      customCountLive.textContent = "0 custom pins";
      customCountLive.classList.remove("has-error");
      return;
    }

    const result = MappingMapGeo.parseCustomCoordinates(raw);
    if (result.errors.length) {
      customCountLive.textContent = "Check coordinate format";
      customCountLive.classList.add("has-error");
      return;
    }

    const count = result.points.length;
    customCountLive.textContent = `${count} custom ${count === 1 ? "pin" : "pins"}`;
    customCountLive.classList.remove("has-error");
  }

  function renderPreview(rows, customCount) {
    previewBody.innerHTML = "";

    let previewRows;
    if (customCount > 0 && rows.length > 10) {
      const customPreviewCount = Math.min(customCount, 3);
      const firstCount = 10 - customPreviewCount;
      previewRows = [
        ...rows.slice(0, firstCount),
        ...rows.slice(rows.length - customPreviewCount)
      ];
    } else {
      previewRows = rows.slice(0, 10);
    }

    previewRows.forEach(row => {
      const tr = document.createElement("tr");
      [row.Name, row.Description, row.Latitude, row.Longitude].forEach((cell, index) => {
        const td = document.createElement("td");
        td.textContent = String(cell);
        if (index === 1) td.title = String(cell);
        tr.appendChild(td);
      });
      previewBody.appendChild(tr);
    });
  }

  function generateRows({ showPreview = true } = {}) {
    clearErrors();

    const data = collectData();
    const keywords = MappingMapDescription.parseKeywords(value("keywords"));
    const inputErrors = MappingMapValidation.validateInput(data, keywords);
    if (inputErrors.length) {
      showErrors(inputErrors);
      return null;
    }

    const customResult = MappingMapGeo.parseCustomCoordinates(value("customCoordinates"));
    if (customResult.errors.length) {
      showErrors(customResult.errors);
      return null;
    }

    const description = MappingMapDescription.buildDescription(data);
    if (!description) {
      showErrors(["The Description would be empty. Add at least Business Name or other business details."]);
      return null;
    }

    const circlePoints = MappingMapGeo.generateCircle(data);
    const allPoints = [...circlePoints, ...customResult.points];

    const rows = allPoints.map((point, index) => ({
      Name: keywords[index % keywords.length],
      Description: description,
      Latitude: point.latitude,
      Longitude: point.longitude
    }));

    const rowErrors = MappingMapValidation.validateRows(rows);
    if (rowErrors.length) {
      showErrors(rowErrors.slice(0, 20));
      return null;
    }

    generatedRows = rows;
    generatedData = data;

    if (showPreview) {
      renderPreview(rows, customResult.points.length);
      document.getElementById("summaryPoints").textContent = rows.length.toLocaleString();
      document.getElementById("summaryCirclePoints").textContent = circlePoints.length.toLocaleString();
      document.getElementById("summaryCustomPoints").textContent = customResult.points.length.toLocaleString();
      document.getElementById("summaryRadius").textContent = `${data.radius} ${unitLabel(data.unit, data.radius)}`;
      document.getElementById("summaryKeywords").textContent = keywords.length.toLocaleString();
      emptyState.classList.add("hidden");
      resultState.classList.remove("hidden");
    }

    return {
      rows,
      data,
      circleCount: circlePoints.length,
      customCount: customResult.points.length
    };
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    generateRows({ showPreview: true });
  });

  downloadNowBtn.addEventListener("click", () => {
    const result = generateRows({ showPreview: true });
    if (!result) return;

    try {
      MappingMapExport.downloadXlsx(result.rows, result.data);
    } catch (error) {
      showErrors([error.message]);
    }
  });

  downloadBtn.addEventListener("click", () => {
    if (!generatedRows.length || !generatedData) {
      const result = generateRows({ showPreview: true });
      if (!result) return;
    }

    try {
      MappingMapExport.downloadXlsx(generatedRows, generatedData);
    } catch (error) {
      showErrors([error.message]);
    }
  });

  downloadCsvBtn.addEventListener("click", () => {
    if (!generatedRows.length || !generatedData) {
      const result = generateRows({ showPreview: true });
      if (!result) return;
    }
    MappingMapExport.downloadCsv(generatedRows, generatedData);
  });

  resetBtn.addEventListener("click", () => {
    window.setTimeout(() => {
      generatedRows = [];
      generatedData = null;
      previewBody.innerHTML = "";
      resultState.classList.add("hidden");
      emptyState.classList.remove("hidden");
      clearErrors();
      updatePinSpacing();
      updateCompletion();
      updateCustomCount();
    }, 0);
  });

  radiusInput.addEventListener("input", updatePinSpacing);
  pointCountInput.addEventListener("input", updatePinSpacing);
  unitInput.addEventListener("change", updatePinSpacing);
  form.addEventListener("input", updateCompletion);
  form.addEventListener("change", updateCompletion);
  customCoordinatesInput.addEventListener("input", updateCustomCount);

  updatePinSpacing();
  updateCompletion();
  updateCustomCount();
})();
