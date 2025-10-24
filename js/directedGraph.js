window.GraphFunctions = window.GraphFunctions || {};

window.GraphFunctions.measureText = (text, fontSize = 12, fontFamily = 'sans-serif', maxWidth = 200) => {
    /**
     * Approximates the rendered width of a text string in pixels based on font size.
     * Does not access the DOM — safe to run in any environment.
     * Assumes average character width is 0.6 × fontSize (typical for sans-serif).
     *
     * @param {string} text - The text to measure.
     * @param {number} [fontSize=12] - Font size in pixels (must be a positive number).
     * @param {string} [fontFamily='sans-serif'] - Font family (not used in approximation).
     * @param {number} [maxWidth=200] - Maximum width in pixels.
     * @returns {number} - The estimated width of the text in pixels, capped at maxWidth (rounded).
     * @throws {TypeError} - If any argument is of invalid type or value.
     */
    // Validate input: text must be a string
    if (typeof text !== 'string') {
        throw new TypeError('measureText: "text" must be a string.');
    }

    // Validate fontSize: must be a positive number
    if (typeof fontSize !== 'number' || fontSize <= 0) {
        throw new TypeError('measureText: "fontSize" must be a positive number.');
    }

    // Validate fontFamily: must be a string
    if (typeof fontFamily !== 'string') {
        throw new TypeError('measureText: "fontFamily" must be a string.');
    }

    // Validate maxWidth: must be a positive number
    if (typeof maxWidth !== 'number' || maxWidth <= 0) {
        throw new TypeError('measureText: "maxWidth" must be a positive number.');
    }

    // Approximate average character width (0.6 × fontSize for sans-serif)
    const averageCharWidth = fontSize * 0.6;

    // Estimate width based on text length
    const estimatedWidth = text.length * averageCharWidth;

    // Cap the width at maxWidth
    return Math.min(Math.round(estimatedWidth), maxWidth);
};

window.GraphFunctions.setupSVG = (svgSelector) => {
    /**
   * Sets up a D3-managed SVG canvas with standard width, height, and arrowhead marker definition.
   * Clears all existing child elements and returns the D3 selection of the SVG element.
   * Expects D3.js and <svg id="{something}"</svg>
   * @param {string} svgSelector - A valid CSS selector for the SVG element (e.g., '#graph').
   * @returns {d3.Selection} - A D3 selection of the prepared SVG element.
   * @throws {TypeError} - If `svgSelector` is not a non-empty string.
   */

    // Input validation
    if (typeof svgSelector !== 'string' || svgSelector.trim() === '') {
        throw new TypeError('setupSVG: "svgSelector" must be a non-empty string.');
    }

    // Select the SVG element using D3
    const svg = d3.select(svgSelector);
    if (svg.empty()) {
        throw new Error(`setupsSVG: No element found for selector ${svgSelector}`);
    }

    // Set standard canvas size attributes
    svg.attr("height", 600).attr("width", "100%");

    // Remove all existing child elements to reset the canvas
    svg.selectAll("*").remove();

    // Append reusable arrow marker definition inside <defs>
    svg.append("defs").html(`
    <marker id="arrow" viewBox="0 -5 10 10" refX="20" refY="0"
      markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="#999" />
    </marker>
  `);

    // Return the prepared D3 selection (composable)
    return svg;
};

window.GraphFunctions.setupSimulation = (nodes, links, width, height) => {
    /**
     * Creates and returns a D3 force simulation configured with link, charge, and center forces.
     * Assumes D3.js is loaded globally and accessible as `d3`.
     *
     * @param {Array<Object>} nodes - Array of node objects with unique `id` properties.
     * @param {Array<Object>} links - Array of link objects with `source` and `target` references.
     * @param {number} width - Width of the simulation area (used for centering).
     * @param {number} height - Height of the simulation area (used for centering).
     * @returns {d3.Simulation} - A configured D3 force simulation.
     * @throws {TypeError} - If inputs are missing or not of expected types.
     * 
     * @dependencies Requires D3.js v5+ to be loaded globally as `d3`.
     */

    // Validate nodes and links arrays
    if (!Array.isArray(nodes)) {
        throw new TypeError('setupSimulation: "nodes" must be an array.');
    }
    if (!Array.isArray(links)) {
        throw new TypeError('setupSimulation: "links" must be an array.');
    }

    // Validate dimensions
    if (typeof width !== 'number' || width <= 0) {
        throw new TypeError('setupSimulation: "width" must be a positive number.');
    }
    if (typeof height !== 'number' || height <= 0) {
        throw new TypeError('setupSimulation: "height" must be a positive number.');
    }

    // Create the D3 force simulation
    return d3.forceSimulation(nodes)
        // Link force: connects nodes by ID, sets distance and strength
        .force("link", d3.forceLink(links).id(d => d.id).distance(120).strength(1))
        // Charge force: pushes nodes apart with negative strength
        .force("charge", d3.forceManyBody().strength(-300).distanceMax(300))
        // Centering force: pulls graph to center of viewport
        .force("center", d3.forceCenter(width / 2, height / 2));
};

