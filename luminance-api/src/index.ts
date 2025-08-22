import { component } from "@prismatic-io/spectral";
import { handleErrors } from "@prismatic-io/spectral/dist/clients/http";
import actions from "./actions";
import connections from "./connections";
import dataSources from "./dataSources";

export default component({
  key: "luminanceApi",
  display: {
    label: "Luminance API",
    description:
      "Luminance API for all things AI contract creation, management, and analysis",
    iconPath: "icon.png",
  },
  hooks: { error: handleErrors },
  actions,
  connections,
  dataSources,
});
