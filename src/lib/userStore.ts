// src/lib/userStore.ts

import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

// By adding <User | null>, we tell the store it can hold
// either a Supabase User object or null. This fixes the error.
export const user = writable<User | null>(null);
