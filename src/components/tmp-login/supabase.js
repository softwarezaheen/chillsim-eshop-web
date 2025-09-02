import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://igtykprtntalfypbsdtp.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndHlrcHJ0bnRhbGZ5cGJzZHRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwNTY1MiwiZXhwIjoyMDYzNDgxNjUyfQ.XUwnY93xun8p-VYPkXvKBeL7os8r3EMmuw12SZrKdBk";
export const supabase = createClient(supabaseUrl, supabaseKey);