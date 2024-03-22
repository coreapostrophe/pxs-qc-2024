import { invoke } from "@tauri-apps/api/tauri";

export function playSfx(
  options: { kind: string; level: number } = { kind: "Click", level: 1 }
) {
  const { kind, level } = options;
  invoke("play", { kind, level });
}
