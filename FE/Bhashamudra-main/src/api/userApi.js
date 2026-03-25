import { supabase } from '../lib/supabase'

export const updateUserProgress = async (userId, newProgress) => {
  const { data, error } = await supabase
    .from('user_progress')
    .update({
      xp: newProgress.xp,
      today_xp: newProgress.todayXP,
      alphabets_completed: newProgress.alphabetsCompleted,
      numbers_completed: newProgress.numbersCompleted,
      words_completed: newProgress.wordsCompleted,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)

  if (error) console.error('Progress update error:', error)
  return data
}

export const markLessonComplete = async (userId, track, lessonKey) => {
  await supabase.from('completed_lessons').upsert({
    user_id: userId,
    track,
    lesson_key: lessonKey
  })

  const { data: progress } = await supabase
    .from('user_progress')
    .select('xp, today_xp')
    .eq('user_id', userId)
    .single()

  if (progress) {
    await supabase.from('user_progress').update({
      xp: progress.xp + 10,
      today_xp: progress.today_xp + 10,
      updated_at: new Date().toISOString()
    }).eq('user_id', userId)
  }
}