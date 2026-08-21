(function () {
  function sanitizeFilename(value) {
    return String(value || "Mapping Map")
      .replace(/[\\/:*?"<>|]+/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function formatUnitLabel(unit, radius) {
    const singular = Number(radius) === 1;
    const map = {
      miles: singular ? "Mile" : "Miles",
      kilometers: singular ? "Kilometer" : "Kilometers",
      meters: singular ? "Meter" : "Meters",
      feet: "Feet"
    };
    return map[unit] || unit;
  }

  function filenameFor(data) {
    const business = sanitizeFilename(data.businessName);
    const unit = formatUnitLabel(data.unit, data.radius);
    return `${business} - ${data.radius} ${unit} Geo Fencing`;
  }

  function downloadXlsx(rows, data) {
    if (typeof XLSX === "undefined") {
      throw new Error("Excel library did not load. Check your internet connection and refresh the page.");
    }

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ["Name", "Description", "Latitude", "Longitude"]
    });

    worksheet["!cols"] = [
      { wch: 42 },
      { wch: 90 },
      { wch: 16 },
      { wch: 16 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Geo Fencing");

    XLSX.writeFile(workbook, `${filenameFor(data)}.xlsx`, {
      compression: true
    });
  }

  function csvCell(value) {
    const str = String(value ?? "");
    return `"${str.replace(/"/g, '""')}"`;
  }

  function downloadCsv(rows, data) {
    const headers = ["Name", "Description", "Latitude", "Longitude"];
    const csv = [
      headers.map(csvCell).join(","),
      ...rows.map(row => headers.map(key => csvCell(row[key])).join(","))
    ].join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filenameFor(data)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  window.MappingMapExport = {
    downloadXlsx,
    downloadCsv,
    filenameFor
  };
})();
