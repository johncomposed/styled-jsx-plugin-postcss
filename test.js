const assert = require("assert");
const path = require("path");
const plugin = require("./");
const { receiveMessageOnPort } = require("worker_threads");

describe("styled-jsx-plugin-postcss", () => {
  const compileEnvs = ["process", "worker"];

  compileEnvs.forEach((compileEnv) => {
    describe(`Compiling using a ${compileEnv}`, () => {
      it("applies browser list and preset-env features", () => {
        assert.strictEqual(
          plugin(
            "p { color: rgba(255, 0, 0, 0.9); & img { display: block } }",
            { compileEnv }
          ),
          "p.plugin { color: rgba(255, 0, 0, 0.9) }\np.plugin img.plugin { display: block }"
        );
      });

      it("applies plugins", () => {
        assert.strictEqual(
          plugin("p { font-size: calc(2 * 20px); }", { compileEnv }),
          "p.plugin { font-size: 40px; }"
        );
      });

      it("works with placeholders", () => {
        assert.strictEqual(
          plugin(
            "p { color: %%styled-jsx-placeholder-0%%; & img { display: block; } } %%styled-jsx-placeholder-1%%",
            { compileEnv }
          ),
          "p.plugin { color: %%styled-jsx-placeholder-0%% } p.plugin img.plugin { display: block; } %%styled-jsx-placeholder-1%%"
        );
      });

      it("works with @import", () => {
        assert.strictEqual(
          plugin('@import "./fixtures/fixture.css"; p { color: red }', {
            compileEnv,
          }),
          "div.plugin { color: red; } p.plugin { color: red }"
        );
      });

      it("works with quotes and other characters", () => {
        assert.strictEqual(
          plugin(
            `@import "./fixtures/fixture.css"; * { color: red; font-family: 'Times New Roman'; }
      li:after{ content: "!@#$%^&*()_+"}
      ul li:before{ content: "{res:{res:'korea'}}"; }`,
            { compileEnv }
          ),
          `div.plugin { color: red; } *.plugin { color: red; font-family: 'Times New Roman'; } li:after.plugin{ content: "!@#$%^&*()_+"} ul.plugin li:before.plugin{ content: "{res:{res:'korea'}}"; }`
        );
      });

      it("throws with invalid css", () => {
        assert.throws(
          () => {
            plugin('a {\n  content: "\n}', { compileEnv });
          },
          {
            name: "Error",
            // TODO - Why did the old versions give better error messages? Is this a real bug?
            // message: /postcss failed with TypeError: <css input>:2:12: Unclosed string/,
            message: /postcss failed with TypeError/,
          }
        );
      });

      it("throws with invalid config", () => {
        assert.throws(
          () => {
            plugin(
              "p { color: rgba(255, 0, 0, 0.9); & img { display: block } }",
              {
                path: path.resolve("./fixtures/fixture-invalid-config"),
                compileEnv,
              }
            );
          },
          {
            name: "Error",
            message: /postcss failed with TypeError: Invalid PostCSS Plugin found at: plugins\[0]/,
          }
        );
      });

      if (
        compileEnv === "worker" &&
        typeof receiveMessageOnPort !== "undefined"
      ) {
        it("worker mode timeouts after 3s", () => {
          assert.throws(
            () => {
              plugin("p { color: red; }", {
                path: path.resolve("fixtures/timeout"),
                compileEnv,
                lockTimeout: 3000,
              });
            },
            {
              name: "Error",
              message: /postcss is taking more than/,
            }
          );
        });
      }
    });
  });
});
