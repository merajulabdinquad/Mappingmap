(function () {
  const EARTH_RADIUS_KM = 6371.0088;

  function toRadians(deg) {
    return deg * Math.PI / 180;
  }

  function toDegrees(rad) {
    return rad * 180 / Math.PI;
  }

  function distanceToKm(distance, unit) {
    const value = Number(distance);
    switch (unit) {
      case "miles": return value * 1.609344;
      case "kilometers": return value;
      case "meters": return value / 1000;
      case "feet": return value * 0.0003048;
      default: throw new Error("Unsupported distance unit.");
    }
  }

  function destinationPoint(lat, lon, distanceKm, bearingDeg) {
    const angularDistance = distanceKm / EARTH_RADIUS_KM;
    const bearing = toRadians(bearingDeg);
    const lat1 = toRadians(lat);
    const lon1 = toRadians(lon);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
    );

    const lon2 = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

    const normalizedLon = ((toDegrees(lon2) + 540) % 360) - 180;

    return {
      latitude: Number(toDegrees(lat2).toFixed(6)),
      longitude: Number(normalizedLon.toFixed(6))
    };
  }

  function generateCircle({ latitude, longitude, radius, unit, pointCount, direction }) {
    const distanceKm = distanceToKm(radius, unit);
    const step = 360 / pointCount;
    const multiplier = direction === "counterclockwise" ? -1 : 1;
    const points = [];

    for (let i = 0; i < pointCount; i += 1) {
      const bearing = (i * step * multiplier + 360) % 360;
      const point = destinationPoint(latitude, longitude, distanceKm, bearing);
      points.push({ ...point, bearing: Number(bearing.toFixed(6)), source: "circle" });
    }

    return points;
  }

  function parseCustomCoordinates(value) {
    const raw = String(value || "").trim();
    if (!raw) return { points: [], errors: [] };

    const errors = [];
    const points = [];
    const cleaned = raw.replace(/[()\[\]]/g, " ");
    const invalidCharacters = cleaned.replace(/[+\-0-9.eE,;\s]/g, "").trim();

    if (invalidCharacters) {
      return {
        points: [],
        errors: ["Custom Coordinates should contain only latitude/longitude numbers separated by commas, spaces, semicolons, or new lines."]
      };
    }

    const tokens = cleaned
      .split(/[,;\s]+/)
      .map(token => token.trim())
      .filter(Boolean);

    if (tokens.length % 2 !== 0) {
      return {
        points: [],
        errors: ["Custom Coordinates contain an incomplete pair. Every latitude must be followed by a longitude."]
      };
    }

    for (let index = 0; index < tokens.length; index += 2) {
      const pairNumber = (index / 2) + 1;
      const latitude = Number(tokens[index]);
      const longitude = Number(tokens[index + 1]);

      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        errors.push(`Custom coordinate ${pairNumber}: latitude must be between -90 and 90.`);
        continue;
      }
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        errors.push(`Custom coordinate ${pairNumber}: longitude must be between -180 and 180.`);
        continue;
      }

      points.push({
        latitude: Number(latitude.toFixed(6)),
        longitude: Number(longitude.toFixed(6)),
        source: "custom"
      });
    }

    return { points, errors };
  }

  function calculatePinSpacing(radius, unit, pointCount) {
    const r = Number(radius);
    const pins = Number(pointCount);
    if (!Number.isFinite(r) || r <= 0 || !Number.isInteger(pins) || pins < 1) return null;

    const circumference = 2 * Math.PI * r;
    const spacing = circumference / pins;

    return { circumference, spacing, unit };
  }

  function formatPinSpacing(result) {
    if (!result) return "Enter radius and pins to calculate";

    const { spacing, unit } = result;
    const decimals = spacing >= 100 ? 2 : spacing >= 1 ? 3 : 4;
    const primary = spacing.toFixed(decimals);

    if (unit === "miles") {
      const feet = spacing * 5280;
      return `${primary} miles (${feet.toFixed(1)} ft)`;
    }
    if (unit === "kilometers") {
      const meters = spacing * 1000;
      return `${primary} km (${meters.toFixed(1)} m)`;
    }
    if (unit === "meters") {
      return `${primary} meters`;
    }
    if (unit === "feet") {
      return `${primary} ft`;
    }
    return `${primary} ${unit}`;
  }

  window.MappingMapGeo = {
    generateCircle,
    destinationPoint,
    distanceToKm,
    parseCustomCoordinates,
    calculatePinSpacing,
    formatPinSpacing
  };
})();
