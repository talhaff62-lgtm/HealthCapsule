import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { createUser, listUsers } from "@/api/panel";
import { useAsync } from "@/hooks/use-data";
import { Button, Card, LabeledInput, SectionTitle } from "@/components/panel-ui";
import { EmptyState, ErrorState, LoadingState } from "@/components/skeleton";
import { colors, minTouch, radius, spacing } from "@/theme";
import { formatDate, messageOf, scalar, Segmented } from "./admin-shared";

type PanelUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string | null;
  submissionCount?: number | null;
  approvedCount?: number | null;
};

type NewRole = "STAFF" | "ADMIN";

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function countOf(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

export default function StaffManagementScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [users, setUsers] = useState<PanelUser[] | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<NewRole>("STAFF");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async (): Promise<PanelUser[]> => {
    if (!token) return [];
    return asArray<PanelUser>(await listUsers<unknown>(token));
  }, [token]);

  const result = useAsync<PanelUser[]>(load);
  const visible = users ?? result.data;

  async function submit() {
    const tok = token;
    if (!tok || saving) return;
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!password) errors.password = "Password is required.";
    setFieldErrors(errors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(errors).length > 0) return;
    setSaving(true);
    try {
      const created = await createUser<PanelUser>(tok, {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      const createdId = scalar((created as unknown as Record<string, unknown>)?.id);
      const row: PanelUser = {
        id: createdId ?? `new-${Date.now()}`,
        name: created?.name ?? name.trim(),
        email: created?.email ?? email.trim(),
        role: created?.role ?? role,
        createdAt: created?.createdAt ?? new Date().toISOString(),
        submissionCount: countOf(created?.submissionCount),
        approvedCount: countOf(created?.approvedCount),
      };
      setUsers([row, ...(visible ?? [])]);
      setNotice(`Added ${row.name} (${row.role.toLowerCase()}).`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("STAFF");
      setFormOpen(false);
    } catch (err) {
      setFormError(messageOf(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.container,
        { paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.xxl },
      ]}
    >
      <SectionTitle title="Staff management" subtitle="Accounts and submission counts" />

      {notice ? (
        <Text style={styles.notice} accessibilityRole="text">
          {notice}
        </Text>
      ) : null}

      {!formOpen ? (
        <Button
          title="Add staff"
          onPress={() => {
            setFormOpen(true);
            setFormError(null);
          }}
        />
      ) : (
        <Card>
          <LabeledInput
            label="Name"
            required
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            autoCapitalize="words"
            error={fieldErrors.name ?? null}
          />
          <LabeledInput
            label="Email"
            required
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            error={fieldErrors.email ?? null}
          />
          <LabeledInput
            label="Password"
            required
            value={password}
            onChangeText={setPassword}
            placeholder="Temporary password"
            autoCapitalize="none"
            secureTextEntry={!showPassword}
            error={fieldErrors.password ?? null}
          />
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            style={styles.showToggle}
          >
            <Text style={styles.showToggleText}>{showPassword ? "Hide" : "Show"}</Text>
          </Pressable>
          <Segmented<NewRole>
            label="Role"
            value={role}
            onChange={(v) => setRole(v)}
            options={[
              { value: "STAFF", label: "Staff" },
              { value: "ADMIN", label: "Admin" },
            ]}
          />
          {formError ? (
            <Text style={styles.apiError} accessibilityRole="alert">
              {formError}
            </Text>
          ) : null}
          <Button title="Create account" loading={saving} onPress={() => void submit()} />
          <Button
            title="Cancel"
            variant="outline"
            disabled={saving}
            onPress={() => setFormOpen(false)}
          />
        </Card>
      )}

      {result.loading && !visible ? (
        <LoadingState />
      ) : result.error && !visible ? (
        <ErrorState message={result.error} onRetry={result.reload} />
      ) : !visible || visible.length === 0 ? (
        <EmptyState
          title="No staff accounts yet"
          hint="Use Add staff to create the first account."
        />
      ) : (
        visible.map((u) => (
          <View key={u.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.cardBody}>
                <Text style={styles.name}>{u.name}</Text>
                <Text style={styles.email} numberOfLines={1}>
                  {u.email}
                </Text>
              </View>
              <View style={styles.roleChip} accessibilityLabel={`${u.role} role`}>
                <Text style={styles.roleChipText}>{u.role}</Text>
              </View>
            </View>
            <Text style={styles.counts}>
              {countOf(u.submissionCount)} submissions · {countOf(u.approvedCount)} approved
            </Text>
            <Text style={styles.joined}>Joined {formatDate(u.createdAt)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  notice: {
    backgroundColor: `${colors.verified}14`,
    color: colors.verified,
    fontSize: 14,
    fontWeight: "600",
    padding: spacing.md,
    borderRadius: radius.md,
  },
  apiError: {
    color: colors.danger,
    fontSize: 13,
  },
  showToggle: {
    alignSelf: "flex-start",
    minHeight: minTouch,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  showToggleText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.label,
    fontSize: 16,
    fontWeight: "700",
  },
  email: {
    color: colors.secondaryLabel,
    fontSize: 13,
  },
  roleChip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  roleChipText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  counts: {
    color: colors.label,
    fontSize: 13,
    fontWeight: "600",
  },
  joined: {
    color: colors.secondaryLabel,
    fontSize: 12,
  },
});
