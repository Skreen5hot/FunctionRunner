(function (window) {
    'use strict';

    function parseInput(value) {
        try {
            const parsed = JSON.parse(value);
            if (parsed && parsed._d3Selector) {
                // Recognize and return a D3 selection
                return d3.select(parsed._d3Selector);
            }
            return parsed;
        } catch {
            return value;
        }
    }

    function extractJsDocComments(fn) {
        const match = fn.toString().match(/\/\*\*([\s\S]*?)\*\//);
        return match ? match[1].trim() : "No documentation found.";
    }

    function getParamNames(func) {
        const fnStr = func.toString()
            .replace(/\/\/.*$/gm, "")            // remove line comments
            .replace(/\/\*[\s\S]*?\*\//g, "")     // remove block comments
            .replace(/\s+/g, " ");                // collapse whitespace

        const match = fnStr.match(/^[^(]*\(([^)]*)\)/);  // match parameters inside parentheses

        if (!match) return [];

        return match[1].split(",").map(p => p.trim().split("=")[0].trim()).filter(Boolean);
    }

    function buildFunctionUI(name, fn) {
        const box = document.createElement("div");
        box.className = "function-box";
        box.innerHTML = ""; // Clear previous content

        const title = document.createElement("h3");
        title.textContent = name;
        box.appendChild(title);

        const comments = document.createElement("pre");
        comments.textContent = extractJsDocComments(fn);
        box.appendChild(comments);

        // Use <details> for a collapsible source code view
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = "Show Source Code";
        summary.style.fontWeight = "bold";
        summary.style.cursor = "pointer";
        summary.style.marginTop = "10px";

        const codeBlock = document.createElement("pre");
        codeBlock.textContent = fn.toString();

        details.appendChild(summary);
        details.appendChild(codeBlock);
        box.appendChild(details);

        const paramNames = getParamNames(fn);
        const inputs = [];

        paramNames.forEach((param) => {
            const label = document.createElement("label");
            label.textContent = param + ":";
            const input = document.createElement("input");
            input.placeholder = "Enter value for " + param;
            inputs.push(input);
            box.appendChild(label);
            box.appendChild(input);
            box.appendChild(document.createElement("br"));
        });

        const runButton = document.createElement("button");
        runButton.textContent = "Run";
        const output = document.createElement("div");
        output.className = "output";
        const tip = document.createElement("small");
        tip.textContent = "Supports JSON input like [1,2], {x:5}, etc. For D3 selections, use {\"_d3Selector\": \"#test-svg\"}.";

        runButton.addEventListener('click', () => {
            try {
                const args = inputs.map((input) => {
                    let val = input.value.trim();
                    if (val === "") {
                        val = null; // Treat blank inputs as null
                    }
                    return parseInput(val);
                });

                console.log("Parsed Inputs for Function:", args);

                const result = fn(...args);

                console.log("Function Output:", result);

                output.textContent = "Output: " + JSON.stringify(result, null, 2);
            } catch (err) {
                console.error("Function Error:", err);
                output.textContent = "Error: " + (err && err.message ? err.message : String(err));
            }
        });

        box.appendChild(runButton);
        box.appendChild(tip);
        box.appendChild(output);

        // Run test if available
        if (window.FunctionTests && window.FunctionTests[name]) {
            const test = window.FunctionTests[name];

            let passed;
            let testOutput;

            try {
                const shouldSpread = test.spread !== false; // default to spreading
                testOutput = shouldSpread
                    ? fn(...test.inputs[0])      // for multi-arg functions
                    : fn(test.inputs[0]);        // for batch functions like array-only

                if (typeof test.assert === "function") {
                    passed = test.assert(testOutput, test.expected);
                } else {
                    passed = JSON.stringify(testOutput) === JSON.stringify(test.expected);
                }
            } catch (err) {
                passed = false;
                testOutput = { error: err && err.message ? err.message : String(err) };
            }

            const resultDiv = document.createElement("div");
            resultDiv.className = "test-result " + (passed ? "pass" : "fail");
            resultDiv.textContent =
                (passed ? "✅" : "❌") + " Test " + (passed ? "Passed" : "Failed");

            const testDetail = document.createElement("pre");
            let actualDisplay;

            if (typeof test.describeActual === "function") {
                try {
                    actualDisplay = test.describeActual(testOutput, test.expected, test.inputs[0]);
                } catch (e) {
                    actualDisplay = { error: "describeActual() threw error", message: e.message };
                }
            } else {
                actualDisplay = testOutput;
            }

            testDetail.textContent =
                "Test Input:\n" +
                JSON.stringify(test.inputs[0], null, 2) +
                "\nExpected:\n" +
                JSON.stringify(test.expected, null, 2) +
                "\nActual:\n" +
                JSON.stringify(actualDisplay, null, 2);

            box.appendChild(resultDiv);
            box.appendChild(testDetail);
        }

        return box;
    }

    function initializeUI() {
        const select = document.getElementById("functionSelect");
        const container = document.getElementById("functionContainer");

        if (!select || !container) {
            console.warn('initializeUI: missing #functionSelect or #functionContainer in DOM');
            return;
        }

        // Combine both MyFunctions and GraphFunctions into one object
        const allFunctions = Object.assign({}, window.MyFunctions || {}, window.GraphFunctions || {});

        // Store it for reuse if needed (optional)
        window.AllFunctions = allFunctions;

        // Populate dropdown
        Object.keys(allFunctions).forEach(name => {
            const option = document.createElement("option");
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });

        // On selection, find function from the combined map
        select.addEventListener("change", () => {
            container.innerHTML = "";
            const selectedName = select.value;

            if (selectedName && allFunctions[selectedName]) {
                const ui = buildFunctionUI(selectedName, allFunctions[selectedName]);
                container.appendChild(ui);
            }
        });
    }

    // Expose a small API for other scripts/tests and avoid polluting more globals
    window.FunctionsUI = window.FunctionsUI || {};
    window.FunctionsUI.initializeUI = initializeUI;

    // Initialize when DOM is ready (safer than window.onload)
    document.addEventListener('DOMContentLoaded', initializeUI);

})(window);
