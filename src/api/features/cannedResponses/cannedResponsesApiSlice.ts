import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface CannedResponse {
  id: string;
  title: string;
  body: string;
  /** null = available to every group. */
  groupKey: string | null;
  createdBy: string | null;
  createdAt: string;
}

function mapRow(r: Record<string, unknown>): CannedResponse {
  return {
    id: r.id as string,
    title: (r.title as string) ?? "",
    body: (r.body as string) ?? "",
    groupKey: (r.group_key as string | null) ?? null,
    createdBy: (r.created_by as string | null) ?? null,
    createdAt: r.created_at as string,
  };
}

export const cannedResponsesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCannedResponses: builder.query<CannedResponse[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("canned_responses")
          .select("*")
          .order("title", { ascending: true });
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: (data ?? []).map((r) => mapRow(r as Record<string, unknown>)) };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((c) => ({ type: "CannedResponse" as const, id: c.id })),
              { type: "CannedResponse" as const, id: "LIST" },
            ]
          : [{ type: "CannedResponse" as const, id: "LIST" }],
    }),

    createCannedResponse: builder.mutation<
      CannedResponse,
      { title: string; body: string; groupKey?: string | null }
    >({
      queryFn: async ({ title, body, groupKey }) => {
        const { data: auth } = await supabase.auth.getUser();
        const { data, error } = await ((supabase.from("canned_responses") as any)
          .insert({
            title: title.trim(),
            body,
            group_key: groupKey ?? null,
            created_by: auth?.user?.id ?? null,
          })
          .select("*")
          .single());
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: mapRow(data as Record<string, unknown>) };
      },
      invalidatesTags: [{ type: "CannedResponse", id: "LIST" }],
    }),

    updateCannedResponse: builder.mutation<
      CannedResponse,
      { id: string; title?: string; body?: string; groupKey?: string | null }
    >({
      queryFn: async ({ id, title, body, groupKey }) => {
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (title !== undefined) patch.title = title.trim();
        if (body !== undefined) patch.body = body;
        if (groupKey !== undefined) patch.group_key = groupKey;
        const { data, error } = await ((supabase.from("canned_responses") as any)
          .update(patch)
          .eq("id", id)
          .select("*")
          .single());
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: mapRow(data as Record<string, unknown>) };
      },
      invalidatesTags: (_r, _e, { id }) => [
        { type: "CannedResponse", id },
        { type: "CannedResponse", id: "LIST" },
      ],
    }),

    deleteCannedResponse: builder.mutation<{ ok: true }, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from("canned_responses").delete().eq("id", id);
        if (error) return { error: { status: "CUSTOM_ERROR", error: error.message } };
        return { data: { ok: true } };
      },
      invalidatesTags: [{ type: "CannedResponse", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCannedResponsesQuery,
  useCreateCannedResponseMutation,
  useUpdateCannedResponseMutation,
  useDeleteCannedResponseMutation,
} = cannedResponsesApiSlice;
