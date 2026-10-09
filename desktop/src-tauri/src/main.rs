// keeps a console window from popping up next to the game on Windows release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    kto_iz_nas_lib::run()
}
