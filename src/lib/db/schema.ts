import {
  pgTable, text, integer, numeric, boolean, date, time,
  timestamp, uuid, primaryKey, uniqueIndex, index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql, relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// ============================================================
// Auth.js (NextAuth) 標準テーブル
// ============================================================
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),

  // プロフィール
  display_name: text('display_name').notNull().default('me'),
  height_cm: numeric('height_cm', { precision: 5, scale: 2 }).notNull().default('170'),
  birthdate: date('birthdate').notNull().default('1998-01-01'),
  sex: text('sex', { enum: ['male', 'female'] }).notNull().default('male'),
  activity_level: numeric('activity_level', { precision: 3, scale: 2 }).notNull().default('1.55'),
  goal_weight_kg: numeric('goal_weight_kg', { precision: 5, scale: 2 }).notNull().default('70.0'),
  goal_date: date('goal_date').notNull().default(sql`(CURRENT_DATE + INTERVAL '120 days')`),

  current_tdee: integer('current_tdee'),
  daily_calorie_target: integer('daily_calorie_target'),
  protein_target_g: integer('protein_target_g'),
  fat_target_g: integer('fat_target_g'),
  carb_target_g: integer('carb_target_g'),

  timezone: text('timezone').notNull().default('Asia/Tokyo'),
  notify_weight_at: time('notify_weight_at').default('07:00:00'),
  notify_meal_at: time('notify_meal_at').array().default(sql`ARRAY['12:00:00'::time, '19:00:00'::time]`),
  notify_enabled: boolean('notify_enabled').notNull().default(true),

  onboarded: boolean('onboarded').notNull().default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const accounts = pgTable('accounts', {
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').$type<AdapterAccountType>().notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (a) => ({
  pk: primaryKey({ columns: [a.provider, a.providerAccountId] }),
}));

export const sessions = pgTable('sessions', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (vt) => ({
  pk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// ============================================================
// アプリ固有テーブル
// ============================================================
export const weight_logs = pgTable('weight_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  weight_kg: numeric('weight_kg', { precision: 5, scale: 2 }).notNull(),
  body_fat_pct: numeric('body_fat_pct', { precision: 4, scale: 2 }),
  note: text('note'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqUserDate: uniqueIndex('weight_logs_user_date_uniq').on(t.user_id, t.date),
  idxUserDate: index('weight_logs_user_date_idx').on(t.user_id, t.date),
}));

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  name_jp: text('name_jp').notNull(),
  name_en: text('name_en'),
  muscle_group: text('muscle_group', {
    enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full', 'cardio'],
  }).notNull(),
  equipment: text('equipment', {
    enum: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'other'],
  }),
  is_compound: boolean('is_compound').notNull().default(false),
  default_rest_sec: integer('default_rest_sec').notNull().default(90),
  is_global: boolean('is_global').notNull().default(true),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idxMuscle: index('exercises_muscle_idx').on(t.muscle_group),
}));

export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull().defaultNow(),
  name: text('name'),
  started_at: timestamp('started_at').defaultNow(),
  ended_at: timestamp('ended_at'),
  note: text('note'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idxUserDate: index('workouts_user_date_idx').on(t.user_id, t.date),
}));

export const workout_sets = pgTable('workout_sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  workout_id: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exercise_id: uuid('exercise_id').notNull().references(() => exercises.id),
  set_no: integer('set_no').notNull(),
  reps: integer('reps').notNull(),
  weight_kg: numeric('weight_kg', { precision: 6, scale: 2 }).notNull(),
  rpe: numeric('rpe', { precision: 3, scale: 1 }),
  is_warmup: boolean('is_warmup').notNull().default(false),
  rest_sec: integer('rest_sec'),
  note: text('note'),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  idxWorkout: index('sets_workout_idx').on(t.workout_id),
  idxExercise: index('sets_exercise_idx').on(t.exercise_id),
}));

