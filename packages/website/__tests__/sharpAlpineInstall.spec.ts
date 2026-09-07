import { existsSync, readFileSync } from "fs";
import path from "path";
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(__dirname, "../../..");
const websitePkg = JSON.parse(
  readFileSync(path.join(__dirname, "../package.json"), "utf8"),
) as { dependencies: { sharp: string } };

describe("Alpine / sharp install (#413)", () => {
  it("pins sharp 0.32.6 so Alpine musl 1.2.4_git* is coerced before semver.lt", () => {
    expect(websitePkg.dependencies.sharp).toBe("0.32.6");
  });

  it("lockfile resolves the pinned sharp instead of 0.31.3", () => {
    const lock = readFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "utf8");
    expect(lock).toContain("/sharp@0.32.6:");
    expect(lock).not.toContain("/sharp@0.31.3:");
  });

  it("installed sharp install script coerces libc versions (not raw musl git tags)", () => {
    const requireFromWebsite = createRequire(
      path.join(__dirname, "../package.json"),
    );
    const sharpPkgPath = requireFromWebsite.resolve("sharp/package.json");
    const installScript = path.join(
      path.dirname(sharpPkgPath),
      "install/libvips.js",
    );
    expect(existsSync(installScript)).toBe(true);
    const source = readFileSync(installScript, "utf8");
    expect(source).toMatch(/semverCoerce\(\s*libcVersionRaw\s*\)/);
    expect(source).toMatch(/detectLibc\.versionSync\(\)/);
  });

  it("semver.lt no longer throws on Alpine musl 1.2.4_git* after coerce (the #413 error)", () => {
    const requireFromWebsite = createRequire(
      path.join(__dirname, "../package.json"),
    );
    const sharpPkgPath = requireFromWebsite.resolve("sharp/package.json");
    const requireFromSharp = createRequire(sharpPkgPath);
    const semverLt = requireFromSharp("semver/functions/lt") as (
      a: string,
      b: string,
    ) => boolean;
    const semverCoerce = requireFromSharp("semver/functions/coerce") as (
      v: string,
    ) => { version: string };
    const alpineMusl = "1.2.4_git20230717";

    expect(() => semverLt(alpineMusl, "1.1.24")).toThrow(/Invalid Version/);
    expect(semverCoerce(alpineMusl).version).toBe("1.2.4");
    expect(semverLt(semverCoerce(alpineMusl).version, "1.1.24")).toBe(false);
  });
});
