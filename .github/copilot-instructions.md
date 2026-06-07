1. This is my custom instrument for creating AB tests.
2. Every unique test is located in its own directory under `src/client_name/test_name`.
3. Each test directory contains the following files:
   - `index.ts`: The main file that implements the test logic.
   - `style.scss`: The stylesheet for the test.
   - `blocks.ts`: The file defining the HTML blocks used in the test.
   - `data.ts`: The file containing data specific to the test.
4. The `app.js` file is running the build process and serves as the entry point for the application.
5. The `src/libraries` directory contains shared libraries and utilities used across different tests.
6. Use previous tests as references for creating new tests.
7. Every test must be a class that has a constructor and an `init` method.
8. Don't compile scss files, it is handled by VS Code plugin.