window.GraphFunctions.renderLinks = (layer, links) => {
    /**
     * Binds an array of link data to SVG `<line>` elements inside the given D3 layer.
     * Uses the D3 data join pattern with `.join("line")` and applies standard styling.
     *
     * @param {d3.Selection} layer - The D3 selection (e.g. {"_d3Selector": "#test-svg"}) to render links into.
     * @param {Array<Object>} links - Array of link data objects, each with source/target references.
     * @returns {void}
     */
    layer.selectAll(".link")
        .data(links)
        .join("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrow)");

    // Log the rendered lines
    const lines = layer.selectAll("line").nodes();
    console.log("Rendered lines:", lines);
};

window.GraphFunctions.renderLinkLabels = (layer, links) => {
    /**
   * Renders link labels on a given layer.
   * 
   * @param {object} layer - The D3 selection of the layer to render labels on.
   * @param {Array.<{label: string}>} links - An array of link objects, each containing a 'label' property.
   * @returns {void}
   * @throws {TypeError} If the layer is not an object or links is not an array of objects with a 'label' property.
   */
    // Validate inputs
    if (typeof layer !== 'object' || typeof layer.selectAll !== 'function') {
        throw new TypeError('The first argument must be a D3 selection object.');
    }
    if (!Array.isArray(links) || !links.every(link => typeof link === 'object' && typeof link.label === 'string')) {
        throw new TypeError('The second argument must be an array of objects, each containing a string property "label".');
    }

    // Render link labels
    layer.selectAll(".label")
        .data(links)
        .join("text")
        .attr("class", "label")
        .text(d => d.label);
};

window.GraphFunctions.renderNodes = (layer, nodes, simulation, stateMap) => {
    /**
   * Renders nodes on a given layer.
   * 
   * @param {object} layer - The D3 selection of the layer to render nodes on.
   * @param {Array.<{id: string}>} nodes - An array of node objects, each containing an 'id' property.
   * @param {object} simulation - The D3 simulation object.
   * @param {object} stateMap - An object representing the state map.
   * @returns {void}
   * @throws {TypeError} If the layer is not an object, nodes is not an array of objects with an 'id' property, simulation is not an object, or stateMap is not an object.
   */
    // Validate inputs
    if (typeof layer !== 'object' || typeof layer.selectAll !== 'function') {
        throw new TypeError('The first argument must be a D3 selection object.');
    }
    if (!Array.isArray(nodes) || !nodes.every(node => typeof node === 'object' && typeof node.id === 'string')) {
        throw new TypeError('The second argument must be an array of objects, each containing a string property "id".');
    }
    if (typeof simulation !== 'object' || typeof simulation.on !== 'function') {
        throw new TypeError('The third argument must be a D3 simulation object.');
    }
    if (typeof stateMap !== 'object') {
        throw new TypeError('The fourth argument must be an object representing the state map.');
    }

    // Render nodes
    const nodeGroups = layer.selectAll(".node")
        .data(nodes, d => d.id)
        .join("g")
        .attr("class", "node")
        .call(drag(simulation));

    nodeGroups.each(function (d) {
        drawNode(d3.select(this), d, simulation, stateMap);
    });
};

