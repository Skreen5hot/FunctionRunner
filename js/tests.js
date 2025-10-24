/**
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Test Helper Convention Guide                          ┃
 * ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
 * ┃ 🔁 GLOBAL HELPERS:                                    ┃
 * ┃   - Stored in TestUtils (e.g., TestUtils.deepEqual)   ┃
 * ┃   - Reused across multiple tests                      ┃
 * ┃   - Prefixed with 'TestUtils.'                        ┃
 * ┃   - Comment: // 🔁 GLOBAL TEST HELPER                 ┃
 * ┃                                                       ┃
 * ┃ 🔒 TEST-LOCAL HELPERS:                                ┃
 * ┃   - Defined inline in FunctionTests["testName"]       ┃
 * ┃   - Not reused elsewhere                              ┃
 * ┃   - Comment: // 🔒 TEST-LOCAL HELPER                  ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */


// Ensure the FunctionTests object exists
window.FunctionTests = window.FunctionTests || {};

// Ensure the TestUtils object exists
window.TestUtils = window.TestUtils || {};

// 🧠 GLOBAL HELPER — defined in TestUtils
//TestUtils.deepEqual = function(a, b) { ... };

// 🧠 GLOBAL HELPER — describe simulation object
//TestUtils.describeD3Simulation = function(sim) { ... };

// 🧠 GLOBAL HELPER — Define the reusable D3 simulation test helper
TestUtils.d3SimulationTest = function (expected) {
    return function (result) {
        if (typeof result !== "object" || typeof result.force !== "function") return false;

        const allForcesPresent = expected.requiredForces.every(name => typeof result.force(name) === "function");

        const nodes = result.nodes?.();
        const links = result.force("link")?.links?.();

        return (
            allForcesPresent &&
            Array.isArray(nodes) &&
            nodes.length === expected.nodeCount &&
            (!expected.linkCount || (Array.isArray(links) && links.length === expected.linkCount))
        );
    };
};
//another helper
TestUtils.describeD3Simulation = function (sim) {
    try {
        const nodes = sim.nodes?.() ?? [];
        const linkForce = sim.force("link");
        const links = linkForce?.links?.() ?? [];

        const availableForces = ["link", "charge", "center"].filter(
            name => typeof sim.force(name) === "function"
        );

        return {
            nodeCount: nodes.length,
            linkCount: links.length,
            forces: availableForces
        };
    } catch (err) {
        return { error: "Failed to describe simulation", message: err.message };
    }
};

//Another helper
TestUtils.assertRenderedLines = function (expected) {
    return function (_, __, [layer]) {
        const lines = layer.selectAll("line").nodes();

        const actualClasses = lines.map(el => el.getAttribute("class"));

        console.log("Assert Debug: rended =", lines.length, "expected =", expected.renderedCount);
        console.log("Assert Debug: actualClasses =", actualClasses, "expected =", expected.classes);

        const classMatch = expected.classes
            ? actualClasses.length === expected.classes.length &&
            actualClasses.every((c, i) => c === expected.classes[i])
            : true; // if no classes expected, ignore

        const countMatch = typeof expected.renderedCount === "number"
            ? lines.length === expected.renderedCount
            : true; // if no count expected, ignore

        return countMatch && classMatch;
    };
};

//Another helper
TestUtils.describeRenderedLines = function (_, __, [layer]) {
    if (!layer || typeof layer.selectAll !== "function") {
        return { error: "Invalid layer" };
    }

    const lines = layer.selectAll("line").nodes();
    return {
        renderedCount: lines.length,
        classes: lines.map(el => el.getAttribute("class"))
    };
};

