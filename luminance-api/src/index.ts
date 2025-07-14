import { component } from "@prismatic-io/spectral";
import { handleErrors } from "@prismatic-io/spectral/dist/clients/http";
import actions from "./actions";
import connections from "./connections";

export default component({
  key: "luminanceApi",
  display: {
    label: "Luminance API",
    description:
      "Luminance offers a RESTful HTTP-based API utilizing JSON as the primary serialization format and OAuth2 for authentication",
    iconPath: "icon.png",
  },
  hooks: { error: handleErrors },
  actions,
  connections,
});
