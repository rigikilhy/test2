// Interactive Mechanics Lecture - script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. script.js is active.");

    const vaAnimationContainer = document.getElementById('vettore-applicato-animation');
    if (vaAnimationContainer) {
        setupVettoreApplicatoAnimation(vaAnimationContainer);
    }

    // Future animations will be added here, e.g.:
    const mpAnimationContainer = document.getElementById('momento-polare-animation');
    if (mpAnimationContainer) {
        setupMomentoPolareAnimation(mpAnimationContainer);
    }

    const rAnimationContainer = document.getElementById('risultante-animation');
    if (rAnimationContainer) {
        setupRisultanteAnimation(rAnimationContainer);
    }

    const mtAnimationContainer = document.getElementById('momento-trasporto-animation');
    if (mtAnimationContainer) {
        setupMomentoTrasportoAnimation(mtAnimationContainer);
    }
    // etc.
});

// --- Global Helper Functions ---
function calculateMomentScalar(pole, point, vector) {
    // M_z = (Px - PoleX)*Vy - (Py - PoleY)*Vx
    return (point.x - pole.x) * vector.y - (point.y - pole.y) * vector.x;
}

function drawMomentArc(pathElem, centerPole, momentVal, baseRadius = 15, color, momentScaleFactor = 100) {
    if (Math.abs(momentVal) < 0.1) { // Threshold to hide very small moments
        pathElem.setAttribute('d', '');
        return;
    }
    const radius = baseRadius + Math.abs(momentVal) / momentScaleFactor;
    const startAngle = -Math.PI / 2; // Start from bottom/top depending on convention
    const arcDir = momentVal >= 0 ? 1 : -1; // CCW or CW
    const endAngle = startAngle + arcDir * 1.5 * Math.PI; // 270 deg arc
    const sX = centerPole.x + radius * Math.cos(startAngle);
    const sY = centerPole.y + radius * Math.sin(startAngle);
    const eX = centerPole.x + radius * Math.cos(endAngle);
    const eY = centerPole.y + radius * Math.sin(endAngle);
    const sweepFlag = momentVal >= 0 ? "1" : "0"; // 1 for CCW, 0 for CW
    // Large arc flag is 1 for arcs > 180 degrees. Our 270deg arc is a large arc.
    pathElem.setAttribute('d', `M ${sX} ${sY} A ${radius} ${radius} 0 1 ${sweepFlag} ${eX} ${eY}`);
    if (color) {
        pathElem.style.stroke = color; // JS overrides CSS if color is passed
    }
    // If no color is passed, CSS defined styles for the path will apply.
}

function createSlider(id, labelText, min, max, value, step) {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';

    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = id;
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = step;

    const valueSpan = document.createElement('span');
    valueSpan.id = id + '-value'; // Unique ID for value span
    valueSpan.textContent = value;
    slider.addEventListener('input', () => valueSpan.textContent = slider.value);

    sliderContainer.appendChild(label);
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueSpan);
    return sliderContainer;
}

function createArrowheadMarker(svgNS, defsElem, id, color) {
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10'); // Tip at the end of the line
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto-start-reverse');
    const polygon = document.createElementNS(svgNS, 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', color);
    marker.appendChild(polygon);
    defsElem.appendChild(marker); // Append to the provided defs element
}


function setupVettoreApplicatoAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    // Create doorbell element
    const doorbell = document.createElement('div');
    doorbell.id = 'doorbell';
    doorbell.textContent = '🔔'; // Simple emoji as doorbell
    doorbell.title = 'Premi il campanello!'; // Tooltip

    // Create arrow element (vector)
    const arrow = document.createElement('div');
    arrow.id = 'force-arrow';
    arrow.textContent = '➔'; // Simple arrow
    arrow.style.visibility = 'hidden'; // Initially hidden

    container.appendChild(doorbell);
    container.appendChild(arrow);

    // Styling and positioning are now primarily handled by style.css using flexbox.
    // JavaScript will only toggle the 'visible' class for the arrow.
    // Note: The initial `arrow.style.visibility = 'hidden'` is okay to keep,
    // as it ensures the arrow is hidden before any class is applied or CSS is fully parsed,
    // preventing a flicker. The .visible class in CSS will override this for display.

    // Event listeners
    doorbell.addEventListener('mouseenter', () => {
        arrow.classList.add('visible');
    });

    doorbell.addEventListener('mouseleave', () => {
        arrow.classList.remove('visible');
    });

    // For touch devices, a click toggles visibility
    let touchTimeout = null;
    doorbell.addEventListener('click', () => {
        if (arrow.classList.contains('visible')) {
            arrow.classList.remove('visible');
            if(touchTimeout) clearTimeout(touchTimeout);
        } else {
            arrow.classList.add('visible');
            // Hide after a delay if it's a touch-simulated click
            touchTimeout = setTimeout(() => {
                arrow.classList.remove('visible');
            }, 1500);
        }
    });
}

function setupMomentoPolareAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '200');
    // svg.style.border, display, margin are now in CSS for #momento-polare-animation svg

    // Define elements (simplified for now)
    // Pole Ω (Nut) - a circle
    const poleOmega = document.createElementNS(svgNS, 'circle');
    poleOmega.setAttribute('cx', '50');
    poleOmega.setAttribute('cy', '100');
    poleOmega.setAttribute('r', '10');
    // poleOmega.setAttribute('fill', 'gray'); // In CSS
    poleOmega.id = 'poleOmega';

    // Wrench handle (P will be on this) - a line
    const wrenchHandle = document.createElementNS(svgNS, 'line');
    wrenchHandle.setAttribute('x1', '50');
    wrenchHandle.setAttribute('y1', '100');
    wrenchHandle.setAttribute('x2', '200');
    wrenchHandle.setAttribute('y2', '100');
    // wrenchHandle.setAttribute('stroke', 'silver'); // In CSS
    // wrenchHandle.setAttribute('stroke-width', '10'); // In CSS
    wrenchHandle.id = 'wrenchHandle';

    // Point P (Point of application of force) - a draggable circle on the handle
    const pointP = document.createElementNS(svgNS, 'circle');
    let pX = 150; // Initial X for P
    const pY = 100; // Y is fixed on the handle
    pointP.setAttribute('cx', pX.toString());
    pointP.setAttribute('cy', pY.toString());
    pointP.setAttribute('r', '8');
    // pointP.setAttribute('fill', 'blue'); // In CSS
    pointP.setAttribute('cursor', 'grab'); // Keep dynamic cursor change
    pointP.id = 'pointP';

    // Force vector v - an arrow (line + arrowhead)
    const forceVectorLine = document.createElementNS(svgNS, 'line');
    forceVectorLine.id = 'forceVectorLine'; // Added ID for CSS
    const forceVectorHead = document.createElementNS(svgNS, 'polygon');
    forceVectorHead.id = 'forceVectorHead'; // Added ID for CSS
    let forceMagnitude = 50; // Arbitrary initial force magnitude (length of arrow)
    let forceAngle = -Math.PI / 2; // Straight down

    function updateForceVector() {
        forceVectorLine.setAttribute('x1', pX.toString());
        forceVectorLine.setAttribute('y1', pY.toString());
        const forceEndX = pX + forceMagnitude * Math.cos(forceAngle);
        const forceEndY = pY + forceMagnitude * Math.sin(forceAngle);
        forceVectorLine.setAttribute('x2', forceEndX.toString());
        forceVectorLine.setAttribute('y2', forceEndY.toString());
        // forceVectorLine.setAttribute('stroke', 'red'); // In CSS
        // forceVectorLine.setAttribute('stroke-width', '3'); // In CSS

        // Arrowhead points
        const arrowSize = 8;
        const angle = Math.atan2(forceEndY - pY, forceEndX - pX);
        const p1x = forceEndX - arrowSize * Math.cos(angle - Math.PI / 6);
        const p1y = forceEndY - arrowSize * Math.sin(angle - Math.PI / 6);
        const p2x = forceEndX - arrowSize * Math.cos(angle + Math.PI / 6);
        const p2y = forceEndY - arrowSize * Math.sin(angle + Math.PI / 6);
        forceVectorHead.setAttribute('points', `${forceEndX},${forceEndY} ${p1x},${p1y} ${p2x},${p2y}`);
        // forceVectorHead.setAttribute('fill', 'red'); // In CSS
    }
    updateForceVector();


    // Moment M_Ω - a circular arrow
    const momentArrowPath = document.createElementNS(svgNS, 'path');
    // momentArrowPath.setAttribute('fill', 'none'); // In CSS
    // momentArrowPath.setAttribute('stroke', 'purple'); // In CSS
    // momentArrowPath.setAttribute('stroke-width', '3'); // In CSS
    momentArrowPath.setAttribute('marker-end', 'url(#arrowhead-purple)');
    momentArrowPath.id = 'momentArrowPath'; // Ensure it has ID for CSS

    // Add a <defs> section for marker definitions
    const defs = document.createElementNS(svgNS, 'defs');
    const marker = document.createElementNS(svgNS, 'marker');
    marker.setAttribute('id', 'arrowhead-purple');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10'); // Adjusted: Tip of the arrowhead should be at the path's end point
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto-start-reverse'); // Better orientation for paths
    const arrowheadPolygon = document.createElementNS(svgNS, 'polygon');
    arrowheadPolygon.setAttribute('points', '0 0, 10 3.5, 0 7'); // Triangle shape
    arrowheadPolygon.setAttribute('fill', 'purple');
    marker.appendChild(arrowheadPolygon);
    defs.appendChild(marker);
    svg.appendChild(defs); // Add defs to SVG first usually

    function updateMoment() {
        const rX = pX - parseFloat(poleOmega.getAttribute('cx'));
        // rY = pY - parseFloat(poleOmega.getAttribute('cy')), which is 0 in this setup.

        // Force components are derived from forceMagnitude and forceAngle
        // forceAngle = -Math.PI / 2 (straight down)
        const Fy_component = forceMagnitude * Math.sin(forceAngle); // = -forceMagnitude
        const Fx_component = forceMagnitude * Math.cos(forceAngle); // = 0

        // M_omega = rX * Fy_component - rY * Fx_component
        // Since rY = 0 in this setup:
        const momentValue = rX * Fy_component;

        // Update text display
        momentText.textContent = `Momento M_Ω = ${momentValue.toFixed(0)} Nm`;

        // Visual representation of moment (circular arrow)
        const poleCX = parseFloat(poleOmega.getAttribute('cx'));
        const poleCY = parseFloat(poleOmega.getAttribute('cy'));
        const momentRadius = 20 + Math.abs(momentValue) / 20; // Scale radius with moment magnitude
        const startAngle = -Math.PI / 2; // Start from bottom for clockwise, top for counter-clockwise visual

        // Adjust arc direction based on moment sign
        // Positive moment (CCW) means arc goes from -PI/2 towards PI
        // Negative moment (CW) means arc goes from -PI/2 towards -2PI
        // The endAngle determines the length of the arc. A 270deg arc (1.5 * PI) is drawn.
        const arcDirection = momentValue >= 0 ? 1 : -1; // 1 for CCW, -1 for CW
        const endAngle = startAngle + arcDirection * 1.5 * Math.PI;

        const startX = poleCX + momentRadius * Math.cos(startAngle);
        const startY = poleCY + momentRadius * Math.sin(startAngle);
        const endX = poleCX + momentRadius * Math.cos(endAngle);
        const endY = poleCY + momentRadius * Math.sin(endAngle);

        const largeArcFlag = "1"; // For a 270 degree arc, it's always a large arc
        // Sweep flag: 1 for positive angle (CCW), 0 for negative angle (CW)
        // If momentValue >= 0, we want CCW arc, sweepFlag = 1
        // If momentValue < 0, we want CW arc, sweepFlag = 0
        const sweepFlag = momentValue >= 0 ? "1" : "0";

        momentArrowPath.setAttribute('d', `M ${startX} ${startY} A ${momentRadius} ${momentRadius} 0 ${largeArcFlag} ${sweepFlag} ${endX} ${endY}`);
    }
    updateMoment();

    // SVG Text element for displaying moment value
    const momentText = document.createElementNS(svgNS, 'text');
    momentText.id = 'momentTextDisplay'; // Ensure it has ID for CSS
    momentText.setAttribute('x', '10');
    momentText.setAttribute('y', '20');
    // momentText.setAttribute('font-family', 'Arial, sans-serif'); // In CSS
    // momentText.setAttribute('font-size', '14'); // In CSS
    // momentText.setAttribute('fill', 'black'); // In CSS
    momentText.textContent = 'Momento M_Ω = 0 Nm'; // Initial text

    svg.appendChild(wrenchHandle);
    svg.appendChild(poleOmega); // Draw pole on top of handle for clarity
    svg.appendChild(forceVectorLine);
    svg.appendChild(forceVectorHead);
    svg.appendChild(momentArrowPath);
    svg.appendChild(momentText); // Add text display to SVG
    svg.appendChild(pointP); // Draw P last so it's on top and draggable

    container.appendChild(svg);

    // Draggability for Point P
    let isDragging = false;
    pointP.addEventListener('mousedown', (e) => {
        isDragging = true;
        pointP.setAttribute('cursor', 'grabbing');
    });

    svg.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const svgRect = svg.getBoundingClientRect();
            let newX = e.clientX - svgRect.left;
            // Constrain P to the handle (between pole and end of handle)
            const handleStartX = parseFloat(wrenchHandle.getAttribute('x1'));
            const handleEndX = parseFloat(wrenchHandle.getAttribute('x2'));
            if (newX < handleStartX + 10) newX = handleStartX + 10; // Min distance from pole
            if (newX > handleEndX) newX = handleEndX;

            pX = newX;
            pointP.setAttribute('cx', pX.toString());
            updateForceVector();
            updateMoment();
        }
    });

    svg.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            pointP.setAttribute('cursor', 'grab');
        }
    });
    svg.addEventListener('mouseleave', () => { // Stop dragging if mouse leaves SVG
        if (isDragging) {
            isDragging = false;
            pointP.setAttribute('cursor', 'grab');
        }
    });

}

function setupRisultanteAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '400'); // Increased width for more space
    svg.setAttribute('height', '300'); // Increased height
    // Styling for this SVG will be in style.css, e.g., #risultante-animation svg { ... }
    container.appendChild(svg); // Add SVG first

    // Create a div for controls
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'risultante-controls';
    // controlsDiv styling will be in style.css

    // Sliders for Vector 1 (v1)
    controlsDiv.appendChild(createSlider('v1-magnitude', 'V1 Mag:', 10, 100, 50, 1));
    controlsDiv.appendChild(createSlider('v1-angle', 'V1 Angle:', 0, 360, 45, 1));

    // Sliders for Vector 2 (v2)
    controlsDiv.appendChild(createSlider('v2-magnitude', 'V2 Mag:', 10, 100, 50, 1));
    controlsDiv.appendChild(createSlider('v2-angle', 'V2 Angle:', 0, 360, 135, 1));

    container.appendChild(controlsDiv); // Add controls div after SVG

    // Placeholder for SVG vector elements (to be drawn based on sliders)
    const v1Path = document.createElementNS(svgNS, 'path');
    v1Path.id = 'v1-risultante'; // Style with CSS
    const v2Path = document.createElementNS(svgNS, 'path');
    v2Path.id = 'v2-risultante';
    const RPath = document.createElementNS(svgNS, 'path');
    RPath.id = 'R-risultante';

    svg.appendChild(v1Path);
    svg.appendChild(v2Path);
    svg.appendChild(RPath);

    // Define arrowhead markers
    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild); // Insert defs at the beginning of SVG

    createArrowheadMarker(svgNS, defs, 'arrowhead-v1', 'blue');
    createArrowheadMarker(svgNS, defs, 'arrowhead-v2', 'green');
    createArrowheadMarker(svgNS, defs, 'arrowhead-R', 'orange');

    // Apply markers to paths (can also be done in update function if style changes)
    v1Path.setAttribute('marker-end', 'url(#arrowhead-v1)');
    v2Path.setAttribute('marker-end', 'url(#arrowhead-v2)');
    RPath.setAttribute('marker-end', 'url(#arrowhead-R)');

    const svgWidth = parseFloat(svg.getAttribute('width'));
    const svgHeight = parseFloat(svg.getAttribute('height'));
    const origin = { x: svgWidth / 3, y: svgHeight / 2 }; // Adjusted origin for more space

    function updateRisultanteVisuals() {
        // Get slider values
        const v1Mag = parseFloat(document.getElementById('v1-magnitude').value);
        const v1AngleDeg = parseFloat(document.getElementById('v1-angle').value);
        const v2Mag = parseFloat(document.getElementById('v2-magnitude').value);
        const v2AngleDeg = parseFloat(document.getElementById('v2-angle').value);

        // Convert angles to radians
        const v1AngleRad = v1AngleDeg * Math.PI / 180;
        const v2AngleRad = v2AngleDeg * Math.PI / 180;

        // Calculate endpoints for v1
        // Note: SVG y-axis is downwards. For standard angle (0=right, 90=up), sin(angle) should be subtracted.
        // Or, treat angles as measured clockwise from positive x-axis if adding to y.
        // Let's use standard math angles (0=right, positive=CCW) and adjust y.
        const v1_endX = origin.x + v1Mag * Math.cos(v1AngleRad);
        const v1_endY = origin.y - v1Mag * Math.sin(v1AngleRad); // Subtract for upward Y in math coords

        // Calculate endpoints for v2 (starts at the head of v1)
        const v2_endX = v1_endX + v2Mag * Math.cos(v2AngleRad);
        const v2_endY = v1_endY - v2Mag * Math.sin(v2AngleRad); // Subtract for upward Y

        // Update path data
        v1Path.setAttribute('d', `M ${origin.x} ${origin.y} L ${v1_endX} ${v1_endY}`);
        v2Path.setAttribute('d', `M ${v1_endX} ${v1_endY} L ${v2_endX} ${v2_endY}`);
        RPath.setAttribute('d', `M ${origin.x} ${origin.y} L ${v2_endX} ${v2_endY}`);
    }

    // Add event listeners to sliders
    const sliders = ['v1-magnitude', 'v1-angle', 'v2-magnitude', 'v2-angle'];
    sliders.forEach(id => {
        const slider = document.getElementById(id);
        slider.addEventListener('input', updateRisultanteVisuals);
    });

    // Initial call to draw vectors
    updateRisultanteVisuals();
}

function setupMomentoRisultanteAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '450'); // Slightly wider for pole and moments
    svg.setAttribute('height', '350');
    // CSS: #momento-risultante-animation svg { ... }
    container.appendChild(svg);

    // --- Reusing slider setup from Risultante ---
    const controlsDiv_mrs = document.createElement('div'); // Renamed to avoid conflict
    controlsDiv_mrs.id = 'momento-risultante-controls';
    // CSS: #momento-risultante-controls { ... }

    controlsDiv_mrs.appendChild(createSlider('mrs-v1-magnitude', 'V1 Mag:', 10, 80, 50, 1)); // Shorter max mag
    controlsDiv_mrs.appendChild(createSlider('mrs-v1-angle', 'V1 Angle:', 0, 360, 30, 1));
    controlsDiv_mrs.appendChild(createSlider('mrs-v2-magnitude', 'V2 Mag:', 10, 80, 40, 1));
    controlsDiv_mrs.appendChild(createSlider('mrs-v2-angle', 'V2 Angle:', 0, 360, 150, 1));
    container.appendChild(controlsDiv_mrs); // Use the renamed variable here too

    // --- SVG Elements for vectors (v1, v2, R) and Pole (Ω) ---
    const defsMomentoR = document.createElementNS(svgNS, 'defs'); // Use a distinct defs for this SVG
    svg.insertBefore(defsMomentoR, svg.firstChild);

    createArrowheadMarker(svgNS, defsMomentoR, 'mrs-arrowhead-v1', 'blue');
    createArrowheadMarker(svgNS, defsMomentoR, 'mrs-arrowhead-v2', 'green');
    createArrowheadMarker(svgNS, defsMomentoR, 'mrs-arrowhead-moment', 'purple');

    const v1Path = document.createElementNS(svgNS, 'path');
    v1Path.id = 'mrs-v1';
    v1Path.setAttribute('marker-end', 'url(#mrs-arrowhead-v1)');
    const v2Path = document.createElementNS(svgNS, 'path');
    v2Path.id = 'mrs-v2';
    v2Path.setAttribute('marker-end', 'url(#mrs-arrowhead-v2)');
    svg.appendChild(v1Path);
    svg.appendChild(v2Path);

    // Pole Ω (draggable circle)
    const poleOmega = document.createElementNS(svgNS, 'circle');
    let omegaX = 50, omegaY = 50; // Initial position for Ω
    poleOmega.id = 'mrs-poleOmega'; // For CSS
    poleOmega.setAttribute('cx', omegaX.toString());
    poleOmega.setAttribute('cy', omegaY.toString());
    poleOmega.setAttribute('r', '10');
    poleOmega.setAttribute('cursor', 'grab');
    svg.appendChild(poleOmega);

    // Paths for individual moments M1, M2 and Resultant Moment MR
    const m1Path = document.createElementNS(svgNS, 'path'); m1Path.id = 'mrs-m1';
    m1Path.setAttribute('marker-end', 'url(#mrs-arrowhead-moment)');
    const m2Path = document.createElementNS(svgNS, 'path'); m2Path.id = 'mrs-m2';
    m2Path.setAttribute('marker-end', 'url(#mrs-arrowhead-moment)');
    const mRPath = document.createElementNS(svgNS, 'path'); mRPath.id = 'mrs-mR';
    mRPath.setAttribute('marker-end', 'url(#mrs-arrowhead-moment)');
    mRPath.style.strokeDasharray = "5,5"; // Dashed line for Resultant Moment
    svg.appendChild(m1Path); svg.appendChild(m2Path); svg.appendChild(mRPath);

    const momentText = document.createElementNS(svgNS, 'text'); // For displaying M_R value
    momentText.id = 'mrs-momentText'; // For CSS
    momentText.setAttribute('x', '10'); momentText.setAttribute('y', '20');
    svg.appendChild(momentText);

    const svgWidth = parseFloat(svg.getAttribute('width'));
    const svgHeight = parseFloat(svg.getAttribute('height'));
    const origin = { x: svgWidth / 2.5, y: svgHeight / 1.8 }; // Adjusted origin

    // --- Draggability for Pole Ω ---
    let isDraggingOmega = false;
    poleOmega.addEventListener('mousedown', () => { isDraggingOmega = true; poleOmega.setAttribute('cursor', 'grabbing'); });
    svg.addEventListener('mousemove', (e) => {
        if (isDraggingOmega) {
            const svgRect = svg.getBoundingClientRect();
            omegaX = e.clientX - svgRect.left;
            omegaY = e.clientY - svgRect.top;
            poleOmega.setAttribute('cx', omegaX.toString());
            poleOmega.setAttribute('cy', omegaY.toString());
            updateMomentoRisultanteVisuals();
        }
    });
    svg.addEventListener('mouseup', () => { if (isDraggingOmega) {isDraggingOmega = false; poleOmega.setAttribute('cursor', 'grab');}});
    svg.addEventListener('mouseleave', () => { if (isDraggingOmega) {isDraggingOmega = false; poleOmega.setAttribute('cursor', 'grab');}});

    function updateMomentoRisultanteVisuals() {
        // Get slider values
        const v1Mag = parseFloat(document.getElementById('mrs-v1-magnitude').value);
        const v1AngleDeg = parseFloat(document.getElementById('mrs-v1-angle').value);
        const v2Mag = parseFloat(document.getElementById('mrs-v2-magnitude').value);
        const v2AngleDeg = parseFloat(document.getElementById('mrs-v2-angle').value);

        const v1AngleRad = v1AngleDeg * Math.PI / 180;
        const v2AngleRad = v2AngleDeg * Math.PI / 180;

        // P1 (point of application for v1) is the origin for this system
        const p1 = { x: origin.x, y: origin.y };
        const v1 = {
            x: v1Mag * Math.cos(v1AngleRad),
            y: -v1Mag * Math.sin(v1AngleRad) // SVG y is inverted from math y
        };
        const v1_end = { x: p1.x + v1.x, y: p1.y + v1.y };
        v1Path.setAttribute('d', `M ${p1.x} ${p1.y} L ${v1_end.x} ${v1_end.y}`);

        // P2 (point of application for v2) is the head of v1
        const p2 = v1_end;
        const v2 = {
            x: v2Mag * Math.cos(v2AngleRad),
            y: -v2Mag * Math.sin(v2AngleRad)
        };
        const v2_end = { x: p2.x + v2.x, y: p2.y + v2.y };
        v2Path.setAttribute('d', `M ${p2.x} ${p2.y} L ${v2_end.x} ${v2_end.y}`);

        // Calculate moments (M = (P-Ω) ∧ v = (Px-Ωx)*vy - (Py-Ωy)*vx)
        // Moment of v1 about Ω
        const m1_val = (p1.x - omegaX) * v1.y - (p1.y - omegaY) * v1.x;
        // Moment of v2 about Ω
        const m2_val = (p2.x - omegaX) * v2.y - (p2.y - omegaY) * v2.x;

        const totalMoment = m1_val + m2_val;
        momentText.textContent = `Momento Risultante M_Ω(S) = ${totalMoment.toFixed(0)} Nm`;

        // Visualize moments (simplified: draw from Ω, radius proportional to magnitude)
        function drawMomentArc(pathElem, momentVal, baseRadius = 20, color = 'purple') {
            if (Math.abs(momentVal) < 1) { // Threshold to hide very small moments
                pathElem.setAttribute('d', ''); return;
            }
            const radius = baseRadius + Math.abs(momentVal) / 50; // Scale factor
            const startAngle = -Math.PI / 2;
            const arcDir = momentVal >= 0 ? 1 : -1;
            const endAngle = startAngle + arcDir * 1.5 * Math.PI; // 270 deg arc
            const sX = omegaX + radius * Math.cos(startAngle);
            const sY = omegaY + radius * Math.sin(startAngle);
            const eX = omegaX + radius * Math.cos(endAngle);
            const eY = omegaY + radius * Math.sin(endAngle);
            const sweep = momentVal >= 0 ? "1" : "0";
            pathElem.setAttribute('d', `M ${sX} ${sY} A ${radius} ${radius} 0 1 ${sweep} ${eX} ${eY}`);
            pathElem.style.stroke = color; // For individual moment colors if needed
        }
        drawMomentArc(m1Path, m1_val, 20, 'rgba(128,0,128,0.5)'); // M1 lighter purple
        drawMomentArc(m2Path, m2_val, 30, 'rgba(255,0,255,0.5)'); // M2 magenta
        drawMomentArc(mRPath, totalMoment, 40, 'purple'); // M_Resultant darker purple
    }

    const sliders = ['mrs-v1-magnitude', 'mrs-v1-angle', 'mrs-v2-magnitude', 'mrs-v2-angle'];
    sliders.forEach(id => {
        document.getElementById(id).addEventListener('input', updateMomentoRisultanteVisuals);
    });

    updateMomentoRisultanteVisuals(); // Initial draw
}

function setupMomentoTrasportoAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '300');
    // CSS: #momento-trasporto-animation svg { ... }
    container.appendChild(svg);

    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
    createArrowheadMarker(svgNS, defs, 'mt-arrowhead-vector', 'black');
    createArrowheadMarker(svgNS, defs, 'mt-arrowhead-moment', 'red'); // For M_A
    createArrowheadMarker(svgNS, defs, 'mt-arrowhead-momentB', 'blue'); // For M_B
    createArrowheadMarker(svgNS, defs, 'mt-arrowhead-term', 'green'); // For (A-B)∧v term

    // Define vector (P, v) - P is point of application, v is the vector
    const pVector = { x: 200, y: 150 }; // Point of application P
    const vVector = { x: 50, y: -30 };  // Vector v components (example)

    const vPath = document.createElementNS(svgNS, 'path');
    vPath.id = 'mt-vPath';
    vPath.setAttribute('marker-end', 'url(#mt-arrowhead-vector)');
    svg.appendChild(vPath);

    // Define Pole A (fixed)
    const poleA = { x: 50, y: 100, element: document.createElementNS(svgNS, 'circle') };
    poleA.element.id = 'mt-poleA';
    poleA.element.setAttribute('cx', poleA.x);
    poleA.element.setAttribute('cy', poleA.y);
    poleA.element.setAttribute('r', '8');
    svg.appendChild(poleA.element);

    // Define Pole B (draggable)
    const poleB = { x: 150, y: 200, element: document.createElementNS(svgNS, 'circle') };
    poleB.element.id = 'mt-poleB';
    poleB.element.setAttribute('cx', poleB.x);
    poleB.element.setAttribute('cy', poleB.y);
    poleB.element.setAttribute('r', '8');
    poleB.element.setAttribute('cursor', 'grab');
    svg.appendChild(poleB.element);

    // Paths for M_A, M_B, and the term (A-B)∧v (represented as arcs or values)
    const momentAPath = document.createElementNS(svgNS, 'path'); momentAPath.id = 'mt-momentAPath';
    momentAPath.setAttribute('marker-end', 'url(#mt-arrowhead-moment)');
    const momentBPath = document.createElementNS(svgNS, 'path'); momentBPath.id = 'mt-momentBPath';
    momentBPath.setAttribute('marker-end', 'url(#mt-arrowhead-momentB)');
    // const termPath = document.createElementNS(svgNS, 'path'); termPath.id = 'mt-termPath'; // If visualizing term vector
    // termPath.setAttribute('marker-end', 'url(#mt-arrowhead-term)');
    svg.appendChild(momentAPath); svg.appendChild(momentBPath); // svg.appendChild(termPath);

    const textDisplay = document.createElementNS(svgNS, 'text');
    textDisplay.id = 'mt-textDisplay';
    textDisplay.setAttribute('x', '10'); textDisplay.setAttribute('y', '20');
    svg.appendChild(textDisplay);

    // --- Draggability for Pole B ---
    let isDraggingPoleB = false;
    poleB.element.addEventListener('mousedown', () => { isDraggingPoleB = true; poleB.element.setAttribute('cursor', 'grabbing'); });
    svg.addEventListener('mousemove', (e) => {
        if (isDraggingPoleB) {
            const svgRect = svg.getBoundingClientRect();
            poleB.x = e.clientX - svgRect.left;
            poleB.y = e.clientY - svgRect.top;
            poleB.element.setAttribute('cx', poleB.x);
            poleB.element.setAttribute('cy', poleB.y);
            updateMomentoTrasportoVisuals();
        }
    });
    svg.addEventListener('mouseup', () => { if (isDraggingPoleB) {isDraggingPoleB = false; poleB.element.setAttribute('cursor', 'grab');}});
    svg.addEventListener('mouseleave', () => { if (isDraggingPoleB) {isDraggingPoleB = false; poleB.element.setAttribute('cursor', 'grab');}});


    function calculateMomentScalar(pole, point, vector) {
        // M_z = (Px - PoleX)*Vy - (Py - PoleY)*Vx
        return (point.x - pole.x) * vector.y - (point.y - pole.y) * vector.x;
    }

    function drawMomentArc(pathElem, pole, momentVal, baseRadius = 15) {
        if (Math.abs(momentVal) < 1) { pathElem.setAttribute('d', ''); return; }
        const radius = baseRadius + Math.abs(momentVal) / 50; // Adjust scale factor as needed
        const startAngle = -Math.PI / 2;
        const arcDir = momentVal >= 0 ? 1 : -1; // CCW or CW
        const endAngle = startAngle + arcDir * 1.5 * Math.PI; // 270 deg arc
        const sX = pole.x + radius * Math.cos(startAngle);
        const sY = pole.y + radius * Math.sin(startAngle);
        const eX = pole.x + radius * Math.cos(endAngle);
        const eY = pole.y + radius * Math.sin(endAngle);
        const sweep = momentVal >= 0 ? "1" : "0";
        pathElem.setAttribute('d', `M ${sX} ${sY} A ${radius} ${radius} 0 1 ${sweep} ${eX} ${eY}`);
    }

    function updateMomentoTrasportoVisuals() {
        // Draw vector v
        vPath.setAttribute('d', `M ${pVector.x} ${pVector.y} L ${pVector.x + vVector.x} ${pVector.y + vVector.y}`);

        const momentA_val = calculateMomentScalar(poleA, pVector, vVector);
        const momentB_val = calculateMomentScalar(poleB, pVector, vVector);

        // (A - B) vector
        const vecAB = { x: poleA.x - poleB.x, y: poleA.y - poleB.y };
        // Term (A - B) ∧ v
        const term_val = vecAB.x * vVector.y - vecAB.y * vVector.x;

        drawMomentArc(momentAPath, poleA, momentA_val);
        drawMomentArc(momentBPath, poleB, momentB_val);
        // drawMomentArc(termPath, poleB, term_val, 25); // Visualize term around B or A?

        textDisplay.innerHTML =
            `<tspan x="10" dy="0">M_A = ${momentA_val.toFixed(0)}</tspan>` +
            `<tspan x="10" dy="1.2em">M_B = ${momentB_val.toFixed(0)}</tspan>` +
            `<tspan x="10" dy="1.2em">(A-B)∧v = ${term_val.toFixed(0)}</tspan>` +
            `<tspan x="10" dy="1.2em">M_A + (A-B)∧v = ${(momentA_val + term_val).toFixed(0)}</tspan>`;
    }

    updateMomentoTrasportoVisuals();
}

function setupInvarianteScalareAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '300');
    // CSS: #invariante-scalare-animation svg { ... }
    container.appendChild(svg);

    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
    createArrowheadMarker(svgNS, defs, 'is-arrow-v', 'teal');
    createArrowheadMarker(svgNS, defs, 'is-arrow-r', 'orange');
    createArrowheadMarker(svgNS, defs, 'is-arrow-m', 'purple');


    // Define a simple system of 2 fixed applied vectors
    const system = [
        { p: { x: 100, y: 100 }, v: { x: 50, y: 20 } }, // (P1, v1)
        { p: { x: 150, y: 200 }, v: { x: -30, y: 40 } }  // (P2, v2)
    ];

    // Draggable Pole Ω
    const poleOmega = { x: 50, y: 150, element: document.createElementNS(svgNS, 'circle') };
    poleOmega.element.id = 'is-poleOmega';
    poleOmega.element.setAttribute('cx', poleOmega.x);
    poleOmega.element.setAttribute('cy', poleOmega.y);
    poleOmega.element.setAttribute('r', '8');
    poleOmega.element.setAttribute('cursor', 'grab');
    svg.appendChild(poleOmega.element);

    // Paths for vectors v1, v2, R, and Moment M_omega
    const v1Path = document.createElementNS(svgNS, 'path'); v1Path.id = 'is-v1Path';
    v1Path.setAttribute('marker-end', 'url(#is-arrow-v)');
    const v2Path = document.createElementNS(svgNS, 'path'); v2Path.id = 'is-v2Path';
    v2Path.setAttribute('marker-end', 'url(#is-arrow-v)');
    const RPath = document.createElementNS(svgNS, 'path'); RPath.id = 'is-RPath';
    RPath.setAttribute('marker-end', 'url(#is-arrow-r)');
    const MPath = document.createElementNS(svgNS, 'path'); MPath.id = 'is-MPath'; // For M_omega
    MPath.setAttribute('marker-end', 'url(#is-arrow-m)');
    svg.appendChild(v1Path); svg.appendChild(v2Path); svg.appendChild(RPath); svg.appendChild(MPath);

    const textDisplay = document.createElementNS(svgNS, 'text');
    textDisplay.id = 'is-textDisplay';
    textDisplay.setAttribute('x', '10'); textDisplay.setAttribute('y', '20');
    svg.appendChild(textDisplay);

    // Calculate Resultant R (fixed for this system)
    const R = { x: 0, y: 0 };
    system.forEach(item => {
        R.x += item.v.x;
        R.y += item.v.y;
    });

    // --- Draggability for Pole Ω ---
    let isDraggingOmega_IS = false; // Suffix to avoid conflict if script gets very large
    poleOmega.element.addEventListener('mousedown', () => { isDraggingOmega_IS = true; poleOmega.element.setAttribute('cursor', 'grabbing'); });
    svg.addEventListener('mousemove', (e) => {
        if (isDraggingOmega_IS) {
            const svgRect = svg.getBoundingClientRect();
            poleOmega.x = e.clientX - svgRect.left;
            poleOmega.y = e.clientY - svgRect.top;
            poleOmega.element.setAttribute('cx', poleOmega.x);
            poleOmega.element.setAttribute('cy', poleOmega.y);
            updateInvarianteScalareVisuals();
        }
    });
    svg.addEventListener('mouseup', () => { if (isDraggingOmega_IS) {isDraggingOmega_IS = false; poleOmega.element.setAttribute('cursor', 'grab');}});
    svg.addEventListener('mouseleave', () => { if (isDraggingOmega_IS) {isDraggingOmega_IS = false; poleOmega.element.setAttribute('cursor', 'grab');}});

    function calculateMomentScalar(pole, point, vector) {
        return (point.x - pole.x) * vector.y - (point.y - pole.y) * vector.x;
    }
    function drawMomentArc(pathElem, pole, momentVal, baseRadius = 15) {
        if (Math.abs(momentVal) < 0.1) { pathElem.setAttribute('d', ''); return; } // Hide if too small
        const radius = baseRadius + Math.abs(momentVal) / 100; // Adjust scale
        const startAngle = -Math.PI / 2;
        const arcDir = momentVal >= 0 ? 1 : -1;
        const endAngle = startAngle + arcDir * 1.5 * Math.PI;
        const sX = pole.x + radius * Math.cos(startAngle);
        const sY = pole.y + radius * Math.sin(startAngle);
        const eX = pole.x + radius * Math.cos(endAngle);
        const eY = pole.y + radius * Math.sin(endAngle);
        const sweep = momentVal >= 0 ? "1" : "0";
        pathElem.setAttribute('d', `M ${sX} ${sY} A ${radius} ${radius} 0 1 ${sweep} ${eX} ${eY}`);
    }

    function updateInvarianteScalareVisuals() {
        // Draw v1, v2
        v1Path.setAttribute('d', `M ${system[0].p.x} ${system[0].p.y} L ${system[0].p.x + system[0].v.x} ${system[0].p.y + system[0].v.y}`);
        v2Path.setAttribute('d', `M ${system[1].p.x} ${system[1].p.y} L ${system[1].p.x + system[1].v.x} ${system[1].p.y + system[1].v.y}`);

        // Draw R (from an arbitrary point, e.g., bottom-left, for visualization)
        const R_origin = {x: 30, y: svg.height - 30};
        RPath.setAttribute('d', `M ${R_origin.x} ${R_origin.y} L ${R_origin.x + R.x} ${R_origin.y + R.y}`);

        // Calculate M_omega_S (scalar sum of individual moments)
        let M_omega_S_scalar = 0;
        system.forEach(item => {
            M_omega_S_scalar += calculateMomentScalar(poleOmega, item.p, item.v);
        });
        drawMomentArc(MPath, poleOmega, M_omega_S_scalar);

        // Invariante Scalare I = R ⋅ M_Ω
        // For a planar system (R in XY plane, M_Ω is vector along Z axis), R = (Rx, Ry, 0), M_Ω = (0, 0, M_omega_S_scalar)
        // So, I = Rx*0 + Ry*0 + 0*M_omega_S_scalar = 0.
        const invarianteScalare = 0; // For any planar system, this is theoretically zero.

        textDisplay.innerHTML =
            `<tspan x="10" dy="0">R = (${R.x.toFixed(0)}, ${R.y.toFixed(0)})</tspan>` +
            `<tspan x="10" dy="1.2em">M_Ω(S) = ${M_omega_S_scalar.toFixed(0)} Nm (scalare)</tspan>` +
            `<tspan x="10" dy="1.2em">Invariante Scalare I = R ⋅ M_Ω = ${invarianteScalare}</tspan>` +
            `<tspan x="10" dy="1.2em">(Per sistemi piani, I è sempre 0)</tspan>`;
    }

    updateInvarianteScalareVisuals();
}

function setupCoppiaAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '300');
    // CSS: #coppia-animation svg { ... }
    container.appendChild(svg);

    const controlsDiv_coppia = document.createElement('div'); // Renamed to avoid conflict
    controlsDiv_coppia.id = 'coppia-controls';
    controlsDiv_coppia.appendChild(createSlider('coppia-v1-magnitude', 'V1 Mag:', 10, 100, 50, 1));
    controlsDiv_coppia.appendChild(createSlider('coppia-v1-angle', 'V1 Angle:', 0, 360, 0, 1));
    container.appendChild(controlsDiv_coppia);

    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
    createArrowheadMarker(svgNS, defs, 'ca-arrow-v1', 'red');
    createArrowheadMarker(svgNS, defs, 'ca-arrow-v2', 'blue');
    createArrowheadMarker(svgNS, defs, 'ca-arrow-m', 'purple'); // For couple's moment

    // Fixed points P1, P2
    const p1 = { x: 100, y: 150, element: document.createElementNS(svgNS, 'circle') };
    p1.element.id = 'ca-p1';
    p1.element.setAttribute('cx', p1.x); p1.element.setAttribute('cy', p1.y); p1.element.setAttribute('r', '5');
    svg.appendChild(p1.element);

    const p2 = { x: 300, y: 150, element: document.createElementNS(svgNS, 'circle') };
    p2.element.id = 'ca-p2';
    p2.element.setAttribute('cx', p2.x); p2.element.setAttribute('cy', p2.y); p2.element.setAttribute('r', '5');
    svg.appendChild(p2.element);

    // Paths for v1, v2, and Moment of Couple M
    const v1Path = document.createElementNS(svgNS, 'path'); v1Path.id = 'ca-v1Path';
    v1Path.setAttribute('marker-end', 'url(#ca-arrow-v1)');
    const v2Path = document.createElementNS(svgNS, 'path'); v2Path.id = 'ca-v2Path';
    v2Path.setAttribute('marker-end', 'url(#ca-arrow-v2)');
    const mCouplePath = document.createElementNS(svgNS, 'path'); mCouplePath.id = 'ca-mCouplePath';
    mCouplePath.setAttribute('marker-end', 'url(#ca-arrow-m)');
    svg.appendChild(v1Path); svg.appendChild(v2Path); svg.appendChild(mCouplePath);

    const textDisplay = document.createElementNS(svgNS, 'text');
    textDisplay.id = 'ca-textDisplay';
    textDisplay.setAttribute('x', '10'); textDisplay.setAttribute('y', '20');
    svg.appendChild(textDisplay);

    // Draggable Pole Ω (to demonstrate moment's independence) - OPTIONAL for couple itself
    // const poleOmega = { x: 50, y: 50, element: document.createElementNS(svgNS, 'circle') };
    // poleOmega.element.id = 'ca-poleOmega'; /* ... setup draggable pole ... */
    // svg.appendChild(poleOmega.element);

    function updateCoppiaVisuals() {
        const v1Mag = parseFloat(document.getElementById('coppia-v1-magnitude').value);
        const v1AngleDeg = parseFloat(document.getElementById('coppia-v1-angle').value);
        const v1AngleRad = v1AngleDeg * Math.PI / 180;

        const v1 = {
            x: v1Mag * Math.cos(v1AngleRad),
            y: -v1Mag * Math.sin(v1AngleRad) // SVG y is inverted
        };
        const v2 = { x: -v1.x, y: -v1.y }; // v2 = -v1

        // Draw v1 at P1
        v1Path.setAttribute('d', `M ${p1.x} ${p1.y} L ${p1.x + v1.x} ${p1.y + v1.y}`);
        // Draw v2 at P2
        v2Path.setAttribute('d', `M ${p2.x} ${p2.y} L ${p2.x + v2.x} ${p2.y + v2.y}`);

        // Resultant R (should be zero)
        const R = { x: v1.x + v2.x, y: v1.y + v2.y }; // Approximately zero due to float precision

        // Moment of the couple M_coppia = (P1 - P2) ∧ v1
        // Or M_coppia = P1P2 x v1 where P1P2 is vector from P2 to P1
        const P1P2 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const momentCouple_val = P1P2.x * v1.y - P1P2.y * v1.x;

        // Visualize moment of couple (e.g., around midpoint of P1P2)
        const midPoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        if (Math.abs(momentCouple_val) > 0.1) { // Draw if moment is significant
            const radius = 15 + Math.abs(momentCouple_val) / 100; // Scale factor for moment arc
            const startAngle = -Math.PI / 2;
            const arcDir = momentCouple_val >= 0 ? 1 : -1;
            const endAngle = startAngle + arcDir * 1.5 * Math.PI;
            const sX = midPoint.x + radius * Math.cos(startAngle);
            const sY = midPoint.y + radius * Math.sin(startAngle);
            const eX = midPoint.x + radius * Math.cos(endAngle);
            const eY = midPoint.y + radius * Math.sin(endAngle);
            const sweep = momentCouple_val >= 0 ? "1" : "0";
            mCouplePath.setAttribute('d', `M ${sX} ${sY} A ${radius} ${radius} 0 1 ${sweep} ${eX} ${eY}`);
        } else {
            mCouplePath.setAttribute('d', ''); // Hide if zero
        }

        textDisplay.innerHTML =
            `<tspan x="10" dy="0">R = (${R.x.toFixed(1)}, ${R.y.toFixed(1)}) (dovrebbe essere 0)</tspan>` +
            `<tspan x="10" dy="1.2em">M_coppia = ${momentCouple_val.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="1.2em">(Indipendente dal polo Ω)</tspan>`;
    }

    const sliders = ['coppia-v1-magnitude', 'coppia-v1-angle'];
    sliders.forEach(id => {
        document.getElementById(id).addEventListener('input', updateCoppiaVisuals);
    });

    updateCoppiaVisuals(); // Initial draw
}

function setupAsseCentraleAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '500'); // Wider for more complex scene
    svg.setAttribute('height', '400');
    // CSS: #asse-centrale-animation svg { ... }
    container.appendChild(svg);

    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
    // Arrowheads for vectors, R, M_O, M_Q, axis line if needed
    createArrowheadMarker(svgNS, defs, 'ac-arrow-v', 'gray');
    createArrowheadMarker(svgNS, defs, 'ac-arrow-r', 'orange');
    createArrowheadMarker(svgNS, defs, 'ac-arrow-m', 'purple'); // For moments

    // Define a simple system of 2 fixed applied vectors
    const system = [
        { id: 'v1', p: { x: 100, y: 100 }, v: { x: 60, y: 30 } },
        { id: 'v2', p: { x: 150, y: 250 }, v: { x: -40, y: 50 } }
        // { id: 'v3', p: { x: 350, y: 150 }, v: { x: 20, y: -70 } }
    ];

    // Draggable test Pole Q
    const poleQ = { x: 50, y: 50, element: document.createElementNS(svgNS, 'circle') };
    poleQ.element.id = 'ac-poleQ';
    poleQ.element.setAttribute('cx', poleQ.x); poleQ.element.setAttribute('cy', poleQ.y);
    poleQ.element.setAttribute('r', '8'); poleQ.element.setAttribute('cursor', 'grab');
    svg.appendChild(poleQ.element);

    // Paths for vectors, R, M_O (around origin), M_Q (around Q), Central Axis line
    system.forEach(item => {
        const path = document.createElementNS(svgNS, 'path');
        path.id = `ac-${item.id}Path`;
        path.setAttribute('marker-end', 'url(#ac-arrow-v)');
        svg.appendChild(path);
        item.pathElement = path;
    });

    const RPath = document.createElementNS(svgNS, 'path'); RPath.id = 'ac-RPath';
    RPath.setAttribute('marker-end', 'url(#ac-arrow-r)');
    svg.appendChild(RPath);

    const M_OPath = document.createElementNS(svgNS, 'path'); M_OPath.id = 'ac-M_OPath'; // Moment about Origin
    M_OPath.setAttribute('marker-end', 'url(#ac-arrow-m)');
    svg.appendChild(M_OPath);

    const M_QPath = document.createElementNS(svgNS, 'path'); M_QPath.id = 'ac-M_QPath'; // Moment about Q
    M_QPath.setAttribute('marker-end', 'url(#ac-arrow-m)');
    svg.appendChild(M_QPath);

    const centralAxisLine = document.createElementNS(svgNS, 'line');
    centralAxisLine.id = 'ac-centralAxisLine';
    svg.appendChild(centralAxisLine);

    const textDisplay = document.createElementNS(svgNS, 'text');
    textDisplay.id = 'ac-textDisplay';
    textDisplay.setAttribute('x', '10'); textDisplay.setAttribute('y', '20');
    svg.appendChild(textDisplay);

    // Define a visible origin for M_O calculation, e.g., bottom-left area
    const visualOrigin = { x: 50, y: svg.height - 30, element: document.createElementNS(svgNS, 'circle') };
    visualOrigin.element.id = 'ac-visualOrigin';
    visualOrigin.element.setAttribute('cx', visualOrigin.x);
    visualOrigin.element.setAttribute('cy', visualOrigin.y);
    visualOrigin.element.setAttribute('r', '6'); // Smaller than poles
    // visualOrigin.element.style.fill = 'black'; // This is now in CSS
    // visualOrigin.element.style.fill, stroke, strokeWidth moved to CSS
    svg.appendChild(visualOrigin.element);
    const originLabel = document.createElementNS(svgNS, 'text');
    originLabel.id = 'ac-originLabel'; // Added ID for styling
    originLabel.setAttribute('x', visualOrigin.x + 10);
    originLabel.setAttribute('y', visualOrigin.y + 5);
    originLabel.textContent = 'O';
    // originLabel.style.fontSize, fill moved to CSS
    svg.appendChild(originLabel);


    // Calculate R and M_O (fixed for this system, M_O is w.r.t visualOrigin)
    const R = { x: 0, y: 0 };
    system.forEach(item => { R.x += item.v.x; R.y += item.v.y; });

    let M_O_scalar = 0; // Moment about visualOrigin
    system.forEach(item => {
        M_O_scalar += (item.p.x - visualOrigin.x) * item.v.y - (item.p.y - visualOrigin.y) * item.v.x;
    });

    // For a planar system, I = R_z * M_Oz. If R is in XY (R_z=0), then I=0.
    const I_scalar = 0;

    // Central Axis: P_axis = H + μR. H = (R ∧ M_O) / |R|^2
    // If M_O is (0,0, M_O_scalar) and R is (Rx,Ry,0):
    // R ∧ M_O = (Ry*M_O_scalar, -Rx*M_O_scalar, 0)
    // |R|^2 = Rx^2 + Ry^2
    let H = {x:0, y:0};
    const R_mag_sq = R.x*R.x + R.y*R.y;
    if (R_mag_sq > 0.001) { // Avoid division by zero
        // H is the position vector from visualOrigin to a point on the central axis.
        // H_abs_x, H_abs_y will be absolute SVG coords for the point on axis.
        H.x = visualOrigin.x + (R.y * M_O_scalar) / R_mag_sq;
        H.y = visualOrigin.y + (-R.x * M_O_scalar) / R_mag_sq;
    } else { // R is zero, H is not well-defined by this formula. Axis depends on M_O.
        H.x = visualOrigin.x; // Default to origin if R=0
        H.y = visualOrigin.y;
    }
    // The axis is a line passing through H (absolute coords) and parallel to R.
    // Line equation: (y - H.y) / Rx = (x - H.x) / Ry  => Ry*y - Ry*H.y = Rx*x - Rx*H.x
    // Or, if Rx=0, x=H.x. If Ry=0, y=H.y.

    // --- Draggability for Pole Q --- (similar to previous animations)
    let isDraggingPoleQ_AC = false;
    poleQ.element.addEventListener('mousedown', () => {isDraggingPoleQ_AC = true; poleQ.element.setAttribute('cursor', 'grabbing');});
    svg.addEventListener('mousemove', (e) => {
        if (isDraggingPoleQ_AC) {
            const svgRect = svg.getBoundingClientRect();
            poleQ.x = e.clientX - svgRect.left; poleQ.y = e.clientY - svgRect.top;
            poleQ.element.setAttribute('cx', poleQ.x); poleQ.element.setAttribute('cy', poleQ.y);
            updateAsseCentraleVisuals();
        }
    });
    svg.addEventListener('mouseup', () => {if (isDraggingPoleQ_AC) {isDraggingPoleQ_AC = false; poleQ.element.setAttribute('cursor', 'grab');}});
    svg.addEventListener('mouseleave', () => {if (isDraggingPoleQ_AC) {isDraggingPoleQ_AC = false; poleQ.element.setAttribute('cursor', 'grab');}});

    // Removed local drawMomentArcLocal, will use global drawMomentArc
    // Removed local calculateMomentScalar, will use global calculateMomentScalar

    function updateAsseCentraleVisuals() {
        // Draw fixed system vectors
        system.forEach(item => {
            item.pathElement.setAttribute('d', `M ${item.p.x} ${item.p.y} L ${item.p.x + item.v.x} ${item.p.y + item.v.y}`);
        });

        // Draw R (from a fixed point for clarity)
        const R_display_origin = {x: 50, y: svg.height - 50};
        RPath.setAttribute('d', `M ${R_display_origin.x} ${R_display_origin.y} L ${R_display_origin.x + R.x} ${R_display_origin.y + R.y}`);

        // Draw M_O (moment about visualOrigin)
        drawMomentArc(M_OPath, visualOrigin, M_O_scalar, 20, 'red'); // Using global

        // Draw Central Axis Line through H (absolute coords) and parallel to R
        if (R_mag_sq > 0.001) {
            const normR_x = R.x / Math.sqrt(R_mag_sq);
            const normR_y = R.y / Math.sqrt(R_mag_sq);
            const scale = Math.max(parseFloat(svg.getAttribute('width')), parseFloat(svg.getAttribute('height'))) * 1.5;
            centralAxisLine.setAttribute('x1', (H.x - normR_x * scale).toString());
            centralAxisLine.setAttribute('y1', (H.y - normR_y * scale).toString());
            centralAxisLine.setAttribute('x2', (H.x + normR_x * scale).toString());
            centralAxisLine.setAttribute('y2', (H.y + normR_y * scale).toString());
        } else {
            centralAxisLine.setAttribute('x1', '0'); centralAxisLine.setAttribute('y1', '0');
            centralAxisLine.setAttribute('x2', '0'); centralAxisLine.setAttribute('y2', '0');
        }

        // Moment M_Q about draggable pole Q: M_Q = M_O + (O - Q) ∧ R
        // where O is visualOrigin, M_O is moment about visualOrigin
        const OQ_vec = { x: visualOrigin.x - poleQ.x, y: visualOrigin.y - poleQ.y };
        const OQ_cross_R_scalar = OQ_vec.x * R.y - OQ_vec.y * R.x; // This is (O-Q) x R
        const M_Q_scalar = M_O_scalar + OQ_cross_R_scalar;
        drawMomentArc(M_QPath, poleQ, M_Q_scalar, 15, 'blue'); // Using global

        let status = "";
        if (R_mag_sq < 0.001) {
            status = (Math.abs(M_O_scalar) < 0.001) ? "Sistema nullo (R=0, M_O=0)." : "Coppia pura (R=0). M_O = " + M_O_scalar.toFixed(0);
        } else {
            // For planar system, I=0. M_Q should be 0 if Q is on central axis.
            // Distance from Q to line defined by H and R:
            // dist = | Rx(Hy - Qy) - Ry(Hx - Qx) | / sqrt(Rx^2 + Ry^2)
            // Note: H.x, H.y are absolute coords of a point on the axis.
            const dist_Q_to_Axis_numerator = Math.abs(R.x * (H.y - poleQ.y) - R.y * (H.x - poleQ.x));
            const dist_Q_to_Axis = R_mag_sq > 0.001 ? dist_Q_to_Axis_numerator / Math.sqrt(R_mag_sq) : 0;

            // Check if M_Q is close to zero. For planar systems, this is the condition for being on the axis.
            if (Math.abs(M_Q_scalar) < 5) { // Adjusted threshold for M_Q near zero
                 status = "Q sull'asse centrale (M_Q ≈ 0)";
            } else {
                 status = `Q fuori dall'asse. Dist: ${dist_Q_to_Axis.toFixed(1)}`;
            }
        }

        textDisplay.innerHTML =
            `<tspan x="10" dy="0">R = (${R.x.toFixed(0)}, ${R.y.toFixed(0)})</tspan>` +
            `<tspan x="10" dy="1.2em">M_O (polo O) = ${M_O_scalar.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="1.2em">I = ${I_scalar} (sistema piano)</tspan>`+
            `<tspan x="10" dy="1.2em">M_Q (polo Q) = ${M_Q_scalar.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="2em" font-weight="bold">${status}</tspan>`;
    }
    updateAsseCentraleVisuals();
}