window.GraphFunctions.drawNode = (group, d, simulation, stateMap) => {
    /**
 * Draws a node on a given group.
 * 
 * @param {object} group - The D3 selection of the group to draw the node on.
 * @param {object} d - The node data object.
 * @param {object} simulation - The D3 simulation object.
 * @param {object} stateMap - An object representing the state map.
 * @returns {void}
 * @throws {TypeError} If any of the inputs are not of the expected type.
 */
    // Validate inputs
    if (typeof group !== 'object' || typeof group.selectAll !== 'function') {
        throw new TypeError('The first argument must be a D3 selection object.');
    }
    if (typeof d !== 'object' || typeof d.name !== 'string') {
        throw new TypeError('The second argument must be an object with a "name" property.');
    }
    if (typeof simulation !== 'object' || typeof simulation.on !== 'function') {
        throw new TypeError('The third argument must be a D3 simulation object.');
    }
    if (typeof stateMap !== 'object') {
        throw new TypeError('The fourth argument must be an object representing the state map.');
    }

    // Remove existing elements
    group.selectAll("*").remove();

    const fontSize = 12,
        lineHeight = 1.2,
        maxWidth = 200,
        paddingX = 10,
        paddingY = 6;

    if (d.collapsed === undefined) d.collapsed = true;
    const collapsed = d.collapsed;

    // Measure natural width (no wrap)
    const naturalWidth = window.GraphFunctions.measureTextWidth(d.name, fontSize, lineHeight);

    let type = "Unknown";
    if (Array.isArray(d.type)) {
        type = d.type.join(", ");
    } else if (typeof d.type === "string") {
        type = d.type;
    }

    const fitsOnOneLine = naturalWidth <= maxWidth;
    const contentWidth = Math.min(naturalWidth, maxWidth);

    // Measure full height with wrapping for expanded state
    const fullHeight = window.GraphFunctions.measureTextHeight(d.name, contentWidth, fontSize, lineHeight);

    const collapsedHeight = Math.ceil(fontSize * lineHeight);
    const width = contentWidth + paddingX;
    const height = collapsed || fitsOnOneLine ? collapsedHeight + paddingY : fullHeight + paddingY;

    // Create a node group and assign the class 'node'
    const nodeGroup = group.append("g").attr("class", "node"); // <-- Added this line

    // Draw background
    nodeGroup.append("rect") // <-- Changed 'group' to 'nodeGroup'
        .attr("width", width)
        .attr("height", height)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", window.GraphFunctions.fillColor(type))
        .attr("stroke", window.GraphFunctions.strokeColor(type))
        .attr("stroke-width", 1.5);

    // Add text
    nodeGroup.append("foreignObject") // <-- Changed 'group' to 'nodeGroup'
        .attr("width", width)
        .attr("height", height)
        .append("xhtml:div")
        .style("font-size", fontSize + "px")
        .style("line-height", lineHeight)
        .style("width", contentWidth + "px")
        .style("height", height - paddingY + "px")
        .style("padding", paddingY / 2 + "px " + paddingX / 2 + "px")
        .style("overflow", "hidden")
        .style("white-space", collapsed ? "nowrap" : "normal")
        .style("text-overflow", collapsed && !fitsOnOneLine ? "ellipsis" : "clip")
        .text(d.name);

    // Click handler for long text and properties
    nodeGroup.style("cursor", "pointer"); // <-- Changed 'group' to 'nodeGroup'
    nodeGroup.on("click", () => { // <-- Changed 'group' to 'nodeGroup'
        showPropertyBox(d);
        if (!fitsOnOneLine) {
            d.collapsed = !collapsed;
            window.GraphFunctions.drawNode(group, d, simulation, stateMap);
            simulation.alpha(0.001).restart();
        }
    });

    nodeGroup.on("dblclick", (event) => { // <-- Changed 'group' to 'nodeGroup'
        event.stopPropagation();
        extendOneHop(d, stateMap);
    });

    nodeGroup.on("contextmenu", (event) => { // <-- Changed 'group' to 'nodeGroup'
        event.preventDefault();
        const confirmDelete = confirm(`Remove node "${d.name}" and all connected edges?`);
        if (!confirmDelete) return;
        stateMap.nodes = stateMap.nodes.filter((n) => n.id !== d.id);
        stateMap.links = stateMap.links.filter(
            (l) => (typeof l.source === "object" ? l.source.id : l.source) !== d.id &&
                (typeof l.target === "object" ? l.target.id : l.target) !== d.id
        );
        window.GraphFunctions.drawGraph(stateMap);
    });

    d._boxWidth = width;
    d._boxHeight = height;
};

window.GraphFunctions.measureTextWidth = (text, fontSize, lineHeight) => {
    /**
 * Measures the natural width of a text string.
 * 
 * @param {string} text - The text string to measure.
 * @param {number} fontSize - The font size in pixels.
 * @param {number} lineHeight - The line height in em units.
 * @returns {number} The natural width of the text string.
 */
    const dummy = document.createElement("div");
    dummy.style.fontSize = fontSize + "px";
    dummy.style.lineHeight = lineHeight + "em";
    dummy.style.visibility = "hidden";
    dummy.style.position = "absolute";
    dummy.style.whiteSpace = "nowrap";
    dummy.style.fontFamily = "sans-serif";
    dummy.innerText = text;
    document.body.appendChild(dummy);
    const width = dummy.scrollWidth;
    document.body.removeChild(dummy);
    return width;
};

