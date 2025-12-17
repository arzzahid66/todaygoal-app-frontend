-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;

-- Users policies: users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Invites policies: only admins can manage invites
CREATE POLICY "Admins can manage invites" ON invites
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own invite" ON invites
  FOR SELECT USING (email = auth.email());

-- Tasks policies: users can only access their own tasks
CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own tasks" ON tasks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (user_id = auth.uid());

-- Habits policies: users can only access their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own habits" ON habits
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (user_id = auth.uid());

-- Habit logs policies: users can only access their own habit logs
CREATE POLICY "Users can view own habit logs" ON habit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own habit logs" ON habit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own habit logs" ON habit_logs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own habit logs" ON habit_logs
  FOR DELETE USING (user_id = auth.uid());

-- Journal entries policies: users can only access their own entries
CREATE POLICY "Users can view own journal entries" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own journal entries" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own journal entries" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own journal entries" ON journal_entries
  FOR DELETE USING (user_id = auth.uid());

-- Focus sessions policies: users can only access their own sessions
CREATE POLICY "Users can view own focus sessions" ON focus_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own focus sessions" ON focus_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own focus sessions" ON focus_sessions
  FOR UPDATE USING (user_id = auth.uid());

-- Life goals policies: users can only access their own goals
CREATE POLICY "Users can view own life goals" ON life_goals
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own life goals" ON life_goals
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own life goals" ON life_goals
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own life goals" ON life_goals
  FOR DELETE USING (user_id = auth.uid());

-- Goal milestones policies: users can access milestones for their goals
CREATE POLICY "Users can view own goal milestones" ON goal_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM life_goals WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own goal milestones" ON goal_milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM life_goals WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own goal milestones" ON goal_milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM life_goals WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own goal milestones" ON goal_milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM life_goals WHERE id = goal_milestones.goal_id AND user_id = auth.uid()
    )
  );
