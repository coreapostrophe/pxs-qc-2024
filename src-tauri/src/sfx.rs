use rodio::{source::Source, Decoder, OutputStream};
use std::fmt::Display;
use std::fs::File;
use std::io::BufReader;

#[derive(serde::Deserialize)]
pub enum SfxKind {
    Click,
    Yay,
    Whoosh,
}

impl Display for SfxKind {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let kind_string = match self {
            Self::Click => "click".to_string(),
            Self::Yay => "yay".to_string(),
            Self::Whoosh => "whoosh".to_string(),
        };
        write!(f, "{}", kind_string)
    }
}

#[derive(serde::Deserialize)]
pub struct PlayOptions {
    pub kind: SfxKind,
    pub level: u64,
    pub delay: u64,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command(rename_all = "snake_case")]
pub async fn play(handle: tauri::AppHandle, options: PlayOptions) -> Result<(), ()> {
    let resource_name = format!("resources/{}-{}.mp3", options.kind, options.level);
    let resource_path = handle
        .path_resolver()
        .resolve_resource(resource_name)
        .expect("Failed to resolve resource.");

    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let file = BufReader::new(File::open(&resource_path).unwrap());
    let source = Decoder::new(file).unwrap();
    match stream_handle.play_raw(source.convert_samples()) {
        Err(e) => println!("{}", e),
        _ => (),
    };
    std::thread::sleep(std::time::Duration::from_millis(options.delay));
    Ok(())
}
