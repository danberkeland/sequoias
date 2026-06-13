import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  CampWaiver: a
  .model({
    camper_id: a.id().required(),
    participant_name: a.string().required(),
    participant_is_minor: a.boolean().required(),
    participant_signature_name: a.string().required(),
    parent_guardian_name: a.string(),
    parent_guardian_signature_name: a.string(),
    medical_conditions: a.string().required(),
    emergency_contact_1_name: a.string().required(),
    emergency_contact_1_phone: a.string().required(),
    emergency_contact_1_email: a.string(),
    emergency_contact_2_name: a.string(),
    emergency_contact_2_phone: a.string(),
    emergency_contact_2_email: a.string(),
    medical_insurance_information: a.string().required(),
    risk_accepted: a.boolean().required(),
    medical_care_accepted: a.boolean().required(),
    electronic_signature_accepted: a.boolean().required(),
    signed_at: a.datetime().required(),
    waiver_version: a.string().required(),
  })
  .authorization((allow) => [allow.owner()]),

  Camper: a
    .model({
      camper_first_name: a.string().required(),
      camper_last_name: a.string().required(),
      family_name: a.string(),

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
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["create", "read", "update"]),
        ]),

      isSLDCfee: a
        .boolean()
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["create", "read", "update"]),
        ]),

      isCampAccept: a
        .boolean()
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["create", "read", "update"]),
        ]),

      isCampFee: a
        .boolean()
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["create", "read", "update"]),
        ]),

      isCampWaiver: a
        .boolean()
        .authorization((allow) => [
          allow.owner().to(["read"]),
          allow.group("ADMINS").to(["create", "read", "update"]),
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
