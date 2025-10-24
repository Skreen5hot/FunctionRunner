Here is a `README.md` file for your project, written in GitHub-flavored Markdown.

-----

# Browser-Native JS Function Sandbox

A simple, zero-configuration, client-side testing framework for interactively running and debugging JavaScript functions directly in the browser.

It's a "living documentation" portal that combines JSDoc comments, a manual "sandbox" runner, and automated unit tests all in one simple HTML file.

*(Note: Replace with a real screenshot of your tool\!)*

## Why Use This? (A Valid Alternative to Jest)

While frameworks like **Jest** are essential for *automated regression testing* in a CI/CD pipeline, they run in a simulated Node.js/JSDOM environment. This tool fills a different, crucial gap.

This framework is a powerful alternative for:

1.  **True Browser-Native Testing:** Test code that *must* run in a real browser. It's perfect for **D3.js visualizations**, SVG manipulation, or any function that interacts with browser APIs (like `localStorage` or the DOM) that JSDOM can't fully simulate.
2.  **Interactive Debugging:** It's not just a "pass/fail" report. It's an interactive sandbox. If a test fails, you can immediately use the manual input fields to tweak the parameters and debug the function live.
3.  **Living Documentation:** The UI automatically parses and displays your JSDoc comments alongside the function's test and runner. This makes it an excellent tool for exploring an API or teaching a concept.
4.  **Zero Configuration:** No `npm install`, no `node_modules`, no `jest.config.js`, no build steps. It's just one `index.html` file and your JavaScript files. This makes it perfect for rapid prototyping, data visualization projects, and algorithm development.

## Features

  * **Function Discovery:** Automatically populates a dropdown with all functions found in your JS files.
  * **JSDoc Parsing:** Displays documentation for the selected function.
  * **Parameter Detection:** Automatically creates labeled input fields for each of the function's parameters.
  * **Interactive Runner:** A "Run" button to execute the function with your manually entered inputs.
  * **Automated Testing:** Automatically finds and runs a corresponding test for the selected function.
  * **Rich Test Reports:** Shows a clear "✅ Pass" or "❌ Fail" status, along with the `Test Input`, `Expected` output, and `Actual` output.
  * **D3-Aware:** Includes a helper to pass live D3 selections (e.g., `d3.select("#test-svg")`) as arguments from the manual runner.
  * **Custom Assertions:** Define your own pass/fail logic for complex tests.

## How to Use

1.  **Add Your Functions:**
    Place your functions inside an object on the `window` scope. For example, in `functions.js`:

    ```javascript
    /**
     * Adds two numbers together.
     * @param {number} a - The first number.
     * @param {number} b - The second number.
     * @returns {number} The sum.
     */
    function add(a, b) {
      return a + b;
    }

    // Expose your functions
    window.MyFunctions = {
      add: add,
    };
    ```

2.  **Add Your Tests:**
    Create a corresponding test object in `tests.js`:

    ```javascript
    // Expose your tests
    window.FunctionTests = {
      // The key 'add' must match the key in window.MyFunctions
      add: {
        // 'inputs' is an array of argument lists.
        // This test will run with fn(2, 3)
        inputs: [
          [2, 3]
        ],
        // 'expected' is the value the test expects to receive
        expected: 5
      }
    };
    ```

3.  **Open `index.html`:**
    Open the `index.html` file in your browser. No server or build step needed. Select your "add" function from the dropdown to see the test run\!

## Advanced Test Definitions

The test object in `tests.js` supports more than just `inputs` and `expected`.

### 1\. Custom Assertion Logic (`assert`)

By default, the framework compares `Actual` and `Expected` using `JSON.stringify`. For complex objects, D3 selections, or partial checks, you can provide a custom `assert` function.

```javascript
FunctionTests = {
  findNodeById: {
    inputs: [
      [/* complex graph data */, "node-3"]
    ],
    expected: { id: "node-3", name: "My Node" },

    /**
     * @param {*} actual - The value your function returned.
     * @param {*} expected - The 'expected' value from this test object.
     * @returns {boolean} - true if the test passed, false if it failed.
     */
    assert: (actual, expected) => {
      // Don't check the whole object, just the ID
      return actual && actual.id === expected.id;
    }
  }
};
```

### 2\. Custom "Actual" Display (`describeActual`)

The `Actual` output can be a massive, unreadable object (like a D3 selection). Use `describeActual` to format the "Actual" block in the test report into something human-readable.

```javascript
FunctionTests = {
  renderGraph: {
    inputs: [
      { "_d3Selector": "#test-svg" }, // Special helper for D3
      [/* node data */]
    ],
    expected: 3, // e.g., we expect 3 <circle> elements to be created

    assert: (actual, expected) => {
      // 'actual' is the D3 selection returned by the function
      return actual.selectAll("circle").size() === expected;
    },

    /**
     * @param {*} actual - The value your function returned.
     * @returns {*} - A JSON-friendly value to be displayed in the report.
     */
    describeActual: (actual) => {
      // Instead of logging the giant D3 object, log the count we care about.
      return {
        nodeCount: actual.selectAll("circle").size(),
        textLabelCount: actual.selectAll("text").size()
      };
    }
  }
};
```

### 3\. Batch/Single-Argument Functions (`spread: false`)

By default, the test runner *spreads* the first input array as arguments: `fn(...test.inputs[0])`.

If your function takes a *single array* as its argument (e.g., `mySortFunction([3, 1, 2])`), set `spread: false`.

```javascript
FunctionTests = {
  sortNumbers: {
    inputs: [
      [3, 1, 2] // This will be passed as ONE argument
    ],
    expected: [1, 2, 3],
    spread: false // Tells the runner to call fn([3, 1, 2])
  }
};
```

## License

This project is available as open-source under the terms of the [MIT License](https://opensource.org/licenses/MIT).