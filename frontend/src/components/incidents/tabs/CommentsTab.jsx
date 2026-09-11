import { useEffect, useState } from "react";
import { MessageSquare, Send, UserCircle2 } from "lucide-react";

import API from "../../../api/api";

import WorkspaceHeader from "../common/WorkspaceHeader";
import StatusChip from "../common/StatusChip";
import SectionCard from "../common/SectionCard";

export default function CommentsTab({ selected }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadComments = async () => {
    if (!selected?.incident_id) return;

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await API.get(
        `/api/v1/incidents/${selected.incident_id}/comments`
      );

      setComments(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selected?.incident_id) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        analyst: "Hamad Ali Khan",
        comment: newComment.trim(),
      };

      await API.post(
        `/api/v1/incidents/${selected.incident_id}/comments`,
        payload
      );

      setNewComment("");
      setMessage("Comment added successfully.");

      await loadComments();
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Failed to save comment.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.incident_id]);

  if (!selected) {
    return (
      <div className="empty-state">
        <MessageSquare size={34} />
        <h4>No Incident Selected</h4>
        <p>Select an incident to view investigation comments.</p>
      </div>
    );
  }

  return (
    <div className="comments-pro">
      <WorkspaceHeader
        icon={<MessageSquare size={22} />}
        title="Analyst Comments"
        description="Collaborate with SOC analysts, document investigation notes, and preserve response history."
        status={`${comments.length} Notes`}
        statusType="info"
      />

      {loading && <div className="result">Loading comments...</div>}

      {message && <div className="result success-message">{message}</div>}

      {error && <div className="result error-message">{error}</div>}

      <SectionCard
        title="Add Investigation Note"
        subtitle="Write a comment for the incident activity history."
      >
        <div className="comment-composer">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write investigation note, containment update, escalation reason, or analyst finding..."
          />

          <button className="btn" onClick={addComment} disabled={saving}>
            <Send size={15} />
            {saving ? "Saving..." : "Add Comment"}
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="Activity Feed"
        subtitle="Chronological analyst and system notes for this incident."
      >
        <div className="comment-feed">
          {comments.length === 0 && (
            <div className="empty-state">
              <MessageSquare size={30} />
              <h4>No Comments Yet</h4>
              <p>Add the first investigation note for this incident.</p>
            </div>
          )}

          {comments.map((comment) => (
            <div className="comment-entry" key={comment.id}>
              <div className="comment-avatar">
                <UserCircle2 size={24} />
              </div>

              <div className="comment-body">
                <div className="comment-head">
                  <div>
                    <b>{comment.analyst}</b>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>

                  <StatusChip type="success">
                    SOC Analyst
                  </StatusChip>
                </div>

                <p>{comment.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "Unknown time";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}