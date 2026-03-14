"use client";

import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { WipWorkItem, DaySnapshot, WipSettings } from "@/types/wip-game";
import type { RoundHistory } from "./use-wip-game";

export interface GameSaveState {
  items: WipWorkItem[];
  snapshots: DaySnapshot[];
  settings: WipSettings;
  roundHistories: RoundHistory[];
  gameRound: number;
  currentDay: number;
  gameOver: boolean;
}

export function useGamePersistence() {
  const supabase = createClient();

  const saveGame = useCallback(async (state: GameSaveState) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("game_saves")
      .upsert({
        user_id: user.id,
        game_type: "wip-game",
        slot: 0,
        game_state: {
          items: state.items,
          snapshots: state.snapshots,
          settings: state.settings,
          roundHistories: state.roundHistories,
        },
        game_round: state.gameRound,
        current_day: state.currentDay,
        game_over: state.gameOver,
        saved_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,game_type,slot",
      })
      .select()
      .single();

    if (error) console.error("Failed to save game:", error);
    return data;
  }, [supabase]);

  const loadGame = useCallback(async (): Promise<GameSaveState | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("game_saves")
      .select("*")
      .eq("user_id", user.id)
      .eq("game_type", "wip-game")
      .eq("slot", 0)
      .single();

    if (error || !data) return null;

    const gs = data.game_state as {
      items: WipWorkItem[];
      snapshots: DaySnapshot[];
      settings: WipSettings;
      roundHistories: RoundHistory[];
    };

    return {
      items: gs.items,
      snapshots: gs.snapshots,
      settings: gs.settings,
      roundHistories: gs.roundHistories,
      gameRound: data.game_round,
      currentDay: data.current_day,
      gameOver: data.game_over,
    };
  }, [supabase]);

  const deleteSave = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("game_saves")
      .delete()
      .eq("user_id", user.id)
      .eq("game_type", "wip-game")
      .eq("slot", 0);
  }, [supabase]);

  return { saveGame, loadGame, deleteSave };
}
