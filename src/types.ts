export interface Card {
    node?: HTMLElement,
    title: string,
    is_loading: boolean,
    is_playing: boolean,
    current_artist?: string,
    current_song?: string,
    color: string,
    url: string,
    metadata_url: string
}