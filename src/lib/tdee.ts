import type { UserProfile, WeightLog, MealLog } from './types';

const SURPLUS_KCAL_PER_DAY = 480;
const KCAL_PER_KG_BODY = 7700;

export function calcAge(birthdate: string, today = new Date()): number {
  const b = new Date(birthdate);
  let age = today.getFullYear() - b.getFullYear();
  const m = today.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
  return age;
}

export function calcBMR(p: Pick<UserProfile, 'sex' | 'height_cm' | 'birthdate'> & { weight_kg: number }): number {
  const age = calcAge(p.birthdate);
  const base = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * age;
  return Math.round(p.sex === 'male' ? base + 5 : base - 161);
}

export function calcTDEE(p: Pick<UserProfile, 'sex' | 'height_cm' | 'birthdate' | 'activity_level'> & { weight_kg: number }): number {
  return Math.round(calcBMR(p) * p.activity_level);
}

export interface CalorieTargets {
  tdee: number;
  daily_calorie_target: number;
  protein_target_g: number;
  fat_target_g: number;
  carb_target_g: number;
}

export function calcCalorieTargets(p: Pick<UserProfile, 'sex' | 'height_cm' | 'birthdate' | 'activity_level'> & { weight_kg: number }): CalorieTargets {
  const tdee = calcTDEE(p);
  const target = tdee + SURPLUS_KCAL_PER_DAY;
  const protein = Math.round(p.weight_kg * 2.0);
  const fat = Math.round((target * 0.25) / 9);
  const carb = Math.round((target - protein * 4 - fat * 9) / 4);
  return {
    tdee,
    daily_calorie_target: target,
    protein_target_g: protein,
    fat_target_g: fat,
    carb_target_g: carb,
  };
}

export function epley1RM(weight_kg: number, reps: number): number {
  return Math.round(weight_kg * (1 + reps / 30) * 10) / 10;
}

export function movingAverage(values: (number | null)[], window = 7): (number | null)[] {
  return values.map((_, i) => {
    const slice = values.slice(Math.max(0, i - window + 1), i + 1).filter((v): v is number => v != null);
    if (slice.length === 0) return null;
    return Math.round((slice.reduce((a, b) => a + b, 0) / slice.length) * 100) / 100;
  });
}

export interface AdaptiveTdeeResult {
  estimated_tdee: number;
  weight_change_kg: number;
  avg_intake_kcal: number;
  new_target_kcal: number;
  period_days: number;
}

export function adaptiveTdee(
  weights: WeightLog[],
  meals: MealLog[],
  current_weight_kg: number,
): AdaptiveTdeeResult | null {
  if (weights.length < 2) return null;
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const periodMs = new Date(newest.date).getTime() - new Date(oldest.date).getTime();
  const period_days = Math.max(1, Math.round(periodMs / (1000 * 60 * 60 * 24)));
  if (period_days < 7) return null;

  const weight_change_kg = newest.weight_kg - oldest.weight_kg;

  const kcalByDate = new Map<string, number>();
  for (const m of meals) {
    kcalByDate.set(m.date, (kcalByDate.get(m.date) ?? 0) + Number(m.kcal));
  }
  if (kcalByDate.size === 0) return null;
  const avg_intake_kcal = Array.from(kcalByDate.values()).reduce((a, b) => a + b, 0) / kcalByDate.size;

  const daily_surplus = (weight_change_kg * KCAL_PER_KG_BODY) / period_days;
  const estimated_tdee = Math.round(avg_intake_kcal - daily_surplus);
  const new_target_kcal = estimated_tdee + SURPLUS_KCAL_PER_DAY;

  return {
    estimated_tdee,
    weight_change_kg: Math.round(weight_change_kg * 100) / 100,
    avg_intake_kcal: Math.round(avg_intake_kcal),
    new_target_kcal,
    period_days,
  };
}

export function projectGoalDate(
  current_weight_kg: number,
  goal_weight_kg: number,
  recent_change_per_week_kg: number,
): Date | null {
  if (recent_change_per_week_kg <= 0) return null;
  const weeks_needed = (goal_weight_kg - current_weight_kg) / recent_change_per_week_kg;
  if (weeks_needed <= 0) return new Date();
  const d = new Date();
  d.setDate(d.getDate() + Math.round(weeks_needed * 7));
  return d;
}
