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
      isSLDCmember: a
        .boolean()
        .default(false)
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["read", "update"]),
        ]),

      isSLDCfee: a
        .boolean()
        .default(false)
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["read", "update"]),
        ]),

      isCampAccept: a
        .boolean()
        .default(false)
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["read", "update"]),
        ]),

      isCampFee: a
        .boolean()
        .default(false)
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["read", "update"]),
        ]),

      isCampWaiver: a
        .boolean()
        .default(false)
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["read", "update"]),
        ]),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("ADMINS").to(["read", "update", "delete"]),
    ]),
  SLDCApplication: a
    .model({
      camper_id: a.id().required(),

      name: a.string().required(),
      age: a.integer(),
      birthdate: a.date(),

      mailing_address: a.string(),
      city_zip: a.string(),
      telephone: a.string(),
      email: a.email(),

      races_or_info_1: a.string(),
      races_or_info_2: a.string(),
      races_or_info_3: a.string(),

      waiver_accepted: a.boolean().default(false),
      code_of_conduct_accepted: a.boolean().default(false),

      signature_name: a.string(),
      parent_signature_name: a.string(),

      signed_at: a.datetime(),
      application_version: a.string(),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.group("ADMINS").to(["read", "update", "delete"]),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
