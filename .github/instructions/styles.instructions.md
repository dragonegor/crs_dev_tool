---
description: Describe when these instructions should be loaded by the agent based on task context
applyTo: '**/*.scss'
---

- Write all styles only in SCSS.
- For large blocks, styles can be extracted into separate files and imported into the main file.
- Use `max-width` to limit content width (for example, on desktop) without adding paddings.
- Always use the `w768` mixin for mobile media queries and `w769` for desktop media queries.

```scss
@mixin w768 {
  @media (max-width: 768px) {
    @content;
  }
}
```

```scss
@mixin w769 {
  @media (min-width: 769px) {
    @content;
  }
}
```

- use the query mixins inside a selector

```scss
.section {
  font-size: 16px;
  @include w768 {
    font-size: 14px;
  }
}
```