export const foods = pgTable('foods', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  name_kana: text('name_kana'),
  brand: text('brand'),
  unit_g: numeric('unit_g', { precision: 7, scale: 2 }).default('100'),
  kcal_per_100g: numeric('kcal_per_100g', { precision: 6, scale: 2 }).notNull(),
  protein_g_per_100g: numeric('protein_g_per_100g', { precision: 5, scale: 2 }).notNull().default('0'),
  fat_g_per_100g: numeric('fat_g_per_100g', { precision: 5, scale: 2 }).notNull().default('0'),
  carb_g_per_100g: numeric('carb_g_per_100g', { precision: 5, scale: 2 }).notNull().default('0'),
  source: text('source', { enum: ['mext', 'user', 'manual', 'barcode'] }).notNull().default('manual'),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const meal_logs = pgTable('meal_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull().defaultNow(),
  meal_type: text('meal_type', { enum: ['breakfast', 'lunch', 'dinner', 'snack'] }).notNull(),
  food_id: uuid('food_id').notNull().references(() => foods.id),
  quantity_g: numeric('quantity_g', { precision: 7, scale: 2 }).notNull(),
  kcal: numeric('kcal', { precision: 7, scale: 2 }).notNull(),
  protein_g: numeric('protein_g', { precision: 6, scale: 2 }).notNull().default('0'),
  fat_g: numeric('fat_g', { precision: 6, scale: 2 }).notNull().default('0'),
  carb_g: numeric('carb_g', { precision: 6, scale: 2 }).notNull().default('0'),
  photo_url: text('photo_url'),
  logged_at: timestamp('logged_at').notNull().defaultNow(),
}, (t) => ({
  idxUserDate: index('meal_logs_user_date_idx').on(t.user_id, t.date),
}));

export const food_favorites = pgTable('food_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  food_id: uuid('food_id').notNull().references(() => foods.id, { onDelete: 'cascade' }),
  default_quantity_g: numeric('default_quantity_g', { precision: 7, scale: 2 }).notNull().default('100'),
  sort_order: integer('sort_order').notNull().default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
}, (t) => ({
  uniqUserFood: uniqueIndex('food_favorites_uniq').on(t.user_id, t.food_id),
}));

export const notification_subscriptions = pgTable('notification_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const tdee_history = pgTable('tdee_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  calculated_at: date('calculated_at').notNull().defaultNow(),
  period_days: integer('period_days').notNull(),
  avg_intake_kcal: numeric('avg_intake_kcal', { precision: 7, scale: 2 }),
  weight_change_kg: numeric('weight_change_kg', { precision: 5, scale: 2 }),
  estimated_tdee: integer('estimated_tdee'),
  new_target_kcal: integer('new_target_kcal'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const workout_templates = pgTable('workout_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  scheduled_dow: integer('scheduled_dow').array(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const template_exercises = pgTable('template_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  template_id: uuid('template_id').notNull().references(() => workout_templates.id, { onDelete: 'cascade' }),
  exercise_id: uuid('exercise_id').notNull().references(() => exercises.id),
  position: integer('position').notNull(),
  default_sets: integer('default_sets').notNull().default(3),
  default_reps: integer('default_reps').notNull().default(8),
});

// ============================================================
// Relations
// ============================================================
export const workoutsRelations = relations(workouts, ({ many, one }) => ({
  sets: many(workout_sets),
  user: one(users, { fields: [workouts.user_id], references: [users.id] }),
}));

export const workoutSetsRelations = relations(workout_sets, ({ one }) => ({
  workout: one(workouts, { fields: [workout_sets.workout_id], references: [workouts.id] }),
  exercise: one(exercises, { fields: [workout_sets.exercise_id], references: [exercises.id] }),
}));

export const mealLogsRelations = relations(meal_logs, ({ one }) => ({
  food: one(foods, { fields: [meal_logs.food_id], references: [foods.id] }),
}));

export const foodFavoritesRelations = relations(food_favorites, ({ one }) => ({
  food: one(foods, { fields: [food_favorites.food_id], references: [foods.id] }),
}));

// ============================================================
// Types (Drizzleが自動生成)
// ============================================================
export type User = typeof users.$inferSelect;
export type WeightLog = typeof weight_logs.$inferSelect;
export type NewWeightLog = typeof weight_logs.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type WorkoutSet = typeof workout_sets.$inferSelect;
export type NewWorkoutSet = typeof workout_sets.$inferInsert;
export type Food = typeof foods.$inferSelect;
export type NewFood = typeof foods.$inferInsert;
export type MealLog = typeof meal_logs.$inferSelect;
export type NewMealLog = typeof meal_logs.$inferInsert;
export type FoodFavorite = typeof food_favorites.$inferSelect;
export type NotificationSubscription = typeof notification_subscriptions.$inferSelect;
export type NewNotificationSubscription = typeof notification_subscriptions.$inferInsert;
export type TdeeHistory = typeof tdee_history.$inferSelect;