//Another helper
TestUtils.deepEqual = function (a, b) {
    if (a === b) return true;

    if (typeof a !== typeof b || a == null || b == null) return false;

    if (Array.isArray(a) && Array.isArray(b)) {
        return a.length === b.length &&
            a.every((val, idx) => TestUtils.deepEqual(val, b[idx]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length) return false;

        return aKeys.every(key =>
            b.hasOwnProperty(key) &&
            TestUtils.deepEqual(a[key], b[key])
        );
    }

    return false;
};


TestUtils.assertRenderedShapes = function (expected) {
    return function (_, __, [layer]) {
        const elements = layer.selectAll(expected.selector || "line").nodes();

        const classMatch = expected.classes
            ? elements.every((el, i) => el.getAttribute("class") === expected.classes[i])
            : true;

        const markerMatch = expected.markerEnd
            ? elements.every(el => el.getAttribute("marker-end") === expected.markerEnd)
            : true;

        const countMatch = typeof expected.renderedCount === "number"
            ? elements.length === expected.renderedCount
            : true;

        return countMatch && classMatch && markerMatch;
    };
};

// Helper function to describe rendered links
TestUtils.describeRenderedShapes = function (_, __, [layer], selector = "line") {
    const elements = layer.selectAll(selector).nodes();
    return {
        count: elements.length,
        classes: elements.map(el => el.getAttribute("class")),
        markerEnds: elements.map(el => el.getAttribute("marker-end")),
        tags: elements.map(el => el.tagName)
    };
};

// Helper function to describe rendered labels
TestUtils.describeRenderedLabels = function (_, __, [layer]) {
    const texts = layer.selectAll("text.label").nodes();
    return {
        renderedCount: texts.length,
        labels: texts.map(el => el.textContent)
    };
};

// Helper function to describe rendered nodes
TestUtils.describeRenderedNodes = function (_, __, [layer]) {
    const nodes = layer.selectAll("g.node").nodes();
    return {
        renderedCount: nodes.length,
        classes: nodes.map(el => el.getAttribute("class"))
    };
}

window.FunctionTests["inferJsonLdSchema"] = {
    inputs: [
        [
            [
                {
                    "@id": "ex:Person",
                    "@type": "http://www.w3.org/2002/07/owl#Class"
                },
                {
                    "@id": "ex:Employee",
                    "@type": "http://www.w3.org/2002/07/owl#Class",
                    "http://www.w3.org/2000/01/rdf-schema#subClassOf": { "@id": "ex:Person" }
                },
                {
                    "@id": "ex:worksFor",
                    "@type": "http://www.w3.org/2002/07/owl#ObjectProperty",
                    "http://www.w3.org/2000/01/rdf-schema#domain": "ex:Employee",
                    "http://www.w3.org/2000/01/rdf-schema#range": "ex:Organization"
                },
                {
                    "@id": "ex:Alice",
                    "@type": [
                        "http://www.w3.org/2002/07/owl#NamedIndividual",
                        "ex:Employee"
                    ],
                    "ex:worksFor": { "@id": "ex:OpenAI" }
                },
                {
                    "@id": "ex:OpenAI",
                    "@type": [
                        "http://www.w3.org/2002/07/owl#NamedIndividual",
                        "ex:Organization"
                    ]
                }
            ],
            "en"
        ]
    ],
    expected: [
        {
            "@id": "ex:Person",
            "@type": "owl:Class"
        },
        {
            "@id": "ex:Employee",
            "@type": "owl:Class",
            "rdfs:subClassOf": { "@id": "ex:Person" },
            "ex:worksFor": { "@id": "ex:Organization" }
        },
        {
            "@id": "ex:Organization",
            "@type": "owl:Class"
        }
    ],
    assert: (actual, expected) => {
        // Loose match: ensure core structure is correct
        if (!Array.isArray(actual)) return false;
        const findClass = id => actual.find(cls => cls["@id"] === id);
        return (
            findClass("ex:Person") &&
            findClass("ex:Employee")?.["ex:worksFor"]?.["@id"] === "ex:Organization" &&
            findClass("ex:Organization")
        );
    }
};


window.FunctionTests["mergePropsIntoClasses"] = {
    inputs: [
        [
            // classMap
            new Map([
                ["ex:Person", { "@id": "ex:Person", "@type": "owl:Class" }]
            ]),
            // propMap
            new Map([
                ["ex:worksFor", {
                    "@id": "ex:worksFor",
                    types: ["http://www.w3.org/2002/07/owl#ObjectProperty"],
                    domain: "ex:Employee",
                    range: "ex:Organization"
                }]
            ]),
            // inferredProps (empty)
            new Map()
        ]
    ],
    // We expect ex:Employee and ex:Organization to be present as class nodes
    expected: [
        { "@id": "ex:Person", "@type": "owl:Class" },
        { "@id": "ex:Employee", "@type": "owl:Class", "ex:worksFor": { "@id": "ex:Organization" } },
        { "@id": "ex:Organization", "@type": "owl:Class" }
    ],
    assert: (actual, expected) => {
        if (!Array.isArray(actual)) return false;

        // Helper: find a class by @id
        const find = (id) => actual.find(c => c && c["@id"] === id);

        // Must have Person
        if (!find("ex:Person")) return false;

        // Must have Employee with the worksFor property pointing to Organization
        const emp = find("ex:Employee");
        if (!emp) return false;
        if (!emp["ex:worksFor"] || emp["ex:worksFor"]["@id"] !== "ex:Organization") return false;

        // Must have Organization placeholder node
        if (!find("ex:Organization")) return false;

        return true;
    },
    describeActual: (actual) => actual
};

window.FunctionTests["inferPropertiesFromIndividuals2"] = {
    inputs: [[
        [
            {
                "@id": "https://dev.fandaws.com/fan/7eafaf8b-5632-465f-8333-06da36c4f5f7",
                "http://www.w3.org/2000/01/rdf-schema#label": [
                    {
                        "@value": "dog",
                        "@language": "en"
                    }
                ],
                "https://dev.fandaws.com/fan/definition": "Dog is a canis that has tail, bark, and eat.",
                "http://www.w3.org/2000/01/rdf-schema#subClassOf": {
                    "@id": "https://dev.fandaws.com/fan/2aa04282-c0de-40f4-a123-6ecedd614597"
                },
                "@type": "http://www.w3.org/2002/07/owl#Class",
                "https://dev.fandaws.com/fan/has": [
                    {
                        "@id": "https://dev.fandaws.com/fan/d0768aa2-a511-4c57-ad71-23785e8c2d00"
                    },
                    {
                        "@id": "https://dev.fandaws.com/fan/2fc378c5-a0b9-4ad9-a6d4-2d202c8d5ff8"
                    },
                    {
                        "@id": "https://dev.fandaws.com/fan/08be3f5b-0e2e-41d1-b096-9f1cffc1036a"
                    }
                ]
            },
            {
                "@id": "https://dev.fandaws.com/fan/instance/dog1",
                "@type": [
                    "https://dev.fandaws.com/fan/7eafaf8b-5632-465f-8333-06da36c4f5f7",
                    "http://www.w3.org/2002/07/owl#NamedIndividual"
                ],
                "https://dev.fandaws.com/fan/has": [
                    {
                        "@id": "https://dev.fandaws.com/fan/instance/tail1"
                    },
                    {
                        "@id": "https://dev.fandaws.com/fan/instance/bark1"
                    },
                    {
                        "@id": "https://dev.fandaws.com/fan/instance/dogfood1"
                    }
                ]
            },
            {
                "@id": "https://dev.fandaws.com/fan/instance/dogfood1",
                "@type": [
                    "https://dev.fandaws.com/fan/c89d7473-8efd-4c5c-bee1-f559e16c4989",
                    "http://www.w3.org/2002/07/owl#NamedIndividual"
                ]
            }
        ]
    ]],
    expected: [
        {
            "@id": "https://dev.fandaws.com/fan/7eafaf8b-5632-465f-8333-06da36c4f5f7",
            "http://www.w3.org/2000/01/rdf-schema#label": [
                {
                    "@value": "dog",
                    "@language": "en",
                },
            ],
            "https://dev.fandaws.com/fan/definition": "Dog is a canis that has tail, bark, and eat.",
            "http://www.w3.org/2000/01/rdf-schema#subClassOf": {
                "@id": "https://dev.fandaws.com/fan/2aa04282-c0de-40f4-a123-6ecedd614597",
            },
            "@type": "http://www.w3.org/2002/07/owl#Class",
            "https://dev.fandaws.com/fan/has": [
                {
                    "@id": "https://dev.fandaws.com/fan/d0768aa2-a511-4c57-ad71-23785e8c2d00",
                },
                {
                    "@id": "https://dev.fandaws.com/fan/2fc378c5-a0b9-4ad9-a6d4-2d202c8d5ff8",
                },
                {
                    "@id": "https://dev.fandaws.com/fan/08be3f5b-0e2e-41d1-b096-9f1cffc1036a",
                },
                {
                    "@id": "https://dev.fandaws.com/fan/c89d7473-8efd-4c5c-bee1-f559e16c4989",
                },
            ],
        },
    ],
};

window.FunctionTests["inferPropsFromIndividuals"] = {
    inputs: [
        [
            // JSON-LD dataset
            {
                "@id": "individual1",
                "@type": [
                    "http://www.w3.org/2002/07/owl#NamedIndividual",
                    "http://example.org/ClassA"
                ],
                "http://example.org/has_text_value": {
                    "@value": "Hello",
                    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
                }
            },
            {
                "@id": "individual2",
                "@type": [
                    "http://www.w3.org/2002/07/owl#NamedIndividual",
                    "http://example.org/ClassA"
                ],
                "http://example.org/has_integer_value": {
                    "@value": 42,
                    "@type": "http://www.w3.org/2001/XMLSchema#integer"
                }
            },
            {
                "@id": "ClassA",
                "@type": [
                    "http://example.org/Class"
                ],
                "http://example.org/has_text_value": {
                    "@value": "Default Text",
                    "@type": "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
                }
            }
        ],
        // Configuration object
        {
            namedIndividual: "http://www.w3.org/2002/07/owl#NamedIndividual",
            datatypeProperty: "http://www.w3.org/2002/07/owl#DatatypeProperty",
            predicateToDatatype: {
                "http://example.org/has_text_value": "rdf:langString",
                "http://example.org/has_integer_value": "xsd:integer"
            }
        }
    ],
    expected: {
        "http://example.org/ClassA": {
            "http://example.org/has_text_value": [
                {
                    "@id": "rdf:langString",
                    "@type": "http://www.w3.org/2002/07/owl#DatatypeProperty"
                },
                {
                    "@id": "Default Text",
                    "@type": "rdf:langString"
                }
            ],
            "http://example.org/has_integer_value": [
                {
                    "@id": "xsd:integer",
                    "@type": "http://www.w3.org/2002/07/owl#DatatypeProperty"
                },
                {
                    "@id": 42,
                    "@type": "xsd:integer"
                }
            ]
        }
    },
    spread: true // Ensure inputs are spread when calling the function
};

window.FunctionTests["getClassMap"] = {
    inputs: [
        [
            [
                { subject: "ex:A", predicate: "@type", object: "http://www.w3.org/2002/07/owl#Class" },
                { subject: "ex:B", predicate: "http://www.w3.org/2000/01/rdf-schema#subClassOf", object: "ex:A" },
                { subject: "ex:C", predicate: "http://www.w3.org/2000/01/rdf-schema#subClassOf", object: "ex:B" }
            ]
        ]
    ],
    expected: new Map([
        ["ex:A", { "@id": "ex:A", "@type": "owl:Class" }],
        ["ex:B", { "@id": "ex:B", "@type": "owl:Class", "rdfs:subClassOf": { "@id": "ex:A" } }],
        ["ex:C", { "@id": "ex:C", "@type": "owl:Class", "rdfs:subClassOf": { "@id": "ex:B" } }]
    ]),
    assert: (actual, expected) => {
        // 🔒 TEST-LOCAL HELPER: Map → plain object for deep equality
        const mapToObject = (map) => {
            const obj = {};
            for (const [k, v] of map.entries()) {
                obj[k] = v;
            }
            return obj;
        };
        return TestUtils.deepEqual(mapToObject(actual), mapToObject(expected));
    },
    describeActual: (actual) => {
        const mapToObject = (map) => {
            const obj = {};
            for (const [k, v] of map.entries()) {
                obj[k] = v;
            }
            return obj;
        };
        return mapToObject(actual);
    }
};


window.FunctionTests["extractTriples"] = {
    inputs: [
        [
            [
                {
                    "@id": "ex:Person1",
                    "@type": ["ex:Person", "ex:Mammal"],
                    "ex:name": "Alice",
                    "ex:knows": [{ "@id": "ex:Person2" }]
                },
                {
                    "@id": "ex:Person2",
                    "@type": "ex:Person",
                    "ex:name": "Bob"
                }
            ]
        ]
    ],
    expected: [
        { subject: "ex:Person1", predicate: "ex:name", object: "Alice" },
        { subject: "ex:Person1", predicate: "ex:knows", object: "ex:Person2" },
        { subject: "ex:Person1", predicate: "@type", object: "ex:Person" },
        { subject: "ex:Person1", predicate: "@type", object: "ex:Mammal" },
        { subject: "ex:Person2", predicate: "ex:name", object: "Bob" },
        { subject: "ex:Person2", predicate: "@type", object: "ex:Person" }
    ],
    assert: (actual, expected) => TestUtils.deepEqual(actual, expected),
    describeActual: (actual) => actual
};

window.FunctionTests["getProperties"] = {
    inputs: [
        [
            [
                { subject: "ex:knows", predicate: "@type", object: "http://www.w3.org/2002/07/owl#ObjectProperty" },
                { subject: "ex:knows", predicate: "http://www.w3.org/2000/01/rdf-schema#domain", object: "ex:Person" },
                { subject: "ex:knows", predicate: "http://www.w3.org/2000/01/rdf-schema#range", object: "ex:Person" },
                { subject: "ex:age", predicate: "@type", object: "http://www.w3.org/2002/07/owl#DatatypeProperty" },
                { subject: "ex:age", predicate: "http://www.w3.org/2000/01/rdf-schema#domain", object: "ex:Person" },
                { subject: "ex:age", predicate: "http://www.w3.org/2000/01/rdf-schema#range", object: "xsd:int" }
            ]
        ]
    ],
    expected: (() => {
        const m = new Map();
        m.set("ex:knows", {
            "@id": "ex:knows",
            types: ["http://www.w3.org/2002/07/owl#ObjectProperty"],
            domain: "ex:Person",
            range: "ex:Person"
        });
        m.set("ex:age", {
            "@id": "ex:age",
            types: ["http://www.w3.org/2002/07/owl#DatatypeProperty"],
            domain: "ex:Person",
            range: "xsd:int"
        });
        return m;
    })(),
    assert: (actual, expected) => TestUtils.deepEqual(actual, expected),
    describeActual: (actual) => Array.from(actual.entries())
};

window.FunctionTests["createTriple"] = {
    inputs: [
        ["ex:Person", "rdf:type", { "@id": "ex:Class" }]
    ],
    expected: { subject: "ex:Person", predicate: "rdf:type", object: "ex:Class" },
    assert: (actual, expected) => TestUtils.deepEqual(actual, expected)
};

// Additional example tests (optional):
window.FunctionTests["createTriple_literal"] = {
    inputs: [
        ["ex:Person", "rdfs:label", { "@value": "Alice" }]
    ],
    expected: { subject: "ex:Person", predicate: "rdfs:label", object: "Alice" },
    assert: (actual, expected) => TestUtils.deepEqual(actual, expected)
};

window.FunctionTests["createTriple_stringObject"] = {
    inputs: [
        ["ex:Person", "rdfs:label", "Alice"]
    ],
    expected: { subject: "ex:Person", predicate: "rdfs:label", object: "Alice" },
    assert: (actual, expected) => TestUtils.deepEqual(actual, expected)
};



window.FunctionTests["inferJsonLdSchema2"] = {
    inputs: [[
        {
            "@id": "ex:book1",
            "@type": "ex:Book",
            "ex:title": "War and Peace",
            "ex:publishedYear": 1869,
            "ex:hasAuthor": {
                "@id": "ex:tolstoy",
                "@type": "ex:Person",
                "ex:name": "Leo Tolstoy"
            }
        },
        {
            "@id": "ex:tolstoy",
            "@type": "ex:Person",
            "ex:name": "Leo Tolstoy"
        }
    ]],
    expected: {
        "@context": {
            "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
            "owl": "http://www.w3.org/2002/07/owl#",
            "xsd": "http://www.w3.org/2001/XMLSchema#"
        },
        "@graph": [
            {
                "@id": "ex:Book",
                "@type": "owl:Class",
                "rdfs:label": "Book",
                "ex:hasAuthor": {
                    "@id": "ex:Person"
                },
                "ex:publishedYear": {
                    "@id": "ex:Year"
                },
                "ex:title": {
                    "@id": "ex:Title"
                }
            },
            {
                "@id": "ex:Person",
                "@type": "owl:Class",
                "rdfs:label": "Person",
                "ex:name": {
                    "@id": "ex:name"
                }
            },
            {
                "@id": "xsd:decimal",
                "@type": "rdfs:Datatype",
                "rdfs:label": "Decimal"
            },
            {
                "@id": "ex:name",
                "@type": "owl:DatatypeProperty",
                "rdfs:label": "Name"
            },
            {
                "@id": "ex:Year",
                "@type": "owl:DatatypeProperty",
                "rdfs:label": "Year"
            },
            {
                "@id": "ex:Title",
                "@type": "owl:DatatypeProperty",
                "rdfs:label": "Title"
            }
        ]
    },
    assert: (actual, expected) => {
        try {
            const normalizeEntry = (entry) => {
                const copy = { ...entry };

                // Normalize nested objects by sorting keys if present
                Object.keys(copy).forEach(key => {
                    if (typeof copy[key] === "object" && !Array.isArray(copy[key]) && copy[key] !== null) {
                        copy[key] = JSON.stringify(copy[key]);
                    }
                });

                return copy;
            };

            const normalize = (graph) =>
                graph["@graph"]
                    .map(normalizeEntry)
                    .sort((a, b) => a["@id"].localeCompare(b["@id"]));

            const normActual = normalize(actual);
            const normExpected = normalize(expected);

            return JSON.stringify(normActual) === JSON.stringify(normExpected);
        } catch (e) {
            return { error: e.message };
        }
    },
    describeActual: (actual) => actual,
    spread: true
};


window.FunctionTests["extractLocalNameFromIRI"] = {
    inputs: [["http://example.org/Person/123"]], // Single test case with one input
    expected: "123", // Expected output
    // Optional: Custom assert function (default equality check is sufficient here)
    // Optional: Custom describeActual function (not needed for this test case)
    spread: true // Spread the inputs array when calling the function
};

window.FunctionTests["eliminateRedundantLinkAssertions"] = {
    inputs: [[
        [
            { source: "A", target: "B", label: "relatesTo" },
            { source: "A", target: "B", label: "relatesTo" },
            { source: "B", target: "C", label: "linkedTo" }
        ]
    ]],
    expected: [
        { source: "A", target: "B", label: "relatesTo" },
        { source: "B", target: "C", label: "linkedTo" }
    ]
};


window.FunctionTests["getFormalLabel"] = {
    inputs: [
        [
            [
                {
                    "@id": "http://example.org/Person/123",
                    "http://www.w3.org/2000/01/rdf-schema#label": [
                        { "@value": "John Doe", "@language": "en" },
                        { "@value": "Juan Pérez", "@language": "es" }
                    ]
                }
            ], // JSON-LD dataset
            "http://example.org/Person/123", // ID to search for
            "en" // Language filter
        ]
    ],
    expected: "John Doe", // Expected output
    spread: true // Spread the inputs array when calling the function
};

window.FunctionTests["getLiteralLabel"] = {
    inputs: [
        [
            {
                "http://example.org/property": [
                    { "@value": "Hello, World!", "@language": "en" },
                    { "@value": "Hola, Mundo!", "@language": "es" }
                ]
            } // Entity object
        ]
    ],
    expected: "Hello, World!", // Expected output (first `@value`)
    spread: true // Spread the inputs array when calling the function
};

window.FunctionTests["getLabelFromNamedIndividual"] = {
    inputs: [
        [
            [
                {
                    "@id": "http://example.org/Person/123",
                    "@type": ["http://example.org/PersonType", "http://www.w3.org/2002/07/owl#NamedIndividual"]
                },
                {
                    "@id": "http://example.org/PersonType",
                    "http://www.w3.org/2000/01/rdf-schema#label": [
                        { "@value": "Person", "@language": "en" }
                    ]
                }
            ], // JSON-LD dataset
            "http://example.org/Person/123", // Entity ID
            "en" // Language filter
        ]
    ],
    expected: "Person 123", // Expected output
    spread: true // Spread the inputs array when calling the function
};

window.FunctionTests["getPreferredLabel"] = {
    inputs: [
        [
            [
                {
                    "@id": "http://example.org/Person/123",
                    "http://www.w3.org/2000/01/rdf-schema#label": [
                        { "@value": "John Doe", "@language": "en" }
                    ]
                }
            ], // JSON-LD dataset
            "http://example.org/Person/123", // Entity ID
            "en" // Language filter
        ]
    ],
    expected: "John Doe", // Expected output
    spread: true // Spread the inputs array when calling the function
};

// Add test for restrictLinksToExistingEntities
window.FunctionTests["restrictLinksToExistingEntities"] = {
    inputs: [
        [
            [
                { source: "Food", target: "_g_L25C1292", label: "is_part_of" },
                { source: "Cheese", target: "Pizza", label: "subClassOf" },
                { source: "Chicken_Fingers", target: "Food", label: "subClassOf" }
            ],
            {
                "Food": {},
                "Pizza": {},
                "Cheese": {},
                "Chicken_Fingers": {}
            }
        ]
    ],
    expected: [
        { source: "Cheese", target: "Pizza", label: "subClassOf" },
        { source: "Chicken_Fingers", target: "Food", label: "subClassOf" }
    ]
};

window.FunctionTests["extractLocalNameFromIRI_Batch"] = {
    inputs: [[
        "http://example.org/Person",
        "http://example.org#Thing",
        "ex:Agent"
    ]],
    expected: ["Person", "Thing", "Agent"],
    spread: false // 🟡 IMPORTANT
};

window.FunctionTests["deriveRepresentationalAttributes"] = {
    inputs: [
        [
            [
                { "@id": "http://example.org/Person", "label": { "@value": "Person", "@language": "en" } },
                { "@id": "http://example.org/name", "label": { "@value": "Name", "@language": "en" } },
                {
                    "@id": "http://example.org/JohnDoe",
                    "@type": ["http://example.org/Person", "http://example.org/NamedIndividual"],
                    "http://example.org/name": { "@value": "John Doe", "@language": "en" }
                }
            ],
            "http://example.org/JohnDoe"
        ]
    ],
    expected: [
        {
            "property": "iri",
            "value": "http://example.org/JohnDoe"
        },
        {
            "property": "type",
            "value": "http://example.org/Person"
        },
        {
            "property": "type",
            "value": "http://example.org/NamedIndividual"
        },
        {
            "property": "Name",
            "value": "John Doe",
            "language": "en"
        }
    ]
};


window.FunctionTests["linkAssertionEquivalenceCheck"] = {
    inputs: [[
        { source: "A", target: "B", label: "relatedTo" },
        { source: "A", target: "B", label: "relatedTo" }
    ]],
    expected: true
};

window.FunctionTests["getPreferredLabelForEntity"] = {
    inputs: [[
        [
            {
                "@id": "ex:Person",
                "http://www.w3.org/2000/01/rdf-schema#label": [
                    { "@value": "Person", "@language": "en" },
                    { "@value": "Persona", "@language": "es" }
                ]
            }
        ],
        "ex:Person",
        "es"
    ]],
    expected: "Persona"
};

window.FunctionTests["constructGraphNodeRepresentation"] = {
    inputs: [[
        "http://example.org/individuals#A123", // id
        [
            { property: "type", value: "http://www.w3.org/2002/07/owl#NamedIndividual" },
            { property: "type", value: "http://example.org/classes#Person" }
        ], // properties
        [
            {
                "@id": "http://example.org/classes#Person",
                "rdfs:label": [
                    {
                        "@value": "Person",
                        "@language": "en"
                    }
                ]
            },
            {
                "@id": "http://example.org/individuals#A123",
                "@type": [
                    "http://example.org/classes#Person",
                    "http://www.w3.org/2002/07/owl#NamedIndividual"
                ]
            },
            {
                "@id": "http://www.w3.org/2002/07/owl#NamedIndividual",
                "rdfs:label": [
                    {
                        "@value": "NamedIndividual",
                        "@language": "en"
                    }
                ]
            }
        ]// jsonld
    ]],
    expected: {
        "id": "http://example.org/individuals#A123",
        "name": "Person A123",
        "properties": [
            {
                "property": "type",
                "value": "http://www.w3.org/2002/07/owl#NamedIndividual"
            },
            {
                "property": "type",
                "value": "http://example.org/classes#Person"
            }
        ]
    }
};

window.FunctionTests["recursivelyTraceEntityRelations"] = {
    inputs: [
        [
            [
                { "@id": "http://example.org/Person", "label": { "@value": "Person", "@language": "en" } },
                { "@id": "http://example.org/name", "label": { "@value": "Name", "@language": "en" } },
                { "@id": "http://example.org/knows", "label": { "@value": "Knows", "@language": "en" } },
                {
                    "@id": "http://example.org/JohnDoe",
                    "@type": ["http://example.org/Person", "http://example.org/NamedIndividual"],
                    "http://example.org/name": { "@value": "John Doe", "@language": "en" },
                    "http://example.org/knows": { "@id": "http://example.org/JaneSmith" }
                },
                {
                    "@id": "http://example.org/JaneSmith",
                    "@type": ["http://example.org/Person"],
                    "http://example.org/name": { "@value": "Jane Smith", "@language": "en" },
                    // Jane also knows John (inbound link to John from Jane's perspective)
                    "http://example.org/knows": { "@id": "http://example.org/JohnDoe" }
                }
            ],
            "http://example.org/JohnDoe", // Start tracing from John Doe
            0,
            { nodes: {}, links: [], seen: new Set() },
            1 // Max depth of 1 to ensure Jane is also included
        ]
    ],
    expected: {
        "nodes": {
            "http://example.org/JohnDoe": {
                "id": "http://example.org/JohnDoe",
                "name": "Person JohnD",
                "properties": [
                    {
                        "property": "iri",
                        "value": "http://example.org/JohnDoe"
                    },
                    {
                        "property": "type",
                        "value": "http://example.org/Person"
                    },
                    {
                        "property": "type",
                        "value": "http://example.org/NamedIndividual"
                    },
                    {
                        "property": "Name",
                        "value": "John Doe",
                        "language": "en"
                    }
                ]
            },
            "http://example.org/JaneSmith": {
                "id": "http://example.org/JaneSmith",
                "name": "Person JaneS",
                "properties": [
                    {
                        "property": "iri",
                        "value": "http://example.org/JaneSmith"
                    },
                    {
                        "property": "type",
                        "value": "http://example.org/Person"
                    },
                    {
                        "property": "Name",
                        "value": "Jane Smith",
                        "language": "en"
                    }
                ]
            }
        },
        "links": [
            {
                "source": "http://example.org/JohnDoe",
                "target": "http://example.org/JaneSmith",
                "label": "Knows"
            },
            {
                "source": "http://example.org/JaneSmith",
                "target": "http://example.org/JohnDoe",
                "label": "Knows"
            },
            {
                "source": "http://example.org/JaneSmith",
                "target": "http://example.org/JaneSmith",
                "label": "Knows"
            },
            {
                "source": "http://example.org/JohnDoe",
                "target": "http://example.org/JohnDoe",
                "label": "Knows"
            }
        ],
        "seen": {}
    }
};

window.FunctionTests["generateEntityGraphFromRDFRepresentation"] = {
    inputs: [[  // 👈 outer array contains one test case
        [         // 👈 jsonld array
            {
                "@id": "ex:Person",
                "@type": "rdfs:Class",
                "rdfs:label": [{ "@value": "Person", "@language": "en" }]
            },
            {
                "@id": "ex:Agent",
                "@type": "rdfs:Class",
                "rdfs:label": [{ "@value": "Agent", "@language": "en" }]
            },
            {
                "@id": "ex:NamedIndividual",
                "@type": "rdfs:Class",
                "rdfs:label": [{ "@value": "Named Individual", "@language": "en" }]
            },
            {
                "@id": "ex:name",
                "rdfs:label": [{ "@value": "Name", "@language": "en" }]
            },
            {
                "@id": "ex:knows",
                "rdfs:label": [{ "@value": "Knows", "@language": "en" }]
            },
            { "@id": "http://purl.obolibrary.org/obo/BFO_0000056", "@type": ["http://www.w3.org/2002/07/owl#ObjectProperty"], "http://www.w3.org/2002/07/owl#inverseOf": [{ "@id": "http://purl.obolibrary.org/obo/BFO_0000057" }], "http://www.w3.org/2000/01/rdf-schema#domain": [{ "@id": "_:b0" }], "http://www.w3.org/2000/01/rdf-schema#range": [{ "@id": "http://purl.obolibrary.org/obo/BFO_0000015" }], "http://purl.org/dc/elements/1.1/identifier": [{ "@value": "250-BFO" }], "http://www.w3.org/2000/01/rdf-schema#label": [{ "@value": "participates in", "@language": "en" }], "http://www.w3.org/2004/02/skos/core#definition": [{ "@value": "(Elucidation) participates in holds between some b that is either a specifically dependent continuant or generically dependent continuant or independent continuant that is not a spatial region & some process p such that b participates in p some way", "@language": "en" }], "http://www.w3.org/2004/02/skos/core#scopeNote": [{ "@value": "Users that require more sophisticated representations of time are encouraged to import a temporal extension of BFO-Core provided by the BFO development team. See documentation for guidance: <https://github.com/BFO-ontology/BFO-2020/tree/master/src/owl/profiles/temporal%20extensions>", "@language": "en" }] },
            {
                "@id": "ex:person123",
                "@type": ["ex:Person", "ex:Agent", "ex:NamedIndividual"],
                "ex:name": { "@value": "Alice", "@language": "en" },
                "http://purl.obolibrary.org/obo/BFO_0000056": { "@id": "ex:person456" }
            },
            {
                "@id": "ex:person456",
                "@type": ["ex:Person", "ex:NamedIndividual"],
                "ex:name": { "@value": "Bob", "@language": "en" }
            }
        ],
        "ex:person123",
        2
    ]],
    expected: {
        "nodes": [
            {
                "id": "ex:person123",
                "name": "Person perso",
                "properties": [
                    {
                        "property": "iri",
                        "value": "ex:person123"
                    },
                    {
                        "property": "type",
                        "value": "ex:Person"
                    },
                    {
                        "property": "type",
                        "value": "ex:Agent"
                    },
                    {
                        "property": "type",
                        "value": "ex:NamedIndividual"
                    },
                    {
                        "property": "Name",
                        "value": "Alice",
                        "language": "en"
                    }
                ]
            },
            {
                "id": "ex:person456",
                "name": "Person perso",
                "properties": [
                    {
                        "property": "iri",
                        "value": "ex:person456"
                    },
                    {
                        "property": "type",
                        "value": "ex:Person"
                    },
                    {
                        "property": "type",
                        "value": "ex:NamedIndividual"
                    },
                    {
                        "property": "Name",
                        "value": "Bob",
                        "language": "en"
                    }
                ]
            }
        ],
        "links": [
            {
                "source": "ex:person123",
                "target": "ex:person456",
                "label": "participates in"
            },
            {
                "source": "ex:person456",
                "target": "ex:person456",
                "label": "participates in"
            }
        ]
    }
};

window.FunctionTests["deriveEntityRelationAssertions"] = {
    inputs: [
        [
            // JSON-LD Graph
            [
                {
                    "@id": "ex:Person",
                    "rdfs:label": [{ "@value": "Person", "@language": "en" }]
                },
                {
                    "@id": "ex:name",
                    "rdfs:label": [{ "@value": "Name", "@language": "en" }]
                },
                {
                    "@id": "ex:knows",
                    "rdfs:label": [{ "@value": "Knows", "@language": "en" }]
                },
                {
                    "@id": "ex:person123",
                    "@type": ["ex:Person"],
                    "ex:name": { "@value": "Alice", "@language": "en" },
                    "ex:knows": { "@id": "ex:person456" }
                },
                {
                    "@id": "ex:person456",
                    "@type": ["ex:Person"],
                    "ex:name": { "@value": "Bob", "@language": "en" }
                }
            ],
            // @id
            "ex:person123",
            // Entity object
            {
                "@id": "ex:person123",
                "@type": ["ex:Person"],
                "ex:name": { "@value": "Alice", "@language": "en" },
                "ex:knows": { "@id": "ex:person456" }
            },
            // direction
            "outbound"
        ]
    ],
    expected: [
        {
            source: "ex:person123",
            target: "ex:person456",
            label: "Knows"
        }
    ]
};

window.FunctionTests["measureText"] = {
    inputs: [["Hello World", 12, "sans-serif", 200]],
    expected: 79 // 11 characters * 0.6 * 12 = 79 (rounded)
};

window.FunctionTests["setupSVG"] = {
    inputs: [['#test-svg']], // The SVG element must exist in the DOM before test runs
    expected: {
        "_groups": [
            [
                {}
            ]
        ],
        "_parents": [
            {}
        ]
    }, // Informational only
    note: 'This test requires a DOM environment with an SVG element having id "test-svg".'
};

window.FunctionTests["bindSimulation"] = {
    // 🔒 TEST-LOCAL HELPER: Used only for this test
    createTestZoomLayer(svgSelector = "#test-svg") {
        const svg = d3.select(svgSelector);
        svg.selectAll("*").remove(); // Clear existing content

        const zoomLayer = svg.append("g")
            .attr("id", "zoom-layer")
            .classed("zoom-layer", true);

        // Add expected child groups
        zoomLayer.append("g").attr("class", "link");
        zoomLayer.append("g").attr("class", "label");
        zoomLayer.append("g").attr("class", "node");

        return zoomLayer;
    },

    inputs() {
        return [[
            this.createTestZoomLayer(),  // uses local helper
            [{ id: "a" }, { id: "b" }],
            [{ source: "a", target: "b" }]
        ]];
    },

    expected: {
        nodeCount: 2,
        linkCount: 1,
        forces: ["link", "charge", "center"]
    },

    // 🔁 GLOBAL TEST HELPER: Deep equality from TestUtils
    assert: TestUtils.deepEqual,

    // 🔁 GLOBAL TEST HELPER: Simplifies sim object for comparison
    describeActual: TestUtils.describeD3Simulation,

    note: "Test-specific zoom layer helper, using shared describe/assert helpers"
};


window.FunctionTests["extractLocalNameFromType"] = {
    inputs:
        [
            [
                {
                    "@id": "http://example.org/ontology/Person",
                    "http://www.w3.org/2000/01/rdf-schema#label": [
                        { "@value": "Person", "@language": "en" }
                    ]
                },
                {
                    "@id": "http://www.w3.org/2002/07/owl#Class",
                    "http://www.w3.org/2000/01/rdf-schema#label": [
                        { "@value": "Class", "@language": "en" }
                    ]
                }],
            [
                "http://www.w3.org/2002/07/owl#Class",
                "http://example.org/ontology/Person"
            ]

        ]
    ,
    expected: "Person"
};