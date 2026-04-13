import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string()
  }),

  brands: defineTable({
    createdBy: v.id('users'),
    name: v.string()
  }),

  shoes: defineTable({
    createdBy: v.id('users'),
    brandId: v.id('brands'),
    name: v.string(),
    color: v.string(),
    startCount: v.number()
  }),

  wears: defineTable({
    shoeId: v.id('shoes'),
    dateISO: v.string()
  })
});
