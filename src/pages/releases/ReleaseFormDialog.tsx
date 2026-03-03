import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { GitHubRelease } from "./functions";

export interface ReleaseFormValues {
  title: string;
  tag: string;
  content: string;
}

interface ReleaseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ReleaseFormValues) => void;
  isSubmitting?: boolean;
  existingRelease?: GitHubRelease | null;
}

function ReleaseFormDialog({ open, onClose, onSubmit, isSubmitting = false, existingRelease }: ReleaseFormDialogProps) {
  const isEditMode = Boolean(existingRelease);

  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (open) {
      if (existingRelease) {
        setTitle(existingRelease.name ?? "");
        setTag(existingRelease.tagName ?? "");
        setContent(existingRelease.body ?? "");
      } else {
        setTitle("");
        setTag("");
        setContent("");
      }
    }
  }, [open, existingRelease]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, tag, content });
  };

  const isValid = title.trim() !== "" && tag.trim() !== "" && content.trim() !== "";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{isEditMode ? "Edit Release" : "Add Release"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth autoFocus />
            <TextField label="Tag" value={tag} onChange={(e) => setTag(e.target.value)} required fullWidth placeholder="e.g. v1.4.0" />
            <Stack spacing={0.5}>
              <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} required fullWidth multiline minRows={6} placeholder="Write release notes here…" />
              <Typography variant="caption" color="text.secondary">
                Markdown is supported
              </Typography>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Saving…" : isEditMode ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ReleaseFormDialog;
