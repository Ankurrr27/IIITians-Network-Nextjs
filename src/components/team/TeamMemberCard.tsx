"use client";
import React from "react";
import Image from "next/image";
import type { ITeamMember } from "@/types";
import { Link2, Globe, ExternalLink, Pencil, Trash2 } from "lucide-react";

interface TeamMemberCardProps {
  member: ITeamMember;
  onEdit?: (member: ITeamMember) => void;
  onDelete?: (id: string) => void;
  onPromote?: (id: string) => void;
  onEndTenure?: (id: string) => void;
  onCopyToTeam?: (id: string) => void;
  onRemoveFromTeam?: (id: string) => void;
}

export default function TeamMemberCard({
  member,
  onEdit,
  onDelete,
  onPromote,
  onEndTenure,
  onCopyToTeam,
  onRemoveFromTeam,
}: TeamMemberCardProps) {
  const photoUrl = member.photo?.url;
  async function callAction(action: string, payload: Record<string, any> = {}) {
    try {
      const res = await fetch("/api/admin/team/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, memberId: member._id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Request failed");
      // Simple feedback — consumer components can refresh on their own
      // eslint-disable-next-line no-alert
      alert(`Success: ${action}`);
      return data;
    } catch (err: unknown) {
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : "Action failed");
      throw err;
    }
  }

  return (
    <article
      className={`group flex flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        member.isActive ?? true ? "border-slate-200" : "border-dashed border-slate-300 opacity-70"
      }`}
    >
      {/* Profile Image with Fallback */}
      <div className="relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-indigo-50 group-hover:ring-indigo-100 transition-all duration-300 shadow-inner">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="80px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-black text-white uppercase tracking-wider">
            {member.name[0]}
          </div>
        )}
      </div>

      {/* Member Details */}
      <h3 className="mt-3.5 text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
        {member.name}
      </h3>
      <p className="mt-0.5 text-xs text-indigo-600 font-semibold">{member.role}</p>
      <p className="mt-1 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
        {member.team} · {member.iiit}
      </p>

      {member.aboutText && (
        <p className="mt-3 text-[11px] leading-relaxed text-slate-500 font-medium line-clamp-2">
          {member.aboutText}
        </p>
      )}

      {/* Social Links Panel */}
      <div className="mt-auto flex w-full items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex gap-3">
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              title="LinkedIn"
              className="text-slate-400 hover:text-indigo-600 transition-colors duration-200"
            >
              <Link2 className="h-3.5 w-3.5" />
            </a>
          )}
          {member.instagram && (
            <a
              href={member.instagram}
              target="_blank"
              rel="noreferrer"
              title="Instagram"
              className="text-slate-400 hover:text-rose-500 transition-colors duration-200"
            >
              <Globe className="h-3.5 w-3.5" />
            </a>
          )}
          {member.twitter && (
            <a
              href={member.twitter}
              target="_blank"
              rel="noreferrer"
              title="Twitter"
              className="text-slate-400 hover:text-sky-500 transition-colors duration-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        {/* Admin Actions */}
        {(onEdit || onDelete || onPromote || onEndTenure || onCopyToTeam || onRemoveFromTeam) && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-100">
            {onEdit && (
              <button
                onClick={() => onEdit(member)}
                className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 transition"
                title="Edit Member"
              >
                <Pencil size={11} />
              </button>
            )}

            {onPromote && (
              <button
                onClick={async () => {
                  // Ask admin for the target roleId (object id) — minimal UX for now
                  const toRoleId = window.prompt("Enter target roleId (ObjectId) for promotion:");
                  if (!toRoleId) return;
                  try {
                    await callAction("promote", { toRoleId });
                    onPromote(member._id);
                  } catch {}
                }}
                className="rounded-lg border border-amber-200 p-1 text-amber-600 hover:bg-amber-50 transition"
                title="Promote"
              >
                P
              </button>
            )}

            {onEndTenure && (
              <button
                onClick={async () => {
                  if (!confirm("End tenure for this member?")) return;
                  try {
                    await callAction("endTenure");
                    onEndTenure(member._id);
                  } catch {}
                }}
                className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 transition"
                title="End Tenure"
              >
                E
              </button>
            )}

            {onCopyToTeam && (
              <button
                onClick={async () => {
                  const targetTermId = window.prompt("Enter target termId (ObjectId) to copy into:");
                  const targetCommitteeId = window.prompt("Enter target committeeId (ObjectId):");
                  const targetRoleId = window.prompt("Enter target roleId (ObjectId):");
                  if (!targetTermId || !targetCommitteeId || !targetRoleId) return;
                  try {
                    await callAction("copy", { targetTermId, targetCommitteeId, targetRoleId });
                    onCopyToTeam(member._id);
                  } catch {}
                }}
                className="rounded-lg border border-sky-200 p-1 text-sky-600 hover:bg-sky-50 transition"
                title="Copy to Team"
              >
                C
              </button>
            )}

            {onRemoveFromTeam && (
              <button
                onClick={async () => {
                  if (!confirm("Remove this member from the team (soft remove)?")) return;
                  try {
                    await callAction("remove");
                    onRemoveFromTeam(member._id);
                  } catch {}
                }}
                className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 transition"
                title="Remove from Team"
              >
                <Trash2 size={11} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(member._id)}
                className="rounded-lg p-1 text-rose-500 hover:bg-rose-50 transition"
                title="Delete Member"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
