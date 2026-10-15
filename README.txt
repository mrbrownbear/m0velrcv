M0VE COVENTRY PROPERTY INTELLIGENCE

A production-oriented, responsive, single-page static website.

START
1. Extract this ZIP.
2. Run "python -m http.server 8000" in the extracted directory.
3. Visit http://localhost:8000.
4. Deploy the contents of this directory to Vercel as a static website, with the output directory set to the project root.

FILES
index.html        Semantic structure, real M0VE navigation and sections.
styles.css        Responsive styling, motion and reduced-motion handling.
app.js            Calculation and data interaction implementation.
scene.js          3D model loader, camera transitions, pointer drag and scroll-driven camera choreography.
assets/           Optimized house GLB and its static fallback image.

DATA
Reference page: https://m0ve.com/house-prices/coventry/
House-price market table: 2018 to 2025, with 2025 listed as projected.
Type averages: Detached, Semi detached, Terraced and Flat / Apartment.
District averages: CV1 through CV8.
Nearby averages: Bedworth, Kenilworth, Nuneaton, Leamington Spa,
Hinckley, Rugby, Warwick, Solihull, Atherstone and Southam.

CALCULATOR
Base Coventry estimator: GBP 345,800 as displayed on the reference page.
Selecting a property type replaces the base with its published average price.
If custom floor area is selected, the difference from the type's published average
size is multiplied by its published per-square-foot cost.
Selecting a district multiplies the estimate by the ratio of the district's
published average to the 2025 city average of GBP 250,500.
Selecting a year applies the published annual-average ratio versus 2025.
New-build selection adds an explicitly adjustable 0%-15% hypothetical premium,
initially 5%. This is NOT a verified premium supplied by M0VE.
Lower and upper range markers are illustrative plus/minus 10% bands.

IMPORTANT
The original M0VE address-specific proprietary valuation algorithms and live
street-level property sale records were not accessible. This frontend therefore
reconstructs the calculator interactions with transparent illustrative maths.
For an address-level assessment the CTA links to the original M0VE valuation
page at https://m0ve.com/property-valuation/coventry/.

TECHNOLOGY
HTML, CSS, vanilla JavaScript and Three.js. Section depth module uses native transforms and IntersectionObserver. Three.js modules are loaded from
jsDelivr and require a browser internet connection. The 3D house GLB is local.
If Three.js or WebGL cannot load, the page shows the house's static image.
No redundant camera buttons, sequence counters or visual helper overlays remain.
No frontend forms pretend to store subscriptions. Registration uses the live
M0VE registration page at https://m0ve.com/register/.

MODEL
User-supplied file: Meshy_AI_house_1015174114_texture.glb
Original GLB: 173,839,992 bytes.
Optimized web GLB: 19,132,368 bytes (KHR_mesh_quantization).
Optimized mesh: 366,089 triangles, UVs, PBR material and 3 JPEG textures retained. Vertex position, normal and UV data quantized with a maximum reconstruction error of about 0.000016 in source coordinates.
Master original is not included in order to keep the deployed site efficient.

QA
The JavaScript was syntax checked. Core valuation interaction, new-build,
custom floor area, year selection, reset, district and town comparisons were
exercised in a local Chromium DOM test at desktop and mobile sizes. No page
script exceptions and no horizontal overflow were observed in those tests.
The optimized GLB was parsed and checked by trimesh; its geometry and textures
were also rendered into the supplied multi-angle PNG fallback images.
Live Three.js network import and GPU frame timing could not be independently
validated in this environment; inspect the deployed WebGL scene in a browser.

REFINEMENT
Removed nonfunctional hero micro-labels, model view controls, fake map caption,
progress counters and decorative indexes. Introduced an original inline SVG
icon system, semantic postcode price comparison and updated responsive layout.

SCROLL DEPTH REFINEMENT
Removed the 2025 city average price chip from the hero markup entirely.
Replaced discrete camera jumps with continuous five-pose position, tilt and lens interpolation.
Removed all model wireframe/material swaps. No reverse animation and no duplicate building meshes.
Added a lightweight architectural ground ring in the inspection phase and reversible visual atmosphere.
Added section-sensitive 3D perspective to market chart, valuation, property type and district surfaces.
Preserved the original calculator and all of its published reference data.
Reference motion sources: the owner-provided m0veproperty/getedu and m0veproperty/chance repository list.
Techniques have been independently implemented, with no copied third-party image or binary assets.
On-screen decorative controls, hero valuation block and numbered camera labels are absent.
