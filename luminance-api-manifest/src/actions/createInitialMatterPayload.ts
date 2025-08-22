export interface CreateInitialMatterPayloadValues {
  /**
   * Name
   * Name for the matter. It should be unique, so a guid is recommended.
   *
   */
  name: string;
  /**
   * Workflow ID
   * Target workflow.
   *
   */
  workflowId: string;
}

/**
 * Create Initial Matter Payload
 *
 * @description Create a payload for the initial matter creation
 */
export const createInitialMatterPayload = {
  key: "createInitialMatterPayload",
  perform: <TReturn>(
    _values: CreateInitialMatterPayloadValues
  ): Promise<TReturn> => Promise.resolve<TReturn>({} as TReturn),
  inputs: {
    name: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
    workflowId: {
      inputType: "string",
      collection: undefined,
      default: ``,
      required: true,
    },
  },
} as const;
