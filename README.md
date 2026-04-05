# JSON Explorer — Tree View, JSONPath Search & Mock API Generator

**[Explore JSON →](https://kappafy.com)** | [About](https://kappafy.com/about.html) | [Blog](https://kappafy.com/blog/)

JSON Explorer is a fast, browser-based JSON viewer with tree visualization, JSONPath search, structure statistics, and a built-in mock API generator. Paste any JSON payload — API responses, config files, data exports — and instantly navigate it as a collapsible tree. Query nested data with JSONPath expressions and generate mock API endpoints from your JSON structure.

## Features

- **Collapsible tree view** — navigate deeply nested JSON structures with expand/collapse controls
- **JSONPath search** — query specific fields using standard JSONPath expressions
- **Structure statistics** — object count, array count, max depth, key frequency analysis
- **Mock API generator** — create fake API endpoints from your JSON schema for testing
- **Syntax-highlighted raw view** — toggle between tree and formatted raw JSON

## How It Works

Paste or upload your JSON data and the explorer parses it instantly. The tree view shows every key, value, and nested structure with collapsible nodes. Use the JSONPath search bar to query specific paths (e.g., `$.users[*].email`) and see matching results highlighted. The stats panel shows structural metrics. The mock API generator analyzes your JSON schema and produces endpoint definitions you can use for frontend development and testing.

## Built With

- Vanilla JavaScript (no frameworks, no dependencies)
- Client-side only — your data never leaves your browser
- Part of the [Zovo Tools](https://zovo.one) open network

## Related Tools

- [Webhook Request Builder](https://invokebot.com) — fire API requests and explore the JSON responses here
- [Claude API Playground](https://claudkit.com) — test AI API calls and parse the JSON output
- [Developer Toolkit](https://kappakit.com) — Base64, JWT, and other encoders for API data

## Contributing

Found a bug or have a feature request? [Open an issue](https://github.com/theluckystrike/kappafy.com/issues).

## License

MIT
