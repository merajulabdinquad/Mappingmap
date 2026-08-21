# Mapping Map

Mapping Map is a browser-based geo-fencing Excel generator.

## Current features

- Circular coordinate generation from center latitude, longitude, radius, unit, and pin count
- Radius can be changed freely (for example 1, 2.5, 3, 4)
- Miles, kilometers, meters, and feet unit selector
- Read-only live calculation of approximate distance between neighboring circle pins
- 3 to 1,500 generated circle pins
- Optional custom coordinates appended after all generated circle pins
- Custom coordinate input supports `latitude, longitude` and `latitude longitude`
- Continuous keyword rotation across generated and custom points
- Repeated structured business Description for every row
- Services and Sub Areas are output one item per line
- Excel `.xlsx` and CSV export
- Output columns remain exactly: Name, Description, Latitude, Longitude
- Duplicate and incomplete coordinate validation
- Numeric browser spinners removed while fields remain manually editable

## Structure

- `index.html`
- `css/style.css`
- `js/app.js`
- `js/geofence.js`
- `js/description.js`
- `js/validation.js`
- `js/excel.js`
- `assets/`

## Privacy

Coordinate generation and business-data processing happen in the browser. The Excel export library is loaded from the official SheetJS CDN in this version.

## Rights

© 2026 Mapping Map. All Rights Reserved by Quadroots Technology - Meraj ul Abdin - SEO Department.

## V4 UI/UX Redesign

- Premium light SaaS / business-software interface
- Stronger product hero with mapping + workbook visual
- Four-step guided workspace navigation
- Improved form hierarchy and compound radius/unit control
- Live form-readiness indicator
- Live custom-coordinate count and format feedback
- Refined sticky workbook preview
- Responsive tablet and mobile layouts
- Core coordinate, validation, keyword rotation, and export logic preserved