function setupVarignonAnimation(container) {
    container.innerHTML = ''; // Clear placeholder

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '450');
    svg.setAttribute('height', '350');
    // CSS: #varignon-animation svg { ... }
    container.appendChild(svg);

    // Controls for v1 and v2 (magnitude and angle)
    const controlsDiv = document.createElement('div');
    controlsDiv.id = 'varignon-controls';
    controlsDiv.appendChild(createSlider('var-v1-magnitude', 'V1 Mag:', 10, 80, 50, 1));
    controlsDiv.appendChild(createSlider('var-v1-angle', 'V1 Angle:', 0, 360, 30, 1));
    controlsDiv.appendChild(createSlider('var-v2-magnitude', 'V2 Mag:', 10, 80, 40, 1));
    controlsDiv.appendChild(createSlider('var-v2-angle', 'V2 Angle:', 0, 360, 120, 1));
    container.appendChild(controlsDiv);

    const defs = document.createElementNS(svgNS, 'defs');
    svg.insertBefore(defs, svg.firstChild);
    createArrowheadMarker(svgNS, defs, 'var-arrow-v1', 'blue');
    createArrowheadMarker(svgNS, defs, 'var-arrow-v2', 'green');
    createArrowheadMarker(svgNS, defs, 'var-arrow-R', 'orange');
    createArrowheadMarker(svgNS, defs, 'var-arrow-moment', 'purple');

    // Fixed Point of Concurrence C
    const C = { x: svg.width.baseVal.value / 2, y: svg.height.baseVal.value / 2, element: document.createElementNS(svgNS, 'circle') };
    C.element.id = 'var-C';
    C.element.setAttribute('cx', C.x); C.element.setAttribute('cy', C.y); C.element.setAttribute('r', '6');
    svg.appendChild(C.element);
    const cLabel = document.createElementNS(svgNS, 'text');
    cLabel.id = 'var-C-label'; // Added ID
    cLabel.setAttribute('x', C.x + 8); cLabel.setAttribute('y', C.y + 8); cLabel.textContent = 'C';
    svg.appendChild(cLabel);

    // Draggable Pole Ω
    const poleOmega = { x: 50, y: 50, element: document.createElementNS(svgNS, 'circle') };
    poleOmega.element.id = 'var-poleOmega';
    poleOmega.element.setAttribute('cx', poleOmega.x); poleOmega.element.setAttribute('cy', poleOmega.y);
    poleOmega.element.setAttribute('r', '8'); poleOmega.element.setAttribute('cursor', 'grab');
    svg.appendChild(poleOmega.element);
    const omegaLabel = document.createElementNS(svgNS, 'text');
    omegaLabel.id = 'var-omega-label'; // Added ID
    omegaLabel.setAttribute('x', poleOmega.x + 10); omegaLabel.setAttribute('y', poleOmega.y + 5); omegaLabel.textContent = 'Ω';
    svg.appendChild(omegaLabel);


    // Paths for v1, v2, R (all from C), M_omega(C,v1), M_omega(C,v2), M_omega(C,R)
    const v1Path = document.createElementNS(svgNS, 'path'); v1Path.id = 'var-v1Path';
    v1Path.setAttribute('marker-end', 'url(#var-arrow-v1)');
    const v2Path = document.createElementNS(svgNS, 'path'); v2Path.id = 'var-v2Path';
    v2Path.setAttribute('marker-end', 'url(#var-arrow-v2)');
    const RPath = document.createElementNS(svgNS, 'path'); RPath.id = 'var-RPath';
    RPath.setAttribute('marker-end', 'url(#var-arrow-R)');
    svg.appendChild(v1Path); svg.appendChild(v2Path); svg.appendChild(RPath);

    const m1Path = document.createElementNS(svgNS, 'path'); m1Path.id = 'var-m1Path';
    m1Path.setAttribute('marker-end', 'url(#var-arrow-moment)');
    const m2Path = document.createElementNS(svgNS, 'path'); m2Path.id = 'var-m2Path';
    m2Path.setAttribute('marker-end', 'url(#var-arrow-moment)');
    const mRPath = document.createElementNS(svgNS, 'path'); mRPath.id = 'var-mRPath'; // Moment of Resultant
    mRPath.setAttribute('marker-end', 'url(#var-arrow-moment)');
    svg.appendChild(m1Path); svg.appendChild(m2Path); svg.appendChild(mRPath);

    const textDisplay = document.createElementNS(svgNS, 'text');
    textDisplay.id = 'var-textDisplay';
    textDisplay.setAttribute('x', '10'); textDisplay.setAttribute('y', '20');
    svg.appendChild(textDisplay);

    // --- Draggability for Pole Ω ---
    let isDraggingOmega_Var = false;
    poleOmega.element.addEventListener('mousedown', () => { isDraggingOmega_Var = true; poleOmega.element.setAttribute('cursor', 'grabbing'); });
    svg.addEventListener('mousemove', (e) => {
        if (isDraggingOmega_Var) {
            const svgRect = svg.getBoundingClientRect();
            poleOmega.x = e.clientX - svgRect.left; poleOmega.y = e.clientY - svgRect.top;
            poleOmega.element.setAttribute('cx', poleOmega.x); poleOmega.element.setAttribute('cy', poleOmega.y);
            omegaLabel.setAttribute('x', poleOmega.x + 10); omegaLabel.setAttribute('y', poleOmega.y + 5);
            updateVarignonVisuals();
        }
    });
    svg.addEventListener('mouseup', () => { if (isDraggingOmega_Var) {isDraggingOmega_Var = false; poleOmega.element.setAttribute('cursor', 'grab');}});
    svg.addEventListener('mouseleave', () => { if (isDraggingOmega_Var) {isDraggingOmega_Var = false; poleOmega.element.setAttribute('cursor', 'grab');}});

    // Removed local calculateMomentScalarLocal and drawMomentArcLocalVar, will use global versions

    function updateVarignonVisuals() {
        const v1Mag = parseFloat(document.getElementById('var-v1-magnitude').value);
        const v1AngleDeg = parseFloat(document.getElementById('var-v1-angle').value);
        const v1AngleRad = v1AngleDeg * Math.PI / 180;
        const v1 = { x: v1Mag * Math.cos(v1AngleRad), y: -v1Mag * Math.sin(v1AngleRad) };
        v1Path.setAttribute('d', `M ${C.x} ${C.y} L ${C.x + v1.x} ${C.y + v1.y}`);

        const v2Mag = parseFloat(document.getElementById('var-v2-magnitude').value);
        const v2AngleDeg = parseFloat(document.getElementById('var-v2-angle').value);
        const v2AngleRad = v2AngleDeg * Math.PI / 180;
        const v2 = { x: v2Mag * Math.cos(v2AngleRad), y: -v2Mag * Math.sin(v2AngleRad) };
        v2Path.setAttribute('d', `M ${C.x} ${C.y} L ${C.x + v2.x} ${C.y + v2.y}`);

        const R = { x: v1.x + v2.x, y: v1.y + v2.y };
        RPath.setAttribute('d', `M ${C.x} ${C.y} L ${C.x + R.x} ${C.y + R.y}`);

        const m1_val = calculateMomentScalar(poleOmega, C, v1); // Using global
        const m2_val = calculateMomentScalar(poleOmega, C, v2); // Using global
        const sum_M_i = m1_val + m2_val;
        const mR_val = calculateMomentScalar(poleOmega, C, R); // Using global

        drawMomentArc(m1Path, poleOmega, m1_val, 20, 'rgba(0,0,255,0.5)'); // Using global
        drawMomentArc(m2Path, poleOmega, m2_val, 30, 'rgba(0,128,0,0.5)'); // Using global
        drawMomentArc(mRPath, poleOmega, mR_val, 40, 'rgba(255,165,0,0.7)'); // Using global

        textDisplay.innerHTML =
            `<tspan x="10" dy="0">M_Ω(C,v1) = ${m1_val.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="1.2em">M_Ω(C,v2) = ${m2_val.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="1.2em">Σ M_Ω(C,v_i) = ${sum_M_i.toFixed(0)} Nm</tspan>` +
            `<tspan x="10" dy="1.5em" font-weight="bold">M_Ω(C,R) = ${mR_val.toFixed(0)} Nm</tspan>`;
    }

    const sliders = ['var-v1-magnitude', 'var-v1-angle', 'var-v2-magnitude', 'var-v2-angle'];
    sliders.forEach(id => {
        document.getElementById(id).addEventListener('input', updateVarignonVisuals);
    });
    updateVarignonVisuals();
}
