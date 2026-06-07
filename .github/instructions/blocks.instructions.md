---
description: Describe when these instructions should be loaded by the agent based on task context
applyTo: '**/blocks.ts'
---

- Block files should contain only content blocks without styles.
- Before inserting an SVG icon, add it to the `svgObj` object.
- Use BEM class naming, but keep names as short as possible.
- Use the shallowest possible block nesting structure.
- If some parts of the data can be extracted into separate arrays, place them in a `data.ts` file and import them from there.
