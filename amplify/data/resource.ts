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
      attending_full_camp: a.boolean().default(true),
      attendance_schedule: a.json(),
      is_driver: a.boolean().default(false),
      empty_seats_to_camp: a.integer().default(0),
      empty_seats_from_camp: a.integer().default(0),
      empty_seats_during_camp: a.integer().default(0),
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
