"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface LessonProgress {
  lesson_id: string;
  status: "not_started" | "in_progress" | "completed";
  current_step: number;
  completed_at: string | null;
}

export function useLessonProgress() {
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Load all progress on mount
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("course_progress")
        .select("lesson_id, status, current_step, completed_at")
        .eq("user_id", user.id);

      if (data) {
        const map: Record<string, LessonProgress> = {};
        for (const row of data) {
          map[row.lesson_id] = row as LessonProgress;
        }
        setProgress(map);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const markStarted = useCallback(async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("course_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: "in_progress",
        current_step: 0,
      }, { onConflict: "user_id,lesson_id" });

    setProgress((prev) => ({
      ...prev,
      [lessonId]: { lesson_id: lessonId, status: "in_progress", current_step: 0, completed_at: null },
    }));
  }, [supabase]);

  const updateStep = useCallback(async (lessonId: string, step: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("course_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: "in_progress",
        current_step: step,
      }, { onConflict: "user_id,lesson_id" });

    setProgress((prev) => ({
      ...prev,
      [lessonId]: { ...prev[lessonId], lesson_id: lessonId, status: "in_progress", current_step: step, completed_at: null },
    }));
  }, [supabase]);

  const markCompleted = useCallback(async (lessonId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    await supabase
      .from("course_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: now,
      }, { onConflict: "user_id,lesson_id" });

    setProgress((prev) => ({
      ...prev,
      [lessonId]: { lesson_id: lessonId, status: "completed", current_step: 0, completed_at: now },
    }));
  }, [supabase]);

  const saveQuizScore = useCallback(async (
    lessonId: string,
    score: number,
    total: number,
    passed: boolean,
    answers: Record<string, number>,
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("quiz_scores").insert({
      user_id: user.id,
      lesson_id: lessonId,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      passed,
      answers,
    });

    if (passed) {
      await markCompleted(lessonId);
    }
  }, [supabase, markCompleted]);

  return { progress, loading, markStarted, updateStep, markCompleted, saveQuizScore };
}
