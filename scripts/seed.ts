import 'dotenv/config';
import { db, exercises, foods } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Seeding exercises...');
  await db.execute(sql`TRUNCATE TABLE template_exercises, workout_templates, workout_sets, workouts, meal_logs, food_favorites, foods, exercises RESTART IDENTITY CASCADE;`);

  await db.insert(exercises).values([
    // 胸
    { name_jp: 'ベンチプレス', name_en: 'Bench Press', muscle_group: 'chest', equipment: 'barbell', is_compound: true, default_rest_sec: 180 },
    { name_jp: 'インクラインベンチプレス', name_en: 'Incline Bench Press', muscle_group: 'chest', equipment: 'barbell', is_compound: true, default_rest_sec: 180 },
    { name_jp: 'ダンベルベンチプレス', name_en: 'Dumbbell Bench Press', muscle_group: 'chest', equipment: 'dumbbell', is_compound: true, default_rest_sec: 120 },
    { name_jp: 'ダンベルフライ', name_en: 'Dumbbell Fly', muscle_group: 'chest', equipment: 'dumbbell', is_compound: false, default_rest_sec: 90 },
    { name_jp: 'ケーブルクロスオーバー', name_en: 'Cable Crossover', muscle_group: 'chest', equipment: 'cable', is_compound: false, default_rest_sec: 90 },
    { name_jp: '腕立て伏せ', name_en: 'Push Up', muscle_group: 'chest', equipment: 'bodyweight', is_compound: true, default_rest_sec: 60 },
    // 背中
    { name_jp: 'デッドリフト', name_en: 'Deadlift', muscle_group: 'back', equipment: 'barbell', is_compound: true, default_rest_sec: 240 },
    { name_jp: 'ベントオーバーロウ', name_en: 'Bent Over Row', muscle_group: 'back', equipment: 'barbell', is_compound: true, default_rest_sec: 150 },
    { name_jp: '懸垂', name_en: 'Pull Up', muscle_group: 'back', equipment: 'bodyweight', is_compound: true, default_rest_sec: 150 },
    { name_jp: 'ラットプルダウン', name_en: 'Lat Pulldown', muscle_group: 'back', equipment: 'machine', is_compound: false, default_rest_sec: 90 },
    { name_jp: 'シーテッドロウ', name_en: 'Seated Row', muscle_group: 'back', equipment: 'cable', is_compound: false, default_rest_sec: 90 },
    { name_jp: 'ダンベルロウ', name_en: 'Dumbbell Row', muscle_group: 'back', equipment: 'dumbbell', is_compound: false, default_rest_sec: 90 },
    // 脚
    { name_jp: 'スクワット', name_en: 'Squat', muscle_group: 'legs', equipment: 'barbell', is_compound: true, default_rest_sec: 240 },
    { name_jp: 'ルーマニアンデッドリフト', name_en: 'Romanian Deadlift', muscle_group: 'legs', equipment: 'barbell', is_compound: true, default_rest_sec: 180 },
    { name_jp: 'レッグプレス', name_en: 'Leg Press', muscle_group: 'legs', equipment: 'machine', is_compound: true, default_rest_sec: 150 },
    { name_jp: 'レッグエクステンション', name_en: 'Leg Extension', muscle_group: 'legs', equipment: 'machine', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'レッグカール', name_en: 'Leg Curl', muscle_group: 'legs', equipment: 'machine', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ブルガリアンスクワット', name_en: 'Bulgarian Split Squat', muscle_group: 'legs', equipment: 'dumbbell', is_compound: true, default_rest_sec: 90 },
    { name_jp: 'カーフレイズ', name_en: 'Calf Raise', muscle_group: 'legs', equipment: 'machine', is_compound: false, default_rest_sec: 60 },
    // 肩
    { name_jp: 'ショルダープレス', name_en: 'Shoulder Press', muscle_group: 'shoulders', equipment: 'barbell', is_compound: true, default_rest_sec: 150 },
    { name_jp: 'ダンベルショルダープレス', name_en: 'Dumbbell Shoulder Press', muscle_group: 'shoulders', equipment: 'dumbbell', is_compound: true, default_rest_sec: 120 },
    { name_jp: 'サイドレイズ', name_en: 'Side Raise', muscle_group: 'shoulders', equipment: 'dumbbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'リアレイズ', name_en: 'Rear Delt Raise', muscle_group: 'shoulders', equipment: 'dumbbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'フェイスプル', name_en: 'Face Pull', muscle_group: 'shoulders', equipment: 'cable', is_compound: false, default_rest_sec: 60 },
    // 腕
    { name_jp: 'バーベルカール', name_en: 'Barbell Curl', muscle_group: 'arms', equipment: 'barbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ダンベルカール', name_en: 'Dumbbell Curl', muscle_group: 'arms', equipment: 'dumbbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ハンマーカール', name_en: 'Hammer Curl', muscle_group: 'arms', equipment: 'dumbbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ナローベンチプレス', name_en: 'Close Grip Bench Press', muscle_group: 'arms', equipment: 'barbell', is_compound: true, default_rest_sec: 90 },
    { name_jp: 'トライセプスエクステンション', name_en: 'Tricep Extension', muscle_group: 'arms', equipment: 'dumbbell', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ケーブルプッシュダウン', name_en: 'Cable Push Down', muscle_group: 'arms', equipment: 'cable', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'ディップス', name_en: 'Dips', muscle_group: 'arms', equipment: 'bodyweight', is_compound: true, default_rest_sec: 90 },
    // コア
    { name_jp: 'プランク', name_en: 'Plank', muscle_group: 'core', equipment: 'bodyweight', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'クランチ', name_en: 'Crunch', muscle_group: 'core', equipment: 'bodyweight', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'レッグレイズ', name_en: 'Leg Raise', muscle_group: 'core', equipment: 'bodyweight', is_compound: false, default_rest_sec: 60 },
    { name_jp: 'アブローラー', name_en: 'Ab Roller', muscle_group: 'core', equipment: 'other', is_compound: false, default_rest_sec: 60 },
    // 有酸素
    { name_jp: 'ランニング', name_en: 'Running', muscle_group: 'cardio', equipment: 'other', is_compound: false, default_rest_sec: 0 },
    { name_jp: 'エアロバイク', name_en: 'Stationary Bike', muscle_group: 'cardio', equipment: 'machine', is_compound: false, default_rest_sec: 0 },
  ]);

  console.log('Seeding foods...');
  await db.insert(foods).values([
    // 主食
    { name: '白米(炊飯)', name_kana: 'はくまい', kcal_per_100g: '156', protein_g_per_100g: '2.5', fat_g_per_100g: '0.3', carb_g_per_100g: '37.1', source: 'mext' },
    { name: '玄米(炊飯)', name_kana: 'げんまい', kcal_per_100g: '152', protein_g_per_100g: '2.8', fat_g_per_100g: '1.0', carb_g_per_100g: '35.6', source: 'mext' },
    { name: '食パン', name_kana: 'しょくぱん', kcal_per_100g: '248', protein_g_per_100g: '8.9', fat_g_per_100g: '4.1', carb_g_per_100g: '46.4', source: 'mext' },
    { name: '全粒粉パン', name_kana: 'ぜんりゅうふんぱん', kcal_per_100g: '251', protein_g_per_100g: '9.8', fat_g_per_100g: '5.4', carb_g_per_100g: '43.7', source: 'mext' },
    { name: 'うどん(茹)', name_kana: 'うどん', kcal_per_100g: '95', protein_g_per_100g: '2.6', fat_g_per_100g: '0.4', carb_g_per_100g: '21.6', source: 'mext' },
    { name: 'そば(茹)', name_kana: 'そば', kcal_per_100g: '130', protein_g_per_100g: '4.8', fat_g_per_100g: '1.0', carb_g_per_100g: '26.0', source: 'mext' },
    { name: 'パスタ(茹)', name_kana: 'ぱすた', kcal_per_100g: '150', protein_g_per_100g: '5.2', fat_g_per_100g: '0.9', carb_g_per_100g: '30.3', source: 'mext' },
    { name: 'オートミール', name_kana: 'おーとみーる', kcal_per_100g: '350', protein_g_per_100g: '13.7', fat_g_per_100g: '5.7', carb_g_per_100g: '69.1', source: 'mext' },
    { name: 'ラーメン(中華麺茹)', name_kana: 'らーめん', kcal_per_100g: '133', protein_g_per_100g: '4.9', fat_g_per_100g: '0.6', carb_g_per_100g: '27.9', source: 'mext' },
    { name: '餅', name_kana: 'もち', kcal_per_100g: '223', protein_g_per_100g: '4.0', fat_g_per_100g: '0.6', carb_g_per_100g: '50.8', source: 'mext' },
    // 肉
    { name: '鶏むね肉(皮なし)', name_kana: 'とりむねにく', kcal_per_100g: '105', protein_g_per_100g: '23.3', fat_g_per_100g: '1.9', carb_g_per_100g: '0.0', source: 'mext' },
    { name: '鶏むね肉(皮あり)', name_kana: 'とりむねにくかわ', kcal_per_100g: '145', protein_g_per_100g: '21.3', fat_g_per_100g: '5.9', carb_g_per_100g: '0.0', source: 'mext' },
    { name: '鶏もも肉(皮なし)', name_kana: 'とりももにく', kcal_per_100g: '113', protein_g_per_100g: '19.0', fat_g_per_100g: '5.0', carb_g_per_100g: '0.0', source: 'mext' },
    { name: '鶏ささみ', name_kana: 'とりささみ', kcal_per_100g: '98', protein_g_per_100g: '23.9', fat_g_per_100g: '0.8', carb_g_per_100g: '0.1', source: 'mext' },
    { name: '豚ロース', name_kana: 'ぶたろーす', kcal_per_100g: '248', protein_g_per_100g: '19.3', fat_g_per_100g: '19.2', carb_g_per_100g: '0.2', source: 'mext' },
    { name: '豚ヒレ', name_kana: 'ぶたひれ', kcal_per_100g: '118', protein_g_per_100g: '22.2', fat_g_per_100g: '3.7', carb_g_per_100g: '0.3', source: 'mext' },
    { name: '牛もも肉', name_kana: 'ぎゅうももにく', kcal_per_100g: '182', protein_g_per_100g: '19.5', fat_g_per_100g: '10.7', carb_g_per_100g: '0.6', source: 'mext' },
    { name: '牛バラ肉', name_kana: 'ぎゅうばらにく', kcal_per_100g: '371', protein_g_per_100g: '14.4', fat_g_per_100g: '32.9', carb_g_per_100g: '0.3', source: 'mext' },
    { name: 'ひき肉(合挽)', name_kana: 'ひきにく', kcal_per_100g: '226', protein_g_per_100g: '17.4', fat_g_per_100g: '16.1', carb_g_per_100g: '0.8', source: 'mext' },
    // 魚
    { name: '鮭', name_kana: 'さけ', kcal_per_100g: '133', protein_g_per_100g: '22.3', fat_g_per_100g: '4.1', carb_g_per_100g: '0.1', source: 'mext' },
    { name: 'まぐろ赤身', name_kana: 'まぐろ', kcal_per_100g: '125', protein_g_per_100g: '26.4', fat_g_per_100g: '1.4', carb_g_per_100g: '0.1', source: 'mext' },
    { name: 'さば', name_kana: 'さば', kcal_per_100g: '247', protein_g_per_100g: '20.6', fat_g_per_100g: '16.8', carb_g_per_100g: '0.3', source: 'mext' },
    { name: 'ぶり', name_kana: 'ぶり', kcal_per_100g: '257', protein_g_per_100g: '21.4', fat_g_per_100g: '17.6', carb_g_per_100g: '0.3', source: 'mext' },
    { name: 'ツナ缶(水煮)', name_kana: 'つなかん', kcal_per_100g: '71', protein_g_per_100g: '16.0', fat_g_per_100g: '0.7', carb_g_per_100g: '0.2', source: 'mext' },
    { name: 'えび', name_kana: 'えび', kcal_per_100g: '82', protein_g_per_100g: '18.4', fat_g_per_100g: '0.6', carb_g_per_100g: '0.0', source: 'mext' },
    // 卵・乳
    { name: '鶏卵', name_kana: 'たまご', kcal_per_100g: '142', protein_g_per_100g: '12.2', fat_g_per_100g: '10.2', carb_g_per_100g: '0.4', source: 'mext' },
    { name: '卵白', name_kana: 'らんぱく', kcal_per_100g: '47', protein_g_per_100g: '10.1', fat_g_per_100g: '0.0', carb_g_per_100g: '0.5', source: 'mext' },
    { name: '牛乳', name_kana: 'ぎゅうにゅう', kcal_per_100g: '61', protein_g_per_100g: '3.3', fat_g_per_100g: '3.8', carb_g_per_100g: '4.8', source: 'mext' },
    { name: 'ヨーグルト(プレーン)', name_kana: 'よーぐると', kcal_per_100g: '56', protein_g_per_100g: '3.6', fat_g_per_100g: '3.0', carb_g_per_100g: '4.9', source: 'mext' },
    { name: 'プロセスチーズ', name_kana: 'ちーず', kcal_per_100g: '313', protein_g_per_100g: '22.7', fat_g_per_100g: '26.0', carb_g_per_100g: '1.3', source: 'mext' },
    { name: 'カッテージチーズ', name_kana: 'かってーじちーず', kcal_per_100g: '99', protein_g_per_100g: '13.3', fat_g_per_100g: '4.5', carb_g_per_100g: '1.9', source: 'mext' },
    // 大豆
    { name: '木綿豆腐', name_kana: 'もめんどうふ', kcal_per_100g: '73', protein_g_per_100g: '7.0', fat_g_per_100g: '4.9', carb_g_per_100g: '1.5', source: 'mext' },
    { name: '絹豆腐', name_kana: 'きぬどうふ', kcal_per_100g: '56', protein_g_per_100g: '5.3', fat_g_per_100g: '3.5', carb_g_per_100g: '2.0', source: 'mext' },
    { name: '納豆', name_kana: 'なっとう', kcal_per_100g: '184', protein_g_per_100g: '16.5', fat_g_per_100g: '10.0', carb_g_per_100g: '12.1', source: 'mext' },
    { name: '豆乳(無調整)', name_kana: 'とうにゅう', kcal_per_100g: '44', protein_g_per_100g: '3.6', fat_g_per_100g: '2.0', carb_g_per_100g: '3.1', source: 'mext' },
    // 野菜
    { name: 'ブロッコリー', name_kana: 'ぶろっこりー', kcal_per_100g: '37', protein_g_per_100g: '5.4', fat_g_per_100g: '0.6', carb_g_per_100g: '6.6', source: 'mext' },
    { name: 'キャベツ', name_kana: 'きゃべつ', kcal_per_100g: '21', protein_g_per_100g: '1.3', fat_g_per_100g: '0.2', carb_g_per_100g: '5.2', source: 'mext' },
    { name: 'トマト', name_kana: 'とまと', kcal_per_100g: '20', protein_g_per_100g: '0.7', fat_g_per_100g: '0.1', carb_g_per_100g: '4.7', source: 'mext' },
    { name: 'きゅうり', name_kana: 'きゅうり', kcal_per_100g: '13', protein_g_per_100g: '1.0', fat_g_per_100g: '0.1', carb_g_per_100g: '3.0', source: 'mext' },
    { name: 'ほうれん草', name_kana: 'ほうれんそう', kcal_per_100g: '18', protein_g_per_100g: '2.2', fat_g_per_100g: '0.4', carb_g_per_100g: '3.1', source: 'mext' },
    { name: '玉ねぎ', name_kana: 'たまねぎ', kcal_per_100g: '33', protein_g_per_100g: '1.0', fat_g_per_100g: '0.1', carb_g_per_100g: '8.4', source: 'mext' },
    // 果物
    { name: 'バナナ', name_kana: 'ばなな', kcal_per_100g: '86', protein_g_per_100g: '1.1', fat_g_per_100g: '0.2', carb_g_per_100g: '22.5', source: 'mext' },
    { name: 'りんご', name_kana: 'りんご', kcal_per_100g: '54', protein_g_per_100g: '0.2', fat_g_per_100g: '0.3', carb_g_per_100g: '14.6', source: 'mext' },
    { name: 'ブルーベリー', name_kana: 'ぶるーべりー', kcal_per_100g: '49', protein_g_per_100g: '0.5', fat_g_per_100g: '0.1', carb_g_per_100g: '12.9', source: 'mext' },
    { name: 'みかん', name_kana: 'みかん', kcal_per_100g: '45', protein_g_per_100g: '0.7', fat_g_per_100g: '0.1', carb_g_per_100g: '12.0', source: 'mext' },
    // ナッツ・油
    { name: 'アーモンド', name_kana: 'あーもんど', kcal_per_100g: '587', protein_g_per_100g: '19.6', fat_g_per_100g: '51.8', carb_g_per_100g: '20.9', source: 'mext' },
    { name: 'オリーブオイル', name_kana: 'おりーぶおいる', kcal_per_100g: '894', protein_g_per_100g: '0.0', fat_g_per_100g: '100.0', carb_g_per_100g: '0.0', source: 'mext' },
    { name: 'ピーナッツバター', name_kana: 'ぴーなっつばたー', kcal_per_100g: '640', protein_g_per_100g: '22.5', fat_g_per_100g: '50.0', carb_g_per_100g: '18.0', source: 'mext' },
    // プロテイン
    { name: 'ホエイプロテイン(1食30g)', name_kana: 'ぷろていん', kcal_per_100g: '400', protein_g_per_100g: '80.0', fat_g_per_100g: '5.0', carb_g_per_100g: '8.0', source: 'mext' },
    { name: 'プロテインバー', name_kana: 'ぷろていんばー', kcal_per_100g: '350', protein_g_per_100g: '30.0', fat_g_per_100g: '15.0', carb_g_per_100g: '25.0', source: 'mext' },
    { name: 'マルトデキストリン', name_kana: 'まるとできすとりん', kcal_per_100g: '400', protein_g_per_100g: '0.0', fat_g_per_100g: '0.0', carb_g_per_100g: '100.0', source: 'mext' },
    // 外食
    { name: 'セブン サラダチキン1個', name_kana: 'さらだちきん', kcal_per_100g: '113', protein_g_per_100g: '24.1', fat_g_per_100g: '1.5', carb_g_per_100g: '0.3', source: 'mext' },
    { name: 'おにぎり 鮭', name_kana: 'おにぎり', kcal_per_100g: '180', protein_g_per_100g: '4.5', fat_g_per_100g: '1.5', carb_g_per_100g: '36.0', source: 'mext' },
    { name: 'カップ麺(平均)', name_kana: 'かっぷめん', kcal_per_100g: '450', protein_g_per_100g: '10.0', fat_g_per_100g: '20.0', carb_g_per_100g: '56.0', source: 'mext' },
    { name: '牛丼(並)', name_kana: 'ぎゅうどん', kcal_per_100g: '770', protein_g_per_100g: '22.9', fat_g_per_100g: '25.0', carb_g_per_100g: '104.0', source: 'mext' },
    { name: 'ラーメン店(平均)', name_kana: 'らーめんてん', kcal_per_100g: '600', protein_g_per_100g: '22.0', fat_g_per_100g: '18.0', carb_g_per_100g: '84.0', source: 'mext' },
  ]);

  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
