import { invoke } from "@tauri-apps/api/tauri";

export function playSfx(
  options: { kind: string; level: number; delay: number } = {
    kind: "Click",
    level: 1,
    delay: 500,
  }
) {
  invoke("play", { options });
}
