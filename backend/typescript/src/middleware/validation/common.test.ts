import Joi from "joi";
import { HttpError } from "../errors";
import { slugifyLabel, validateSchema } from "./common";

describe("slugifyLabel", () => {
  it("normalizes text labels into lowercase slugs", () => {
    expect(slugifyLabel("Chicken Breast")).toBe("chicken-breast");
  });

  it("collapses non-alphanumeric characters", () => {
    expect(slugifyLabel("  Bench press / wide grip  ")).toBe(
      "bench-press-wide-grip"
    );
  });

  it("returns an empty string when no slug content exists", () => {
    expect(slugifyLabel("!!!")).toBe("");
  });
});

describe("validateSchema", () => {
  it("strips unknown fields from validated values", () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    });

    expect(validateSchema(schema, { name: "Push", ignored: true })).toEqual({
      name: "Push",
    });
  });

  it("throws an HttpError with status 400 for invalid values", () => {
    const schema = Joi.object({
      name: Joi.string().required().messages({
        "any.required": "name is required",
      }),
    });

    expect(() => validateSchema(schema, {})).toThrow(HttpError);
    try {
      validateSchema(schema, {});
    } catch (error) {
      expect(error).toBeInstanceOf(HttpError);
      expect((error as HttpError).status).toBe(400);
      expect((error as HttpError).message).toBe("name is required");
    }
  });
});
