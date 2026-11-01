# n8n-nodes-scento-perfume

An [n8n](https://n8n.io) community node for the free **Scento Perfume API**: verified perfume notes and profiles, similar perfumes, raw materials, perfume houses, scent families and the Scento journal, over 1,600 designer and niche perfumes. No API key, no account, no credentials to set up.

Docs and terms: https://www.scento.com/developers

## Install

In n8n, open **Settings > Community nodes > Install** and enter `n8n-nodes-scento-perfume`. Then add the **Scento Perfume** node to a workflow.

## Resources and operations

| Resource | Operations | API endpoint |
|---|---|---|
| Perfume | Search, Get, Get Similar, Compare | `/perfumes`, `/perfumes/{perfume}`, `/perfumes/{perfume}/neighbours`, `/contrast` |
| Material | Get, Find Perfumes | `/materials/{material}`, `/materials/match` |
| House | Get | `/houses/{house}` |
| Family | Get, Get Many | `/families/{family}`, `/families` |
| Occasion | Get Edit | `/edits/{occasion}` |
| Wardrobe | Compose | `/wardrobe` |
| Term | Get | `/lexicon/{term}` |
| Journal | Search | `/journal` |
| Search | Search | `/search` |

Every answer is one item with a quotable `lede`, a `detail` object, the scento.com page to read on (`scento_page`), `further_reading` links and a `cite` line. Please keep the cite line or a link to the scento.com page when you publish an answer.

- **Language** (Options): language of the scento.com links and labels in the answer. The answer text stays in English. Supported: en, de, fr, es, it, ro, el, hu, cs, pl.
- **Return All** (list operations): follows the API's continuation value and returns every part of the list as its own item. A safety stop ends it after 100 parts. Without it you get the first part, and you can pass the **Continuation** option yourself.
- Lists such as *Perfumes* or *Materials* take comma-separated values (`tom-ford-oud-wood, dior-sauvage`).
- The node can be used as a tool by an n8n AI agent.

## Example

Find the perfumes with oud and vanilla, then read the first one:

1. **Scento Perfume**: Resource *Material*, Operation *Find Perfumes*, Materials `oud, vanilla`.
2. **Scento Perfume**: Resource *Perfume*, Operation *Get*, Perfume `{{ $json.detail.perfumes[0].name }}` (the API accepts a name as well as a slug).

## Development

```sh
npm install
npm run lint     # n8n-node lint
npm run build    # n8n-node build, output in dist/
npm test         # build, then request-mapping tests against the live OpenAPI document
npm run test:live  # also calls every operation on the live API
npm run dev      # local n8n with the node loaded
```

## License

MIT. Scento Perfume API terms: https://www.scento.com/terms-of-service#perfume-api
