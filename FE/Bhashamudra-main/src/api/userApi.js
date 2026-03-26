import { supabase } from '../lib/supabase'

// ── Fetch full progress for a user ──────────────────────────
export const getUserProgress = async (userId) => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('xp, today_xp, streak, last_xp_date')
    .eq('user_id', userId)
    .single()

  if (error) console.error('getUserProgress error:', error)
  return data
}

// ── Fetch completed lessons for a user ──────────────────────
export const getCompletedLessons = async (userId) => {
  const { data, error } = await supabase
    .from('completed_lessons')
    .select('track, lesson_key')
    .eq('user_id', userId)

  if (error) console.error('getCompletedLessons error:', error)
  return data || []
}

// ── Mark a lesson complete + award XP + update streak ───────
export const markLessonComplete = async (userId, track, lessonKey) => {
  // 1. Upsert completed lesson (ignore if already done)
  const { error: lessonError, data: upsertData } = await supabase
    .from('completed_lessons')
    .upsert(
      { user_id: userId, track, lesson_key: lessonKey },
      { onConflict: 'user_id,track,lesson_key', ignoreDuplicates: true }
    )
    .select()

  if (lessonError) {
    console.error('markLessonComplete upsert error:', lessonError)
    return
  }

  // If ignoreDuplicates kicked in, upsertData will be empty — lesson already done, no XP
  if (!upsertData || upsertData.length === 0) {
    console.log(`Lesson ${track}/${lessonKey} already completed — no XP awarded`)
    return
  }

  // 2. Fetch current progress
  const { data: progress, error: fetchError } = await supabase
    .from('user_progress')
    .select('xp, today_xp, streak, last_xp_date')
    .eq('user_id', userId)
    .single()

  if (fetchError || !progress) {
    console.error('markLessonComplete fetch error:', fetchError)
    return
  }

  // 3. Streak logic
  const today = new Date().toISOString().split('T')[0]          // 'YYYY-MM-DD'
  const lastDate = progress.last_xp_date                        // 'YYYY-MM-DD' or null

  let newStreak = progress.streak
  let newTodayXp = progress.today_xp

  if (lastDate === today) {
    // Already earned XP today — just add to today_xp, no streak change
    newTodayXp = progress.today_xp + 10
  } else {
    // Check if yesterday — streak continues
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      newStreak = progress.streak + 1   // consecutive day
    } else {
      newStreak = 1                     // streak broken or first time
    }
    newTodayXp = 10                     // reset today's XP for new day
  }

  // 4. Update progress
  const { error: updateError } = await supabase
    .from('user_progress')
    .update({
      xp:            progress.xp + 10,
      today_xp:      newTodayXp,
      streak:        newStreak,
      last_xp_date:  today,
      updated_at:    new Date().toISOString()
    })
    .eq('user_id', userId)

  if (updateError) console.error('markLessonComplete update error:', updateError)
}

// ── Update progress manually (for other use cases) ──────────
export const updateUserProgress = async (userId, newProgress) => {
  const { data, error } = await supabase
    .from('user_progress')
    .update({
      xp:                  newProgress.xp,
      today_xp:            newProgress.todayXP,
      updated_at:          new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) console.error('updateUserProgress error:', error)
  return data
}