window.GraphFunctions.measureTextHeight = (text, width, fontSize, lineHeight) => {
    /**
 * Measures the height of a text string with wrapping.
 * 
 * @param {string} text - The text string to measure.
 * @param {number} width - The width of the container in pixels.
 * @param {number} fontSize - The font size in pixels.
 * @param {number} lineHeight - The line height in em units.
 * @returns {number} The height of the text string with wrapping.
 */
    const dummy = document.createElement("div");
    dummy.style.fontSize = fontSize + "px";
    dummy.style.lineHeight = lineHeight + "em";
    dummy.style.visibility = "hidden";
    dummy.style.position = "absolute";
    dummy.style.whiteSpace = "normal";
    dummy.style.wordWrap = "break-word";
    dummy.style.width = width + "px";
    dummy.style.fontFamily = "sans-serif";
    dummy.innerText = text;
    document.body.appendChild(dummy);
    const height = dummy.scrollHeight;
    document.body.removeChild(dummy);
    return height;
};

window.GraphFunctions.fillColor = (type = "") => {
    /**
 * Determines the fill color based on the node type.
 * 
 * @param {string} type - The node type.
 * @returns {string} The fill color.
 */
    if (type == "Ontology") return "#FAD9DD";
    if (type.includes("NamedIndividual")) return "#D8BFD8";
    if (type == "Class") return "#F5DE82";
    if (type.includes("DataType")) return "#A9FFA9";
    if (type.includes("Annotation")) return "#FFC4A0";
    if (type.includes("ObjectProperty")) return "#D9EDF7";
    return "#D4D4D4";
};

window.GraphFunctions.strokeColor = (type = "") => {
    /**
 * Determines the stroke color based on the node type.
 * 
 * @param {string} type - The node type.
 * @returns {string} The stroke color.
 */
    if (type == "Ontology") return "#7A353C";
    if (type.includes("NamedIndividual")) return "#592559";
    if (type == "Class") return "#F4BD37";
    if (type.includes("DataType")) return "#285528";
    if (type.includes("Annotation")) return "#FCA045";
    if (type.includes("ObjectProperty")) return "#4682B4";
    return "#7F7F7F";
};

window.GraphFunctions.drawGraph = (state) => {
    console.log(
        "Drawing graph with",
        state.nodes.length,
        "nodes and",
        state.links.length,
        "links"
    );

    const { svg, zoomLayer } = window.GraphFunctions.initializeCanvas("#graph", state.transform);
    // const filterOptions = getFilterOptionsFromDOM();
    // const { visibleNodes, visibleLinks } = filterGraph(
    //   state.nodes,
    //   state.links,
    //   filterOptions
    // );
    //  const simulation = bindSimulation(
    //   zoomLayer,
    //   visibleNodes,
    //   visibleLinks
    // );
    const visibleLinks = state.links;
    const visibleNodes = state.nodes;
    const simulation = window.GraphFunctions.bindSimulation(
        zoomLayer,
        visibleNodes,
        visibleLinks
    );
    window.GraphFunctions.renderLinks(zoomLayer, visibleLinks);
    window.GraphFunctions.renderLinkLabels(zoomLayer, visibleLinks);
    window.GraphFunctions.renderNodes(zoomLayer, visibleNodes, simulation, new Map());
};

window.GraphFunctions.initializeCanvas = (selector, currentTransform = d3.zoomIdentity) => {
    const svg = window.GraphFunctions.setupSVG(selector);
    const zoomLayer = svg.append("g").attr("class", "zoom-layer");

    const zoom = d3
        .zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            state.transform = event.transform;
            zoomLayer.attr("transform", event.transform);
        });

    svg.call(zoom);
    if (currentTransform) svg.call(zoom.transform, currentTransform);

    return { svg, zoomLayer };
};

