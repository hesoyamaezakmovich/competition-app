import { createClient } from '@supabase/supabase-js';

// Замените на ваши реальные данные из проекта Supabase
const supabaseUrl = 'https://azrvoposnqzdvxjkpbxk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6cnZvcG9zbnF6ZHZ4amtwYnhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyMzcxMDcsImV4cCI6MjA2MDgxMzEwN30.siNMKIzQ1RTB39Fanowo7s1h53r93KxZ0cUGFaQ7Zkk';

export const supabase = createClient(supabaseUrl, supabaseKey);