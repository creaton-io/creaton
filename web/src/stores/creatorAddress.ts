import {writable} from 'svelte/store';

// set address to null instead of '0x0' to prevent UI flickering
// while fetching creator address
export const creatorAddress = writable(null)