window.GraphFunctions.extendOneHop = (node, state, fullGraph) => {
    /**
   * Extends the graph by one hop from the given node.
   * 
   * @param {object} node - The node from which to extend the graph.
   * @param {object} state - The current state of the graph.
   * @returns {void}
   * @throws {TypeError} If any of the inputs are not of the expected type.
   */
    // Validate inputs
    if (typeof node !== 'object' || typeof node.id !== 'string') {
        throw new TypeError('The first argument must be an object with an "id" property.');
    }
    if (typeof state !== 'object' || !Array.isArray(state.nodes) || !Array.isArray(state.links)) {
        throw new TypeError('The second argument must be an object with "nodes" and "links" arrays.');
    }
    if (!Array.isArray(fullGraph)) {
        throw new TypeError('The third argument must be an array representing the full graph in JSON-LD format.');
    }

    try {
        const newGraph = MyFunctions.generateEntityGraphFromRDFRepresentation(fullGraph, node.id, 1);

        const newNodes = newGraph.nodes.filter(
            (n) => !state.nodes.some((cn) => cn.id === n.id)
        );
        const newLinks = newGraph.links.filter(
            (l) =>
                !state.links.some(
                    (cl) =>
                        (cl.source.id || cl.source) === (l.source.id || l.source) &&
                        (cl.target.id || cl.target) === (l.target.id || l.target)
                )
        );

        state.nodes.push(...newNodes);
        state.links.push(...newLinks);

        window.GraphFunctions.drawGraph(state);
    } catch (e) {
        console.error("Failed to extend node:", e);
        alert("Error extending node: " + e.message);
    }
};

window.GraphFunctions.setupSVG = (svgSelector) => {
    const svg = d3.select(svgSelector);
    svg.attr("height", 600).attr("width", "100%");
    svg.selectAll("*").remove();
    svg.append("defs").html(`
    <marker id="arrow" viewBox="0 -5 10 10" refX="20" refY="0"
      markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,-5L10,0L0,5" fill="#999" />
    </marker>
  `);
    return svg;
};

window.GraphFunctions.getFilterOptionsFromDOM = () => {
    return {
        hideBNodes: document.getElementById("hideBNodes").checked,
        hideAxioms: document.getElementById("hideAxioms").checked,
        selectedTypes: Array.from(
            document.getElementById("typeFilter").selectedOptions
        )
            .map((opt) => opt.value)
            .filter((v) => v),
    };
};


window.GraphFunctions.bindSimulation = (zoomLayer, nodes, links) => {
    /**
     * Binds a D3 force simulation to an SVG zoom layer, wiring up a `tick` handler
     * that updates positions of nodes, links, and labels on every simulation frame.
     *
     * @param {d3.Selection} zoomLayer - The D3 selection of the container group (e.g., a <g> element).
     * @param {Array<Object>} nodes - Array of node objects with position properties (e.g., {id, x, y}).
     * @param {Array<Object>} links - Array of link objects with `source` and `target` references.
     * @returns {d3.Simulation} - The configured and bound D3 force simulation.
     *
     * @throws {TypeError} - If any argument is missing or of an unexpected type.
     */

    // ✅ Input validation
    if (!zoomLayer || typeof zoomLayer.selectAll !== "function") {
        throw new TypeError('bindSimulation: "zoomLayer" must be a valid D3 selection.');
    }
    if (!Array.isArray(nodes)) {
        throw new TypeError('bindSimulation: "nodes" must be an array.');
    }
    if (!Array.isArray(links)) {
        throw new TypeError('bindSimulation: "links" must be an array.');
    }

    // ✅ Get SVG size from parent SVG element of zoomLayer
    const svgElement = zoomLayer.node()?.ownerSVGElement;
    if (!svgElement) {
        throw new Error("bindSimulation: zoomLayer must be inside an SVG element.");
    }

    const { width, height } = svgElement.getBoundingClientRect();

    // ✅ Create the force simulation
    const simulation = window.GraphFunctions.setupSimulation(
        nodes,
        links,
        +width,
        +height
    );

    // ✅ Bind the tick update logic
    simulation.on("tick", () => {
        zoomLayer
            .selectAll(".link")
            .attr("x1", (d) => d?.source?.x ?? 0)
            .attr("y1", (d) => d?.source?.y ?? 0)
            .attr("x2", (d) => d?.target?.x ?? 0)
            .attr("y2", (d) => d?.target?.y ?? 0);

        zoomLayer
            .selectAll(".label")
            .attr("x", (d) => ((d?.source?.x ?? 0) + (d?.target?.x ?? 0)) / 2)
            .attr("y", (d) => ((d?.source?.y ?? 0) + (d?.target?.y ?? 0)) / 2);

        zoomLayer
            .selectAll(".node")
            .attr("transform", (d) => {
                const x = (d?.x ?? 0) - (d?._boxWidth || 0) / 2;
                const y = (d?.y ?? 0) - (d?._boxHeight || 0) / 2;
                return `translate(${x},${y})`;
            });
    });

    return simulation;
};
