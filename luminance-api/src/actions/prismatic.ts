import { action, input, util } from "@prismatic-io/spectral";
import { createPrismaticClient } from "../prismatic/client";

export const listPrismaticInstances = action({
  display: {
    label: "List Prismatic Instances",
    description: "List instances, optionally filtered by customer ID",
  },
  inputs: {
    connection: input({ label: "Prismatic Connection", type: "connection", required: true }),
    customerId: input({ label: "Customer ID", type: "string", required: false }),
  },
  perform: async (context, { connection, customerId }) => {
    const client = await createPrismaticClient(connection, context);

    const hasCustomer = Boolean(customerId);
    const query = hasCustomer
      ? `query ListInstances($customer: ID) {\n  instances(customer: $customer) {\n    nodes { id name }\n  }\n}`
      : `query ListInstances {\n  instances {\n    nodes { id name }\n  }\n}`;

    const variables = hasCustomer ? { customer: customerId } : undefined;
    const { data } = await client.post<{ data?: { instances?: { nodes?: Array<{ id: string; name: string }> } } }>(
      "/api",
      { query, variables }
    );

    const nodes = data?.data?.instances?.nodes || [];
    return { data: nodes } as any;
  },
});

export default { listPrismaticInstances };


``