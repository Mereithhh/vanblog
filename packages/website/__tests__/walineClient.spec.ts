import { describe, expect, it } from "vitest";
import { buildWalineInitOptions } from "../utils/walineClient";

describe("buildWalineInitOptions", () => {
  it("maps force login to Waline login=force", () => {
    expect(buildWalineInitOptions({ forceLoginComment: true }).login).toBe(
      "force",
    );
    expect(buildWalineInitOptions({ forceLoginComment: false }).login).toBe(
      "enable",
    );
    expect(buildWalineInitOptions({}).login).toBe("enable");
  });

  it("passes imageUploader false through to @waline/client and does not drop it", () => {
    const options = buildWalineInitOptions({
      forceLoginComment: false,
      imageUploader: false,
    });
    expect(options.imageUploader).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(options, "imageUploader")).toBe(
      true,
    );
  });

  it("coerces string false so imageUploader is not a truthy uploader", () => {
    const options = buildWalineInitOptions({
      imageUploader: "false",
    } as any);
    expect(options.imageUploader).toBe(false);
  });

  it("does not invent a custom imageUploader when the key is absent", () => {
    const options = buildWalineInitOptions({ forceLoginComment: true });
    expect(options).toEqual({ login: "force" });
    expect(options).not.toHaveProperty("imageUploader");
  });
});
