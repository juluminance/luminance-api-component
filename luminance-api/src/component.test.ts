import { testing } from "@prismatic-io/spectral";
import { oAuth2 } from "./connections";
import component from ".";

describe("luminanceApi", () => {
  const harness = testing.createHarness(component);
  const connection = harness.connectionValue(oAuth2);

  it("should invoke action", async () => {
    const result = await harness.action("get", {
      connection,
    });
    expect(result?.data).toBeDefined();
  });
});
