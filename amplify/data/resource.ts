import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Camper: a
    .model({
      camper_first_name: a.string().required(),
      camper_last_name: a.string().required(),

      camper_type: a.enum([
        "ATHLETE",
        "PARENT",
        "NON_PARENT_ADULT_ALUMNI",
        "SIBLING",
        "COACH",
      ]),
      shirt_size: a.enum(["XS", "S", "M", "L", "XL"]),

      sweatshirt_size: a.enum(["XS", "S", "M", "L", "XL"]),

      special_dietary_needs: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
